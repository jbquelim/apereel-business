// One business, one row: find domains that redirect to another domain already
// in the dataset (aurate.com -> auratenewyork.com) and merge them. Also fills
// deterministic ccTLD countries. Run: node --env-file=.env.local tools/merge-aliases.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const TLD_COUNTRY = {
  ca: "Canada", uk: "United Kingdom", au: "Australia", nz: "New Zealand",
  de: "Germany", fr: "France", ie: "Ireland", jp: "Japan", sg: "Singapore",
  in: "India", mx: "Mexico", br: "Brazil", za: "South Africa",
};

// Deterministic country from ccTLD
let ccTldSet = 0;
for (const [tld, country] of Object.entries(TLD_COUNTRY)) {
  const r = await sql`
    UPDATE businesses SET country = ${country}
    WHERE country IS NULL AND (domain LIKE ${"%." + tld} OR domain LIKE ${"%.co." + tld} OR domain LIKE ${"%.com." + tld})
  `;
  ccTldSet += r.length ?? 0;
}

const businesses = await sql`SELECT id, domain FROM businesses ORDER BY id`;
const byDomain = new Map(businesses.map((b) => [b.domain, b]));

async function finalHost(domain) {
  try {
    const res = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    });
    return new URL(res.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const merges = [];
const CONCURRENCY = 15;
for (let i = 0; i < businesses.length; i += CONCURRENCY) {
  const chunk = businesses.slice(i, i + CONCURRENCY);
  const hosts = await Promise.all(chunk.map((b) => finalHost(b.domain)));
  chunk.forEach((b, j) => {
    const host = hosts[j];
    if (host && host !== b.domain && byDomain.has(host)) {
      merges.push({ from: b, into: byDomain.get(host) });
    }
  });
  if (i % 150 === 0) console.log(`checked ${Math.min(i + CONCURRENCY, businesses.length)}/${businesses.length}`);
}

console.log(`\nFound ${merges.length} alias pairs:`);
for (const m of merges) {
  console.log(`  ${m.from.domain} -> ${m.into.domain}`);
  await sql`UPDATE inventory_snapshots SET business_id = ${m.into.id} WHERE business_id = ${m.from.id}`;
  await sql`UPDATE product_samples SET business_id = ${m.into.id} WHERE business_id = ${m.from.id}`;
  await sql`UPDATE credibility_snapshots SET business_id = ${m.into.id} WHERE business_id = ${m.from.id}`;
  await sql`UPDATE businesses SET discovered_from = ${m.into.domain} WHERE discovered_from = ${m.from.domain}`;
  await sql`DELETE FROM crawl_queue WHERE domain = ${m.from.domain}`;
  await sql`DELETE FROM businesses WHERE id = ${m.from.id}`;
}

const [{ n }] = await sql`SELECT count(*)::int AS n FROM businesses`;
console.log(`\nccTLD countries set: ${ccTldSet} | businesses after merge: ${n}`);
