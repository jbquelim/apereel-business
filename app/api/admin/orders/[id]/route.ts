import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getOrderDetail, startRequest, updatePlan } from "@/lib/orders";
import { deliverReport } from "@/lib/delivery";
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

  if (body.action === "run") {
    if (!(await startRequest(id))) {
      return NextResponse.json({ ok: false, error: "Only unpaid requests can be run this way." }, { status: 409 });
    }
    try {
      await triggerStage(base, id, "collect");
      return NextResponse.json({ ok: true });
    } catch (err) {
      // The discover cron restarts orders left in 'paid'.
      return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not start" }, { status: 502 });
    }
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
    const delivered = await deliverReport(id, base);
    if (!delivered) return NextResponse.json({ ok: false, error: "Already sent." }, { status: 409 });
    return NextResponse.json({ ok: true, ...delivered });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
