// Content and ads QA: runs lib/content-qa on every client's latest batch and
// lists what a client would see that they shouldn't. Read-only, no AI, free:
//
//   npx tsx --env-file=.env.local tools/content-qa.mts [domain]

import { neon } from "@neondatabase/serverless";
import { checkItem, fixItem, type QaItem } from "../lib/content-qa";
import { syncCounts } from "../lib/content-release";
import { qaContext } from "../lib/content-context";

const sql = neon(process.env.DATABASE_URL!);
const only = process.argv[2];
const clients = (await sql`
  SELECT c.id, c.domain, c.service, c.tier, max(i.batch) AS batch FROM clients c JOIN content_items i ON i.client_id = c.id
  WHERE c.service IN ('premium-creative', 'advertising') GROUP BY 1, 2, 3, 4 ORDER BY 2, 3
`) as { id: string; domain: string; service: string; tier: string; batch: string }[];

const totals = new Map<string, number>();
for (const c of clients.filter((x) => !only || x.domain === only)) {
  const ctx = await qaContext(c.domain);
  const items = (await sql`SELECT id, kind, data, product_url, image FROM content_items WHERE client_id = ${c.id} AND batch = ${c.batch} ORDER BY id`) as (QaItem & { id: number })[];
  const flagged = items.map((i) => ({ i, issues: checkItem(i, ctx) })).filter((x) => x.issues.length);
  // What the release gate's automatic fixes leave for the AI repair (lib/content-release).
  const after = items.map((i) => ({ i, issues: checkItem({ ...i, data: syncCounts(fixItem(i.data), ctx.catalogTotal) }, ctx) })).filter((x) => x.issues.length);
  console.log(`\n${c.domain} · ${c.service} · ${c.tier} · ${c.batch}: ${flagged.length} of ${items.length} items flagged (catalog ${ctx.catalogTotal ?? "unknown"}, ${ctx.products.length} products known)`);
  console.log(`  after automatic fixes: ${after.length} still need the AI repair${after.length ? ` (${[...new Set(after.flatMap((x) => x.issues.map((y) => y.check)))].join(", ")})` : ""}`);
  for (const { i, issues } of flagged.slice(0, 12)) {
    for (const x of issues) {
      totals.set(x.check, (totals.get(x.check) ?? 0) + 1);
      console.log(`  #${i.id} ${i.kind} · ${x.check}${x.field ? ` (${x.field})` : ""}: ${x.detail}`);
    }
  }
  for (const { issues } of flagged.slice(12)) for (const x of issues) totals.set(x.check, (totals.get(x.check) ?? 0) + 1);
}
console.log(`\nBy check: ${[...totals].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ")}`);
