import Link from "next/link";
import { Container } from "@/components/container";

const PILLARS = [
  {
    kicker: "Business Fundamentals",
    title: "More content is not the answer.",
    body: "Pricing, product selection, and customer experience matter. A content plan should support a stronger business.",
    footerKicker: "Start here",
    footer: "Fix what limits the buying decision.",
    icon: (
      // Document
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5Z"
          className="stroke-electric-deep"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 3.5V8H18M9 12h6M9 15.5h6"
          className="stroke-electric-deep"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    kicker: "Competitive Advantage",
    title: "Give people a reason to choose you.",
    body: "Before asking how to rank higher, understand what makes your business the better choice.",
    footerKicker: "Ask this",
    footer: "Why should customers choose us?",
    icon: (
      // People
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="8.5" r="2.6" className="stroke-electric-deep" strokeWidth="1.6" />
        <circle cx="5.8" cy="10" r="2" className="stroke-electric-deep" strokeWidth="1.6" />
        <circle cx="18.2" cy="10" r="2" className="stroke-electric-deep" strokeWidth="1.6" />
        <path
          d="M7.5 18.5a4.6 4.6 0 0 1 9 0M2.8 17.5a3.4 3.4 0 0 1 3-2.4M21.2 17.5a3.4 3.4 0 0 0-3-2.4"
          className="stroke-electric-deep"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    kicker: "Measurable Results",
    title: "Look for proof that matters.",
    body: "Connect search demand and relevant traffic to real outcomes. Rankings alone do not tell the whole story.",
    footerKicker: "Measure this",
    footer: "Qualified leads, conversions, and sales.",
    icon: (
      // Bar chart
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M5.5 19.5v-6M10.5 19.5V9M15.5 19.5v-8.5M20 19.5V4.5"
          className="stroke-electric-deep"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function RealityCheck() {
  return (
    <section
      id="reality-check"
      aria-labelledby="reality-check-heading"
      className="reveal-section bg-ink py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="reality-check-heading"
            className="font-display text-4xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-5xl"
          >
            What good digital growth looks like.
          </h2>
          <p className="mt-4 text-lg text-navy/60 sm:text-xl">
            Three things to look for before investing more in marketing.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-3 lg:gap-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.kicker}
              className="reveal-stagger flex flex-col rounded-[var(--radius-parent)] border border-navy/8 bg-white p-8 sm:p-10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10">
                {pillar.icon}
              </div>
              <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-electric-deep uppercase">
                {pillar.kicker}
              </p>
              <h3 className="font-display mt-3 text-2xl text-navy sm:text-[26px]">
                {pillar.title}
              </h3>
              <p className="mt-4 mb-6 text-sm leading-relaxed text-navy/60 sm:text-base">
                {pillar.body}
              </p>
              <div className="mt-auto border-t border-navy/10 pt-5">
                <p className="pt-1 text-[11px] font-semibold tracking-[0.18em] text-electric-deep uppercase">
                  {pillar.footerKicker}
                </p>
                <p className="mt-2 text-sm font-medium text-navy sm:text-base">
                  {pillar.footer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#proof"
            className="inline-flex items-center gap-2 text-sm font-semibold text-electric-deep transition-colors hover:text-navy sm:text-base"
          >
            See the results behind our approach
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
