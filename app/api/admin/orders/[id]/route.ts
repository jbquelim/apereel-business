import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getOrderDetail, markSent, updatePlan } from "@/lib/orders";
import { triggerStage } from "@/lib/growth-trigger";
import type { GrowthPlan } from "@/lib/growth-report";

// Admin actions on one Growth Plan order: save edits, regenerate, or
// approve and send. Session cookie + same-origin required.

const IMPACT = ["high", "medium", "low"];
const EFFORT = ["low", "medium", "high"];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => str(x, 400)).filter(Boolean).slice(0, 8) : [];

function cleanPlan(p: Partial<GrowthPlan>): GrowthPlan | null {
  const priorities = Array.isArray(p.priorities)
    ? p.priorities
        .map((x) => ({
          title: str(x?.title, 200),
          evidence: str(x?.evidence, 1500),
          action: str(x?.action, 2000),
          impact: (IMPACT.includes(x?.impact as string) ? x!.impact : "medium") as GrowthPlan["priorities"][number]["impact"],
          effort: (EFFORT.includes(x?.effort as string) ? x!.effort : "medium") as GrowthPlan["priorities"][number]["effort"],
          service: str(x?.service, 80),
        }))
        .filter((x) => x.title && x.action)
        .slice(0, 10)
    : [];
  const summary = str(p.summary, 2000);
  if (!summary || priorities.length === 0) return null;
  return {
    summary,
    priorities,
    roadmap: { days30: list(p.roadmap?.days30), days60: list(p.roadmap?.days60), days90: list(p.roadmap?.days90) },
    notMeasured: list(p.notMeasured),
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { action?: string; plan?: Partial<GrowthPlan>; notes?: string };
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");

  if (body.action === "save") {
    const plan = cleanPlan(body.plan ?? {});
    if (!plan) return NextResponse.json({ ok: false, error: "A summary and at least one priority are required." }, { status: 400 });
    const ok = await updatePlan(id, plan, str(body.notes, 4000) || null);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ ok: false, error: "Only reports awaiting review can be edited." }, { status: 409 });
  }

  if (body.action === "regenerate") {
    try {
      await triggerStage(base, id, "collect", true);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not regenerate" }, { status: 409 });
    }
  }

  if (body.action === "send") {
    const order = await getOrderDetail(id);
    if (!order || order.status !== "needs_review") {
      return NextResponse.json({ ok: false, error: "Only reports awaiting review can be sent." }, { status: 409 });
    }
    const token = randomBytes(24).toString("base64url");
    const sent = await markSent(id, token);
    if (!sent) return NextResponse.json({ ok: false, error: "Already sent." }, { status: 409 });
    const link = `${base}/report/${token}`;
    const emailed = await emailCustomer(sent, link);
    return NextResponse.json({ ok: true, link, emailed });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

async function emailCustomer(
  o: { domain: string; email: string; name: string | null; livemode: boolean | null },
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
      subject: `${o.livemode === false ? "[TEST] " : ""}Your Growth Plan for ${o.domain} is ready`,
      text: [
        `${first ? `Hi ${first},` : "Hi,"}`,
        "",
        `Your Growth Plan for ${o.domain} is ready. I've reviewed it personally.`,
        "",
        `Read it here: ${link}`,
        "",
        "It covers where you stand against your competitors, what to fix first and why, and a 30/60/90-day plan. The link is private to you.",
        "",
        "If you'd like help putting any of it into action, just reply to this email.",
        "",
        "John Lim",
        "Founder, Apereel",
      ].join("\n"),
    }),
  }).catch(() => null);
  return !!res?.ok;
}
