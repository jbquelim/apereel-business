"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import { services } from "@/lib/site";
import { ResearchDiagram } from "@/components/diagrams/research-diagram";
import { SeoDiagram } from "@/components/diagrams/seo-diagram";
import { AdvertisingDiagram } from "@/components/diagrams/advertising-diagram";
import { WebdevDiagram } from "@/components/diagrams/webdev-diagram";
import { ConversionDiagram } from "@/components/diagrams/conversion-diagram";

const visibleServices = services.filter(
  (s) => s.tag !== "Premium Creative",
);

const diagrams = [
  ResearchDiagram,
  SeoDiagram,
  AdvertisingDiagram,
  WebdevDiagram,
  ConversionDiagram,
];

export function Services() {
  const [active, setActive] = useState(0);
  const service = visibleServices[active];
  const Diagram = diagrams[active];

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Services
          </p>
          <h2
            id="services-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            Every service starts with the same question: what&apos;s actually limiting growth?
          </h2>
        </div>

        {/* Tab bar */}
        <div className="mt-14 flex gap-1 overflow-x-auto border-b border-white/10">
          {visibleServices.map((s, i) => (
            <button
              key={s.tag}
              onClick={() => setActive(i)}
              className={`press-scale relative shrink-0 px-5 py-4 text-sm font-medium tracking-wide transition-colors ${
                i === active
                  ? "text-ink"
                  : "text-muted hover:text-ink/70"
              }`}
            >
              {s.title}
              {i === active && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-electric" />
              )}
            </button>
          ))}
        </div>

        {/* Active service */}
        <article key={active} className="tab-content grid overflow-hidden rounded-2xl border border-white/10 mt-10 lg:grid-cols-2">
          <div className="hidden min-h-[280px] items-center justify-center bg-navy p-8 lg:flex">
            <Diagram />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              {service.tag}
            </p>
            <h3 className="font-display mt-3 text-2xl text-ink sm:text-3xl">
              {service.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {service.body}
            </p>
          </div>
        </article>
      </Container>
    </section>
  );
}
