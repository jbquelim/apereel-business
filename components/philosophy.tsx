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
          Our Philosophy
        </p>
        <h2
          id="philosophy-heading"
          className="font-display mt-4 max-w-3xl text-3xl text-ink text-balance sm:text-5xl"
        >
          Most digital marketing works backward. We start with the business.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          Traditional agencies begin with keywords and content, hoping traffic
          converts. Apereel begins with what makes the business genuinely
          competitive — then translates that into digital experiences, visibility,
          and revenue.
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

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          Technical SEO — metadata, headings, URLs, schema, site structure,
          performance — is expected. It is not the strategy. The competitive
          advantage comes from understanding what makes a business genuinely
          better for customers, then translating that into a stronger digital
          presence.
        </p>
      </Container>
    </section>
  );
}
