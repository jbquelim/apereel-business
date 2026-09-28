import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthReportView } from "@/components/growth-report-view";
import { getSentReport } from "@/lib/orders";
import type { GrowthReport } from "@/lib/growth-report";
import { pricedServices } from "@/lib/service-prices";
import { tierById } from "@/lib/analysis-tiers";

// A customer's delivered report. The unguessable token in the URL is the only
// key; reports are reachable only once sent (approved by John, or delivered
// automatically for the unreviewed tier).

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const row = await getSentReport((await params).token);
  return {
    title: `Your ${tierById(row?.tier).name}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await getSentReport(token);
  if (!row) notFound();
  return (
    <main id="main" className="bg-navy pt-10">
      <div className="mx-auto w-full max-w-[1040px] px-6 py-20 sm:px-8 sm:py-24">
        <GrowthReportView
          report={row.report as GrowthReport}
          preparedFor={row.name}
          date={row.sent_at}
          services={await pricedServices()}
          tier={row.tier}
        />
      </div>
    </main>
  );
}
