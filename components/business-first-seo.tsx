import { Container } from "@/components/container";
import { seoChain } from "@/lib/site";

export function BusinessFirstSeo() {
  return (
    <section
      id="seo"
      aria-labelledby="seo-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          Business-First SEO
        </p>
        <h2
          id="seo-heading"
          className="font-display mt-4 max-w-3xl text-3xl text-ink text-balance sm:text-5xl"
        >
          You can&apos;t cheat your way to becoming the best result.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          Strong rankings should come from creating genuine customer value. SEO
          should reflect the strength of the business, not manufacture it.
          Visibility is the outcome of being the better choice — then making
          that choice unmistakable in search, on the site, and in the offer.
        </p>

        <ol className="mt-14 grid gap-0 overflow-hidden rounded-2xl border border-white/10 bg-navy-mid md:grid-cols-5">
          {seoChain.map((step, index) => {
            const isLast = index === seoChain.length - 1;
            return (
              <li
                key={step.title}
                className="relative flex flex-col border-b border-white/10 px-6 py-8 last:border-b-0 md:border-b-0 md:border-l md:px-5 md:first:border-l-0"
              >
                {!isLast ? (
                  <span
                    className="pointer-events-none absolute top-10 -right-2 z-10 hidden text-electric md:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-electric/70 font-mono text-[11px] tracking-[0.14em] text-electric">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
                {!isLast ? (
                  <p
                    className="mt-5 font-mono text-electric md:hidden"
                    aria-hidden="true"
                  >
                    ↓
                  </p>
                ) : (
                  <p className="mt-5 text-[11px] tracking-[0.16em] text-signal uppercase">
                    Compounding result
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
