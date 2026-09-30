import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthPlanCheckoutForm } from "./checkout-form";

// The $20 Growth Plan. Hidden (404) until NEXT_PUBLIC_GROWTH_PLAN=on — i.e.
// until live payments are set up; ?growthplan=preview shows it meanwhile.

const live = process.env.NEXT_PUBLIC_GROWTH_PLAN === "on";

export const metadata: Metadata = {
  title: "The Growth Plan",
  description:
    "A $20 plan for your business, built from live data on your site and your competitors' and reviewed by John Lim: what to fix first, where buyers search, and a 90-day roadmap.",
  alternates: { canonical: "/growth-plan" },
  robots: live ? undefined : { index: false, follow: false },
};

const INSIDE = [
  ["Priorities, ranked", "The fixes that matter most, in order of impact, each with the evidence behind it and what to do."],
  ["What your buyers search for", "Real searches people type into Google around what you sell, and which ones have no page on your site."],
  ["Your competitors, measured", "Their catalogs, prices and marketing tools read directly from their sites, plus what's changed since we started tracking them."],
  ["Every page, checked", "Up to 1,200 pages from your sitemap opened one by one: errors, missing product data, duplicate titles, thin categories and slow pages, each listed by URL."],
  ["Side by side with competitors", "Your product pages against theirs: prices in Google's product data, reviews, specification tables, photos and description length."],
  ["A 90-day roadmap", "Growth Plan and up: what to do in the first 30 days, the next 30 and the 30 after."],
  ["A better version of your site", "With the $30 Preview: your homepage reimagined with your own products, rewritten product copy and ready-to-run ads."],
  ["Honest limits", "What the plan couldn't measure, stated plainly, so you know exactly what it rests on."],
] as const;

const STEPS = [
  ["You tell us your website", "Pay securely with Stripe. No account needed."],
  ["We read your market", "Your site and your competitors' sites, read live, not guessed by a chatbot."],
  ["John reviews it", "Every plan is read and edited by John Lim before it's sent."],
  ["You get your plan", "A private link by email, within two business days."],
] as const;

export default async function GrowthPlanPage({ searchParams }: { searchParams: Promise<{ site?: string; growthplan?: string }> }) {
  const { site, growthplan } = await searchParams;
  if (!live && growthplan !== "preview") notFound();
  const prefill = typeof site === "string" ? site.slice(0, 200) : "";

  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1120px] px-6 pt-20 pb-16 sm:px-8 sm:pt-28">
        {!live && <p className="mb-6 font-mono text-[12px] text-signal">Preview: not visible to the public yet.</p>}
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">The Growth Plan</p>
        <h1 className="font-display mt-5 max-w-3xl text-4xl tracking-[-0.02em] text-ink sm:text-6xl">
          Know exactly what to fix first.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Analysis built from live data on your site and your competitors&apos;. Three depths: an
          instant $10 Teardown, the $20 Growth Plan reviewed by John Lim, or the $30 plan with a
          preview of a better version of your site.
        </p>
        <div className="mt-10 max-w-2xl">
          <GrowthPlanCheckoutForm site={prefill} />
          <p className="mt-3 text-[13px] text-muted">
            Teardown in about five minutes; reviewed plans within two business days.
          </p>
        </div>
      </section>

      <section className="bg-navy-mid py-20">
        <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">What&apos;s inside</h2>
          <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {INSIDE.map(([title, body]) => (
              <div key={title}>
                <h3 className="text-lg font-medium text-ink">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-navy-mid p-6">
                <p className="font-mono text-[12px] text-electric">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-[16px] font-medium text-ink">{title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-muted">
            Why not just ask a chatbot? A chatbot guesses from what it remembers. The Growth Plan reads
            your site and your competitors&apos; sites today, compares them against our own tracking of
            your market, and is checked by a person, not a model.
          </p>
        </div>
      </section>
    </main>
  );
}
