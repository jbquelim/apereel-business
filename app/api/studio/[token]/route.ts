import { NextResponse } from "next/server";
import { getClientByToken } from "@/lib/clients";
import { reviseItem, setItemStatus } from "@/lib/content-engine";
import { getSiteForClient, reviseSite, setPublished, undoSite } from "@/lib/site-builder";
import { connectDomain } from "@/lib/vercel-domains";
import { portalUrl } from "@/lib/billing";
import { ensureAccount, onboardingUrl } from "@/lib/connect";
import { setProductAction } from "@/lib/site-builder";

// The client's studio actions: ask for a change (uses one request from the
// monthly allowance) or mark an item approved. The token is the only key.

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const client = await getClientByToken((await params).token);
  if (!client) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const b = (await request.json().catch(() => ({}))) as { action?: string; itemId?: number; instruction?: string; domain?: string; mode?: string };

  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const studio = `${base}/studio/${client.token}`;
  if (b.action === "billing") {
    if (!client.stripe_customer_id) return NextResponse.json({ ok: false, error: "No billing account yet." }, { status: 409 });
    try {
      return NextResponse.json({ ok: true, url: await portalUrl(client.stripe_customer_id, studio) });
    } catch (err) {
      console.error("Billing portal failed:", err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: "Billing couldn't open. Please email john@apereel.com." }, { status: 502 });
    }
  }
  if (b.action === "payments-connect" || b.action === "payments-mode") {
    const site = client.service === "web-development" ? await getSiteForClient(client.id) : null;
    if (!site) return NextResponse.json({ ok: false, error: "Your site hasn't been built yet." }, { status: 409 });
    if (b.action === "payments-mode") {
      const mode = (b as { mode?: string }).mode;
      if (mode !== "checkout" && mode !== "link" && mode !== "enquire") return NextResponse.json({ ok: false, error: "Unknown option" }, { status: 400 });
      const r = await setProductAction(client, mode);
      return NextResponse.json(r, { status: r.ok ? 200 : 409 });
    }
    try {
      const account = await ensureAccount(site, { name: site.doc.brand.name, email: client.email });
      return NextResponse.json({ ok: true, url: await onboardingUrl(account, `${studio}?payments=return`) });
    } catch (err) {
      console.error("Stripe onboarding failed:", err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: "Stripe onboarding couldn't open. Please try again." }, { status: 502 });
    }
  }

  // Website actions.
  if (b.action?.startsWith("site-")) {
    if (client.service !== "web-development") return NextResponse.json({ ok: false, error: "Not a website plan" }, { status: 400 });
    if (b.action === "site-revise") {
      const instruction = typeof b.instruction === "string" ? b.instruction.trim() : "";
      if (instruction.length < 3) return NextResponse.json({ ok: false, error: "Say what you'd like changed." }, { status: 400 });
      try {
        const r = await reviseSite(client, instruction);
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      } catch {
        return NextResponse.json({ ok: false, error: "The AI couldn't make that change right now. It didn't use a request; please try again." }, { status: 502 });
      }
    }
    if (b.action === "site-undo") return NextResponse.json({ ok: await undoSite(client) });
    if (b.action === "site-publish" || b.action === "site-unpublish") return NextResponse.json({ ok: await setPublished(client, b.action === "site-publish") });
    if (b.action === "site-domain") {
      const site = await getSiteForClient(client.id);
      if (!site || typeof b.domain !== "string") return NextResponse.json({ ok: false, error: "Enter your domain." }, { status: 400 });
      const domain = await connectDomain(site.id, b.domain);
      return NextResponse.json({ ok: domain.status !== "error", domain, error: domain.error });
    }
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  const itemId = Number(b.itemId);
  if (!Number.isInteger(itemId)) return NextResponse.json({ ok: false, error: "Missing item" }, { status: 400 });

  if (b.action === "revise") {
    const instruction = typeof b.instruction === "string" ? b.instruction.trim() : "";
    if (instruction.length < 3) return NextResponse.json({ ok: false, error: "Say what you'd like changed." }, { status: 400 });
    try {
      const r = await reviseItem(client, itemId, instruction);
      return NextResponse.json(r, { status: r.ok ? 200 : 409 });
    } catch {
      return NextResponse.json({ ok: false, error: "The AI couldn't make that change right now. It didn't use a request; please try again." }, { status: 502 });
    }
  }
  if (b.action === "approve" || b.action === "unapprove") {
    const ok = await setItemStatus(client.id, itemId, b.action === "approve" ? "approved" : "draft");
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
