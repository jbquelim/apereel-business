import { neon } from "@neondatabase/serverless";

// Growth Plan orders. Every state change is conditional on the current
// status, so replayed or duplicated Stripe events can't double-fulfil.

export type OrderStatus = "requested" | "pending" | "paid" | "generating" | "needs_review" | "sent" | "failed";

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

export async function createOrder(o: {
  id: string;
  domain: string;
  url: string;
  email: string;
  name: string | null;
  amountCents: number;
  currency: string;
  tier: string;
  /** "requested": no payment taken (before live checkout); John runs it from admin. */
  status?: "pending" | "requested";
}): Promise<void> {
  await sql()`
    INSERT INTO growth_orders (id, domain, url, email, name, amount_cents, currency, tier, status)
    VALUES (${o.id}, ${o.domain}, ${o.url}, ${o.email}, ${o.name}, ${o.amountCents}, ${o.currency}, ${o.tier}, ${o.status ?? "pending"})
  `;
}

/** John runs a request without payment: it joins the pipeline as if paid. */
export async function startRequest(id: string): Promise<boolean> {
  const rows = await sql()`
    UPDATE growth_orders SET status = 'paid', paid_at = now()
    WHERE id = ${id} AND status = 'requested' RETURNING id
  `;
  return rows.length > 0;
}

export async function attachSession(id: string, sessionId: string): Promise<void> {
  await sql()`UPDATE growth_orders SET stripe_session_id = ${sessionId} WHERE id = ${id} AND status = 'pending'`;
}

/** Marks a pending order paid. Returns the order only on the first transition. */
export async function markPaid(p: {
  id: string;
  sessionId: string;
  paymentIntent: string | null;
  amountCents: number | null;
  livemode: boolean;
}) {
  const rows = (await sql()`
    UPDATE growth_orders
    SET status = 'paid', paid_at = now(), stripe_session_id = ${p.sessionId},
        stripe_payment_intent = ${p.paymentIntent}, livemode = ${p.livemode},
        amount_cents = COALESCE(${p.amountCents}, amount_cents)
    WHERE id = ${p.id} AND status = 'pending'
    RETURNING id, domain, url, email, name, amount_cents, currency, livemode, tier
  `) as {
    id: string;
    domain: string;
    url: string;
    email: string;
    name: string | null;
    amount_cents: number;
    currency: string;
    livemode: boolean;
    tier: string;
  }[];
  return rows[0] ?? null;
}

export async function markFailed(id: string): Promise<void> {
  await sql()`UPDATE growth_orders SET status = 'failed' WHERE id = ${id} AND status = 'pending'`;
}

export type GrowthOrder = {
  id: string;
  domain: string;
  url: string;
  email: string;
  name: string | null;
  status: OrderStatus | "generation_failed";
  report: unknown;
  livemode: boolean | null;
  tier: string;
  /** Run for our own website build; never delivered to the customer. */
  internal: boolean;
  /** Re-run the free audit rather than reuse the saved one (a fresh analysis John asked for). */
  fresh_audit: boolean;
};

export async function getOrder(id: string): Promise<GrowthOrder | null> {
  const rows = (await sql()`
    SELECT id, domain, url, email, name, status, report, livemode, tier, COALESCE(internal, false) AS internal, COALESCE(fresh_audit, false) AS fresh_audit FROM growth_orders WHERE id = ${id}
  `) as GrowthOrder[];
  return rows[0] ?? null;
}

/** Claims an order for report generation; false if it isn't in an allowed state. */
export async function claimForGeneration(id: string, from: string[]): Promise<boolean> {
  const rows = await sql()`
    UPDATE growth_orders SET status = 'generating', generation_error = NULL
    WHERE id = ${id} AND status = ANY(${from})
    RETURNING id
  `;
  return rows.length > 0;
}

export async function saveReport(id: string, report: unknown, status: "generating" | "needs_review" | "internal"): Promise<void> {
  await sql()`
    UPDATE growth_orders SET report = ${JSON.stringify(report)}::jsonb, status = ${status}
    WHERE id = ${id} AND status = 'generating'
  `;
}

export async function failGeneration(id: string, error: string): Promise<void> {
  await sql()`
    UPDATE growth_orders SET status = 'generation_failed', generation_error = ${error.slice(0, 500)}
    WHERE id = ${id} AND status = 'generating'
  `;
}

export type OrderRow = {
  id: string;
  domain: string;
  email: string;
  name: string | null;
  status: string;
  livemode: boolean | null;
  created_at: string;
  paid_at: string | null;
  sent_at: string | null;
  generation_error: string | null;
  tier: string;
};

export async function listOrders(limit = 100): Promise<OrderRow[]> {
  return (await sql()`
    SELECT id, domain, email, name, status, livemode, created_at, paid_at, sent_at, generation_error, tier
    FROM growth_orders WHERE status <> 'pending'
    ORDER BY COALESCE(paid_at, created_at) DESC LIMIT ${limit}
  `) as OrderRow[];
}

export async function getOrderDetail(id: string) {
  const rows = (await sql()`
    SELECT id, domain, url, email, name, status, livemode, report, review_notes, access_token,
           created_at, paid_at, sent_at, generation_error, tier, amount_cents
    FROM growth_orders WHERE id = ${id}
  `) as (OrderRow & { url: string; report: unknown; review_notes: string | null; access_token: string | null; amount_cents: number })[];
  return rows[0] ?? null;
}

/** John's edits to the plan; only while the report is awaiting review. */
export async function updatePlan(id: string, plan: unknown, notes: string | null): Promise<boolean> {
  const rows = await sql()`
    UPDATE growth_orders
    SET report = jsonb_set(report, '{plan}', ${JSON.stringify(plan)}::jsonb), review_notes = ${notes}
    WHERE id = ${id} AND status = 'needs_review' AND report IS NOT NULL
    RETURNING id
  `;
  return rows.length > 0;
}

/** Approves a reviewed report: issues the customer's access token once. */
export async function markSent(id: string, token: string) {
  const rows = (await sql()`
    UPDATE growth_orders SET status = 'sent', sent_at = now(), access_token = ${token}
    WHERE id = ${id} AND status = 'needs_review'
    RETURNING id, domain, email, name, livemode, tier
  `) as { id: string; domain: string; email: string; name: string | null; livemode: boolean | null; tier: string }[];
  return rows[0] ?? null;
}

export async function getSentReport(token: string) {
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  const rows = (await sql()`
    SELECT domain, name, report, sent_at, tier FROM growth_orders
    WHERE access_token = ${token} AND status = 'sent'
  `) as { domain: string; name: string | null; report: unknown; sent_at: string; tier: string }[];
  return rows[0] ?? null;
}
