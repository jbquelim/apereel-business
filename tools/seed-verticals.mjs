// Bulk-enqueue seed domains into the discovery queue. Each gets processed by
// the nightly ingest cron (classification + inventory + competitor discovery),
// and its discovered competitors keep the snowball rolling in that vertical.
// Run: node --env-file=.env.local tools/seed-verticals.mjs
import { neon } from "@neondatabase/serverless";

const SEEDS = [
  // Menswear
  "harryrosen.com",
  "gotstyle.com",
  "simons.ca",
  "frankandoak.com",
  "rw-co.com",
  // Jewelry (fills gaps around the existing snowball)
  "maisonbirks.com",
  "knar.com",
  "peoplesjewellers.com",
  // Footwear
  "brownsshoes.com",
  "littleburgundyshoes.com",
  "gravitypope.com",
  // Home & furniture
  "article.com",
  "structube.com",
  "eq3.com",
  // Beauty & health
  "well.ca",
  "etiket.ca",
  // Womenswear
  "aritzia.com",
  "oakandfort.com",
  "kotn.com",
  // Outdoor & active
  "mec.ca",
  "altitude-sports.com",
  "sportinglife.ca",
  // B2B: custom packaging (quote-based)
  "pakfactory.com",
  "packlane.com",
  "refinepackaging.com",
  "noissue.co",
  // B2B: on-demand manufacturing (quote-based)
  "protolabs.com",
  "xometry.com",
  "fictiv.com",
  "hubs.com",
  // Pets
  "chewy.com",
  "ren-spets.ca",
  "baileyblu.com",
  // Baby & kids
  "snugglebugz.ca",
  "westcoastkids.ca",
  // Watches & eyewear
  "myle.ca",
  "clearlylab.ca",
  "bonlook.ca",
  // Supplements & wellness
  "canadianprotein.com",
  "supplementsource.ca",
  // Kitchen & home goods
  "hendrixrestaurantequipment.com",
  "paderno.com",
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
let added = 0;
for (const raw of SEEDS) {
  const domain = raw.replace(/^www\./, "");
  const rows = await sql`
    INSERT INTO crawl_queue (domain) VALUES (${domain})
    ON CONFLICT (domain) DO NOTHING
    RETURNING id
  `;
  if (rows.length > 0) added++;
}
const [{ pending }] = await sql`
  SELECT count(*)::int AS pending FROM crawl_queue WHERE status = 'pending'
`;
console.log(`Seeded ${added} new domains (${SEEDS.length - added} already known). Queue pending: ${pending}`);
