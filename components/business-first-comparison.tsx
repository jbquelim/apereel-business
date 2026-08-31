import { Container } from "@/components/container";

const soldSteps = ["Blogs", "Backlinks", "Reports", "Wait"];
const apereelSteps = [
  "Business",
  "Customer",
  "Competition",
  "Opportunity",
  "Strategy",
  "Growth",
];

export function BusinessFirstComparison() {
  return (
    <section className="reveal-section py-24 sm:py-32">
      <Container>
        <div>
          <h3 className="font-display max-w-4xl text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            The problem isn&apos;t SEO.
            <br />
            <span className="text-electric">
              It&apos;s doing SEO before understanding the business.
            </span>
          </h3>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted">
            Apereel starts with the business. We examine your product, pricing,
            competition, inventory, customer experience, and technology first.
            Then we determine where SEO, advertising, web development, AI, and
            digital strategy can actually create growth.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-navy-mid p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              What You Were Sold
            </p>
            <ol className="mt-8">
              {soldSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-4 py-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-base ${i === soldSteps.length - 1 ? "text-signal" : "text-muted"}`}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-electric/20 bg-navy-mid p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              How Apereel Starts
            </p>
            <ol className="mt-8">
              {apereelSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-4 py-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-electric/40 font-mono text-[10px] text-electric">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-base font-medium ${i === apereelSteps.length - 1 ? "text-signal" : "text-ink"}`}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
