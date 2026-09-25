"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { ButtonLink } from "@/components/button-link";

// Camera focal points (camera.json). x is the horizontal focus in the 2172x724
// panorama; the route between landmarks is baked into the image.
const IMG_W = 2172;
const IMG_H = 724;
const ZOOM = 1.04;
const SCENES = [0.115, 0.29, 0.5, 0.708, 0.915];

const SERVICE_ROUTES: Record<string, string> = {
  "Research and competitive analysis": "/services/research-competitive-analysis",
  SEO: "/services/seo",
  "Conversion optimization": "/services/conversion-optimization",
  "Web development": "/services/web-development",
  Creative: "/services/premium-creative",
};

type Chapter = {
  id: string;
  number: string;
  nav: string;
  layer: string;
  title: string;
  summary: string;
  constraint: string;
  change: string;
  outcome: string;
  services: string[];
};

// content.json — case narratives (verified copy, no invented numbers).
const CHAPTERS: Chapter[] = [
  {
    id: "inventory",
    number: "01",
    nav: "Inventory and SEO",
    layer: "Inventory",
    title: "The SEO problem that SEO couldn't fix.",
    summary:
      "We looked beyond content and backlinks to the depth, availability, and structure of the catalog.",
    constraint:
      "Important categories lacked the inventory depth and availability customers needed.",
    change:
      "Expand key categories, publish inventory faster, and organize the catalog around how customers shop.",
    outcome: "A stronger catalog supporting search visibility.",
    services: ["Research and competitive analysis", "SEO"],
  },
  {
    id: "discovery",
    number: "02",
    nav: "Customer experience",
    layer: "Discovery",
    title: "The products were there. The path was missing.",
    summary:
      "We rebuilt discovery around relevant filters, clearer categories and useful product details.",
    constraint: "A strong assortment was difficult to explore.",
    change: "A clearer route from search to discovery.",
    outcome: "An easier path to relevant products.",
    services: ["Conversion optimization", "Web development"],
  },
  {
    id: "development",
    number: "03",
    nav: "Development",
    layer: "Development",
    title: "From waiting to shipping.",
    summary:
      "We helped the team build, test, and release improvements internally, reducing dependence on an external queue.",
    constraint:
      "Website improvements waited through handoffs and development queues.",
    change:
      "A connected internal workflow for building, testing, and releasing changes.",
    outcome: "A shorter route from idea to release.",
    services: ["Web development"],
  },
  {
    id: "pricing",
    number: "04",
    nav: "Pricing",
    layer: "Pricing",
    title: "The gap was in the offer.",
    summary:
      "Competitive research exposed pricing differences that more advertising alone could not resolve.",
    constraint: "The category's pricing was out of step with the market.",
    change:
      "Review the competitive range and adjust the offer where the evidence supports it.",
    outcome: "A more competitive offer.",
    services: ["Research and competitive analysis"],
  },
  {
    id: "brand",
    number: "05",
    nav: "Brand and commerce",
    layer: "Brand",
    title: "Protect the brand. Improve the experience.",
    summary:
      "We aligned imagery, typography, layout, and shopping functionality with brand requirements.",
    constraint:
      "Strict brand requirements had to coexist with a useful shopping experience.",
    change: "Build the brand standards into the storefront's design and implementation.",
    outcome: "Brand consistency and a clearer buying experience.",
    services: ["Web development", "Conversion optimization", "Creative"],
  },
];

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth = (t: number) => t * t * (3 - 2 * t);

function ConstraintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="pj-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
    </svg>
  );
}
function ChangeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="pj-icon" aria-hidden="true">
      <path d="M4 9h13l-3.2-3.2M20 15H7l3.2 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PanoramicJourney() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const narrativeRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const articleRefs = useRef<(HTMLElement | null)[]>([]);

  // Non-render state kept in refs so the camera never triggers React updates.
  const st = useRef({
    enabled: false,
    ready: false,
    active: -1,
    centers: [] as number[],
    vw: 0,
    vh: 0,
    frame: 0,
    measureFrame: 0,
  });

  const setActiveIfChanged = useCallback((i: number) => {
    if (st.current.active === i) return;
    st.current.active = i;
    setActive(i);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    const viewport = viewportRef.current;
    const visual = visualRef.current;
    const narrative = narrativeRef.current;
    if (!section || !img || !viewport || !visual || !narrative) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1100px)");

    const update = () => {
      st.current.frame = 0;
      const { centers } = st.current;
      if (!centers.length) return;
      const target = window.scrollY + window.innerHeight * 0.45;
      let lo = 0;
      let hi = 0;
      let q = 0;
      if (target >= centers[4]) {
        lo = hi = 4;
      } else if (target > centers[0]) {
        for (let i = 0; i < 4; i++) {
          if (target >= centers[i] && target < centers[i + 1]) {
            lo = i;
            hi = i + 1;
            const t = (target - centers[i]) / (centers[i + 1] - centers[i]);
            q = smooth(clamp((t - 0.3) / 0.55, 0, 1));
            break;
          }
        }
      }
      setActiveIfChanged(q >= 0.5 ? hi : lo);
      if (!st.current.enabled) return;
      const fx = SCENES[lo] + (SCENES[hi] - SCENES[lo]) * q;
      const fy = 0.5;
      const { vw, vh } = st.current;
      const scale = Math.max(vw / IMG_W, vh / IMG_H) * ZOOM;
      const sw = IMG_W * scale;
      const sh = IMG_H * scale;
      const x = clamp(vw * 0.5 - fx * sw, vw - sw, 0);
      const y = clamp(vh * 0.5 - fy * sh, vh - sh, 0);
      img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    };

    const schedule = () => {
      if (!st.current.frame) st.current.frame = requestAnimationFrame(update);
    };

    const measure = () => {
      st.current.measureFrame = 0;
      let enabled =
        st.current.ready &&
        wide.matches &&
        !reduce.matches &&
        window.innerHeight >= 720;
      section.classList.toggle("pj-enhanced", enabled);
      if (enabled && visual.getBoundingClientRect().height > window.innerHeight - 32) {
        enabled = false;
        section.classList.remove("pj-enhanced");
      }
      st.current.enabled = enabled;
      const r = viewport.getBoundingClientRect();
      st.current.vw = r.width;
      st.current.vh = r.height;
      st.current.centers = articleRefs.current.map((a) => {
        if (!a) return 0;
        const b = a.getBoundingClientRect();
        return window.scrollY + b.top + b.height * 0.5;
      });
      if (!enabled) img.style.transform = "";
      st.current.active = -1;
      update();
    };

    const requestMeasure = () => {
      if (!st.current.measureFrame)
        st.current.measureFrame = requestAnimationFrame(measure);
    };

    const imageReady = () => {
      if (!img.naturalWidth) return;
      const p = img.decode ? img.decode() : Promise.resolve();
      p.catch(() => {}).then(() => {
        st.current.ready = true;
        requestMeasure();
      });
    };

    if (img.complete) imageReady();
    else {
      img.addEventListener("load", imageReady);
      img.addEventListener("error", requestMeasure);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("pageshow", requestMeasure);
    reduce.addEventListener("change", requestMeasure);
    wide.addEventListener("change", requestMeasure);
    document.fonts?.ready.then(requestMeasure);
    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(requestMeasure);
      ro.observe(narrative);
      ro.observe(viewport);
    }
    measure();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("pageshow", requestMeasure);
      reduce.removeEventListener("change", requestMeasure);
      wide.removeEventListener("change", requestMeasure);
      img.removeEventListener("load", imageReady);
      img.removeEventListener("error", requestMeasure);
      ro?.disconnect();
      if (st.current.frame) cancelAnimationFrame(st.current.frame);
      if (st.current.measureFrame) cancelAnimationFrame(st.current.measureFrame);
    };
  }, [setActiveIfChanged]);

  // Anchor navigation: derive camera from real scroll, jump to article center.
  const onChapterLink = (i: number) => (e: React.MouseEvent) => {
    if (!st.current.enabled) return; // let native anchor scroll handle it
    e.preventDefault();
    const c = st.current.centers[i];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(0, c - window.innerHeight * 0.45),
      behavior: reduce ? "auto" : "smooth",
    });
    history.replaceState(null, "", `#pj-${CHAPTERS[i].id}`);
  };

  const hasPrev = active > 0;
  const hasNext = active < CHAPTERS.length - 1;

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="reveal-section pj-section"
    >
      <Container>
        <div className="pj-intro">
          <p className="pj-eyebrow">Complexity to clarity</p>
          <h2 id="journey-heading" className="pj-title">
            Inside a business transformation.
          </h2>
          <p className="pj-lede">The constraints we found. The changes we made.</p>
        </div>

        <div className="pj-story">
          {/* Left: cinematic panorama window */}
          <div ref={visualRef} className="pj-visual">
            <div ref={viewportRef} className="pj-viewport">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src="/images/panorama-journey.webp"
                alt="An illustrated architectural journey from a catalog wall through a discovery gateway, a build-and-ship bridge, a balance sculpture, and an ordered brand facade."
                className="pj-panorama"
                width={IMG_W}
                height={IMG_H}
                decoding="async"
              />
              <div className="pj-shade" aria-hidden="true" />
              <div className="pj-controls" aria-hidden="true">
                <span className={`pj-step${hasPrev ? "" : " pj-step-off"}`}>
                  {hasPrev ? (
                    <>
                      <span className="pj-step-k">
                        {CHAPTERS[active - 1].number} / 05
                      </span>
                      <span>{CHAPTERS[active - 1].nav}</span>
                    </>
                  ) : null}
                </span>
                <span className="pj-counter">
                  {CHAPTERS[active].number} / 05
                </span>
                <span className={`pj-step pj-step-next${hasNext ? "" : " pj-step-off"}`}>
                  {hasNext ? (
                    <>
                      <span className="pj-step-k">
                        {CHAPTERS[active + 1].number} / 05
                      </span>
                      <span>{CHAPTERS[active + 1].nav}</span>
                    </>
                  ) : null}
                </span>
              </div>
              <div className="pj-caption" aria-hidden="true">
                <span className="pj-eyebrow">
                  {CHAPTERS[active].number} / {CHAPTERS[active].nav}
                </span>
                <span className="pj-current-name">{CHAPTERS[active].layer}</span>
              </div>
            </div>
            <nav className="pj-rail" aria-label="Case journey chapters">
              {CHAPTERS.map((c, i) => (
                <a
                  key={c.id}
                  href={`#pj-${c.id}`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={onChapterLink(i)}
                >
                  <span className="pj-rail-num">{c.number}</span>
                  <span className="pj-rail-line" aria-hidden="true" />
                  <span className="pj-rail-name">{c.nav}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Right: scrolling narrative */}
          <div ref={narrativeRef} className="pj-narrative">
            {CHAPTERS.map((c, i) => (
              <article
                key={c.id}
                id={`pj-${c.id}`}
                ref={(el) => {
                  articleRefs.current[i] = el;
                }}
                className={`pj-article${i === active ? " is-active" : ""}`}
              >
                {/* Mobile/fallback still: the same panorama cropped to this landmark */}
                <div
                  className="pj-still"
                  aria-hidden="true"
                  style={{ backgroundPosition: `${SCENES[i] * 100}% 50%` }}
                />
                <p className="pj-eyebrow">
                  {c.number} / {c.nav}
                </p>
                <h3 className="pj-headline">{c.title}</h3>
                <p className="pj-summary">{c.summary}</p>
                <div className="pj-detail">
                  <ConstraintIcon />
                  <div>
                    <h4>The constraint</h4>
                    <p>{c.constraint}</p>
                  </div>
                </div>
                <div className="pj-detail">
                  <ChangeIcon />
                  <div>
                    <h4>The change</h4>
                    <p>{c.change}</p>
                  </div>
                </div>
                <p className="pj-outcome">
                  <span>What changed</span>
                  {c.outcome}
                </p>
                {c.services.length > 0 && (
                  <ul className="pj-services">
                    {c.services.map((s) =>
                      SERVICE_ROUTES[s] ? (
                        <li key={s}>
                          <Link href={SERVICE_ROUTES[s]}>
                            {s}
                            <span aria-hidden="true"> ↗</span>
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                )}
                <a className="pj-case-link" href="#work">
                  Explore this case
                  <span aria-hidden="true"> ↗</span>
                </a>
              </article>
            ))}
            <div className="pj-cta">
              <ButtonLink href="/contact">
                Talk to us about your business
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
