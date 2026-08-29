import { Container } from "@/components/container";
import { traditionalChain, apereelChain } from "@/lib/site";

export function Philosophy() {
  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          Business-First Growth
        </p>
        <h2
          id="philosophy-heading"
          className="font-display mt-4 max-w-3xl text-3xl text-ink text-balance sm:text-5xl"
        >
          You can&apos;t cheat your way to becoming the best result.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          The strongest long-term strategy is often becoming a better answer for
          the customer. Most digital marketing starts with keywords and tactics.
          Apereel starts with the business.
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
              This philosophy came from observing e-commerce firsthand. Product
              categories with stronger, more complete inventory consistently
              outperformed in search — regardless of how much SEO content was
              produced for weaker categories. Where competitors had better
              assortments, they frequently outranked us.
            </p>
          </div>
          <div className="lg:col-span-6">
            <p className="text-base leading-relaxed text-muted">
              The response was not more blog posts. The focus shifted to the
              business itself — getting products online faster, improving
              merchandising, strengthening the offer. As the business became more
              competitive, both sales and organic visibility improved.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          The technical work is expected. It is not the strategy. The advantage
          comes from understanding why customers choose you, then making that
          answer unmistakable.
        </p>
      </Container>
    </section>
  );
}
