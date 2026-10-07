import { neon } from "@neondatabase/serverless";
import { fetchAuditResult, fetchCompetitorSet } from "./marketdb";
import { loadCatalog } from "./content-engine";
import { siteAnalysis } from "./site-analysis";
import type { QaContext } from "./content-qa";
import { fetchSitemapCatalog } from "./site-fetch";

// What's known to be true about a business, for checking its content and
// ads (lib/content-qa): its products and prices, the facts from its audit and
// analysis, its competitors, and its catalog size when a site has counted it.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

export async function qaContext(domain: string): Promise<QaContext> {
  const [audit, analysis, catalog, saved, site] = await Promise.all([
    fetchAuditResult<Record<string, unknown> & { industry?: { competitors?: { name: string; domain?: string }[] } }>(domain).catch(() => null),
    siteAnalysis(domain).catch(() => null),
    loadCatalog(domain).catch(() => []),
    fetchCompetitorSet(domain).catch(() => null),
    sql()`
      SELECT s.id, (s.doc->>'catalogTotal')::int AS total FROM sites s JOIN clients c ON c.id = s.client_id
      WHERE c.domain = ${domain} ORDER BY s.updated_at DESC LIMIT 1
    `.then((r) => (r as { id: string; total: number | null }[])[0] ?? null),
  ]);
  const siteProducts = site
    ? ((await sql()`SELECT title, source_url AS url, price::float AS price FROM site_products WHERE site_id = ${site.id}`) as { title: string; url: string; price: number | null }[])
    : [];
  const competitors = [...(audit?.industry?.competitors ?? []), ...(saved ?? [])].flatMap((c) => [c.name, c.domain ?? ""]).filter((x) => x && x.length > 3);
  return {
    products: [...catalog.map((p) => ({ title: p.title, url: p.url, price: p.price })), ...siteProducts],
    // The audit and analysis as text: a claim is supported when its words or number are in here.
    facts: [JSON.stringify(audit ?? {}), JSON.stringify(analysis?.plan ?? {}), JSON.stringify(analysis?.audit ?? {})].join("\n"),
    competitors: [...new Set(competitors)],
    catalogTotal: site?.total ?? (await sitemapCount(domain)),
  };
}

/** Products the store's sitemap lists (each once), when no website has counted the catalog. */
async function sitemapCount(domain: string): Promise<number | null> {
  const s = await fetchSitemapCatalog(domain).catch(() => null);
  const n = new Set((s?.productUrls ?? []).map((u) => u.replace(/[?#].*$/, "").replace(/\/$/, "").split("/").pop())).size;
  return n >= 20 ? n : null;
}

/** The store's catalog size: counted by its website when there is one, else its sitemap. */
export async function catalogTotalFor(domain: string): Promise<number | null> {
  const rows = (await sql()`
    SELECT (s.doc->>'catalogTotal')::int AS total FROM sites s JOIN clients c ON c.id = s.client_id WHERE c.domain = ${domain} ORDER BY s.updated_at DESC LIMIT 1
  `) as { total: number | null }[];
  return rows[0]?.total ?? (await sitemapCount(domain));
}
