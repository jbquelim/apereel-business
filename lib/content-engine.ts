import { neon } from "@neondatabase/serverless";
import { callClaude, parseJson } from "./ai";
import { allowance, tierFor, type Client } from "./clients";
import { fetchAuditResult, fetchCompetitorSet } from "./marketdb";
import { historyForMany } from "./market-history";
import { crawlSite } from "./site-crawl";
import { queueMediaJob, type MediaBrief, type MediaKind } from "./media";
import { storeImages, storedUrls } from "./image-store";

// The content service, automated: the client's own products (from our crawl,
// saved in page_snapshots) plus what we know of their market (the saved
// audit: advantage, competitors, buyer searches with no page) become a
// month of posts, buying guides and newsletters. Every item is saved in
// content_items; each change the client asks for is one allowance request.

export type Product = { url: string; title: string; price: number | null; currency: string | null; image: string | null; rating: number | null };

export type PostData = { platform: string; hook: string; caption: string; hashtags: string[]; cta: string; productTitle: string; suggestedDate?: string };
export type GuideData = { title: string; targetSearch: string; summary: string; body: string };
export type NewsletterData = { subject: string; preview: string; body: string };

// What each content tier produces per month. Videos are briefed now and
// rendered by the media queue (lib/media) once a provider is connected.
const VOLUME: Record<string, { posts: number; guides: number; newsletters: number; videos: number; visuals: number; competitorNote: boolean }> = {
  fix: { posts: 12, guides: 0, newsletters: 0, videos: 0, visuals: 0, competitorNote: false },
  build: { posts: 20, guides: 2, newsletters: 0, videos: 4, visuals: 0, competitorNote: false },
  grow: { posts: 30, guides: 4, newsletters: 2, videos: 8, visuals: 4, competitorNote: true },
};

/** Posting dates spread over the rest of the month (from tomorrow). */
function postingDates(n: number): string[] {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const days = Math.max(7, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  return Array.from({ length: n }, (_, i) => new Date(start.getTime() + Math.floor((i * days) / n) * 86_400_000).toISOString().slice(0, 10));
}

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

/** Long text in a simple labelled format: JSON breaks too easily on long Markdown. */
function parseLabelled(text: string, labels: string[]): Record<string, string> | null {
  const out: Record<string, string> = {};
  const bodyAt = text.search(/^---\s*$/m);
  const head = bodyAt >= 0 ? text.slice(0, bodyAt) : text;
  for (const l of labels) {
    const m = head.match(new RegExp(`^${l}:\\s*(.+)$`, "mi"));
    if (m) out[l.toLowerCase()] = m[1].trim();
  }
  if (bodyAt < 0) return null;
  out.body = text.slice(bodyAt).replace(/^---\s*/, "").trim();
  return out.body.length > 100 ? out : null;
}

async function writeGuide(client: Client, brief: string, search: string, products: Product[]): Promise<GuideData | null> {
  const text = await callClaude({
    clientId: client.id,
    purpose: "content:guide",
    maxTokens: 4000,
    prompt: `Write a buying guide for the business below, aimed at people searching Google for "${search}". The business has no page for this search yet.

${brief}

RELEVANT PRODUCTS (mention them by name where they fit): ${products.slice(0, 8).map((p) => p.title).join("; ")}

Reply in exactly this format and nothing else:
TITLE: max 65 characters, includes the search
SUMMARY: one sentence
---
The guide in Markdown, 500-800 words, with ## headings, practical advice and where the products fit.

${RULES}`,
  });
  const r = parseLabelled(text, ["TITLE", "SUMMARY"]);
  return r?.title ? { title: cut(r.title, 90), targetSearch: search, summary: cut(r.summary, 300), body: r.body } : null;
}

async function writeNewsletter(client: Client, brief: string, products: Product[], n: number): Promise<NewsletterData | null> {
  const text = await callClaude({
    clientId: client.id,
    purpose: "content:newsletter",
    maxTokens: 2500,
    prompt: `Write newsletter ${n} of 2 this month for the business below, featuring these products: ${products.map((p) => `${p.title}${p.price != null ? ` (${p.currency ?? "$"}${p.price})` : ""}`).join("; ")}.

${brief}

Reply in exactly this format and nothing else:
SUBJECT: max 60 characters
PREVIEW: max 90 characters
---
The email in Markdown, 200-350 words, one clear call to action.

${RULES}`,
  });
  const r = parseLabelled(text, ["SUBJECT", "PREVIEW"]);
  return r?.subject ? { subject: cut(r.subject, 80), preview: cut(r.preview, 120), body: r.body } : null;
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
  // Our own copies of the photos we're likely to use (see lib/image-store).
  const photos = catalog.filter((p) => p.image).slice(0, 80).map((p) => p.image!);
  await storeImages(photos, 60_000).catch((err) => console.error("storeImages failed:", err instanceof Error ? err.message : err));
  const copies = await storedUrls(photos).catch(() => new Map<string, string>());
  return catalog.map((p) => (p.image && copies.has(p.image) ? { ...p, image: copies.get(p.image)! } : p));
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
  opts: { batch: string; itemKind: string; mediaKind: MediaKind; style: string; duration: number; aspect: MediaBrief["aspect"]; alsoAspects?: MediaBrief["aspect"][] },
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
    // Extra sizes of the same film (e.g. 16:9 for YouTube beside 9:16 for Reels and TikTok).
    for (const aspect of opts.alsoAspects ?? []) await queueMediaJob({ clientId: client.id, itemId, kind: opts.mediaKind, brief: { ...media, aspect } });
    n++;
  }
  return n;
}

/** Generates this month's content for a client. Crawls first when we have no recent product data. */
export type MonthStage = "posts" | "long" | "media" | "catalog";
export const NEXT_STAGE: Record<MonthStage, MonthStage | null> = { posts: "long", long: "media", media: null, catalog: null };

async function countItems(clientId: string, batch: string): Promise<Record<string, number>> {
  const rows = (await sql()`SELECT kind, count(*)::int AS n FROM content_items WHERE client_id = ${clientId} AND batch = ${batch} GROUP BY kind`) as { kind: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
}

/**
 * One step of this month's content. A Scale month doesn't fit one 5-minute
 * run, so it's done in three steps (posts, then guides and newsletters,
 * then video briefs, visuals and the competitor note), each its own run.
 * Every step only makes what's missing, so a re-run finishes a partial month.
 */
export async function generateMonth(client: Client, stage: MonthStage = "posts"): Promise<string> {
  const volume = VOLUME[client.tier] ?? VOLUME.fix;
  const batch = new Date().toISOString().slice(0, 7);
  const have = await countItems(client.id, batch);
  const catalog = await catalogWithPhotos(client.domain);
  const audit = await fetchAuditResult<AuditLike>(client.domain);
  const brief = marketBrief(client.domain, audit);

  if (stage === "posts") {
    const missing = volume.posts - (have.post ?? 0);
    if (missing <= 0) return "posts already made";
    const featured = pickProducts(catalog, volume.posts).slice(volume.posts - missing);
    const posts = await writePosts(client, brief, featured);
    const dates = postingDates(volume.posts).slice(volume.posts - missing);
    for (const [i, post] of posts.entries()) {
      const product = featured.find((p) => p.title === post.productTitle) ?? featured[i] ?? null;
      await save(client.id, batch, "post", { ...post, suggestedDate: dates[i] }, product, post.platform);
    }
    return `${posts.length} posts`;
  }

  if (stage === "long") {
    const done = ((await sql()`SELECT data->>'targetSearch' AS s FROM content_items WHERE client_id = ${client.id} AND batch = ${batch} AND kind = 'guide'`) as { s: string }[]).map((r) => r.s);
    const searches = (audit?.demand?.rows ?? []).filter((r) => r.coverage === "none" && !done.includes(r.query)).map((r) => r.query).slice(0, Math.max(0, volume.guides - done.length));
    let guides = 0;
    for (const s of searches) {
      const g = await writeGuide(client, brief, s, catalog);
      if (g) {
        await save(client.id, batch, "guide", g);
        guides++;
      }
    }
    let newsletters = 0;
    for (let n = (have.newsletter ?? 0) + 1; n <= volume.newsletters; n++) {
      const nl = await writeNewsletter(client, brief, pickProducts(catalog.slice((n - 1) * 3), 3), n);
      if (nl) {
        await save(client.id, batch, "newsletter", nl);
        newsletters++;
      }
    }
    return `${guides} guides, ${newsletters} newsletters`;
  }

  const withPhotos = catalog.filter((p) => p.image);
  const videos = await writeVideoBriefs(client, brief, pickProducts(withPhotos, Math.max(0, volume.videos - (have.video ?? 0))), {
    batch,
    itemKind: "video",
    mediaKind: "short-video",
    style: "short vertical social video that shows the product off in a few quick moves",
    duration: 8,
    aspect: "9:16",
  });
  const visuals = await writeVisualBriefs(client, brief, pickProducts(withPhotos.slice(3), Math.max(0, volume.visuals - (have.visual ?? 0))), batch);
  const notes = volume.competitorNote && !have.note ? await writeCompetitorNote(client, audit, batch) : 0;
  return `${videos} videos, ${visuals} visuals, ${notes} competitor notes`;
}

/**
 * Premium product visuals: the real product photo as the reference, staged
 * in a premium scene by the image model (lib/media). Claude writes the scene.
 */
export async function writeVisualBriefs(client: Client, brief: string, products: Product[], batch: string, siteId?: string): Promise<number> {
  if (products.length === 0) return 0;
  const text = await callClaude({
    clientId: client.id,
    purpose: "visuals:briefs",
    maxTokens: 3000,
    prompt: `Write a premium product photography scene for each product below, for the business described. The product itself comes from its real photo; you only describe the setting.

${brief}

PRODUCTS:
${products.map((p, i) => `${i + 1}. ${p.title}`).join("\n")}

Return ONLY a JSON array, one per product in order: [{ "productTitle": "exactly as given", "title": "short name for the visual", "prompt": "the scene: surface, background, light, a few props that suit the product and its buyers; editorial, premium, photographic; the product is the hero, centred and sharp" }]`,
  });
  const briefs = parseJson<{ productTitle: string; title: string; prompt: string }[]>(text) ?? [];
  let n = 0;
  for (const [i, b] of briefs.slice(0, products.length).entries()) {
    const product = products.find((p) => p.title === b.productTitle) ?? products[i];
    if (!product?.image) continue;
    const media: MediaBrief = { title: cut(b.title, 120), duration: 0, aspect: siteId ? "4:3" : "1:1", images: [product.image], shots: [], prompt: cut(b.prompt, 1500) };
    const itemId = siteId ? null : await saveItem(client.id, batch, "visual", { ...media, productTitle: product.title }, product, null);
    await queueMediaJob({ clientId: client.id, itemId, siteId: siteId ?? null, kind: siteId ? "site-visual" : "product-visual", brief: media });
    n++;
  }
  return n;
}

/** What the client's tracked competitors changed since we started watching them. */
async function writeCompetitorNote(client: Client, audit: AuditLike | null, batch: string): Promise<number> {
  const set = (await fetchCompetitorSet(client.domain)) ?? (audit?.industry?.competitors ?? []).map((c) => ({ name: c.name, domain: (c as { domain?: string }).domain ?? "" }));
  const competitors = set.filter((c) => c.domain).slice(0, 5);
  const history = await historyForMany(competitors.map((c) => ({ domain: c.domain, name: c.name })));
  if (history.length === 0) {
    await saveItem(client.id, batch, "note", {
      title: "We're now tracking your competitors",
      points: competitors.map((c) => `${c.name} (${c.domain}): catalog, prices and marketing tools recorded; changes appear from next month.`),
      suggestion: "",
    });
    return 1;
  }
  const text = await callClaude({
    clientId: client.id,
    purpose: "content:competitor-note",
    maxTokens: 1500,
    prompt: `Summarise what these competitors of ${client.domain} changed, for the business owner. Use ONLY these measured facts:

${history.map((h) => `${h.name} (since ${h.since}): ${h.facts.join(" ")}`).join("\n")}

Return ONLY JSON: { "title": "max 60 chars", "points": ["3-5 plain sentences, one change each, with the numbers given"], "suggestion": "one practical thing the owner could do about it this month" }`,
  });
  const note = parseJson<{ title: string; points: string[]; suggestion: string }>(text);
  if (!note?.points?.length) return 0;
  await saveItem(client.id, batch, "note", { title: cut(note.title, 80), points: note.points.map((p) => cut(p, 300)).slice(0, 5), suggestion: cut(note.suggestion, 300) });
  return 1;
}

export type ContentItem = {
  id: number;
  batch: string;
  kind: "post" | "guide" | "newsletter" | "video" | "ad" | "carousel" | "animated-ad" | "video-ad" | "visual" | "note";
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
  if (client.status !== "active") return { ok: false, error: "Your plan has ended, so changes are paused." };
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
