import { neon } from "@neondatabase/serverless";
import { randomBytes, randomUUID } from "node:crypto";
import { SERVICE_TIERS, type TierId } from "./service-tiers";

// Clients of the AI services (content, ads, website) and their monthly
// allowance of change requests. A request is counted by logging it in
// ai_requests with counts_toward_allowance, so the count can't drift.

export type AiService = "premium-creative" | "advertising" | "web-development";

export type Client = {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  id: string;
  domain: string;
  name: string | null;
  email: string;
  service: AiService;
  tier: TierId;
  token: string;
  status: string;
  period_start: string;
  created_at: string;
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

export function tierFor(c: Pick<Client, "service" | "tier">) {
  return SERVICE_TIERS.find((s) => s.slug === c.service)?.tiers.find((t) => t.id === c.tier) ?? null;
}

export async function createClient(c: { domain: string; name: string | null; email: string; service: AiService; tier: TierId }): Promise<Client> {
  const rows = (await sql()`
    INSERT INTO clients (id, domain, name, email, service, tier, token)
    VALUES (${randomUUID()}, ${c.domain}, ${c.name}, ${c.email}, ${c.service}, ${c.tier}, ${randomBytes(24).toString("base64url")})
    RETURNING *
  `) as Client[];
  return rows[0];
}

export async function listClients(): Promise<(Client & { used: number; items: number; cost: number })[]> {
  return (await sql()`
    SELECT c.*,
      (SELECT count(*)::int FROM ai_requests r WHERE r.client_id = c.id AND r.counts_toward_allowance AND r.ok
         AND r.created_at >= date_trunc('month', now())) AS used,
      (SELECT count(*)::int FROM content_items i WHERE i.client_id = c.id) AS items,
      (SELECT COALESCE(sum(cost_usd), 0)::float FROM ai_requests r WHERE r.client_id = c.id) AS cost
    FROM clients c ORDER BY c.created_at DESC
  `) as (Client & { used: number; items: number; cost: number })[];
}

export async function getClient(id: string): Promise<Client | null> {
  return ((await sql()`SELECT * FROM clients WHERE id = ${id}`) as Client[])[0] ?? null;
}

export async function getClientByToken(token: string): Promise<Client | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  // Cancelled clients can still open their studio to see past work.
  return ((await sql()`SELECT * FROM clients WHERE token = ${token} AND status IN ('active', 'cancelled')`) as Client[])[0] ?? null;
}

/** Change requests used and allowed: per calendar month for monthly tiers, in total for one-time ones. */
export async function allowance(c: Client): Promise<{ used: number; limit: number; left: number }> {
  const tier = tierFor(c);
  const since = tier?.cadence === "monthly" ? "month" : "all";
  const rows = (await sql()`
    SELECT count(*)::int AS used FROM ai_requests
    WHERE client_id = ${c.id} AND counts_toward_allowance AND ok
      AND (${since} = 'all' OR created_at >= date_trunc('month', now()))
  `) as { used: number }[];
  const limit = tier?.requests ?? 0;
  const used = rows[0]?.used ?? 0;
  return { used, limit, left: Math.max(0, limit - used) };
}

/** A client created from a paid Checkout; returns null when that session was already handled. */
export async function createPaidClient(c: {
  domain: string;
  name: string | null;
  email: string;
  service: AiService;
  tier: TierId;
  checkoutSession: string;
  customer: string | null;
  subscription: string | null;
}): Promise<Client | null> {
  const rows = (await sql()`
    INSERT INTO clients (id, domain, name, email, service, tier, token, stripe_checkout_session, stripe_customer_id, stripe_subscription_id)
    VALUES (${randomUUID()}, ${c.domain}, ${c.name}, ${c.email}, ${c.service}, ${c.tier}, ${randomBytes(24).toString("base64url")},
            ${c.checkoutSession}, ${c.customer}, ${c.subscription})
    ON CONFLICT (stripe_checkout_session) DO NOTHING
    RETURNING *
  `) as Client[];
  return rows[0] ?? null;
}

export async function setSubscription(clientId: string, subscription: string) {
  await sql()`UPDATE clients SET stripe_subscription_id = ${subscription} WHERE id = ${clientId}`;
}

/** A subscription ended: monthly services stop; a website's hosting ends and it's taken offline. */
export async function endSubscription(subscription: string): Promise<Client | null> {
  const rows = (await sql()`
    UPDATE clients SET status = 'cancelled' WHERE stripe_subscription_id = ${subscription} AND status <> 'cancelled' RETURNING *
  `) as Client[];
  const c = rows[0] ?? null;
  if (c?.service === "web-development") await sql()`UPDATE sites SET published = false WHERE client_id = ${c.id}`;
  return c;
}
