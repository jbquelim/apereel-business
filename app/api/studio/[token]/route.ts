import { NextResponse } from "next/server";
import { getClientByToken } from "@/lib/clients";
import { reviseItem, setItemStatus } from "@/lib/content-engine";
import { getSiteForClient, reviseSite, setPublished, undoSite } from "@/lib/site-builder";
import { connectDomain } from "@/lib/vercel-domains";

// The client's studio actions: ask for a change (uses one request from the
// monthly allowance) or mark an item approved. The token is the only key.

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const client = await getClientByToken((await params).token);
  if (!client) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const b = (await request.json().catch(() => ({}))) as { action?: string; itemId?: number; instruction?: string; domain?: string };

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
