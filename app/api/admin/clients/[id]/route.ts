import { NextResponse, after } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { runService } from "@/lib/ai-services";
import { kickMediaWorker } from "@/lib/media";

// Runs a client's service now: this month's content or ads, or the website
// build. Runs after the response (crawl if needed, then AI): a few minutes.

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const client = await getClient((await params).id);
  if (!client) return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  // A request (sign-up before live payments): activating it starts the service without charging.
  if (client.status === "requested" && process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    await neon(process.env.DATABASE_URL)`UPDATE clients SET status = 'active' WHERE id = ${client.id}`;
    client.status = "active";
  }
  if (client.status !== "active") return NextResponse.json({ ok: false, error: "This client's plan has ended." }, { status: 409 });
  after(async () => {
    try {
      console.log(`AI service for ${client.domain}: ${await runService(client)}`);
      await kickMediaWorker((process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, ""));
    } catch (err) {
      console.error(`Content generation failed for ${client.domain}:`, err instanceof Error ? err.message : err);
    }
  });
  return NextResponse.json({ ok: true });
}
