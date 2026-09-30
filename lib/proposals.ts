import { neon } from "@neondatabase/serverless";
import type { BuildProposal } from "./build-proposal";

// Saved build proposals, one per analysis order. Draft until John sends it;
// the customer opens it with an unguessable token and can accept it.

export type ProposalStatus = "draft" | "sent" | "accepted";

export type ProposalRow = {
  order_id: string;
  data: BuildProposal;
  status: ProposalStatus;
  token: string | null;
  sent_at: string | null;
  accepted_at: string | null;
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

export async function getProposal(orderId: string): Promise<ProposalRow | null> {
  const rows = (await sql()`
    SELECT order_id, data, status, token, sent_at, accepted_at FROM proposals WHERE order_id = ${orderId}
  `) as ProposalRow[];
  return rows[0] ?? null;
}

/** Saves edits; a sent or accepted proposal can't be changed. */
export async function saveProposal(orderId: string, data: BuildProposal): Promise<boolean> {
  const rows = await sql()`
    INSERT INTO proposals (order_id, data) VALUES (${orderId}, ${JSON.stringify(data)}::jsonb)
    ON CONFLICT (order_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      WHERE proposals.status = 'draft'
    RETURNING order_id
  `;
  return rows.length > 0;
}

export async function markProposalSent(orderId: string, token: string): Promise<boolean> {
  const rows = await sql()`
    UPDATE proposals SET status = 'sent', token = ${token}, sent_at = now()
    WHERE order_id = ${orderId} AND status = 'draft' RETURNING order_id
  `;
  return rows.length > 0;
}

export async function getProposalByToken(token: string) {
  const rows = (await sql()`
    SELECT p.order_id, p.data, p.status, p.token, p.sent_at, p.accepted_at, o.domain, o.name, o.email
    FROM proposals p JOIN growth_orders o ON o.id = p.order_id
    WHERE p.token = ${token} AND p.status IN ('sent', 'accepted')
  `) as (ProposalRow & { domain: string; name: string | null; email: string })[];
  return rows[0] ?? null;
}

export async function acceptProposal(token: string): Promise<boolean> {
  const rows = await sql()`
    UPDATE proposals SET status = 'accepted', accepted_at = now()
    WHERE token = ${token} AND status = 'sent' RETURNING order_id
  `;
  return rows.length > 0;
}
