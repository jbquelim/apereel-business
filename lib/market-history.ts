import { neon } from "@neondatabase/serverless";

// "What changed since we started watching": like-for-like comparisons from the
// market index's own history. Only two kinds of fact are reported, both
// measured the same way at both dates:
//   • price moves on the SAME product URL between the first and latest sample
//   • product-count moves in the SAME category between the first and latest
//     live/sitemap snapshot
// Newly seen products are NOT reported: samples are capped per store, so an
// apparently new product can be a sampling artefact.

export type HistoryFacts = { domain: string; name: string; since: string; facts: string[] };

const MIN_DAYS_APART = 3;
const bare = (d: string) => d.replace(/^www\./, "").toLowerCase();
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function db() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

async function priceMoves(domain: string) {
  const sql = db();
  if (!sql) return null;
  const rows = (await sql`
    WITH biz AS (SELECT id FROM businesses WHERE domain = ${domain}),
    span AS (
      SELECT min(captured_at::date) AS d0, max(captured_at::date) AS d1
      FROM product_samples WHERE business_id = (SELECT id FROM biz) AND captured_at > now() - interval '90 days'
    ),
    f AS (
      SELECT DISTINCT ON (url) url, price_cents FROM product_samples
      WHERE business_id = (SELECT id FROM biz) AND captured_at::date = (SELECT d0 FROM span)
        AND url IS NOT NULL AND price_cents > 0
      ORDER BY url, captured_at
    ),
    l AS (
      SELECT DISTINCT ON (url) url, price_cents FROM product_samples
      WHERE business_id = (SELECT id FROM biz) AND captured_at::date = (SELECT d1 FROM span)
        AND url IS NOT NULL AND price_cents > 0
      ORDER BY url, captured_at DESC
    )
    SELECT (SELECT d0 FROM span) AS d0, (SELECT d1 FROM span) AS d1,
           count(*)::int AS matched,
           count(*) FILTER (WHERE l.price_cents > f.price_cents)::int AS up,
           count(*) FILTER (WHERE l.price_cents < f.price_cents)::int AS down,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY (l.price_cents - f.price_cents)::float / f.price_cents)
             FILTER (WHERE l.price_cents <> f.price_cents) AS median_change
    FROM f JOIN l USING (url)
  `) as { d0: string | null; d1: string | null; matched: number; up: number; down: number; median_change: number | null }[];
  const r = rows[0];
  if (!r?.d0 || !r.d1 || r.matched < 10) return null;
  if ((new Date(r.d1).getTime() - new Date(r.d0).getTime()) / 86_400_000 < MIN_DAYS_APART) return null;
  return r;
}

async function catalogMoves(domain: string) {
  const sql = db();
  if (!sql) return null;
  const rows = (await sql`
    WITH biz AS (SELECT id FROM businesses WHERE domain = ${domain}),
    snaps AS (
      SELECT category, product_count, captured_at FROM inventory_snapshots
      WHERE business_id = (SELECT id FROM biz) AND source IN ('live', 'sitemap')
        AND product_count IS NOT NULL AND captured_at > now() - interval '90 days'
    ),
    span AS (SELECT min(captured_at) AS t0, max(captured_at) AS t1 FROM snaps)
    SELECT a.category, a.product_count AS before, b.product_count AS after,
           (SELECT t0 FROM span) AS t0, (SELECT t1 FROM span) AS t1
    FROM snaps a JOIN snaps b ON lower(a.category) = lower(b.category)
    WHERE a.captured_at = (SELECT t0 FROM span) AND b.captured_at = (SELECT t1 FROM span)
  `) as { category: string; before: number; after: number; t0: string; t1: string }[];
  if (rows.length === 0) return null;
  if ((new Date(rows[0].t1).getTime() - new Date(rows[0].t0).getTime()) / 86_400_000 < MIN_DAYS_APART) return null;
  const moved = rows
    .filter((r) => Math.abs(r.after - r.before) >= 5 && Math.abs(r.after - r.before) / Math.max(r.before, 1) >= 0.05)
    .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before))
    .slice(0, 3);
  return { t0: rows[0].t0, compared: rows.length, moved };
}

/** Plain-language facts for one business; null when there's no usable history. */
export async function historyFor(domain: string, name: string): Promise<HistoryFacts | null> {
  const d = bare(domain);
  try {
    const [prices, catalog] = await Promise.all([priceMoves(d), catalogMoves(d)]);
    const facts: string[] = [];
    let since: string | null = null;
    if (prices?.d0) {
      const d0 = prices.d0;
      since = d0;
      const changed = prices.up + prices.down;
      if (changed === 0) {
        facts.push(`Held prices steady: none of ${prices.matched} tracked products changed price since ${fmtDate(d0)}.`);
      } else {
        const pct = prices.median_change != null ? ` (typical change ${prices.median_change > 0 ? "+" : ""}${Math.round(prices.median_change * 100)}%)` : "";
        facts.push(
          `Changed prices on ${changed} of ${prices.matched} tracked products since ${fmtDate(d0)}: ${prices.up} up, ${prices.down} down${pct}.`,
        );
      }
    }
    if (catalog) {
      if (!since || new Date(catalog.t0) < new Date(since)) since = catalog.t0;
      for (const m of catalog.moved) {
        const delta = m.after - m.before;
        facts.push(`${m.category}: ${m.before.toLocaleString("en-US")} → ${m.after.toLocaleString("en-US")} products (${delta > 0 ? "+" : ""}${delta}) since ${fmtDate(catalog.t0)}.`);
      }
      if (catalog.moved.length === 0 && catalog.compared >= 2) {
        facts.push(`Category sizes held steady across ${catalog.compared} tracked categories since ${fmtDate(catalog.t0)}.`);
      }
    }
    return facts.length > 0 && since ? { domain: d, name, since: fmtDate(since), facts } : null;
  } catch (err) {
    console.error("historyFor failed:", d, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function historyForMany(sites: { domain: string; name: string }[]): Promise<HistoryFacts[]> {
  const all = await Promise.all(sites.map((s) => historyFor(s.domain, s.name)));
  return all.filter((h): h is HistoryFacts => h !== null);
}
