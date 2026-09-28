import { neon } from "@neondatabase/serverless";
import { recordAuditSnapshot, recordTechSnapshots } from "./marketdb";
import { GIFT_CARD_RE, readShopifyCatalog, shopifyMinPrice } from "./shopify-feed";
import { fetchSiteStack } from "./tech-stack";

// Snapshot-only refresh for the stores that matter most: the competitors in
// saved competitor sets (i.e. of businesses that ran an audit) and the audited
// businesses themselves. No AI calls — just the public product feed (catalog
// by product type, exact prices) and the homepage's marketing tools — so the
// "what changed" history grows cheaply and regularly.

const STALE_AFTER_DAYS = 3;
const PER_RUN = 12;
const PARALLEL = 4;
const MAX_PRODUCTS = 300;

type Target = { domain: string; name: string | null };

async function pickTargets(limit: number): Promise<Target[]> {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  return (await sql`
    WITH tracked AS (
      SELECT lower(regexp_replace(c->>'domain', '^www\\.', '')) AS domain, c->>'name' AS name
      FROM competitor_sets, jsonb_array_elements(competitors) AS c
      UNION
      SELECT domain, NULL FROM competitor_sets
    )
    SELECT DISTINCT ON (t.domain) t.domain, COALESCE(b.name, t.name) AS name
    FROM tracked t
    LEFT JOIN businesses b ON b.domain = t.domain
    WHERE b.last_crawled IS NULL OR b.last_crawled < now() - make_interval(days => ${STALE_AFTER_DAYS})
    ORDER BY t.domain, b.last_crawled NULLS FIRST
    LIMIT ${limit}
  `) as Target[];
}

export async function refreshOne(t: Target): Promise<{ domain: string; products: number; tools: number }> {
  let feed = await readShopifyCatalog(t.domain);
  if (feed.products.length === 0) feed = await readShopifyCatalog(`www.${t.domain}`);
  const sellable = feed.products.filter((p) => p.title && p.handle && !GIFT_CARD_RE.test(`${p.title} ${p.product_type ?? ""}`));

  if (sellable.length >= 20) {
    const byType = new Map<string, number[]>();
    for (const p of sellable) {
      const type = (p.product_type ?? "").trim();
      const price = shopifyMinPrice(p);
      if (!type) continue;
      byType.set(type, [...(byType.get(type) ?? []), ...(price != null ? [price] : [])]);
    }
    const counts = new Map<string, number>();
    for (const p of sellable) {
      const type = (p.product_type ?? "").trim();
      if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    const categories = [...counts.entries()]
      .filter(([, n]) => n >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, productCount]) => {
        const prices = byType.get(category) ?? [];
        const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
        return {
          category,
          productCount,
          avgPrice: avg != null ? `$${Math.round(avg)}` : null,
          priceRange: prices.length ? `$${Math.round(Math.min(...prices))} - $${Math.round(Math.max(...prices))}` : null,
        };
      });
    await recordAuditSnapshot([
      {
        domain: t.domain,
        name: t.name,
        industry: null,
        subIndustry: null,
        country: null,
        source: "live",
        discoveredFrom: null,
        categories,
        products: sellable.slice(0, MAX_PRODUCTS).map((p) => {
          const min = shopifyMinPrice(p);
          return {
            title: p.title!,
            productType: p.product_type || null,
            priceCents: min != null ? Math.round(min * 100) : null,
            url: `https://${t.domain}/products/${p.handle}`,
          };
        }),
      },
    ]);
  }

  const stack = await fetchSiteStack(t.name ?? t.domain, t.domain);
  if (stack) await recordTechSnapshots([stack]);
  return { domain: t.domain, products: sellable.length, tools: stack?.technologies.length ?? 0 };
}

/** Refreshes stale tracked stores until the time budget runs out. */
export async function refreshTrackedStores(budgetMs: number) {
  const started = Date.now();
  const targets = await pickTargets(PER_RUN);
  const done: { domain: string; products: number; tools: number }[] = [];
  for (let i = 0; i < targets.length && Date.now() - started < budgetMs; i += PARALLEL) {
    const batch = targets.slice(i, i + PARALLEL);
    const results = await Promise.all(
      batch.map((t) =>
        Promise.race([
          refreshOne(t),
          new Promise<null>((r) => setTimeout(() => r(null), 40_000)),
        ]).catch(() => null),
      ),
    );
    for (const r of results) if (r) done.push(r);
  }
  console.log(`Tracked refresh: ${done.length}/${targets.length} stores in ${Math.round((Date.now() - started) / 1000)}s`);
  return done;
}
