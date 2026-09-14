// One-time schema setup for the market-intelligence dataset.
// Run: source <(grep -v '^#' .env.local | sed 's/^/export /') && node tools/migrate-marketdb.mjs
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set — pull env first: vercel env pull .env.local --yes");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    name TEXT,
    industry TEXT,
    sub_industry TEXT,
    country TEXT,
    platform TEXT,
    discovered_from TEXT,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_crawled TIMESTAMPTZ
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS inventory_snapshots (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    product_count INTEGER,
    avg_price_cents INTEGER,
    price_min_cents INTEGER,
    price_max_cents INTEGER,
    source TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_snapshots_business_time
  ON inventory_snapshots (business_id, captured_at)
`;

await sql`
  CREATE TABLE IF NOT EXISTS crawl_queue (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    enqueued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
  )
`;

await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_model TEXT`;

await sql`
  CREATE TABLE IF NOT EXISTS credibility_snapshots (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    case_studies INTEGER NOT NULL DEFAULT 0,
    resources INTEGER NOT NULL DEFAULT 0,
    certifications INTEGER NOT NULL DEFAULT 0,
    industries_served INTEGER NOT NULL DEFAULT 0,
    has_quote_path BOOLEAN NOT NULL DEFAULT false,
    has_live_chat BOOLEAN NOT NULL DEFAULT false,
    has_published_pricing BOOLEAN NOT NULL DEFAULT false,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_credibility_business_time
  ON credibility_snapshots (business_id, captured_at)
`;

await sql`ALTER TABLE credibility_snapshots ADD COLUMN IF NOT EXISTS sitemap_found BOOLEAN NOT NULL DEFAULT true`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM businesses`;
console.log("Schema ready. businesses rows:", count);
