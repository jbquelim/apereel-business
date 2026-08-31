import { Container } from "@/components/container";
import { traditionalChain, apereelChain } from "@/lib/site";

export function Philosophy() {
  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          Business-First Growth
        </p>
        <h2
          id="philosophy-heading"
          className="font-display mt-4 max-w-3xl text-3xl text-ink text-balance sm:text-5xl"
        >
          Most agencies are solving the wrong problem.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          They start with keywords and content calendars. They report on traffic
          and impressions. Somewhere between the kickoff meeting and the monthly
          report, the actual business gets ignored.
        </p>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-navy-mid p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              Traditional Approach
            </p>
            <ol className="mt-8 space-y-0">
              {traditionalChain.map((step, index) => (
                <li key={step.title} className="flex items-start gap-4 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-base ${step.color === "signal" ? "text-signal" : "text-muted"}`}
                  >
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-electric/20 bg-navy-mid p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              Apereel Approach
            </p>
            <ol className="mt-8 space-y-0">
              {apereelChain.map((step, index) => (
                <li key={step.title} className="flex items-start gap-4 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-electric/40 font-mono text-[10px] text-electric">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-base font-medium ${step.color === "signal" ? "text-signal" : "text-ink"}`}
                  >
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-base leading-relaxed text-muted">
              We discovered this by watching SEO fail. Product categories with
              weak inventory never ranked well — no matter how much content we
              produced. Categories with strong, deep inventory outranked the
              competition without a single content campaign.
            </p>
          </div>
          <div className="lg:col-span-6">
            <p className="text-base leading-relaxed text-muted">
              The answer was never more blog posts. It was more products. Faster
              merchandising. A stronger offer. When the business improved, the
              rankings followed. No agency would have recommended that.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          The technical work is table stakes. The advantage comes from one
          question: why should a customer choose you instead of the
          competition?
        </p>
      </Container>
    </section>
  );
}
