"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/container";
import { caseStudies } from "@/lib/site";

type Visual = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** When set, letterbox with this background instead of cropping. */
  contain?: string;
  /** Looping motion version of the still; the still remains the fallback. */
  video?: string;
};

const visuals: Visual[] = [
  {
    src: "/images/case-inventory-seo.jpg",
    width: 783,
    height: 901,
    alt: "Category ranking positions climbing from #48 to #3 as inventory depth grows",
    video: "/videos/case-inventory-seo.mp4",
  },
  {
    src: "/images/case-ecommerce-ux.jpg",
    width: 838,
    height: 758,
    alt: "Product discovery interface with filters and navigation rebuilt around how customers shop",
    // Callouts reach the image edges — letterbox on the image's own navy instead of cropping.
    contain: "#0f1e3b",
    video: "/videos/case-ecommerce-ux.mp4",
  },
  {
    src: "/images/case-development-transformation.jpg",
    width: 768,
    height: 746,
    alt: "Development cycle collapsing from weeks in an external queue to same-day internal shipping",
    video: "/videos/case-development-transformation.mp4",
  },
  {
    src: "/images/case-pricing-intelligence.jpg",
    width: 868,
    height: 753,
    alt: "Competitive price comparison revealing a category priced above market",
    video: "/videos/case-pricing-intelligence.mp4",
  },
  {
    src: "/images/case-brand-compliance.jpg",
    width: 817,
    height: 727,
    alt: "Brand standards and commercial goals converging into one e-commerce execution",
    contain: "#081633",
    video: "/videos/case-brand-compliance.mp4",
  },
];

export function CaseStudies() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const study = caseStudies[active];
  const visual = visuals[active];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Real Business Problems. Real Fixes.
          </p>
          <h1
            id="work-heading"
            className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-6xl"
          >
            What we found. And what we changed.
          </h1>
        </div>

        {/* Tab bar */}
        <div role="tablist" aria-label="Case studies" className="mt-14 flex gap-1 overflow-x-auto border-b border-white/10">
          {caseStudies.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              id={`work-tab-${i}`}
              aria-selected={i === active}
              aria-controls="work-panel"
              onClick={() => setActive(i)}
              className={`press-scale relative shrink-0 px-5 py-4 text-sm font-medium tracking-wide transition-colors ${
                i === active
                  ? "text-ink"
                  : "text-muted hover:text-ink/70"
              }`}
            >
              {s.kicker}
              {i === active && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-ink" />
              )}
            </button>
          ))}
        </div>

        {/* Active case study */}
        <article key={active} role="tabpanel" id="work-panel" aria-labelledby={`work-tab-${active}`} className="tab-content grid overflow-hidden rounded-[var(--radius-parent)] bg-navy-mid mt-10 lg:grid-cols-2">
          <div
            className="relative hidden min-h-[280px] bg-navy-lift lg:block"
            style={visual.contain ? { backgroundColor: visual.contain } : undefined}
          >
            {visual.video && !reducedMotion ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={visual.src}
                aria-label={visual.alt}
                className={`absolute inset-0 h-full w-full ${
                  visual.contain ? "object-contain" : "object-cover"
                }`}
              >
                <source src={visual.video} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={visual.src}
                alt={visual.alt}
                width={visual.width}
                height={visual.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`absolute inset-0 h-full w-full ${
                  visual.contain ? "object-contain" : "object-cover"
                }`}
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              {study.kicker}
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink sm:text-3xl">
              {study.title}
            </h2>
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
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-muted uppercase"
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
