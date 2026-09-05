"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { approach } from "@/lib/site";
import { ApproachResearchDiagram } from "@/components/diagrams/approach-research-diagram";
import { ApproachAdvantageDiagram } from "@/components/diagrams/approach-advantage-diagram";
import { ApproachTranslateDiagram } from "@/components/diagrams/approach-translate-diagram";
import { ApproachAmplifyDiagram } from "@/components/diagrams/approach-amplify-diagram";
import { ApproachMeasureDiagram } from "@/components/diagrams/approach-measure-diagram";

const diagrams = [
  ApproachResearchDiagram,
  ApproachAdvantageDiagram,
  ApproachTranslateDiagram,
  ApproachAmplifyDiagram,
  ApproachMeasureDiagram,
];

export function Approach() {
  const [active, setActive] = useState(0);
  const step = approach[active];
  const Diagram = diagrams[active];

  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            The Apereel Method
          </p>
          <h2
            id="approach-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            Fix the business first. Then amplify it with digital.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="mt-14 flex gap-1 overflow-x-auto border-b border-white/10">
          {approach.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className={`press-scale relative shrink-0 px-5 py-4 text-sm font-medium tracking-wide transition-colors ${
                i === active
                  ? "text-ink"
                  : "text-muted hover:text-ink/70"
              }`}
            >
              <span className="mr-2 font-mono text-[11px] tracking-[0.22em] text-electric">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
              {i === active && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-electric" />
              )}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <article key={active} className="tab-content grid overflow-hidden rounded-2xl border border-white/10 mt-10 lg:grid-cols-2">
          <div className="hidden min-h-[280px] items-center justify-center bg-navy p-8 lg:flex">
            <Diagram />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              {step.title}
            </p>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted">
              {step.body.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            {step.services.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-mono text-[11px] tracking-[0.2em] text-muted/60 uppercase">
                  Services Deployed
                </p>
                <ul className="mt-3 grid gap-2">
                  {step.services.map((service) => (
                    <li
                      key={service.tag}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <p className="text-[11px] font-medium tracking-wide text-electric uppercase">
                        {service.tag}
                      </p>
                      <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">
                        {service.title}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        <div className="mt-10">
          <ButtonLink href="/#contact" variant="secondary">
            Find Your Growth Opportunity
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
