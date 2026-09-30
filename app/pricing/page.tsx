import type { Metadata } from "next";
import Link from "next/link";
import { pricedServices } from "@/lib/service-prices";
import { priceLabel, tierLabel, tiersForService, type Tier } from "@/lib/service-tiers";
import { ANALYSIS_TIERS, formatUsd } from "@/lib/analysis-tiers";

// Four services, three tiers each, bought separately. Everything starts from
// the crawl: what we measure on the client's site and their competitors'.
// Prices come from the database (/admin/pricing) laid over lib/service-tiers.ts.

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Four services, three tiers each: competitor analysis from $10, websites built from your analysis, Google, Meta and TikTok ads, and content made from your own products.",
  alternates: { canonical: "/pricing" },
};

type Card = { id: string; label: string; price: string; name: string; summary: string; scope: string[]; note?: string };

function Cards({ cards, featured, cta }: { cards: Card[]; featured: string; cta: { href: string; label: (c: Card) => string } }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.id}
          className={`flex flex-col rounded-3xl border p-7 sm:p-8 ${c.id === featured ? "border-electric/50 bg-electric/5" : "border-white/10 bg-navy-mid"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">{c.label}</p>
          <p className="font-display mt-3 text-[34px] leading-none text-ink">{c.price}</p>
          <p className="mt-4 text-[17px] font-medium text-ink">{c.name}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{c.summary}</p>
          <ul className="mt-6 flex-1 space-y-2.5">
            {c.scope.map((s) => (
              <li key={s} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                {s}
              </li>
            ))}
          </ul>
          {c.note && <p className="mt-5 font-mono text-[12px] text-muted">{c.note}</p>}
          <Link
            href={cta.href}
            className={`press-scale mt-6 inline-flex h-11 items-center justify-center rounded-full px-5 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${c.id === featured ? "bg-electric text-navy hover:bg-electric-deep" : "border border-white/25 text-ink hover:border-electric"}`}
          >
            {cta.label(c)}
          </Link>
        </div>
      ))}
    </div>
  );
}

const fromTier = (t: Tier): Card => ({
  id: t.id,
  label: tierLabel(t),
  price: priceLabel(t),
  name: t.name,
  summary: t.summary,
  scope: t.scope,
  note: t.timeline,
});

function Service({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/10 py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">{eyebrow}</p>
        <h2 className="font-display mt-4 max-w-3xl text-3xl text-ink sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">{intro}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default async function PricingPage() {
  const services = await pricedServices();
  const web = tiersForService("web-development", services)!;
  const ads = tiersForService("advertising", services)!;
  const content = tiersForService("premium-creative", services)!;

  const analysis: Card[] = ANALYSIS_TIERS.map((t) => ({
    id: t.id,
    label: t.name,
    price: formatUsd(t.priceCents),
    name: t.tagline,
    summary: t.delivery,
    scope: t.includes,
  }));

  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1200px] px-6 pt-20 pb-16 sm:px-8 sm:pt-28">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Pricing</p>
        <h1 className="font-display mt-5 max-w-4xl text-4xl tracking-[-0.02em] text-ink sm:text-6xl">
          Four services. Three tiers each. All built on what we measure.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every service starts from our crawl of your site and your competitors&apos;, and every page,
          product and price we read is kept, so each piece of work builds on the last.
        </p>
        <nav aria-label="Services on this page" className="mt-8 flex flex-wrap gap-2">
          {[
            ["#analysis", "Analysis"],
            ["#website", "Website"],
            ["#ads", "Ads"],
            ["#content", "Content"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-ink/85 hover:border-electric hover:text-electric">
              {label}
            </a>
          ))}
        </nav>
      </section>

      <Service
        id="analysis"
        eyebrow="01 · Analysis"
        title="Know what to fix, measured, not guessed."
        intro="Start with the free scan. Then go deeper: every page of your site opened and checked, and your product pages set against your competitors'."
      >
        <Cards cards={analysis} featured="growth" cta={{ href: "/#audit", label: () => "Start with the free scan" }} />
      </Service>

      <Service
        id="website"
        eyebrow="02 · Website"
        title="A better site, priced by how far the design goes."
        intro="Every tier crawls your site and implements what your analysis found. The tiers differ in design: a premium template made yours, a custom design, or a bespoke flagship. Your analysis fee comes off the price."
      >
        <Cards cards={web.tiers.map(fromTier)} featured="build" cta={{ href: "/contact", label: (c) => `Talk about ${c.label}` }} />
      </Service>

      <Service
        id="ads"
        eyebrow="03 · Ads"
        title="Ads for Google, Meta and TikTok, priced by creative."
        intro="Made from your real products, prices and advantages. The tiers step up in creative, from static ads to motion to cinematic film, and in how many platforms we run. Ad spend is paid directly to the platforms."
      >
        <Cards cards={ads.tiers.map(fromTier)} featured="build" cta={{ href: "/contact", label: (c) => `Start with ${c.label}` }} />
      </Service>

      <Service
        id="content"
        eyebrow="04 · Content"
        title="Content made from your catalog, every month."
        intro="Our crawler reads your products and your competitors' every month, and our system turns them into posts, videos and buying guides: consistent, on-brand and aimed at what your buyers search for."
      >
        <Cards cards={content.tiers.map(fromTier)} featured="build" cta={{ href: "/contact", label: (c) => `Start with ${c.label}` }} />
      </Service>

      <section className="border-t border-white/10 py-12">
        <p className="mx-auto w-full max-w-[1200px] px-6 text-[13px] leading-relaxed text-muted sm:px-8">
          USD, before any applicable tax. Monthly services have a three-month minimum, then run month to
          month. Buy any service on its own.
        </p>
      </section>
    </main>
  );
}
