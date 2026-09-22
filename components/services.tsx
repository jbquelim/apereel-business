"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/container";
import { services } from "@/lib/site";
import { servicePages } from "@/lib/service-pages";
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
      className="reveal-section bg-navy py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Services
          </p>
          <h1
            id="services-heading"
            className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-6xl"
          >
            Each capability solves a specific growth constraint.
          </h1>
        </div>

        {/* Tab bar */}
        <div role="tablist" aria-label="Services" className="mt-14 flex gap-1 overflow-x-auto border-b border-white/10">
          {visibleServices.map((s, i) => (
            <button
              key={s.tag}
              role="tab"
              id={`service-tab-${i}`}
              aria-selected={i === active}
              aria-controls="service-panel"
              onClick={() => setActive(i)}
              className={`press-scale relative shrink-0 px-5 py-4 text-sm font-medium tracking-wide transition-colors ${
                i === active
                  ? "text-ink"
                  : "text-muted hover:text-ink/70"
              }`}
            >
              {s.tag}
              {i === active && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-ink" />
              )}
            </button>
          ))}
        </div>

        {/* Active service */}
        <article key={active} role="tabpanel" id="service-panel" aria-labelledby={`service-tab-${active}`} className="tab-content grid overflow-hidden rounded-[var(--radius-parent)] bg-navy-mid mt-10 lg:grid-cols-2">
          <div className="hidden min-h-[280px] items-center justify-center bg-navy-lift p-8 lg:flex">
            <Diagram />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              {service.tag}
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink sm:text-3xl">
              {service.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {service.body}
            </p>
            {(() => {
              const page = servicePages.find((p) => p.tag === service.tag);
              return page ? (
                <Link
                  href={`/services/${page.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 transition-colors hover:text-electric hover:underline"
                >
                  More about {service.tag.toLowerCase()} →
                </Link>
              ) : null;
            })()}
          </div>
        </article>
      </Container>
    </section>
  );
}
