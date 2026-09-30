import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getOrderDetail } from "@/lib/orders";
import { draftProposal, type BuildProposal } from "@/lib/build-proposal";
import { markProposalSent, saveProposal } from "@/lib/proposals";
import { pricedServices } from "@/lib/service-prices";
import type { GrowthReport } from "@/lib/growth-report";

// John's controls for a web development proposal: redraft from the report,
// save edits, and send it to the customer (a private link by email).

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const money = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : 0);

function clean(p: Partial<BuildProposal>): BuildProposal | null {
  const tier = p.tier === "fix" || p.tier === "build" || p.tier === "grow" ? p.tier : null;
  const items = Array.isArray(p.items)
    ? p.items.map((i) => ({ title: str(i?.title, 200), detail: str(i?.detail, 600) })).filter((i) => i.title).slice(0, 30)
    : [];
  if (!tier || items.length === 0) return null;
  return {
    tier,
    tierLabel: str(p.tierLabel, 40),
    tierName: str(p.tierName, 120),
    reasons: Array.isArray(p.reasons) ? p.reasons.map((r) => str(r, 400)).filter(Boolean).slice(0, 8) : [],
    items,
    timeline: str(p.timeline, 60),
    price: money(p.price),
    credit: money(p.credit),
    notes: str(p.notes, 2000),
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order?.report) return NextResponse.json({ ok: false, error: "No report to build a proposal from." }, { status: 409 });
  const body = (await request.json().catch(() => ({}))) as { action?: string; proposal?: Partial<BuildProposal> };

  if (body.action === "redraft") {
    return NextResponse.json({ ok: true, proposal: draftProposal(order.report as GrowthReport, order.amount_cents, await pricedServices()) });
  }

  const proposal = clean(body.proposal ?? {});
  if (!proposal) return NextResponse.json({ ok: false, error: "A tier and at least one line item are required." }, { status: 400 });
  if (!(await saveProposal(id, proposal))) {
    return NextResponse.json({ ok: false, error: "This proposal was already sent and can't be edited." }, { status: 409 });
  }
  if (body.action === "save") return NextResponse.json({ ok: true });

  if (body.action === "send") {
    const token = randomBytes(24).toString("base64url");
    if (!(await markProposalSent(id, token))) return NextResponse.json({ ok: false, error: "Already sent." }, { status: 409 });
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const link = `${base}/proposal/${token}`;
    const emailed = await emailCustomer(order, proposal, link);
    return NextResponse.json({ ok: true, link, emailed });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

async function emailCustomer(
  o: { domain: string; email: string; name: string | null; livemode: boolean | null },
  p: BuildProposal,
  link: string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const first = o.name?.split(/\s+/)[0];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "John Lim at Apereel <noreply@apereel.com>",
      reply_to: "john@apereel.com",
      to: [o.email],
      subject: `${o.livemode === false ? "[TEST] " : ""}Your website proposal for ${o.domain}`,
      text: [
        first ? `Hi ${first},` : "Hi,",
        "",
        `Following your analysis, here's what I'd do to fix ${o.domain} and make it work harder: our ${p.tierLabel} package, built from what we measured on your site and your competitors'.`,
        "",
        `Read the proposal: ${link}`,
        "",
        p.credit > 0 ? `The $${p.credit} you paid for the analysis comes off the price.` : "",
        "Questions? Just reply.",
        "",
        "John Lim",
        "Founder, Apereel",
      ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n"),
    }),
  }).catch(() => null);
  return !!res?.ok;
}
