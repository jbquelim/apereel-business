import { NextResponse, after } from "next/server";
import { claimForGeneration, failGeneration, getOrder, saveReport } from "@/lib/orders";
import { collectEvidence, writePlan, type GrowthReport } from "@/lib/growth-report";
import { triggerStage } from "@/lib/growth-trigger";

// Internal: builds a paid order's Growth Plan in two runs so each fits the
// function time limit. Called by the Stripe webhook after payment, and by
// John to regenerate. Returns 202 at once; the work runs after the response.
//   stage "collect": paid | generation_failed | needs_review(regenerate) → evidence saved
//   stage "plan":    evidence → plan written → needs_review, John emailed

export const maxDuration = 300;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("x-internal-secret") === secret;
}

function baseUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const { orderId, stage = "collect", regenerate = false } = (await request.json().catch(() => ({}))) as {
    orderId?: string;
    stage?: "collect" | "plan";
    regenerate?: boolean;
  };
  if (!orderId) return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  const base = baseUrl(request);

  if (stage === "collect") {
    const from = regenerate ? ["paid", "generation_failed", "needs_review"] : ["paid", "generation_failed"];
    if (!(await claimForGeneration(orderId, from))) {
      return NextResponse.json({ ok: false, error: "Order not in a generatable state" }, { status: 409 });
    }
    after(async () => {
      try {
        const order = await getOrder(orderId);
        if (!order) throw new Error("Order vanished");
        const report = await collectEvidence(order.url, order.domain, base);
        await saveReport(orderId, report, "generating");
        await triggerStage(base, orderId, "plan");
      } catch (err) {
        await failGeneration(orderId, err instanceof Error ? err.message : String(err));
        await notifyJohn(orderId, "failed", err instanceof Error ? err.message : String(err));
      }
    });
    return NextResponse.json({ ok: true, stage: "collect" }, { status: 202 });
  }

  after(async () => {
    try {
      const order = await getOrder(orderId);
      if (!order || order.status !== "generating" || !order.report) throw new Error("No collected evidence to plan from");
      const report = order.report as GrowthReport;
      const { plan, model } = await writePlan(report);
      await saveReport(orderId, { ...report, plan, plannedAt: new Date().toISOString(), planModel: model }, "needs_review");
      await notifyJohn(orderId, "ready", `${order.domain}: ${plan.priorities.length} priorities`);
    } catch (err) {
      await failGeneration(orderId, err instanceof Error ? err.message : String(err));
      await notifyJohn(orderId, "failed", err instanceof Error ? err.message : String(err));
    }
  });
  return NextResponse.json({ ok: true, stage: "plan" }, { status: 202 });
}

async function notifyJohn(orderId: string, kind: "ready" | "failed", detail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const order = await getOrder(orderId).catch(() => null);
  const test = order?.livemode === false ? "[TEST] " : "";
  const subject =
    kind === "ready"
      ? `${test}Growth Plan ready for review: ${order?.domain ?? orderId}`
      : `${test}Growth Plan generation failed: ${order?.domain ?? orderId}`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"],
        subject,
        text: [subject, "", detail, "", `Order ID: ${orderId}`, order ? `Customer: ${order.email}` : ""].join("\n"),
      }),
    });
  } catch {
    /* notification is best-effort */
  }
}
