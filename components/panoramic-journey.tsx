"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { ButtonLink } from "@/components/button-link";

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
  services: string[];
};

const CHAPTERS: Chapter[] = [
  {
    id: "inventory",
    number: "01",
    nav: "Inventory and SEO",
    layer: "Inventory and SEO",
    title: "The SEO problem that SEO couldn't fix.",
    summary:
      "We looked beyond content and backlinks to the depth, availability, and structure of the catalog.",
    constraint:
      "Important categories lacked the inventory depth and availability customers needed.",
    change:
      "Expand key categories, publish inventory faster, and organize the catalog around how customers shop.",
    services: ["Research and competitive analysis", "SEO"],
  },
  {
    id: "discovery",
    number: "02",
    nav: "Customer experience",
    layer: "Customer experience",
    title: "The products were there. The path was missing.",
    summary:
      "We rebuilt discovery around relevant filters, clearer categories and useful product details.",
    constraint: "A strong assortment was difficult to explore.",
    change: "A clearer route from search to discovery.",
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
    services: ["Research and competitive analysis"],
  },
  {
    id: "brand",
    number: "05",
    nav: "Brand and commerce",
    layer: "Brand and commerce",
    title: "Protect the brand. Improve the experience.",
    summary:
      "We aligned imagery, typography, layout, and shopping functionality with brand requirements.",
    constraint:
      "Strict brand requirements had to coexist with a useful shopping experience.",
    change: "Build the brand standards into the storefront's design and implementation.",
    services: ["Web development", "Conversion optimization", "Creative"],
  },
];

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function PanoramicJourney() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const artWindowRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scrollArea = scrollAreaRef.current;
    const stage = stageRef.current;
    const artWindow = artWindowRef.current;
    const img = imgRef.current;
    if (!section || !scrollArea || !stage || !artWindow || !img) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1100px)");

    const s = {
      enabled: false,
      ready: false,
      frame: 0,
      measurement: 0,
      start: 0,
      travel: 0,
      w: 0,
      h: 0,
      active: -1,
    };

    const select = (i: number) => {
      if (s.active === i) return;
      s.active = i;
      panelRefs.current.forEach((p, j) => {
        if (!p) return;
        p.classList.toggle("is-active", j === i);
        if (s.enabled && j !== i) {
          p.setAttribute("aria-hidden", "true");
          (p as HTMLElement & { inert: boolean }).inert = true;
        } else {
          p.removeAttribute("aria-hidden");
          (p as HTMLElement & { inert: boolean }).inert = false;
        }
      });
      linkRefs.current.forEach((a, j) => {
        if (!a) return;
        if (j === i) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      if (counterRef.current)
        counterRef.current.textContent = `${CHAPTERS[i].number} / 05`;
      if (nameRef.current) nameRef.current.textContent = CHAPTERS[i].nav;
    };

    const paint = () => {
      s.frame = 0;
      if (!s.enabled) return;
      const p = clamp((window.scrollY - s.start) / s.travel, 0, 1);
      const v = p * 5;
      const i = Math.min(4, Math.floor(v));
      const part = v - i;
      const a = SCENES[i];
      const b = SCENES[Math.min(4, i + 1)];
      const t = i < 4 ? smooth(clamp((part - 0.6) / 0.4, 0, 1)) : 0;
      select(t > 0.5 ? Math.min(4, i + 1) : i);
      const fx = a + (b - a) * t;
      const fy = 0.5;
      const scale = Math.max(s.w / IMG_W, s.h / IMG_H) * ZOOM;
      const sw = IMG_W * scale;
      const sh = IMG_H * scale;
      const x = clamp(s.w / 2 - fx * sw, s.w - sw, 0);
      const y = clamp(s.h / 2 - fy * sh, s.h - sh, 0);
      img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    };

    const request = () => {
      if (!s.frame) s.frame = requestAnimationFrame(paint);
    };

    const headerOffset = () => {
      const header = document.querySelector("header");
      const hh = header ? header.getBoundingClientRect().height : 72;
      return hh + 16;
    };

    const measure = () => {
      s.measurement = 0;
      section.classList.remove("pjf-enhanced", "pjf-measuring");
      scrollArea.style.height = "";
      panelRefs.current.forEach((p) => {
        if (!p) return;
        p.removeAttribute("aria-hidden");
        (p as HTMLElement & { inert: boolean }).inert = false;
      });
      img.style.transform = "";

      const top = headerOffset();
      document.documentElement.style.setProperty("--pjf-top", `${top}px`);

      let enabled =
        s.ready && wide.matches && !reduced.matches && window.innerHeight >= 760;

      if (enabled) {
        section.classList.add("pjf-enhanced", "pjf-measuring");
        const max = Math.max(
          ...panelRefs.current.map((p) =>
            p ? p.getBoundingClientRect().height : 0,
          ),
        );
        document.documentElement.style.setProperty(
          "--pjf-panel-height",
          `${max}px`,
        );
        section.classList.remove("pjf-measuring");
        if (stage.getBoundingClientRect().height > window.innerHeight - top - 8) {
          enabled = false;
          section.classList.remove("pjf-enhanced");
        }
      }
      s.enabled = enabled;

      if (enabled) {
        s.travel = window.innerHeight * 3;
        scrollArea.style.height = `${stage.getBoundingClientRect().height + s.travel}px`;
        s.start = window.scrollY + scrollArea.getBoundingClientRect().top;
        const r = artWindow.getBoundingClientRect();
        s.w = r.width;
        s.h = r.height;
        s.active = -1;
        paint();
      } else {
        s.active = -1;
        select(0);
      }
    };

    const requestMeasure = () => {
      if (!s.measurement) s.measurement = requestAnimationFrame(measure);
    };

    const onLinkClick = (i: number) => (e: MouseEvent) => {
      if (!s.enabled) return; // native anchor handles static mode
      e.preventDefault();
      window.scrollTo({
        top: s.start + s.travel * ((i + 0.3) / 5),
        behavior: reduced.matches ? "auto" : "smooth",
      });
      history.replaceState(null, "", `#pjf-${CHAPTERS[i].id}`);
    };
    const clickHandlers = linkRefs.current.map((a, i) => {
      const h = onLinkClick(i);
      a?.addEventListener("click", h);
      return h;
    });

    const loaded = () => {
      if (!img.naturalWidth) return;
      Promise.resolve(img.decode ? img.decode() : undefined)
        .catch(() => {})
        .then(() => {
          s.ready = true;
          requestMeasure();
        });
    };
    if (img.complete) loaded();
    else {
      img.addEventListener("load", loaded);
      img.addEventListener("error", requestMeasure);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("pageshow", requestMeasure);
    wide.addEventListener("change", requestMeasure);
    reduced.addEventListener("change", requestMeasure);
    document.fonts?.ready.then(requestMeasure);
    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(requestMeasure);
      panelRefs.current.forEach((p) => p && ro!.observe(p));
    }
    measure();

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("pageshow", requestMeasure);
      wide.removeEventListener("change", requestMeasure);
      reduced.removeEventListener("change", requestMeasure);
      img.removeEventListener("load", loaded);
      img.removeEventListener("error", requestMeasure);
      linkRefs.current.forEach((a, i) => a?.removeEventListener("click", clickHandlers[i]));
      ro?.disconnect();
      if (s.frame) cancelAnimationFrame(s.frame);
      if (s.measurement) cancelAnimationFrame(s.measurement);
    };
  }, []);

  return (
    <section ref={sectionRef} id="journey" aria-labelledby="journey-heading" className="pjf-section">
      <Container>
        <header className="pjf-intro">
          <p className="pjf-eyebrow">Complexity to clarity</p>
          <h2 id="journey-heading" className="pjf-title">
            Inside a business transformation.
          </h2>
          <p className="pjf-subtitle">
            The constraints we found. The changes we made.
          </p>
        </header>
      </Container>

      <div ref={scrollAreaRef} className="pjf-scroll-area">
        <div ref={stageRef} className="pjf-stage">
          <div ref={artWindowRef} className="pjf-art-window">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src="/images/panorama-journey.webp"
              alt="A continuous architectural landscape moving through a catalog wall, a discovery gateway, a build-and-ship bridge, a balance sculpture, and an ordered brand facade."
              className="pjf-panorama"
              width={IMG_W}
              height={IMG_H}
              decoding="async"
            />
            <div className="pjf-art-shade" aria-hidden="true" />
            <div className="pjf-art-caption" aria-hidden="true">
              <span ref={counterRef} className="pjf-counter">
                01 / 05
              </span>
              <span ref={nameRef} className="pjf-name">
                {CHAPTERS[0].nav}
              </span>
            </div>
          </div>

          <Container>
            <nav className="pjf-rail" aria-label="Case chapters">
              {CHAPTERS.map((c, i) => (
                <a
                  key={c.id}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={`#pjf-${c.id}`}
                  aria-current={i === 0 ? "true" : undefined}
                >
                  <span>{c.number}</span>
                  {c.nav}
                </a>
              ))}
            </nav>

            <div className="pjf-panels">
              {CHAPTERS.map((c, i) => (
                <article
                  key={c.id}
                  id={`pjf-${c.id}`}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className={`pjf-panel${i === 0 ? " is-active" : ""}`}
                >
                  <div className="pjf-lead">
                    <p className="pjf-eyebrow">
                      {c.number} / {c.nav}
                    </p>
                    <h3 className="pjf-headline">{c.title}</h3>
                  </div>
                  <div className="pjf-summary">
                    <p>{c.summary}</p>
                    <a className="pjf-case-link" href="#work">
                      Explore this case
                      <span aria-hidden="true"> ↗</span>
                    </a>
                    {c.services.length > 0 && (
                      <ul className="pjf-services">
                        {c.services.map((sv) =>
                          SERVICE_ROUTES[sv] ? (
                            <li key={sv}>
                              <Link href={SERVICE_ROUTES[sv]}>{sv}</Link>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="pjf-detail">
                    <div>
                      <h4>The constraint</h4>
                      <p>{c.constraint}</p>
                    </div>
                    <div>
                      <h4>The change</h4>
                      <p>{c.change}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </div>
      </div>

      <Container>
        <div className="pjf-cta">
          <ButtonLink href="/contact">Talk to us about your business</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
