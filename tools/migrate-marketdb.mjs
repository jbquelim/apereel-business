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

await sql`
  CREATE TABLE IF NOT EXISTS product_samples (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    product_type TEXT,
    price_cents INTEGER,
    url TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_product_samples_business_time
  ON product_samples (business_id, captured_at)
`;

await sql`
  CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    domain TEXT NOT NULL,
    url TEXT,
    industry TEXT,
    sub_industry TEXT,
    business_model TEXT,
    headline TEXT,
    insights JSONB,
    competitors JSONB,
    status TEXT NOT NULL DEFAULT 'new',
    emailed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email, domain)
  )
`;

// The last good competitor set per audited domain, reused for 30 days so a
// business sees the same competitors on every report.
await sql`
  CREATE TABLE IF NOT EXISTS competitor_sets (
    domain TEXT PRIMARY KEY,
    offering TEXT,
    competitors JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Marketing technology seen on a site's homepage, one row per crawl, so
// changes over time ("added Klaviyo in June") can be reported.
await sql`
  CREATE TABLE IF NOT EXISTS tech_snapshots (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    technologies JSONB NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`
  CREATE INDEX IF NOT EXISTS idx_tech_snapshots_domain_time
  ON tech_snapshots (domain, captured_at)
`;

// Paid Growth Plan orders. Status: pending → paid → (generating → needs_review
// → sent) | failed. Written only by the checkout route and the signed webhook.
await sql`
  CREATE TABLE IF NOT EXISTS growth_orders (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    url TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent TEXT,
    livemode BOOLEAN,
    report JSONB,
    review_notes TEXT,
    access_token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_growth_orders_status ON growth_orders (status, created_at)`;
// AI services: clients, their monthly request allowance, every AI call
// (tokens and cost), the content we generate, and the industry template library.
await sql`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    name TEXT,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    tier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS ai_requests (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT,
    purpose TEXT NOT NULL,
    counts_toward_allowance BOOLEAN NOT NULL DEFAULT false,
    model TEXT NOT NULL,
    input_tokens INT,
    output_tokens INT,
    cost_usd NUMERIC(10,5),
    ok BOOLEAN NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_ai_requests_client ON ai_requests (client_id, created_at)`;
await sql`
  CREATE TABLE IF NOT EXISTS content_items (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT NOT NULL,
    batch TEXT NOT NULL,
    kind TEXT NOT NULL,
    platform TEXT,
    product_url TEXT,
    image TEXT,
    data JSONB NOT NULL,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_content_items_client ON content_items (client_id, batch)`;
await sql`
  CREATE TABLE IF NOT EXISTS site_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industries TEXT[] NOT NULL DEFAULT '{}',
    tier TEXT NOT NULL,
    style TEXT,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_image TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
// Video and animation jobs wait here until a media provider is connected.
await sql`
  CREATE TABLE IF NOT EXISTS media_jobs (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT NOT NULL,
    item_id BIGINT,
    site_id TEXT,
    kind TEXT NOT NULL,
    brief JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting_provider',
    provider TEXT,
    output_url TEXT,
    cost_usd NUMERIC(10,4),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_media_jobs_status ON media_jobs (status, created_at)`;
await sql`ALTER TABLE media_jobs ADD COLUMN IF NOT EXISTS provider_request_id TEXT`;
// Short-lived named locks (e.g. "one render round a minute", "credit email sent").
await sql`CREATE TABLE IF NOT EXISTS app_locks (name TEXT PRIMARY KEY, until TIMESTAMPTZ NOT NULL)`;
await sql`ALTER TABLE media_jobs ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ`;
// Customer websites: the whole site as one JSON document, rendered to HTML.
await sql`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    domain_status TEXT,
    template_id TEXT,
    doc JSONB NOT NULL,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    published BOOLEAN NOT NULL DEFAULT false,
    hosting_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS running_since TIMESTAMPTZ`;
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`;
await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_checkout_session TEXT UNIQUE`;
await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`;
await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS payments_status TEXT`;
// Product photos copied to our own storage (Vercel Blob): client sites'
// servers often block hotlinking, and old sites go away after a move.
await sql`
  CREATE TABLE IF NOT EXISTS image_cache (
    source_url TEXT PRIMARY KEY,
    stored_url TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS site_leads (
    id BIGSERIAL PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT, email TEXT, phone TEXT, message TEXT, page TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS proposals (
    order_id TEXT PRIMARY KEY,
    service TEXT NOT NULL DEFAULT 'web-development',
    data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS audit_runs (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_audit_runs_domain ON audit_runs (domain, created_at)`;
await sql`
  CREATE TABLE IF NOT EXISTS page_snapshots (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    role TEXT NOT NULL,
    url TEXT NOT NULL,
    kind TEXT NOT NULL,
    crawled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status INT, blocked BOOLEAN, ms INT, bytes INT,
    title TEXT, meta_description TEXT, h1_count INT, canonical TEXT, noindex BOOLEAN,
    schema_types TEXT[], has_product_schema BOOLEAN, has_price BOOLEAN, has_availability BOOLEAN,
    price NUMERIC, currency TEXT, rating_value NUMERIC, review_count INT, review_widget BOOLEAN,
    images INT, images_missing_alt INT, words INT, spec_table BOOLEAN, product_links INT
  )
`;
await sql`ALTER TABLE page_snapshots ADD COLUMN IF NOT EXISTS image TEXT`;
await sql`CREATE INDEX IF NOT EXISTS idx_page_snapshots_domain ON page_snapshots (domain, crawled_at)`;
await sql`CREATE INDEX IF NOT EXISTS idx_page_snapshots_url ON page_snapshots (url, crawled_at)`;
await sql`
  CREATE TABLE IF NOT EXISTS audit_results (
    domain TEXT PRIMARY KEY,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE growth_orders ADD COLUMN IF NOT EXISTS generation_error TEXT`;
await sql`ALTER TABLE growth_orders ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'growth'`;

// Service tier prices, edited by John at /admin/pricing. A tier without a
// row (or with a null price) is unpriced.
await sql`
  CREATE TABLE IF NOT EXISTS service_prices (
    slug TEXT NOT NULL,
    tier TEXT NOT NULL,
    price INTEGER,
    price_prefix TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (slug, tier)
  )
`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM businesses`;
console.log("Schema ready. businesses rows:", count);
