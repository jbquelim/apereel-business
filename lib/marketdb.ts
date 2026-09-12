import { neon } from "@neondatabase/serverless";

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

// Best-effort: dataset growth must never break or slow an audit, so every
// failure is logged and swallowed.
export async function recordAuditSnapshot(
  businesses: BusinessSnapshot[],
): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  for (const b of businesses) {
    try {
      const rows = (await sql`
        INSERT INTO businesses (domain, name, industry, sub_industry, country, platform, discovered_from, last_crawled)
        VALUES (${b.domain}, ${b.name}, ${b.industry}, ${b.subIndustry}, ${b.country}, ${b.source}, ${b.discoveredFrom}, now())
        ON CONFLICT (domain) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, businesses.name),
          industry = COALESCE(EXCLUDED.industry, businesses.industry),
          sub_industry = COALESCE(EXCLUDED.sub_industry, businesses.sub_industry),
          country = COALESCE(EXCLUDED.country, businesses.country),
          platform = COALESCE(EXCLUDED.platform, businesses.platform),
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

      // Discovered competitors seed the snowball queue for later processing.
      if (b.discoveredFrom) {
        await sql`
          INSERT INTO crawl_queue (domain) VALUES (${b.domain})
          ON CONFLICT (domain) DO NOTHING
        `;
      }
    } catch (err) {
      console.error("marketdb: failed to record", b.domain, err);
    }
  }
}
