import { NextResponse } from "next/server";
import { getClientByToken } from "@/lib/clients";
import { reviseItem, setItemStatus } from "@/lib/content-engine";

// The client's studio actions: ask for a change (uses one request from the
// monthly allowance) or mark an item approved. The token is the only key.

export const maxDuration = 120;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const client = await getClientByToken((await params).token);
  if (!client) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const b = (await request.json().catch(() => ({}))) as { action?: string; itemId?: number; instruction?: string };
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
