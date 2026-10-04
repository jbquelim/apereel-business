import { NextResponse, after } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { claimRun, runAndContinue } from "@/lib/ai-services";

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
  if (!(await claimRun(client.id))) {
    return NextResponse.json({ ok: false, error: "Already running. Give it a few minutes." }, { status: 409 });
  }
  // A single later step of a website build (John re-running the analysis pages or the catalog), or the whole run.
  const { stage } = (await request.json().catch(() => ({}))) as { stage?: string };
  const step = client.service === "web-development" && (stage === "pages" || stage === "catalog") ? stage : undefined;
  after(() => runAndContinue(client, step, (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "")));
  return NextResponse.json({ ok: true });
}
