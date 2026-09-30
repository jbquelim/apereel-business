import type { Metadata } from "next";
import Link from "next/link";
import { pricedServices } from "@/lib/service-prices";
import { priceLabel, tierLabel, tiersForService, type ServiceTiers } from "@/lib/service-tiers";
import { ANALYSIS_TIERS, formatUsd } from "@/lib/analysis-tiers";

// The one-stop subscription: search, ads, content and site work as one
// monthly plan, plus each service on its own. Prices come from the database
// (/admin/pricing) laid over lib/service-tiers.ts.

export const metadata: Metadata = {
  title: "Plans and pricing",
  description:
    "One team for search, ads, content and your website, on a monthly plan. Or pick a single service: Google, Meta and TikTok ads, monthly content, or a website fix, refresh or rebuild.",
  alternates: { canonical: "/plans" },
};

const STEPS = [
  ["Free scan", "Run the free scan on your site. It takes about two minutes."],
  [
    "Paid analysis",
    `From ${formatUsd(ANALYSIS_TIERS[0].priceCents)}: every page of your site checked and set against your competitors. Included when you start a plan.`,
  ],
  ["Your plan starts", "We fix what the analysis found first, then grow from there."],
  ["Proof every month", "Your site is re-checked monthly, so you see exactly what changed and what it did."],
] as const;

function PlanCard({ service, featured }: { service: ServiceTiers; featured: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {service.tiers.map((t) => (
        <div
          key={t.id}
          className={`flex flex-col rounded-3xl border p-7 sm:p-8 ${t.id === featured ? "border-electric/50 bg-electric/5" : "border-white/10 bg-navy-mid"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">{tierLabel(t)}</p>
          <p className="font-display mt-3 text-[40px] leading-none text-ink">
            {t.price != null ? `$${t.price.toLocaleString("en-US")}` : "Ask"}
            <span className="ml-1 text-[15px] text-muted">{t.cadence === "monthly" ? "/ month" : ""}</span>
          </p>
          <p className="mt-4 text-[17px] font-medium text-ink">{t.name}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.summary}</p>
          <ul className="mt-6 flex-1 space-y-2.5">
            {t.scope.map((s) => (
              <li key={s} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                {s}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className={`press-scale mt-8 inline-flex h-11 items-center justify-center rounded-full px-5 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${t.id === featured ? "bg-electric text-navy hover:bg-electric-deep" : "border border-white/25 text-ink hover:border-electric"}`}
          >
            Start with {tierLabel(t)}
          </Link>
        </div>
      ))}
    </div>
  );
}

function ServiceRow({ service, title, blurb, href }: { service: ServiceTiers; title: string; blurb: string; href: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-navy-mid p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-xl font-medium text-ink">{title}</h3>
        <Link href={href} className="text-[13px] text-electric underline underline-offset-4">
          What&apos;s included
        </Link>
      </div>
      <p className="mt-1 text-[14px] text-muted">{blurb}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {service.tiers.map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 p-4">
            <p className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-medium text-ink">{tierLabel(t)}</span>
              <span className="font-mono text-[13px] text-ink">{priceLabel(t)}</span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.name}</p>
            {t.timeline && <p className="mt-2 font-mono text-[11px] text-muted/80">{t.timeline}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PlansPage() {
  const services = await pricedServices();
  const plans = tiersForService("marketing-plans", services)!;
  const ads = tiersForService("advertising", services)!;
  const content = tiersForService("premium-creative", services)!;
  const web = tiersForService("web-development", services)!;

  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1200px] px-6 pt-20 pb-12 sm:px-8 sm:pt-28">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Plans and pricing</p>
        <h1 className="font-display mt-5 max-w-4xl text-4xl tracking-[-0.02em] text-ink sm:text-6xl">
          One team for search, ads, content and your website.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A monthly plan that starts from what we measure on your site and your competitors&apos;, not
          from guesses, and proves every month what it changed.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 sm:px-8">
        <PlanCard service={plans} featured="build" />
        <p className="mt-5 text-[13px] leading-relaxed text-muted">
          USD, before any applicable tax. Three-month minimum, then month to month. Ad spend is paid directly
          to Google, Meta or TikTok and isn&apos;t included.
        </p>
      </section>

      <section className="border-t border-white/10 bg-navy-mid/40 py-20">
        <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">
          <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">How it starts</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {STEPS.map(([title, body], i) => (
              <li key={title}>
                <p className="font-mono text-2xl text-electric">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-[17px] font-medium text-ink">{title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/#audit"
            className="press-scale mt-10 inline-flex h-11 items-center rounded-full bg-electric px-6 text-[12px] font-semibold tracking-[0.08em] text-navy uppercase transition-colors hover:bg-electric-deep"
          >
            Run the free scan
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-20 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Or one service at a time</p>
        <h2 className="font-display mt-4 text-3xl text-ink sm:text-4xl">Pick exactly what you need.</h2>
        <div className="mt-10 space-y-5">
          <ServiceRow
            service={ads}
            title="Ads: Google, Meta and TikTok"
            blurb="Managed monthly. Ad spend paid directly to the platforms."
            href="/services/advertising#packages"
          />
          <ServiceRow
            service={content}
            title="Content creation"
            blurb="Social posts, short videos, buying guides and ad creative, every month."
            href="/services/premium-creative#packages"
          />
          <ServiceRow
            service={web}
            title="Website"
            blurb="Built from your analysis. The analysis fee comes off the price."
            href="/services/web-development#packages"
          />
        </div>
      </section>
    </main>
  );
}
