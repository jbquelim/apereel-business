import { neon } from "@neondatabase/serverless";
import type { SiteDoc } from "./site-types";
import { renderPath } from "./site-render";
import { loadCatalogView } from "./site-catalog";
import { templateById } from "./templates";
import { checkDoc, checkPage, type QaIssue } from "./site-qa";
import { byRank } from "./templates/kit";

// Renders a site's key pages the way visitors get them and runs the quality
// checks (lib/site-qa). Results are saved on the site for the admin page.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** The pages worth checking: home, the shop, a main category, a product, about, contact. */
export function qaPaths(doc: SiteDoc): string[] {
  const cat = doc.categories.filter((c) => !c.parent).sort(byRank)[0];
  const product = doc.products.find((p) => p.image) ?? doc.products[0];
  return ["/", "/products", ...(cat ? [`/collections/${cat.slug}`] : []), ...(product ? [`/products/${product.slug}`] : []), "/about", "/contact"];
}

/** Checks a site (optionally in another template) and returns the issues found. */
export async function qaSite(site: { id: string; slug: string; doc: SiteDoc }, design?: string): Promise<QaIssue[]> {
  const issues = checkDoc(site.doc);
  const count = site.doc.catalogSize ?? site.doc.products.length;
  const perPage = templateById(design ?? site.doc.design)?.perPage ?? 48;
  for (const path of qaPaths(site.doc)) {
    const parts = path.split("/").filter(Boolean);
    const query = new URLSearchParams();
    const catalog = await loadCatalogView(site.id, site.doc, parts, query, perPage).catch(() => null);
    const base = `/sites/${site.slug}`;
    const r = renderPath({ catalog, siteId: site.id, doc: site.doc, base, origin: `https://www.apereel.com${base}`, apiOrigin: "https://www.apereel.com", preview: true, design }, parts, query);
    if (r.kind !== "html" || r.status !== 200) {
      issues.push({ page: path, check: "render", detail: r.kind === "html" ? `status ${r.status}` : r.kind });
      continue;
    }
    issues.push(...checkPage(path, r.body, count, (site.doc.categories).map((c) => c.count ?? 0)));
  }
  return issues;
}

/** Runs the checks and saves them on the site. */
export async function runSiteQa(siteId: string): Promise<QaIssue[]> {
  const site = ((await sql()`SELECT id, slug, doc FROM sites WHERE id = ${siteId}`) as { id: string; slug: string; doc: SiteDoc }[])[0];
  if (!site) return [];
  const issues = await qaSite(site);
  await sql()`UPDATE sites SET qa = ${JSON.stringify(issues)}::jsonb, qa_at = now() WHERE id = ${siteId}`;
  return issues;
}
