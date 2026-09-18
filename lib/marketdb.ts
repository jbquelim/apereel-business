import { neon } from "@neondatabase/serverless";
import type { ProofSignals } from "./proofSignals";
import type { RawProduct } from "./productMatch";
import { isBlockedDomain } from "./taxonomy";

// Market-intelligence dataset: every audit persists the businesses it touched,
// their industry classification, and an inventory snapshot per category. The
// crawl queue seeds future snowball discovery (competitors of competitors).

export type SnapshotSource = "live" | "sitemap" | "crawl" | "search";

export type CategorySnapshot = {
  category: string;
  productCount: number | null;
  avgPrice: string | null;
  priceRange: string | null;
};

export type BusinessSnapshot = {
  domain: string;
  name: string | null;
  industry: string | null;
  subIndustry: string | null;
  country: string | null;
  source: SnapshotSource | null;
  discoveredFrom: string | null;
  categories: CategorySnapshot[];
  businessModel?: string | null; // retail | b2b | hybrid
  proof?: ProofSignals | null;
  products?: RawProduct[] | null;
};

type Sql = ReturnType<typeof neon>;

let _sql: Sql | null = null;

function getSql(): Sql | null {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// "$1,240" -> 124000; null when no parseable dollar figure
function priceToCents(s: string | null): number | null {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/\$\s*(\d+(?:\.\d+)?)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : null;
}

// "$250 - $5,000" -> [25000, 500000]
function rangeToCents(s: string | null): [number | null, number | null] {
  const nums =
    s
      ?.replace(/,/g, "")
      .match(/\$\s*\d+(?:\.\d+)?/g)
      ?.map((x) => Math.round(parseFloat(x.replace(/[$\s]/g, "")) * 100)) ?? [];
  if (nums.length === 0) return [null, null];
  return [Math.min(...nums), Math.max(...nums)];
}

export type SegmentBenchmark = {
  segment: string;
  storesTracked: number;
  medianDepth: number | null; // median of each store's deepest tracked category
  medianPriceCents: number | null; // median of per-store average price points
  priceLowCents: number | null; // p25 of store price points
  priceHighCents: number | null; // p75 of store price points
};

// Segment medians from each business's LATEST crawl. Depth uses the deepest
// tracked category per store (categories overlap, so summing would
// double-count); price uses each store's average price point. Only shown
// when the segment has enough stores to make a median honest.
const MIN_STORES_FOR_BENCHMARK = 5;

export async function fetchSegmentBenchmark(
  industry: string,
  subIndustry: string,
): Promise<SegmentBenchmark | null> {
  try {
    if (!process.env.DATABASE_URL) return null;
    const sql = neon(process.env.DATABASE_URL);

    const compute = async (bySub: boolean) => {
      const rows = (await sql`
        WITH latest AS (
          SELECT s.business_id, max(s.captured_at) AS at
          FROM inventory_snapshots s
          JOIN businesses b ON b.id = s.business_id
          WHERE b.industry = ${industry}
            AND (${!bySub} OR b.sub_industry = ${subIndustry})
          GROUP BY s.business_id
        ),
        per_store AS (
          SELECT s.business_id,
                 max(s.product_count) AS depth,
                 avg(s.avg_price_cents) AS price
          FROM inventory_snapshots s
          JOIN latest l ON l.business_id = s.business_id AND l.at = s.captured_at
          GROUP BY s.business_id
        )
        SELECT count(*)::int AS stores,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY depth)::int AS median_depth,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY price)::int AS median_price,
               percentile_cont(0.25) WITHIN GROUP (ORDER BY price)::int AS price_low,
               percentile_cont(0.75) WITHIN GROUP (ORDER BY price)::int AS price_high
        FROM per_store
        WHERE price IS NOT NULL OR depth IS NOT NULL
      `) as {
        stores: number;
        median_depth: number | null;
        median_price: number | null;
        price_low: number | null;
        price_high: number | null;
      }[];
      return rows[0] ?? null;
    };

    // Prefer the tight sub-segment; widen to the industry when it's thin.
    let stats = await compute(true);
    let segment = subIndustry;
    if (!stats || stats.stores < MIN_STORES_FOR_BENCHMARK) {
      stats = await compute(false);
      segment = industry;
    }
    if (!stats || stats.stores < MIN_STORES_FOR_BENCHMARK) return null;

    return {
      segment,
      storesTracked: stats.stores,
      medianDepth: stats.median_depth,
      medianPriceCents: stats.median_price,
      priceLowCents: stats.price_low,
      priceHighCents: stats.price_high,
    };
  } catch (err) {
    console.error("fetchSegmentBenchmark failed:", err);
    return null;
  }
}

// Best-effort: dataset growth must never break or slow an audit, so every
// failure is logged and swallowed.
export async function recordAuditSnapshot(
  businesses: BusinessSnapshot[],
): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  for (const b of businesses) {
    try {
      // One business, one row — "www.example.com" and "example.com" must not
      // split into two identities.
      const domain = b.domain.replace(/^www\./, "");
      // Marketplaces and mass giants never enter the dataset.
      if (isBlockedDomain(domain)) continue;
      const discoveredFrom = b.discoveredFrom?.replace(/^www\./, "") ?? null;
      const rows = (await sql`
        INSERT INTO businesses (domain, name, industry, sub_industry, country, platform, discovered_from, business_model, last_crawled)
        VALUES (${domain}, ${b.name}, ${b.industry}, ${b.subIndustry}, ${b.country}, ${b.source}, ${discoveredFrom}, ${b.businessModel ?? null}, now())
        ON CONFLICT (domain) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, businesses.name),
          -- First classification wins: model labels drift between runs
          -- ("Jewelry" vs "Retail"), and churning them breaks grouping.
          industry = COALESCE(businesses.industry, EXCLUDED.industry),
          sub_industry = COALESCE(businesses.sub_industry, EXCLUDED.sub_industry),
          country = COALESCE(EXCLUDED.country, businesses.country),
          platform = COALESCE(EXCLUDED.platform, businesses.platform),
          business_model = COALESCE(businesses.business_model, EXCLUDED.business_model),
          last_crawled = now()
        RETURNING id
      `) as { id: number }[];
      const businessId = rows[0]?.id;
      if (!businessId) continue;

      for (const c of b.categories) {
        const [minCents, maxCents] = rangeToCents(c.priceRange);
        await sql`
          INSERT INTO inventory_snapshots (business_id, category, product_count, avg_price_cents, price_min_cents, price_max_cents, source)
          VALUES (${businessId}, ${c.category}, ${c.productCount}, ${priceToCents(c.avgPrice)}, ${minCents}, ${maxCents}, ${b.source ?? "crawl"})
        `;
      }

      if (b.proof) {
        await sql`
          INSERT INTO credibility_snapshots (business_id, sitemap_found, case_studies, resources, certifications, industries_served, has_quote_path, has_live_chat, has_published_pricing)
          VALUES (${businessId}, ${b.proof.sitemapFound}, ${b.proof.caseStudies}, ${b.proof.resources}, ${b.proof.certifications}, ${b.proof.industriesServed}, ${b.proof.hasQuotePath}, ${b.proof.hasLiveChat}, ${b.proof.hasPublishedPricing})
        `;
      }

      if (b.products && b.products.length > 0) {
        // One batched insert — 150 individual round trips would make the
        // post-response window drag.
        const rows = b.products.map((p) => ({
          title: p.title,
          product_type: p.productType,
          price_cents: p.priceCents,
          url: p.url,
        }));
        await sql`
          INSERT INTO product_samples (business_id, title, product_type, price_cents, url)
          SELECT ${businessId}, x.title, x.product_type, x.price_cents, x.url
          FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
            AS x(title text, product_type text, price_cents int, url text)
        `;
      }

      // Discovered competitors seed the snowball queue for later processing.
      if (discoveredFrom) {
        await sql`
          INSERT INTO crawl_queue (domain) VALUES (${domain})
          ON CONFLICT (domain) DO NOTHING
        `;
      }
    } catch (err) {
      console.error("marketdb: failed to record", b.domain, err);
    }
  }
}
