"use client";

import { useState } from "react";
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
  const [active, setActive] = useState(0);
  const study = caseStudies[active];
  const Diagram = diagrams[active];

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Real Business Problems. Real Fixes.
          </p>
          <h2
            id="work-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            What we found — and what we changed.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="mt-14 flex gap-1 overflow-x-auto border-b border-white/10">
          {caseStudies.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={`press-scale relative shrink-0 px-5 py-4 text-sm font-medium tracking-wide transition-colors ${
                i === active
                  ? "text-ink"
                  : "text-muted hover:text-ink/70"
              }`}
            >
              {s.kicker}
              {i === active && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-electric" />
              )}
            </button>
          ))}
        </div>

        {/* Active case study */}
        <article key={active} className="tab-content grid overflow-hidden rounded-2xl border border-white/10 mt-10 lg:grid-cols-2">
          <div className="hidden min-h-[280px] items-center justify-center bg-navy p-8 lg:flex">
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
            <div className="mt-6 flex flex-wrap gap-2">
              {study.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-electric uppercase"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
