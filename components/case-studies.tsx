import { Container } from "@/components/container";
import { caseStudies } from "@/lib/site";
import { InventoryDiagram } from "@/components/diagrams/inventory-diagram";
import { UxDiagram } from "@/components/diagrams/ux-diagram";
import { DevelopmentDiagram } from "@/components/diagrams/development-diagram";
import { PricingDiagram } from "@/components/diagrams/pricing-diagram";
import { LuxuryDiagram } from "@/components/diagrams/luxury-diagram";

const diagrams = [
  InventoryDiagram,
  UxDiagram,
  DevelopmentDiagram,
  PricingDiagram,
  LuxuryDiagram,
];

export function CaseStudies() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Case Studies
          </p>
          <h2
            id="work-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            Where stronger businesses became stronger digitally.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Patterns from real engagements. Brand names and confidential figures
            are omitted by design.
          </p>
        </div>
        <div className="mt-14 space-y-6">
          {caseStudies.map((study, index) => {
            const Diagram = diagrams[index];
            const reversed = index % 2 === 1;
            return (
              <article
                key={study.id}
                id={study.id}
                className="grid overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-2"
              >
                <div
                  className={`flex min-h-[240px] items-center justify-center bg-navy-mid p-8 ${reversed ? "lg:order-2" : ""}`}
                >
                  <Diagram />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
                    {study.kicker}
                  </p>
                  <h3 className="font-display mt-3 text-2xl text-ink sm:text-3xl">
                    {study.title}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {study.body.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-sm leading-relaxed text-muted sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
