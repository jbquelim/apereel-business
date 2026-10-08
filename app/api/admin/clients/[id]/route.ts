import { NextResponse, after } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { claimRun, releaseRun, runAndContinue } from "@/lib/ai-services";
import { getSiteForClient } from "@/lib/site-builder";
import { expandGuides } from "@/lib/site-pages";
import { runSiteQa } from "@/lib/site-qa-run";
import { approveRelease } from "@/lib/site-release";

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
  // John releases a held site by hand (lib/site-release): no run.
  const peek = (await request.clone().json().catch(() => ({}))) as { approve?: boolean; releaseHeld?: boolean; authorize?: boolean; retryRenders?: boolean; recheck?: boolean };
  // John re-runs this month's release gate (lib/content-release): automatic fixes, one AI repair for what still fails (cents), holds and releases. No new items.
  if (client.service !== "web-development" && peek.recheck) {
    if (!(await claimRun(client.id))) return NextResponse.json({ ok: false, error: "Already running. Give it a few minutes." }, { status: 409 });
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    after(async () => {
      try {
        const { releaseMonth } = await import("@/lib/content-release");
        console.log(`Re-check for ${client.domain}: ${await releaseMonth(client, base)}`);
      } catch (err) {
        console.error(`Re-check failed for ${client.domain}:`, err instanceof Error ? err.message : err);
      } finally {
        await releaseRun(client.id);
      }
    });
    return NextResponse.json({ ok: true, recheck: true });
  }
  // John re-queues failed video and visual renders (lib/media) once the cause is fixed: no AI run, Higgsfield credit only.
  if (peek.retryRenders) {
    // Renders fail when Higgsfield can't fetch the business's photo: without our photo storage a retry just pays again.
    if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: false, error: "Connect a Vercel Blob store to the project first (BLOB_READ_WRITE_TOKEN); renders need our own copies of the photos." }, { status: 409 });
    const { retryFailedRenders, kickMediaWorker } = await import("@/lib/media");
    const n = await retryFailedRenders(client.id);
    if (n) await kickMediaWorker((process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, ""));
    return NextResponse.json({ ok: true, retried: n });
  }
  // John records the client's "yes" to us accessing their site on their behalf (lib/crawl-access): no run.
  if (peek.authorize) {
    const { recordAuthorization } = await import("@/lib/clients");
    await recordAuthorization(client.id);
    return NextResponse.json({ ok: true, authorized: true });
  }
  // John releases content or ads items the gate held (lib/content-release), after reviewing them.
  if (client.service !== "web-development" && peek.releaseHeld && process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const rows = await neon(process.env.DATABASE_URL)`UPDATE content_items SET status = 'draft', updated_at = now() WHERE client_id = ${client.id} AND status = 'held' RETURNING id`;
    return NextResponse.json({ ok: true, released: rows.length });
  }
  if (client.service === "web-development" && peek.approve) {
    await approveRelease(client, (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, ""));
    return NextResponse.json({ ok: true, released: true });
  }
  if (!(await claimRun(client.id))) {
    return NextResponse.json({ ok: false, error: "Already running. Give it a few minutes." }, { status: 409 });
  }
  const body = (await request.json().catch(() => ({}))) as { stage?: string; fresh?: boolean };
  // A fresh analysis: older analyses and the saved audit of the domain are not reused (lib/site-analysis).
  if (client.service === "web-development" && body.fresh && process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    await neon(process.env.DATABASE_URL)`UPDATE clients SET analysis_after = now() WHERE id = ${client.id}`;
  }
  // Deepen a site's short guides (lib/site-pages expandGuides), then re-check the site.
  if (client.service === "web-development" && body.stage === "guides") {
    after(async () => {
      try {
        const site = await getSiteForClient(client.id);
        if (!site) return;
        const n = await expandGuides(site, client.id);
        await runSiteQa(site.id);
        console.log(`Expanded ${n} guides for ${client.domain}`);
      } finally {
        await releaseRun(client.id);
      }
    });
    return NextResponse.json({ ok: true, stage: "guides" });
  }
  // A single later step of a website build (John re-running the analysis pages or the catalog), or the whole run.
  const { stage } = body;
  const step = client.service === "web-development" && (stage === "pages" || stage === "catalog") ? stage : undefined;
  after(() => runAndContinue(client, step, (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "")));
  return NextResponse.json({ ok: true });
}
