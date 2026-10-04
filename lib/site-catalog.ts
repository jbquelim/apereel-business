import { neon } from "@neondatabase/serverless";
import type { SiteDoc, SiteProduct } from "./site-types";

// Reads a site's full catalog (site_products) for the page being shown:
// one page of a listing (category, search, paging), or one product with
// related ones. Sites without an imported catalog use their document.

export type ListingView = {
  kind: "listing";
  products: SiteProduct[];
  total: number;
  page: number;
  pages: number;
  q: string;
  category: SiteDoc["categories"][number] | null;
  /** The category itself and everything under it (for the listing query). */
  scopeCount: number;
  /** Spec filters for this listing: values with counts, and the one chosen. */
  facets: { key: string; label: string; values: { value: string; count: number }[]; selected: string | null }[];
};
export type ProductView = { kind: "product"; product: SiteProduct; related: SiteProduct[] };
export type SitemapView = { kind: "sitemap"; slugs: string[] };
export type CatalogView = ListingView | ProductView | SitemapView;

type Row = { slug: string; title: string; price: string | null; currency: string | null; image: string | null; description: string | null; category: string | null; specs: SiteProduct["specs"] | null; featured: boolean; source_url: string };

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const toProduct = (r: Row): SiteProduct => ({
  slug: r.slug,
  title: r.title,
  price: r.price != null ? Number(r.price) : null,
  currency: r.currency,
  image: r.image,
  description: r.description ?? `${r.title}.`,
  category: r.category,
  sourceUrl: r.source_url,
  featured: r.featured,
  ...(r.specs ? { specs: r.specs } : {}),
});

/** A category and all its descendants' slugs. */
function withChildren(doc: SiteDoc, slug: string): string[] {
  const out = [slug];
  for (let i = 0; i < out.length; i++) for (const c of doc.categories) if (c.parent === out[i]) out.push(c.slug);
  return out;
}

export async function loadCatalogView(siteId: string, doc: SiteDoc, path: string[], query: URLSearchParams, perPage: number): Promise<CatalogView | null> {
  if (!doc.catalogSize) return null;
  const joined = path.join("/");
  if (joined === "sitemap.xml") {
    const rows = (await sql()`SELECT slug FROM site_products WHERE site_id = ${siteId} ORDER BY position`) as { slug: string }[];
    return { kind: "sitemap", slugs: rows.map((r) => r.slug) };
  }
  if (path[0] === "products" && path[1]) {
    const r = ((await sql()`SELECT * FROM site_products WHERE site_id = ${siteId} AND slug = ${path[1]}`) as Row[])[0];
    if (!r) return null;
    const related = (await sql()`
      SELECT * FROM site_products WHERE site_id = ${siteId} AND slug <> ${r.slug} AND image IS NOT NULL
        AND (${r.category}::text IS NULL OR category = ${r.category}) ORDER BY position LIMIT 3
    `) as Row[];
    return { kind: "product", product: toProduct(r), related: related.map(toProduct) };
  }
  const isListing = joined === "products" || (path[0] === "collections" && !!path[1]);
  if (!isListing) return null;
  const category = path[0] === "collections" ? doc.categories.find((c) => c.slug === path[1]) ?? null : null;
  if (path[0] === "collections" && !category) return null;
  const scope = category ? withChildren(doc, category.slug) : null;
  const q = (query.get("q") ?? "").trim().slice(0, 80);
  const like = q ? q.split(/\s+/).filter(Boolean).map((w) => `%${w.replace(/[%_]/g, "")}%`) : [];
  // Spec filters (lib/facets): ?thread=1/8 IPS&finish=Polished Brass
  const chosen = Object.fromEntries((doc.facets ?? []).map((f) => [f.key, (query.get(f.key) ?? "").slice(0, 60)]).filter(([, v]) => v));
  const where = JSON.stringify(chosen);
  const count = ((await sql()`
    SELECT count(*)::int AS n FROM site_products WHERE site_id = ${siteId}
      AND (${scope}::text[] IS NULL OR category = ANY(${scope}))
      AND (cardinality(${like}::text[]) = 0 OR (SELECT bool_and((title || ' ' || slug) ILIKE w) FROM unnest(${like}::text[]) AS w))
      AND (${where}::jsonb = '{}'::jsonb OR facets @> ${where}::jsonb)
  `) as { n: number }[])[0].n;
  const pages = Math.max(1, Math.ceil(count / perPage));
  const page = Math.min(pages, Math.max(1, Number(query.get("page")) || 1));
  const rows = (await sql()`
    SELECT * FROM site_products WHERE site_id = ${siteId}
      AND (${scope}::text[] IS NULL OR category = ANY(${scope}))
      AND (cardinality(${like}::text[]) = 0 OR (SELECT bool_and((title || ' ' || slug) ILIKE w) FROM unnest(${like}::text[]) AS w))
      AND (${where}::jsonb = '{}'::jsonb OR facets @> ${where}::jsonb)
    ORDER BY (image IS NULL), position LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
  `) as Row[];
  // Each filter's values among what's listed (within the category, search and other filters).
  const counts = doc.facets?.length
    ? ((await sql()`
        SELECT f.key, f.value, count(*)::int AS n FROM site_products p, jsonb_each_text(p.facets) AS f
        WHERE p.site_id = ${siteId} AND p.facets IS NOT NULL
          AND (${scope}::text[] IS NULL OR p.category = ANY(${scope}))
          AND (cardinality(${like}::text[]) = 0 OR (SELECT bool_and((p.title || ' ' || p.slug) ILIKE w) FROM unnest(${like}::text[]) AS w))
          AND (${where}::jsonb = '{}'::jsonb OR p.facets @> ${where}::jsonb)
        GROUP BY 1, 2
      `) as { key: string; value: string; n: number }[])
    : [];
  const facets = (doc.facets ?? []).map((f) => ({
    ...f,
    values: counts.filter((c) => c.key === f.key).sort((a, b) => b.n - a.n).slice(0, 14).map((c) => ({ value: c.value, count: c.n })),
    selected: chosen[f.key] ?? null,
  })).filter((f) => f.selected || f.values.length > 1);
  const scopeCount = q || Object.keys(chosen).length
    ? ((await sql()`SELECT count(*)::int AS n FROM site_products WHERE site_id = ${siteId} AND (${scope}::text[] IS NULL OR category = ANY(${scope}))`) as { n: number }[])[0].n
    : count;
  return { kind: "listing", products: rows.map(toProduct), total: count, page, pages, q, category, scopeCount, facets };
}
