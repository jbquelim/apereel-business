import { Container } from "@/components/container";
import { CountUp } from "@/components/count-up";
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
              <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                What Real SEO Looks Like
              </p>
              <h2
                id="proof-heading"
                className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-5xl lg:text-6xl"
              >
                Proof, Not Promises.
              </h2>
              <div className="mt-8 max-w-xl space-y-4 text-base leading-relaxed text-muted">
                <p>Four years of sustained growth for one e-commerce business.</p>
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
                  <div key={m.label} className="reveal-stagger">
                    <p className="font-mono text-3xl text-ink sm:text-4xl">
                      <CountUp value={m.value} />
                    </p>
                    <p className="mt-1 font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
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
              <div className="overflow-hidden rounded-[var(--radius-parent)]">
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

    </>
  );
}

export function MeasureStatement() {
  return (
    <div className="reveal-section bg-ink py-16 sm:py-20 lg:py-24">
      <Container className="text-center">
        <h2 className="font-display mx-auto max-w-4xl text-3xl font-normal leading-tight tracking-[-0.02em] text-navy sm:text-4xl lg:text-5xl">
          One pricing adjustment outperformed six months of marketing
          spend. That&apos;s what we measure.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy/60">
          The only question that matters: did the business get stronger?
        </p>
      </Container>
    </div>
  );
}
