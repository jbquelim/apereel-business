import { NextResponse, after } from "next/server";
import { getClient } from "@/lib/clients";
import { claimRun, runAndContinue } from "@/lib/ai-services";
import type { MonthStage } from "@/lib/content-engine";

// Internal: runs one step of a client's service in its own function (up to
// 5 minutes). Called by the discover cron for monthly clients, by the
// Stripe webhook after payment, and by each step to start the next one.
// A first call (no stage) takes the client's run lock; follow-on steps
// carry it, and the last step releases it. CRON_SECRET-gated.

export const maxDuration = 300;
const STAGES: MonthStage[] = ["posts", "long", "media", "analysis", "build", "catalog"];

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("x-internal-secret") !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  const { clientId, stage } = (await request.json().catch(() => ({}))) as { clientId?: string; stage?: string };
  const client = clientId ? await getClient(clientId) : null;
  if (!client) return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  const step = STAGES.find((s) => s === stage);
  if (!step && !(await claimRun(client.id))) return NextResponse.json({ ok: false, error: "Already running" }, { status: 409 });
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  after(() => runAndContinue(client, step, base));
  return NextResponse.json({ ok: true }, { status: 202 });
}
