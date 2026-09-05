import { Container } from "@/components/container";
import Image from "next/image";

const metrics: { value: string; label: string; sublabel?: string }[] = [
  { value: "8.6K", label: "Organic Search Visibility" },
  { value: "58.6K", label: "Estimated Organic Traffic" },
  { value: "87%", label: "Non-Branded Discovery", sublabel: "Customers finding the business through what it sells, not its name" },
  { value: "Top 5", label: "Across High-Demand Commercial Searches" },
];

export function ProofSection() {
  return (
    <>
      <section
        id="proof"
        aria-labelledby="proof-heading"
        className="reveal-section py-24 sm:py-32"
      >
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
                What Real SEO Looks Like
              </p>
              <h2
                id="proof-heading"
                className="font-display mt-4 text-3xl text-ink sm:text-4xl lg:text-5xl"
              >
                Proof, Not Promises.
              </h2>
              <div className="mt-8 max-w-xl space-y-4 text-base leading-relaxed text-muted">
                <p>SEO should be measurable.</p>
                <p>
                  This is what sustained organic growth looks like over time.
                  Stronger search visibility, increasing non-branded discovery,
                  and top positions across high-demand commercial searches.
                </p>
                <p>
                  The focus was never on producing more content for the sake of
                  it. It was on improving the business itself: strengthening
                  product selection, accelerating inventory launches, improving
                  the shopping experience, and making the website more useful to
                  customers.
                </p>
                <p className="text-ink">
                  As the business became stronger, its digital presence followed.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <p className="font-display text-3xl text-ink sm:text-4xl">
                      {m.value}
                    </p>
                    <p className="mt-1 text-[12px] tracking-[0.1em] text-muted uppercase">
                      {m.label}
                    </p>
                    {m.sublabel && (
                      <p className="mt-1 text-[11px] leading-snug text-muted/60 normal-case">
                        {m.sublabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/organic-growth-trend.png"
                  alt="Sustained organic growth trend showing search visibility and non-branded traffic increasing over time"
                  width={1537}
                  height={768}
                  className="w-full"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-ink">
                  Sustained Organic Growth
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Long-term growth in search visibility and non-branded traffic,
                  showing that customers are discovering the business through
                  what it offers, not simply by searching for the company name.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- Bottom statement --- */}
      <div className="reveal-section bg-ink py-16 sm:py-20 lg:py-24">
        <Container className="text-center">
          <h3 className="font-display mx-auto max-w-4xl text-2xl leading-tight text-navy sm:text-3xl lg:text-4xl">
            One pricing adjustment outperformed six months of marketing
            spend. That&apos;s what we measure.
          </h3>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy/60">
            The only question that matters: did the business get stronger?
          </p>
        </Container>
      </div>
    </>
  );
}
