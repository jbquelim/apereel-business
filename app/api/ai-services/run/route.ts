import { NextResponse, after } from "next/server";
import { getClient } from "@/lib/clients";
import { runService } from "@/lib/ai-services";

// Internal: runs one client's service in its own function (up to 5 minutes).
// Called by the discover cron for monthly clients. CRON_SECRET-gated.

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("x-internal-secret") !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  const { clientId } = (await request.json().catch(() => ({}))) as { clientId?: string };
  const client = clientId ? await getClient(clientId) : null;
  if (!client) return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  after(async () => {
    try {
      console.log(`AI service for ${client.domain}: ${await runService(client)}`);
    } catch (err) {
      console.error(`AI service failed for ${client.domain}:`, err instanceof Error ? err.message : err);
    }
  });
  return NextResponse.json({ ok: true }, { status: 202 });
}
