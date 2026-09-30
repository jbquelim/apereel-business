import { neon } from "@neondatabase/serverless";
import { callClaude, parseJson } from "./ai";
import { allowance, tierFor, type Client } from "./clients";
import { fetchAuditResult } from "./marketdb";
import { crawlSite } from "./site-crawl";
import { queueMediaJob, type MediaBrief, type MediaKind } from "./media";

// The content service, automated: the client's own products (from our crawl,
// saved in page_snapshots) plus what we know of their market (the saved
// audit: advantage, competitors, buyer searches with no page) become a
// month of posts, buying guides and newsletters. Every item is saved in
// content_items; each change the client asks for is one allowance request.

export type Product = { url: string; title: string; price: number | null; currency: string | null; image: string | null; rating: number | null };

export type PostData = { platform: string; hook: string; caption: string; hashtags: string[]; cta: string; productTitle: string };
export type GuideData = { title: string; targetSearch: string; summary: string; body: string };
export type NewsletterData = { subject: string; preview: string; body: string };

// What each content tier produces per month. Videos are briefed now and
// rendered by the media queue (lib/media) once a provider is connected.
const VOLUME: Record<string, { posts: number; guides: number; newsletters: number; videos: number }> = {
  fix: { posts: 12, guides: 0, newsletters: 0, videos: 0 },
  build: { posts: 20, guides: 2, newsletters: 0, videos: 4 },
  grow: { posts: 30, guides: 4, newsletters: 2, videos: 8 },
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** Drops a trailing " | Brand" / " – Brand" from a page title, keeping the product's full name. */
function cleanTitle(t: string, domain: string): string {
  const parts = t.split(/\s+[|–—]\s+|\s+-\s+/);
  const brand = domain.replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (parts.length > 1 && parts[parts.length - 1].replace(/[^a-z0-9]/gi, "").toLowerCase().includes(brand)) parts.pop();
  return parts.join(" – ").trim();
}

/** The client's products from our most recent crawl of each page. */
export async function loadCatalog(domain: string): Promise<Product[]> {
  const rows = (await sql()`
    SELECT DISTINCT ON (url) url, title, price::float AS price, currency, image, rating_value::float AS rating
    FROM page_snapshots
    WHERE domain = ${domain.replace(/^www\./, "")} AND role = 'client' AND kind = 'product'
      AND NOT blocked AND status < 400 AND title IS NOT NULL
      AND crawled_at > now() - interval '45 days'
    ORDER BY url, crawled_at DESC
  `) as Product[];
  return rows.map((r) => ({ ...r, title: cleanTitle(r.title, domain), price: r.price ? r.price : null }));
}

/** Products worth featuring: with a photo, spread across the catalog. */
export function pickProducts(all: Product[], n: number): Product[] {
  const pool = all.filter((p) => p.image);
  const list = pool.length >= n ? pool : all;
  if (list.length <= n) return list;
  const step = list.length / n;
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)]);
}

export type AuditLike = {
  headline?: string;
  translateAdvantage?: { strength?: string };
  industry?: { subIndustry?: string; offering?: string; businessModel?: string | null; competitors?: { name: string; strength: string }[] } | null;
  demand?: { rows: { query: string; coverage: string | null }[] };
};

export function marketBrief(domain: string, audit: AuditLike | null): string {
  const a = audit;
  return [
    `BUSINESS: ${domain}${a?.industry?.subIndustry ? ` (${a.industry.subIndustry})` : ""}`,
    a?.industry?.offering && `WHAT IT SELLS: ${a.industry.offering}`,
    a?.industry?.businessModel && `SELLS TO: ${a.industry.businessModel}`,
    a?.translateAdvantage?.strength && `ITS ADVANTAGE: ${a.translateAdvantage.strength}`,
    a?.industry?.competitors?.length && `COMPETITORS: ${a.industry.competitors.map((c) => `${c.name} (${c.strength})`).join("; ")}`,
    a?.demand?.rows?.length && `BUYER SEARCHES WITH NO PAGE ON THE SITE: ${a.demand.rows.filter((r) => r.coverage === "none").map((r) => r.query).join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const RULES = `Rules:
- Use only facts given here: product names, prices and the business's advantage. Never invent discounts, awards, reviews, statistics, shipping or guarantees.
- Plain, confident language for real buyers; no hype words ("revolutionary", "game-changing", "unparalleled").
- Never name competitors in customer-facing copy.
- Prices exactly as given; leave prices out when none is given.`;

async function writePosts(client: Client, brief: string, products: Product[]): Promise<PostData[]> {
  const out: PostData[] = [];
  // Ten at a time keeps each reply short and reliable.
  for (let i = 0; i < products.length; i += 10) {
    const chunk = products.slice(i, i + 10);
    const text = await callClaude({
      clientId: client.id,
      purpose: "content:posts",
      maxTokens: 6000,
      prompt: `You write social media posts for a business, one post per product below.

${brief}

PRODUCTS:
${chunk.map((p, j) => `${j + 1}. ${p.title}${p.price != null ? ` — ${p.currency ?? "$"}${p.price}` : ""}${p.rating != null ? ` (rated ${p.rating})` : ""}`).join("\n")}

Return ONLY a JSON array with one object per product, in the same order:
[{ "platform": "instagram | facebook | linkedin | tiktok (the best fit for this business and product)", "hook": "first line, max 80 characters, stops the scroll", "caption": "the post body, 2-4 short sentences", "hashtags": ["3 to 6 relevant hashtags without #"], "cta": "one short call to action", "productTitle": "exactly as given" }]

${RULES}
- Vary the angle across posts: a use, a problem it solves, a detail, who it's for, the business's advantage.`,
    });
    const posts = parseJson<PostData[]>(text) ?? [];
    posts.slice(0, chunk.length).forEach((p) => out.push(p));
  }
  return out;
}

async function writeGuide(client: Client, brief: string, search: string, products: Product[]): Promise<GuideData | null> {
  const text = await callClaude({
    clientId: client.id,
    purpose: "content:guide",
    maxTokens: 4000,
    prompt: `Write a buying guide for the business below, aimed at people searching Google for "${search}". The business has no page for this search yet.

${brief}

RELEVANT PRODUCTS (link to them by name): ${products.slice(0, 8).map((p) => p.title).join("; ")}

Return ONLY JSON: { "title": "max 65 characters, includes the search", "targetSearch": "${search}", "summary": "one sentence", "body": "the guide in Markdown, 500-800 words, with ## headings, practical advice and where the products fit" }

${RULES}`,
  });
  return parseJson<GuideData>(text);
}

async function writeNewsletter(client: Client, brief: string, products: Product[], n: number): Promise<NewsletterData | null> {
  const text = await callClaude({
    clientId: client.id,
    purpose: "content:newsletter",
    maxTokens: 2500,
    prompt: `Write newsletter ${n} of 2 this month for the business below, featuring these products: ${products.map((p) => `${p.title}${p.price != null ? ` (${p.currency ?? "$"}${p.price})` : ""}`).join("; ")}.

${brief}

Return ONLY JSON: { "subject": "max 60 characters", "preview": "max 90 characters", "body": "Markdown, 200-350 words, one clear call to action" }

${RULES}`,
  });
  return parseJson<NewsletterData>(text);
}

export async function saveItem(clientId: string, batch: string, kind: string, data: object, product?: Product | null, platform?: string | null): Promise<number> {
  const rows = (await sql()`
    INSERT INTO content_items (client_id, batch, kind, platform, product_url, image, data)
    VALUES (${clientId}, ${batch}, ${kind}, ${platform ?? null}, ${product?.url ?? null}, ${product?.image ?? null}, ${JSON.stringify(data)}::jsonb)
    RETURNING id
  `) as { id: number }[];
  return rows[0].id;
}
const save = saveItem;

/** Products with fresh photos: re-reads the site when we have none yet. */
export async function catalogWithPhotos(domain: string): Promise<Product[]> {
  let catalog = await loadCatalog(domain);
  if (catalog.filter((p) => p.image).length < 5) {
    await crawlSite(domain, 100_000);
    catalog = await loadCatalog(domain);
  }
  if (catalog.length === 0) throw new Error(`No products could be read from ${domain}`);
  return catalog;
}

const cut = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Video briefs (script, shots, on-screen text and a generation prompt), one
 * per product, built from the product's real photo. Saved as items and
 * queued for rendering.
 */
export async function writeVideoBriefs(
  client: Client,
  brief: string,
  products: Product[],
  opts: { batch: string; itemKind: string; mediaKind: MediaKind; style: string; duration: number; aspect: MediaBrief["aspect"] },
): Promise<number> {
  if (products.length === 0) return 0;
  const text = await callClaude({
    clientId: client.id,
    purpose: `${opts.itemKind}:briefs`,
    maxTokens: 6000,
    prompt: `Write ${products.length} short video brief(s) for the business below, one per product. Style: ${opts.style}. Each video is about ${opts.duration} seconds, ${opts.aspect}, made from the product's real photo.

${brief}

PRODUCTS:
${products.map((p, i) => `${i + 1}. ${p.title}${p.price != null ? ` (${p.currency ?? "$"}${p.price})` : ""}`).join("\n")}

Return ONLY a JSON array, one object per product in order:
[{ "title": "internal title", "productTitle": "exactly as given", "shots": [{ "seconds": 3, "visual": "what the camera shows", "onScreenText": "max 6 words, optional" }], "voiceover": "optional, max 25 words", "caption": "post caption, 1-2 sentences", "prompt": "one detailed prompt for an image-to-video model animating the product photo: camera move, light, mood; no text in the video" }]

${RULES}
- Shots add up to about ${opts.duration} seconds. Motion only; never ask the model to render words.`,
  });
  const briefs = parseJson<(MediaBrief & { productTitle: string; caption?: string })[]>(text) ?? [];
  let n = 0;
  for (const [i, b] of briefs.slice(0, products.length).entries()) {
    const product = products.find((p) => p.title === b.productTitle) ?? products[i];
    const media: MediaBrief = {
      title: cut(b.title, 120),
      duration: opts.duration,
      aspect: opts.aspect,
      images: product?.image ? [product.image] : [],
      shots: Array.isArray(b.shots) ? b.shots.slice(0, 8).map((s) => ({ seconds: Number(s.seconds) || 2, visual: cut(s.visual, 300), onScreenText: cut(s.onScreenText, 60) || undefined })) : [],
      voiceover: cut(b.voiceover, 300) || undefined,
      prompt: cut(b.prompt, 1500),
    };
    const itemId = await saveItem(client.id, opts.batch, opts.itemKind, { ...media, productTitle: product?.title ?? b.productTitle, caption: cut(b.caption, 400) }, product ?? null, opts.aspect === "9:16" ? "reels / tiktok" : null);
    await queueMediaJob({ clientId: client.id, itemId, kind: opts.mediaKind, brief: media });
    n++;
  }
  return n;
}

/** Generates this month's content for a client. Crawls first when we have no recent product data. */
export async function generateMonth(client: Client): Promise<{ batch: string; posts: number; guides: number; newsletters: number; videos: number }> {
  const volume = VOLUME[client.tier] ?? VOLUME.fix;
  const batch = new Date().toISOString().slice(0, 7);
  const catalog = await catalogWithPhotos(client.domain);

  const audit = await fetchAuditResult<AuditLike>(client.domain);
  const brief = marketBrief(client.domain, audit);
  const featured = pickProducts(catalog, volume.posts);

  const posts = await writePosts(client, brief, featured);
  for (const [i, post] of posts.entries()) {
    const product = featured.find((p) => p.title === post.productTitle) ?? featured[i] ?? null;
    await save(client.id, batch, "post", post, product, post.platform);
  }

  const searches = (audit?.demand?.rows ?? []).filter((r) => r.coverage === "none").map((r) => r.query).slice(0, volume.guides);
  let guides = 0;
  for (const s of searches) {
    const g = await writeGuide(client, brief, s, catalog);
    if (g) {
      await save(client.id, batch, "guide", g);
      guides++;
    }
  }

  let newsletters = 0;
  for (let n = 1; n <= volume.newsletters; n++) {
    const picks = pickProducts(catalog.slice((n - 1) * 3), 3);
    const nl = await writeNewsletter(client, brief, picks, n);
    if (nl) {
      await save(client.id, batch, "newsletter", nl);
      newsletters++;
    }
  }
  const videos = await writeVideoBriefs(client, brief, pickProducts(catalog.filter((p) => p.image), volume.videos), {
    batch,
    itemKind: "video",
    mediaKind: "short-video",
    style: "short vertical social video that shows the product off in a few quick moves",
    duration: 8,
    aspect: "9:16",
  });
  return { batch, posts: posts.length, guides, newsletters, videos };
}

export type ContentItem = {
  id: number;
  batch: string;
  kind: "post" | "guide" | "newsletter" | "video" | "ad" | "carousel" | "animated-ad" | "video-ad";
  platform: string | null;
  product_url: string | null;
  image: string | null;
  data: PostData | GuideData | NewsletterData;
  history: unknown[];
  status: string;
  updated_at: string;
};

export async function listContent(clientId: string): Promise<ContentItem[]> {
  return (await sql()`
    SELECT id, batch, kind, platform, product_url, image, data, history, status, updated_at
    FROM content_items WHERE client_id = ${clientId} ORDER BY batch DESC, kind, id
  `) as ContentItem[];
}

/**
 * The client asks for a change to one item, in plain words. Uses one request
 * from their monthly allowance; the previous version is kept in history.
 */
export async function reviseItem(client: Client, itemId: number, instruction: string): Promise<{ ok: true; item: ContentItem } | { ok: false; error: string }> {
  const left = (await allowance(client)).left;
  if (left <= 0) return { ok: false, error: `You've used all ${tierFor(client)?.requests ?? 0} change requests this month.` };
  const item = ((await sql()`
    SELECT id, batch, kind, platform, product_url, image, data, history, status, updated_at
    FROM content_items WHERE id = ${itemId} AND client_id = ${client.id}
  `) as ContentItem[])[0];
  if (!item) return { ok: false, error: "That item wasn't found." };

  const text = await callClaude({
    clientId: client.id,
    purpose: `content:revise:${item.kind}`,
    countsTowardAllowance: true,
    maxTokens: item.kind === "post" ? 1500 : 4000,
    prompt: `Here is a ${item.kind} written for ${client.domain}, as JSON:

${JSON.stringify(item.data, null, 2)}

The business owner asks: "${instruction.slice(0, 600)}"

Apply the change and return ONLY the updated JSON with the same fields. Change only what they asked for.

${RULES}`,
  });
  const updated = parseJson<Record<string, unknown>>(text);
  if (!updated || Array.isArray(updated)) return { ok: false, error: "The change couldn't be applied. Please try again in different words." };
  const merged = { ...(item.data as object), ...updated };
  const rows = (await sql()`
    UPDATE content_items
    SET data = ${JSON.stringify(merged)}::jsonb,
        history = history || ${JSON.stringify([{ at: new Date().toISOString(), instruction: instruction.slice(0, 600), before: item.data }])}::jsonb,
        platform = COALESCE(${(merged as { platform?: string }).platform ?? null}, platform),
        updated_at = now()
    WHERE id = ${item.id} AND client_id = ${client.id}
    RETURNING id, batch, kind, platform, product_url, image, data, history, status, updated_at
  `) as ContentItem[];
  return { ok: true, item: rows[0] };
}

export async function setItemStatus(clientId: string, itemId: number, status: "draft" | "approved"): Promise<boolean> {
  const rows = await sql()`
    UPDATE content_items SET status = ${status}, updated_at = now() WHERE id = ${itemId} AND client_id = ${clientId} RETURNING id
  `;
  return rows.length > 0;
}
