import { neon } from "@neondatabase/serverless";

// Growth Plan orders. Every state change is conditional on the current
// status, so replayed or duplicated Stripe events can't double-fulfil.

export type OrderStatus = "pending" | "paid" | "generating" | "needs_review" | "sent" | "failed";

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
}): Promise<void> {
  await sql()`
    INSERT INTO growth_orders (id, domain, url, email, name, amount_cents, currency)
    VALUES (${o.id}, ${o.domain}, ${o.url}, ${o.email}, ${o.name}, ${o.amountCents}, ${o.currency})
  `;
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
    RETURNING id, domain, url, email, name, amount_cents, currency, livemode
  `) as {
    id: string;
    domain: string;
    url: string;
    email: string;
    name: string | null;
    amount_cents: number;
    currency: string;
    livemode: boolean;
  }[];
  return rows[0] ?? null;
}

export async function markFailed(id: string): Promise<void> {
  await sql()`UPDATE growth_orders SET status = 'failed' WHERE id = ${id} AND status = 'pending'`;
}
