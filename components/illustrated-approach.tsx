"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { ButtonLink } from "@/components/button-link";
import { APPROACH_MAP_SVG } from "@/components/approach-map-svg";

type Chapter = {
  id: string;
  num: string;
  label: string;
  headline: string;
  body: string;
  deliverable: string;
  services: { label: string; href: string }[];
};

// Copy from chapters.json; service links resolved to real service routes,
// non-existent services omitted (never invented).
const CHAPTERS: Chapter[] = [
  {
    id: "research",
    num: "01",
    label: "Research",
    headline: "Find the opportunity.",
    body: "Understand customer needs, study the competition, and identify where your business can offer something better.",
    deliverable: "A clear opportunity map",
    services: [
      {
        label: "Research & Competitive Analysis",
        href: "/services/research-competitive-analysis",
      },
    ],
  },
  {
    id: "advantage",
    num: "02",
    label: "Build the advantage",
    headline: "Give customers a reason to choose you.",
    body: "Strengthen pricing, selection, availability, and experience around the opportunity that matters most.",
    deliverable: "Prioritized business improvements",
    services: [],
  },
  {
    id: "translate",
    num: "03",
    label: "Translate",
    headline: "Make your advantage visible.",
    body: "Turn what makes your business stronger into a clearer website, better navigation, and more convincing messaging.",
    deliverable: "A clearer buying experience",
    services: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Conversion Optimization", href: "/services/conversion-optimization" },
    ],
  },
  {
    id: "amplify",
    num: "04",
    label: "Amplify",
    headline: "Bring the right people to it.",
    body: "Use search, advertising, and content to help the right customers discover and understand your offer.",
    deliverable: "A focused channel plan",
    services: [
      { label: "SEO", href: "/services/seo" },
      { label: "Advertising", href: "/services/advertising" },
    ],
  },
  {
    id: "improve",
    num: "05",
    label: "Measure and improve",
    headline: "Learn what moves the business.",
    body: "Review qualified leads, conversions, revenue, and margin. Use the findings to choose what to improve next.",
    deliverable: "The next improvement priorities",
    services: [],
  },
];

export function IllustratedApproach() {
  // -1 = nothing lit yet: the page opens on the heading alone, and a step
  // only lights once it has scrolled into place beside the map
  const [active, setActive] = useState(-1);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const recompute = useCallback(() => {
    // Pinned layout: a step lights as it settles into the box beside the map
    // (its text centred on the drawing). Unpinned: upper quarter of the view.
    const sticky = stickyRef.current;
    const pinned = !!sticky && getComputedStyle(sticky).position === "sticky";
    const line = pinned
      ? sticky.getBoundingClientRect().top + 48
      : window.innerHeight * 0.25;
    let best = -1;
    for (let i = 0; i < chapterRefs.current.length; i++) {
      const el = chapterRefs.current[i];
      if (el && el.getBoundingClientRect().top <= line) best = i;
    }
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);

  useEffect(() => {
    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        recompute();
        scheduled = false;
      });
    };
    // The last step's box matches the pinned column, so the section releases
    // exactly when step 05 sits centred on the drawing.
    const sticky = stickyRef.current;
    const ro = new ResizeObserver(() => {
      if (sticky)
        sectionRef.current?.style.setProperty(
          "--approach-sticky-h",
          `${sticky.offsetHeight}px`,
        );
    });
    if (sticky) ro.observe(sticky);
    recompute();
    // Re-measure once fonts/layout settle.
    const t = window.setTimeout(recompute, 250);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [recompute]);

  return (
    <section
      ref={sectionRef}
      id="approach"
      aria-labelledby="approach-heading"
      className="reveal-section approach-illustrated py-16 sm:py-24"
    >
      <Container>
        <div className="approach-grid">
          {/* Left: sticky map + step nav */}
          <div ref={stickyRef} className="approach-sticky">
            <div
              className="approach-map"
              data-active={active}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: APPROACH_MAP_SVG }}
            />
            <nav aria-label="Approach steps" className="approach-nav">
              <ol>
                {CHAPTERS.map((c, i) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      aria-current={i === active ? "step" : undefined}
                      className={i === active ? "is-active" : undefined}
                    >
                      <span className="num">{c.num}</span>
                      <span className="lbl">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Right: intro + scrolling chapters */}
          <div className="approach-chapters">
            <div className="approach-intro">
              <div className="approach-intro-inner">
                <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  Our Approach
                </p>
                <h1
                  id="approach-heading"
                  className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-5xl"
                >
                  Fix the business first. Then amplify it with digital.
                </h1>
              </div>
            </div>
            {CHAPTERS.map((c, i) => (
              <article
                key={c.id}
                id={c.id}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                className={`approach-chapter${i === active ? " is-active" : ""}`}
              >
                <div className="approach-chapter-inner">
                  <p className="chapter-kicker">
                    <span className="chapter-num">{c.num}</span> / {c.label}
                  </p>
                  <h2 className="chapter-headline">{c.headline}</h2>
                  <p className="chapter-body">{c.body}</p>
                  <div className="chapter-deliverable">
                    <span className="chapter-deliverable-kicker">
                      What you get
                    </span>
                    <p>{c.deliverable}</p>
                  </div>
                  {c.services.length > 0 && (
                    <ul className="chapter-services">
                      {c.services.map((s) => (
                        <li key={s.href}>
                          <Link href={s.href}>
                            {s.label}
                            <span aria-hidden="true"> ↗</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {i === CHAPTERS.length - 1 && (
                    <div className="approach-cta">
                      <ButtonLink href="/contact">
                        Talk to us about your business
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
