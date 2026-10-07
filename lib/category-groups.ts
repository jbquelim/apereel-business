import { neon } from "@neondatabase/serverless";
import type { SiteDoc } from "./site-types";
import { callClaude, parseJson } from "./ai";
import { analysisBrief, siteAnalysis } from "./site-analysis";
import { syncCategoryCounts } from "./site-qa";

// Main categories: a store with dozens of top-level categories gets a few
// flagship groups above them (highest-value first, per the analysis), so
// buyers and search engines see a short, strong top level. The store's own
// categories stay underneath, unchanged. Groups are saved on the document
// and re-applied whenever the catalog is re-imported.

type Category = SiteDoc["categories"][number];
type Group = NonNullable<SiteDoc["categoryGroups"]>[number];

const MIN_TOP_LEVEL = 9;
/** Regroup when a re-import leaves this many top-level categories outside every group. */
const REGROUP_LOOSE = 5;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** Puts the store's top-level categories under their groups (in the groups' order). */
export function applyGroups(categories: Category[], groups: Group[] | undefined): Category[] {
  // Undo groups already applied (they carry a rank), so this can run again.
  const applied = new Set(categories.filter((c) => c.rank != null).map((c) => c.slug));
  const cats = categories.filter((c) => !applied.has(c.slug)).map((c) => (c.parent && applied.has(c.parent) ? { ...c, parent: null } : c));
  if (!groups?.length) return cats;
  const bySlug = new Map(cats.map((c) => [c.slug, c]));
  const top = new Set(cats.filter((c) => !c.parent).map((c) => c.slug));
  const out: Category[] = [];
  const grouped = new Map<string, string>();
  groups.forEach((g, i) => {
    const members = g.members.filter((m) => top.has(m) && !grouped.has(m) && !bySlug.has(g.slug));
    if (!members.length) return;
    for (const m of members) grouped.set(m, g.slug);
    const ranked = members.map((m) => bySlug.get(m)!).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    out.push({
      slug: g.slug,
      name: g.name,
      description: g.description,
      parent: null,
      count: ranked.reduce((n, c) => n + (c.count ?? 0), 0),
      image: ranked.find((c) => c.image)?.image ?? null,
      rank: i,
    });
  });
  for (const c of cats) out.push(grouped.has(c.slug) ? { ...c, parent: grouped.get(c.slug)! } : c);
  return out;
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/**
 * Writes the groups for a site whose catalog has many top-level categories
 * (one Sonnet call, about $0.03), saves them and applies them. No-op when
 * the site already has groups or has few top-level categories.
 */
export async function groupCategories(site: { id: string; doc: SiteDoc }, domain: string, clientId: string | null): Promise<number> {
  const doc = site.doc;
  // A catalog that grew (Onyx: 248 → 953 products) brings categories the groups never saw: group again.
  const loose = doc.categories.filter((c) => !c.parent && c.rank == null).length;
  if (doc.categoryGroups?.length && loose < REGROUP_LOOSE) return doc.categoryGroups.length;
  const cats = applyGroups(doc.categories, undefined);
  const top = cats.filter((c) => !c.parent);
  if (top.length < MIN_TOP_LEVEL) return 0;

  // Average price per top-level category (its whole subtree), for revenue weight.
  const rootOf = new Map<string, string>();
  const parentOf = new Map(cats.map((c) => [c.slug, c.parent ?? null]));
  for (const c of cats) {
    let r = c.slug;
    for (let i = 0; i < 10 && parentOf.get(r); i++) r = parentOf.get(r)!;
    rootOf.set(c.slug, r);
  }
  const prices = (await sql()`
    SELECT category, avg(price)::float AS avg FROM site_products
    WHERE site_id = ${site.id} AND price > 0 AND category IS NOT NULL GROUP BY category
  `) as { category: string; avg: number }[];
  const sum = new Map<string, { t: number; n: number }>();
  for (const p of prices) {
    const r = rootOf.get(p.category);
    if (!r) continue;
    const s = sum.get(r) ?? { t: 0, n: 0 };
    sum.set(r, { t: s.t + p.avg, n: s.n + 1 });
  }
  const brief = analysisBrief(await siteAnalysis(domain));

  const text = await callClaude({
    clientId,
    purpose: "site:category-groups",
    maxTokens: 4000,
    prompt: `${domain} sells online with ${top.length} top-level categories, too many for a buyer to scan. Group them into 6 to 8 main categories.

${brief ? `${brief}\n\n` : ""}TOP-LEVEL CATEGORIES (slug | name | products | average price):
${top.map((c) => {
  const s = sum.get(c.slug);
  return `${c.slug} | ${c.name} | ${c.count ?? 0} | ${s ? `$${(s.t / s.n).toFixed(0)}` : "n/a"}`;
}).join("\n")}

Rules:
- Every slug above goes in exactly one group
- Group names are what a buyer of this business would look for: 1 to 3 words, plain, no marketing words
- Order the groups by value to the business, highest first: follow the analysis where it names a revenue lever, otherwise weigh product count and average price
- One sentence description per group for shoppers, saying what they will find there; max 140 characters. Never mention prices, value, revenue, the analysis or the ordering

Return ONLY JSON: [{ "name": "...", "description": "...", "members": ["slug", ...] }]`,
  });
  const raw = parseJson<{ name?: string; description?: string; members?: string[] }[]>(text);
  if (!Array.isArray(raw)) throw new Error("Category groups: no JSON");
  const taken = new Set(cats.map((c) => c.slug));
  const groups: Group[] = [];
  for (const g of raw) {
    const name = (g.name ?? "").trim().slice(0, 40);
    const members = (g.members ?? []).filter((m) => typeof m === "string" && top.some((c) => c.slug === m));
    if (!name || !members.length) continue;
    let slug = slugify(name) || "range";
    while (taken.has(slug)) slug = `${slug}-range`;
    taken.add(slug);
    groups.push({ slug, name, description: (g.description ?? "").trim().slice(0, 160), members });
  }
  if (groups.length < 2) throw new Error("Category groups: too few groups");
  const categories = applyGroups(cats, groups);
  // Counts in the copy follow the new groups.
  const next: SiteDoc = { ...doc, categoryGroups: groups, categories, pages: syncCategoryCounts(doc.pages, categories) };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(next)}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return groups.length;
}
