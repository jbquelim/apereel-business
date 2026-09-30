import { NextResponse, after } from "next/server";
import { claimForGeneration, failGeneration, getOrder, saveReport } from "@/lib/orders";
import { collectEvidence, writePlan, type GrowthReport } from "@/lib/growth-report";
import { triggerStage } from "@/lib/growth-trigger";
import { collectShowcase } from "@/lib/showcase";
import { writePreviewAssets } from "@/lib/preview-assets";
import { deliverReport } from "@/lib/delivery";
import { tierById } from "@/lib/analysis-tiers";
import { compareProductPages, crawlSite } from "@/lib/site-crawl";

// Internal: builds a paid order's Growth Plan in two runs so each fits the
// function time limit. Called by the Stripe webhook after payment, and by
// John to regenerate. Returns 202 at once; the work runs after the response.
//   stage "collect": paid | generation_failed | needs_review(regenerate) → evidence saved
//   stage "crawl":   every page + competitor product pages → saved
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
    stage?: "collect" | "crawl" | "plan" | "assets";
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
        await triggerStage(base, orderId, "crawl");
      } catch (err) {
        await failGeneration(orderId, err instanceof Error ? err.message : String(err));
        await notifyJohn(orderId, "failed", err instanceof Error ? err.message : String(err));
      }
    });
    return NextResponse.json({ ok: true, stage: "collect" }, { status: 202 });
  }

  if (stage === "crawl") {
    after(async () => {
      try {
        const order = await getOrder(orderId);
        if (!order || order.status !== "generating" || !order.report) throw new Error("No collected evidence to crawl from");
        const report = order.report as GrowthReport;
        // Crawl and competitor pages share one run: ~150s for the client's
        // pages, then ~70s for competitors (their sitemaps load meanwhile).
        const { crawl, pages } = await crawlSite(order.domain, 150_000);
        const competitors = (report.audit.industry?.competitors ?? []).map((c) => ({ name: c.name, domain: c.domain }));
        const productCompare = await compareProductPages(
          { name: "You", domain: order.domain, pages },
          competitors,
          70_000,
        ).catch(() => undefined);
        await saveReport(orderId, { ...report, crawl, productCompare }, "generating");
        await triggerStage(base, orderId, "plan");
      } catch (err) {
        await failGeneration(orderId, err instanceof Error ? err.message : String(err));
        await notifyJohn(orderId, "failed", err instanceof Error ? err.message : String(err));
      }
    });
    return NextResponse.json({ ok: true, stage: "crawl" }, { status: 202 });
  }

  if (stage === "assets") {
    after(async () => {
      try {
        const order = await getOrder(orderId);
        if (!order || order.status !== "generating" || !(order.report as GrowthReport | null)?.plan) {
          throw new Error("No plan to build preview assets from");
        }
        const report = order.report as GrowthReport;
        const showcase = await collectShowcase(order.domain);
        const preview = await writePreviewAssets(report, showcase);
        await saveReport(orderId, { ...report, preview }, "needs_review");
        await notifyJohn(orderId, "ready", `${order.domain}: plan + preview (${showcase.length} products)`);
      } catch (err) {
        await failGeneration(orderId, err instanceof Error ? err.message : String(err));
        await notifyJohn(orderId, "failed", err instanceof Error ? err.message : String(err));
      }
    });
    return NextResponse.json({ ok: true, stage: "assets" }, { status: 202 });
  }

  after(async () => {
    try {
      const order = await getOrder(orderId);
      if (!order || order.status !== "generating" || !order.report) throw new Error("No collected evidence to plan from");
      const report = order.report as GrowthReport;
      const { plan, model } = await writePlan(report);
      const planned = { ...report, plan, plannedAt: new Date().toISOString(), planModel: model };
      if (order.tier === "preview") {
        // $30: keep generating — the preview assets build on the plan.
        await saveReport(orderId, planned, "generating");
        await triggerStage(base, orderId, "assets");
        return;
      }
      await saveReport(orderId, planned, "needs_review");
      if (!tierById(order.tier).reviewed) {
        // $10 Teardown: delivered automatically, no review step.
        const delivered = await deliverReport(orderId, base);
        await notifyJohn(orderId, "ready", `${order.domain}: Teardown delivered automatically${delivered?.emailed ? "" : " (customer email FAILED — send the link manually)"}`);
        return;
      }
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
