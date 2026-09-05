import { Container } from "@/components/container";
import Image from "next/image";

export function RealityCheck() {
  return (
    <>
      {/* --- Main content --- */}
<section
        id="reality-check"
        aria-labelledby="reality-check-heading"
        className="reveal-section"
      >
        <Container>
          <div className="grid lg:grid-cols-2">
            <div className="py-24 pr-12 sm:py-32">
              <h3
                id="reality-check-heading"
                className="font-display text-3xl text-ink sm:text-4xl"
              >
                You were promised better rankings and more business.
              </h3>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                Months later, you&apos;re getting reports, keyword charts, and
                another batch of generic blog posts that your customers probably
                never asked for.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted/70">
                Whether you&apos;ve been relying on an agency, managing it
                in-house, or not doing digital marketing at all — the starting
                question is the same: what&apos;s actually limiting the business?
              </p>
            </div>
            <div className="relative lg:min-h-full">
              <Image
                src="/images/reality-check.png"
                alt="SEO reports and keyword charts"
                width={1537}
                height={1023}
                className="h-full w-full object-contain object-left"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* --- Three principles (white background) --- */}
      <div className="reveal-section bg-ink py-16 sm:py-20 lg:py-24">
        <Container>
          <h2 className="font-display mb-12 text-center text-3xl text-navy sm:mb-16 sm:text-4xl">
            What to Know. What to Look For.
          </h2>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* 01 */}
            <div className="rounded-2xl border border-navy/10 bg-white p-8 sm:p-10">
              <p className="font-mono text-[12px] tracking-[0.22em] text-electric">
                01
              </p>
              <h3 className="font-display mt-4 text-xl text-navy sm:text-2xl">
                Content isn&apos;t a strategy.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-navy/60">
                Publishing another AI-assisted blog every week does not solve
                weak pricing, poor product selection, bad UX, slow inventory
                updates, or an uncompetitive business.
              </p>
            </div>

            {/* 02 */}
            <div className="rounded-2xl border border-navy/10 bg-white p-8 sm:p-10">
              <p className="font-mono text-[12px] tracking-[0.22em] text-electric">
                02
              </p>
              <h3 className="font-display mt-4 text-xl text-navy sm:text-2xl">
                Rankings need a reason.
              </h3>
              <div className="mt-4 text-sm leading-relaxed text-navy/60">
                <p>Before asking:</p>
                <p className="mt-2 text-base text-navy">
                  &ldquo;How do we rank higher?&rdquo;
                </p>
                <p className="mt-3">Apereel asks:</p>
              </div>
              <blockquote className="mt-3 border-l-2 border-electric pl-4">
                <p className="font-display text-lg text-electric sm:text-xl">
                  &ldquo;Why should this business rank ahead of everyone
                  else?&rdquo;
                </p>
              </blockquote>
              <p className="mt-4 text-sm leading-relaxed text-navy/60">
                Once we understand the answer, we build the digital strategy
                around it.
              </p>
            </div>

            {/* 03 */}
            <div className="rounded-2xl border border-navy/10 bg-white p-8 sm:p-10">
              <p className="font-mono text-[12px] tracking-[0.22em] text-electric">
                03
              </p>
              <h3 className="font-display mt-4 text-xl text-navy sm:text-2xl">
                Ask for proof.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-navy/60">
                If an agency says its SEO works, ask them to show you a real
                client example.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-navy/60">
                Check:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "What keywords are ranking?",
                  "Do those keywords have real search volume?",
                  "Have rankings improved over time?",
                  "Is the traffic relevant to the business?",
                  "Did it lead to leads, conversions, or sales?",
                ].map((q) => (
                  <li
                    key={q}
                    className="flex items-start gap-2.5 text-sm text-navy/60"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-electric"
                      aria-hidden="true"
                    />
                    {q}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium leading-relaxed text-navy">
                A ranking means little if nobody searches for it.
              </p>
            </div>
          </div>
        </Container>
      </div>

    </>
  );
}
