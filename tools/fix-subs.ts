// Snap stray sub_industry labels onto the pinned taxonomy for rows whose
// industry was already valid (the batch reclassifier skipped them).
// Run: npx tsx --env-file=.env.local tools/fix-subs.ts
import { neon } from "@neondatabase/serverless";
import { TAXONOMY } from "../lib/taxonomy";

const sql = neon(process.env.DATABASE_URL!);

async function main() {

const rows = (await sql`SELECT id, industry, sub_industry FROM businesses`) as {
  id: number;
  industry: string | null;
  sub_industry: string | null;
}[];

function bestSub(industry: string, sub: string): string {
  const subs = TAXONOMY[industry];
  const exact = subs.find((s) => s.toLowerCase() === sub.toLowerCase());
  if (exact) return exact;
  // token overlap: pick the taxonomy sub sharing the most words
  const tokens = new Set(sub.toLowerCase().split(/[^a-z]+/).filter((t) => t.length > 3));
  let best = subs[0];
  let bestScore = 0;
  for (const s of subs) {
    const score = s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((t) => tokens.has(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

let fixed = 0;
for (const r of rows) {
  if (!r.industry || !(r.industry in TAXONOMY)) continue;
  const subs = TAXONOMY[r.industry];
  if (r.sub_industry && (subs as readonly string[]).includes(r.sub_industry)) continue;
  const snapped = bestSub(r.industry, r.sub_industry ?? "");
  await sql`UPDATE businesses SET sub_industry = ${snapped} WHERE id = ${r.id}`;
  fixed++;
}
const [{ subs }] = (await sql`SELECT count(DISTINCT sub_industry)::int AS subs FROM businesses`) as {
  subs: number;
}[];
console.log(`snapped ${fixed} stray sub-labels; distinct subs now: ${subs}`);
}

main();
