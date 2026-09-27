import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

// Confirmation only. The order is fulfilled by the Stripe webhook, never here:
// a buyer who pays and closes the tab before this page loads still gets it.
export default function GrowthPlanThanksPage() {
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[760px] px-6 py-24 sm:px-8 sm:py-32">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">
          Growth Plan
        </p>
        <h1 className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink sm:text-5xl">
          Thank you. Your order is in.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          We&apos;re preparing your Growth Plan now. John reviews every report
          personally before it&apos;s sent, and it will arrive by email within
          two business days.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Your receipt from Stripe is on its way to your inbox. Questions in the
          meantime? Write to{" "}
          <a href="mailto:john@apereel.com" className="text-electric underline underline-offset-4">
            john@apereel.com
          </a>
          .
        </p>
        <Link
          href="/"
          className="press-scale mt-10 inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm text-ink transition-colors hover:border-electric hover:text-electric"
        >
          Back to Apereel
        </Link>
      </section>
    </main>
  );
}
