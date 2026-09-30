import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getOrderDetail } from "@/lib/orders";
import { tierById } from "@/lib/analysis-tiers";
import { GrowthReportView } from "@/components/growth-report-view";
import type { GrowthReport } from "@/lib/growth-report";
import { pricedServices } from "@/lib/service-prices";
import { ReviewPanel } from "./review-panel";
import { ProposalPanel } from "./proposal-panel";
import { draftProposal } from "@/lib/build-proposal";
import { getProposal } from "@/lib/proposals";
import { tiersForService } from "@/lib/service-tiers";

export const metadata: Metadata = { title: "Review Growth Plan", robots: { index: false, follow: false } };

export default async function OrderReviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();
  const report = order.report as GrowthReport | null;
  const services = await pricedServices();
  const web = tiersForService("web-development", services)!;
  const saved = report?.plan ? await getProposal(order.id) : null;

  return (
    <main id="main" className="bg-navy pt-10">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-16 sm:px-8">
        <Link href="/admin" className="font-mono text-[12px] text-muted underline underline-offset-4">
          ← All orders
        </Link>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-display text-3xl text-ink">{order.domain}</h1>
          <span className="font-mono text-[12px] text-muted">
            {order.status}
            {order.livemode === false ? " · TEST" : ""} · {order.email}
          </span>
        </div>
        <p className="mt-2 font-mono text-[12px] text-electric">
          {tierById(order.tier).name} · {tierById(order.tier).reviewed ? "needs your review" : "sent automatically"}
        </p>
        {report?.preview?.reviewNotes && (
          <p className="mt-4 max-w-3xl rounded-xl border border-electric/30 bg-electric/5 p-4 text-[14px] text-ink">
            <span className="font-semibold">Check before sending:</span> {report.preview.reviewNotes}{" "}
            <span className="text-muted">(Preview drafts aren&apos;t editable here; regenerate if they need redoing.)</span>
          </p>
        )}
        {order.generation_error && (
          <p role="alert" className="mt-4 text-[14px] text-signal">Last generation error: {order.generation_error}</p>
        )}
        {order.status === "sent" && order.access_token && (
          <p className="mt-4 text-[14px] text-ink/80">
            Sent. Customer link:{" "}
            <a href={`/report/${order.access_token}`} className="text-electric underline underline-offset-4">
              /report/{order.access_token.slice(0, 8)}…
            </a>
          </p>
        )}

        <div className="mt-10 grid gap-10 xl:grid-cols-[420px_minmax(0,1fr)]">
          <ReviewPanel
            orderId={order.id}
            status={order.status}
            plan={report?.plan ?? null}
            notes={order.review_notes}
          />
          <div className="min-w-0 rounded-3xl border border-white/10 p-6 sm:p-10">
            <p className="mb-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              Preview: exactly what the customer will see
            </p>
            {report ? (
              <GrowthReportView
                report={report}
                preparedFor={order.name}
                date={order.sent_at ?? new Date().toISOString()}
                services={services}
                tier={order.tier}
              />
            ) : (
              <p className="text-muted">No report yet.</p>
            )}
          </div>
        </div>

        {report?.plan && (
          <ProposalPanel
            orderId={order.id}
            initial={saved?.data ?? draftProposal(report, order.amount_cents, services)}
            status={saved?.status ?? "new"}
            link={saved?.token ? `/proposal/${saved.token}` : null}
            web={web}
          />
        )}
      </div>
    </main>
  );
}
