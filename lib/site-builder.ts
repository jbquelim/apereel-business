import { neon } from "@neondatabase/serverless";
import { randomBytes, randomUUID } from "node:crypto";
import { callClaude, parseJson } from "./ai";
import { allowance, tierFor, type Client } from "./clients";
import { RULES, catalogWithPhotos, type Product } from "./content-engine";
import { fetchAuditResult } from "./marketdb";
import { queueMediaJob } from "./media";
import { pickTemplate } from "./site-templates";
import type { Section, SectionType, SiteDoc, SitePage, SiteProduct, SiteTemplate } from "./site-types";

// The website service, automated: the best template for the business's
// industry and tier, filled by Claude with copy from what we measured (their
// advantage, competitors, buyer searches) and their real catalog from our
// crawl. Redirects from the old site come from the crawl too. Changes are
// requested in plain words and use the client's allowance.

type AuditLike = {
  headline?: string;
  translateAdvantage?: { strength?: string };
  industry?: {
    industry?: string;
    subIndustry?: string;
    offering?: string;
    businessModel?: string | null;
    inventoryCategories?: { category: string; productCount: number | null }[];
  } | null;
  demand?: { rows: { query: string; coverage: string | null }[] };
};

export type SiteRow = {
  id: string;
  client_id: string;
  slug: string;
  custom_domain: string | null;
  domain_status: string | null;
  template_id: string | null;
  doc: SiteDoc;
  published: boolean;
  hosting_until: string | null;
  updated_at: string;
  stripe_account_id: string | null;
  payments_status: string | null;
};

// Tier limits: products on the site, categories, featured products with written descriptions.
const LIMITS = {
  fix: { products: 24, categories: 0, featured: 12 },
  build: { products: 300, categories: 12, featured: 24 },
  grow: { products: 1000, categories: 30, featured: 24 },
} as const;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
const cut = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const stem = (w: string) => w.toLowerCase().replace(/(ies)$/, "y").replace(/(es|s)$/, "");

export async function getSiteForClient(clientId: string): Promise<SiteRow | null> {
  return ((await sql()`SELECT * FROM sites WHERE client_id = ${clientId}`) as SiteRow[])[0] ?? null;
}
export async function getSiteBySlug(slug: string): Promise<SiteRow | null> {
  return ((await sql()`SELECT * FROM sites WHERE slug = ${slug}`) as SiteRow[])[0] ?? null;
}
export async function getSiteByDomain(host: string): Promise<SiteRow | null> {
  const h = host.toLowerCase().replace(/^www\./, "");
  return ((await sql()`SELECT * FROM sites WHERE custom_domain = ${h} AND published`) as SiteRow[])[0] ?? null;
}
export async function getSiteById(id: string): Promise<SiteRow | null> {
  return ((await sql()`SELECT * FROM sites WHERE id = ${id}`) as SiteRow[])[0] ?? null;
}

function toProducts(catalog: Product[], limit: number): SiteProduct[] {
  const pool = [...catalog.filter((p) => p.image), ...catalog.filter((p) => !p.image)].slice(0, limit);
  const used = new Set<string>();
  return pool.map((p) => {
    let slug = slugify(new URL(p.url).pathname.split("/").filter(Boolean).pop() ?? p.title);
    while (used.has(slug)) slug = `${slug}-${used.size}`;
    used.add(slug);
    return { slug, title: p.title, price: p.price, currency: p.currency, image: p.image, description: `${p.title}.`, category: null, sourceUrl: p.url };
  });
}

/** Categories from the audit's catalog reading, products matched to them by name. */
function assignCategories(products: SiteProduct[], names: string[], max: number): SiteDoc["categories"] {
  if (max === 0) return [];
  const cats = names.slice(0, max).map((name) => ({ slug: slugify(name), name, words: name.split(/[^a-z0-9]+/i).filter((w) => w.length > 2).map(stem) }));
  for (const p of products) {
    const words = new Set(p.title.split(/[^a-z0-9]+/i).map(stem));
    const hit = cats.find((c) => c.words.some((w) => words.has(w)));
    if (hit) p.category = hit.slug;
  }
  return cats.filter((c) => products.some((p) => p.category === c.slug)).map((c) => ({ slug: c.slug, name: c.name, description: "" }));
}

async function redirectsFrom(domain: string, products: SiteProduct[], categories: SiteDoc["categories"]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const p of products) {
    try {
      map[new URL(p.sourceUrl).pathname.replace(/\/$/, "")] = `/products/${p.slug}`;
    } catch {
      /* skip */
    }
  }
  const cats = (await sql()`
    SELECT DISTINCT ON (url) url, title FROM page_snapshots
    WHERE domain = ${domain} AND role = 'client' AND kind = 'category' AND NOT blocked ORDER BY url, crawled_at DESC
  `) as { url: string; title: string | null }[];
  for (const c of cats) {
    try {
      const path = new URL(c.url).pathname.replace(/\/$/, "");
      const match = categories.find((x) => (c.title ?? "").toLowerCase().includes(x.name.toLowerCase()));
      map[path] = match ? `/collections/${match.slug}` : "/products";
    } catch {
      /* skip */
    }
  }
  return map;
}

function skeleton(template: SiteTemplate): string {
  const describe = (types: SectionType[]) => types.join(", ");
  return `home: ${describe(template.pages.home)}\nabout: ${describe(template.pages.about)}\ncontact: ${describe(template.pages.contact)}`;
}

const SECTION_SHAPES = `Section shapes (use exactly these fields):
hero: { "type":"hero", "eyebrow":"2-4 words", "heading":"max 60 chars", "subheading":"max 160 chars", "ctaLabel":"max 22 chars", "ctaHref":"/products" }
features: { "type":"features", "heading":"...", "items":[{ "title":"...", "body":"1-2 sentences" }] } (3 items)
stats: { "type":"stats", "items":[{ "value":"a fact from the evidence, e.g. 2,600+", "label":"what it counts" }] } (2-4 items, ONLY numbers given in the evidence)
productGrid: { "type":"productGrid", "heading":"...", "products":"featured", "limit":8 }
categoryGrid: { "type":"categoryGrid", "heading":"...", "categories":[] }
story: { "type":"story", "heading":"...", "body":"2 short paragraphs separated by a blank line" }
faq: { "type":"faq", "heading":"...", "items":[{ "q":"...", "a":"..." }] } (4-6 items, answers from the evidence only; aim questions at what buyers search)
cta: { "type":"cta", "heading":"...", "body":"one sentence", "ctaLabel":"...", "ctaHref":"/contact" }
contact: { "type":"contact", "heading":"...", "body":"one sentence" }`;

/** Builds (or rebuilds) the client's site. */
export async function buildSite(client: Client): Promise<SiteRow> {
  const tier = client.tier;
  const limits = LIMITS[tier];
  const catalog = await catalogWithPhotos(client.domain);
  const audit = await fetchAuditResult<AuditLike>(client.domain);
  const industryText = [audit?.industry?.industry, audit?.industry?.subIndustry, audit?.industry?.offering].filter(Boolean).join(" ") || client.domain;
  const template = await pickTemplate(industryText, tier);
  const b2b = /b2b|wholesale|distribut|manufactur|oem|trade/i.test(`${audit?.industry?.businessModel ?? ""} ${audit?.industry?.offering ?? ""}`);

  const products = toProducts(catalog, limits.products);
  const categories = assignCategories(products, (audit?.industry?.inventoryCategories ?? []).map((c) => c.category), limits.categories);
  const featured = products.filter((p) => p.image).slice(0, limits.featured);
  featured.forEach((p) => (p.featured = true));
  const gaps = (audit?.demand?.rows ?? []).filter((r) => r.coverage === "none").map((r) => r.query);

  const text = await callClaude({
    clientId: client.id,
    purpose: "site:build",
    maxTokens: 12000,
    prompt: `You are building a website for a real business with Apereel's "${template.name}" template. Write all the copy.

BUSINESS: ${client.domain}${audit?.industry?.subIndustry ? ` (${audit.industry.subIndustry})` : ""}
${audit?.industry?.offering ? `WHAT IT SELLS: ${audit.industry.offering}\n` : ""}${audit?.industry?.businessModel ? `SELLS TO: ${audit.industry.businessModel}\n` : ""}${audit?.translateAdvantage?.strength ? `ITS ADVANTAGE (lead with this): ${audit.translateAdvantage.strength}\n` : ""}CATALOG: ${catalog.length} products${categories.length ? `; categories: ${categories.map((c) => c.name).join(", ")}` : ""}
${gaps.length ? `SEARCHES BUYERS MAKE THAT THE OLD SITE HAD NO PAGE FOR (answer them in the FAQ and copy): ${gaps.join("; ")}\n` : ""}
FEATURED PRODUCTS (write a description for each):
${featured.map((p) => `- ${p.slug}: ${p.title}${p.price != null ? ` (${p.currency ?? "$"}${p.price})` : ""}`).join("\n")}

PAGES AND THEIR SECTIONS, in order:
${skeleton(template)}

${SECTION_SHAPES}

Return ONLY JSON:
{
  "brand": { "name": "the business's name as customers know it", "tagline": "max 70 chars" },
  "pages": {
    "home": { "metaTitle": "max 60 chars", "metaDescription": "max 155 chars", "sections": [ ...one per section listed for home, in order... ] },
    "about": { "navLabel": "About", "metaTitle": "...", "metaDescription": "...", "sections": [...] },
    "contact": { "navLabel": "Contact", "metaTitle": "...", "metaDescription": "...", "sections": [...] }
  },
  "categories": { ${categories.length ? categories.map((c) => `"${c.slug}": "one sentence describing this category"`).join(", ") : ""} },
  "products": { "<slug>": "2-3 sentence description, facts from the product name only" }
}

${RULES}
- Titles and descriptions are unique per page and written for the searches buyers make.
- Never claim reviews, ratings, awards, certifications, years in business or delivery times unless given above.`,
  });
  const out = parseJson<{
    brand?: { name?: string; tagline?: string };
    pages?: Record<string, { navLabel?: string; metaTitle?: string; metaDescription?: string; sections?: Section[] }>;
    categories?: Record<string, string>;
    products?: Record<string, string>;
  }>(text);
  if (!out?.pages?.home?.sections?.length) throw new Error("The site copy came back incomplete");

  const name = cut(out.brand?.name, 60) || client.domain;
  const heroImage = featured[0]?.image ?? null;
  const pages: SitePage[] = (["home", "about", "contact"] as const).map((key) => {
    const p = out.pages?.[key] ?? {};
    const sections = (p.sections ?? []).filter((s) => s && typeof s === "object" && "type" in s).map((s) => {
      if (s.type === "hero") return { ...s, image: heroImage, ctaHref: s.ctaHref || "/products" };
      if (s.type === "story") return { ...s, image: featured[1]?.image ?? null };
      if (s.type === "contact") return { ...s, quoteForm: b2b || tier === "grow" };
      if (s.type === "categoryGrid") return { ...s, categories: [] };
      return s;
    });
    return {
      slug: key === "home" ? "" : key,
      navLabel: key === "home" ? undefined : cut(p.navLabel, 20) || (key === "about" ? "About" : "Contact"),
      title: key,
      metaTitle: cut(p.metaTitle, 70) || name,
      metaDescription: cut(p.metaDescription, 160) || cut(out.brand?.tagline, 160),
      sections,
    };
  });
  for (const c of categories) c.description = cut(out.categories?.[c.slug], 200);
  for (const p of products) {
    const d = cut(out.products?.[p.slug], 600);
    if (d) p.description = d;
    else if (p.category) p.description = `${p.title}, part of the ${categories.find((c) => c.slug === p.category)?.name ?? ""} range from ${name}.`;
    else p.description = `${p.title} from ${name}.`;
  }

  const doc: SiteDoc = {
    brand: { name, tagline: cut(out.brand?.tagline, 90) },
    tokens: template.tokens,
    pages,
    products,
    categories,
    productAction: b2b ? "enquire" : "link",
    redirects: await redirectsFrom(client.domain, products, categories),
  };

  const existing = await getSiteForClient(client.id);
  const row = existing
    ? ((await sql()`
        UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, template_id = ${template.id},
          history = history || ${JSON.stringify([{ at: new Date().toISOString(), instruction: "rebuild", before: { pages: existing.doc.pages, brand: existing.doc.brand, tokens: existing.doc.tokens } }])}::jsonb,
          updated_at = now()
        WHERE id = ${existing.id} RETURNING *
      `) as SiteRow[])[0]
    : ((await sql()`
        INSERT INTO sites (id, client_id, slug, template_id, doc, hosting_until)
        VALUES (${randomUUID()}, ${client.id}, ${`${slugify(client.domain.split(".")[0])}-${randomBytes(3).toString("hex")}`}, ${template.id},
                ${JSON.stringify(doc)}::jsonb, (CURRENT_DATE + interval '12 months')::date)
        RETURNING *
      `) as SiteRow[])[0];

  // Signature: a cinematic hero film from the lead product's photo.
  if (tier === "grow" && heroImage) {
    await queueMediaJob({
      clientId: client.id,
      siteId: row.id,
      kind: "hero-film",
      brief: {
        title: `${name} homepage hero film`,
        duration: 10,
        aspect: "16:9",
        images: [heroImage],
        shots: [{ seconds: 10, visual: "slow cinematic push-in on the product in soft premium light" }],
        prompt: `Cinematic product film of ${featured[0]?.title ?? "the product"}: slow push-in, soft directional light, shallow depth of field, premium and calm. No text.`,
      },
    });
  }
  return row;
}

const SECTION_TYPES = new Set(["hero", "features", "productGrid", "categoryGrid", "story", "faq", "cta", "contact", "stats"]);

/** A change to the site in plain words; uses one request from the allowance. */
export async function reviseSite(client: Client, instruction: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (client.status !== "active") return { ok: false, error: "Your plan has ended, so changes are paused." };
  const left = (await allowance(client)).left;
  if (left <= 0) return { ok: false, error: `You've used all ${tierFor(client)?.requests ?? 0} change requests this month.` };
  const site = await getSiteForClient(client.id);
  if (!site) return { ok: false, error: "Your site hasn't been built yet." };
  const { products, redirects, ...editable } = site.doc;
  const text = await callClaude({
    clientId: client.id,
    purpose: "site:revise",
    countsTowardAllowance: true,
    maxTokens: 12000,
    prompt: `This is a business's website as JSON (products are listed separately by slug):

${JSON.stringify(editable)}

PRODUCT SLUGS: ${products.slice(0, 200).map((p) => `${p.slug} (${p.title})`).join("; ")}

The owner asks: "${instruction.slice(0, 800)}"

Apply the change and return ONLY the full updated JSON with the same top-level keys (brand, tokens, pages, categories, productAction, footerNote). Keep everything they didn't ask to change exactly as it is. Colors are hex; fonts are Google Fonts family names. Section types allowed: ${[...SECTION_TYPES].join(", ")}. A productGrid's "products" is "featured" or a list of product slugs.
If they ask about a product's description, return it in "productDescriptions": { "<slug>": "new text" }.

${RULES}`,
  });
  const updated = parseJson<Partial<SiteDoc> & { productDescriptions?: Record<string, string> }>(text);
  if (!updated?.pages || !Array.isArray(updated.pages) || !updated.pages.every((p) => Array.isArray(p.sections) && p.sections.every((s) => SECTION_TYPES.has(s.type)))) {
    return { ok: false, error: "That change couldn't be applied. Please try different words." };
  }
  const next: SiteDoc = {
    ...site.doc,
    brand: { ...site.doc.brand, ...(updated.brand ?? {}) },
    tokens: { ...site.doc.tokens, ...(updated.tokens ?? {}), palette: { ...site.doc.tokens.palette, ...(updated.tokens?.palette ?? {}) } },
    pages: updated.pages,
    categories: Array.isArray(updated.categories) ? updated.categories : site.doc.categories,
    // How buyers pay is set from the studio (Stripe), not by a text request.
    productAction: site.doc.productAction,
    footerNote: typeof updated.footerNote === "string" ? updated.footerNote : site.doc.footerNote,
    products: products.map((p) => (updated.productDescriptions?.[p.slug] ? { ...p, description: cut(updated.productDescriptions[p.slug], 800) } : p)),
    redirects,
  };
  await sql()`
    UPDATE sites SET doc = ${JSON.stringify(next)}::jsonb,
      history = (CASE WHEN jsonb_array_length(history) >= 20 THEN history - 0 ELSE history END)
        || ${JSON.stringify([{ at: new Date().toISOString(), instruction: instruction.slice(0, 800), before: editable }])}::jsonb,
      updated_at = now()
    WHERE id = ${site.id}
  `;
  return { ok: true };
}

/** Undo the last change (free: doesn't use a request). */
export async function undoSite(client: Client): Promise<boolean> {
  const site = await getSiteForClient(client.id);
  if (!site) return false;
  const rows = (await sql()`SELECT history FROM sites WHERE id = ${site.id}`) as { history: { before: Partial<SiteDoc> }[] }[];
  const history = rows[0]?.history ?? [];
  const last = history[history.length - 1];
  if (!last?.before || !Array.isArray((last.before as SiteDoc).pages)) return false;
  const next = { ...site.doc, ...(last.before as Partial<SiteDoc>) };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(next)}::jsonb, history = history - (jsonb_array_length(history) - 1), updated_at = now() WHERE id = ${site.id}`;
  return true;
}

export async function setPublished(client: Client, published: boolean): Promise<boolean> {
  const rows = await sql()`UPDATE sites SET published = ${published}, updated_at = now() WHERE client_id = ${client.id} RETURNING id`;
  return rows.length > 0;
}

/** Switches how buyers act on products: Stripe checkout (only when payments are live), store link or enquiry. */
export async function setProductAction(client: Client, action: SiteDoc["productAction"]): Promise<{ ok: boolean; error?: string }> {
  const site = await getSiteForClient(client.id);
  if (!site) return { ok: false, error: "Your site hasn't been built yet." };
  if (action === "checkout" && site.payments_status !== "active") return { ok: false, error: "Finish connecting Stripe first." };
  const doc = { ...site.doc, productAction: action };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return { ok: true };
}
