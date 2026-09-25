"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { ButtonLink } from "@/components/button-link";
import { OVERLAY_SVGS } from "@/components/cinematic-overlays";

const IMG_W = 2172;
const IMG_H = 724;
const VISIBLE_FRACTION = 0.52;
const MIN_ZOOM = 1.12;
const SCROLL_VIEWPORTS = 4;
const T_OVERVIEW = 0.06;
const T_CHAPTER_END = 0.92;

const SERVICE_ROUTES: Record<string, string> = {
  "Research and competitive analysis": "/services/research-competitive-analysis",
  SEO: "/services/seo",
  "Conversion optimization": "/services/conversion-optimization",
  "Web development": "/services/web-development",
  Creative: "/services/premium-creative",
};

type Chapter = {
  id: keyof typeof OVERLAY_SVGS;
  number: string;
  nav: string;
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
    title: "Protect the brand. Improve the experience.",
    summary:
      "We aligned imagery, typography, layout, and shopping functionality with brand requirements.",
    constraint:
      "Strict brand requirements had to coexist with a useful shopping experience.",
    change: "Build the brand standards into the storefront's design and implementation.",
    services: ["Web development", "Conversion optimization", "Creative"],
  },
];

const FOCUS = [0.115, 0.29, 0.5, 0.708, 0.915];
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function PanoramicJourney() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const area = areaRef.current;
    const stage = stageRef.current;
    const visual = visualRef.current;
    const img = imgRef.current;
    const label = labelRef.current;
    if (!area || !stage || !visual || !img || !label) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const chapters = chapterRefs.current.filter(Boolean) as HTMLElement[];
    const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];

    // Collect animation hooks from the injected SVGs.
    const bits = chapters.map((c) => ({
      reveal: Array.from(c.querySelectorAll<SVGElement>("[data-reveal]")),
      draw: Array.from(c.querySelectorAll<SVGElement>("[data-draw]")),
      move: Array.from(c.querySelectorAll<SVGElement>("[data-move]")),
    }));

    const s = {
      enabled: false,
      ready: false,
      start: 0,
      travel: 1,
      w: 1,
      h: 1,
      frame: 0,
      resizeFrame: 0,
      active: -1,
    };

    const diagram = (i: number, p: number) => {
      const b = bits[i];
      if (!b) return;
      b.reveal.forEach((el) => {
        el.style.opacity = String(
          clamp((p - Number(el.dataset.reveal)) / 0.18),
        );
      });
      b.draw.forEach((el) => {
        el.style.strokeDasharray = "1";
        el.style.strokeDashoffset = String(1 - p);
      });
      b.move.forEach((el) => {
        const [x, y] = (el.dataset.move ?? "0,0").split(",").map(Number);
        el.setAttribute("transform", `translate(${x * (1 - p)} ${y * (1 - p)})`);
      });
    };

    const select = (i: number, p: number) => {
      chapters.forEach((c, j) => {
        const on = j === i;
        c.classList.toggle("is-active", on);
        (c as HTMLElement & { inert: boolean }).inert = s.enabled && !on;
        if (s.enabled && !on) c.setAttribute("aria-hidden", "true");
        else c.removeAttribute("aria-hidden");
        diagram(j, s.enabled ? (on ? p : 0) : 1);
      });
      links.forEach((a, j) => {
        if (j === i) a.setAttribute("aria-current", "step");
        else a.removeAttribute("aria-current");
      });
      label.textContent = `${CHAPTERS[i].number} · ${CHAPTERS[i].nav}`;
    };

    const camera = (fx: number, z: number) => {
      const scale = Math.max(s.w / IMG_W, s.h / IMG_H) * z;
      const sw = IMG_W * scale;
      const sh = IMG_H * scale;
      const x = clamp(s.w * 0.5 - fx * sw, s.w - sw, 0);
      const y = clamp(s.h * 0.5 - sh * 0.5, s.h - sh, 0);
      img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    };

    const paint = () => {
      s.frame = 0;
      if (!s.enabled) return;
      const p = clamp((window.scrollY - s.start) / s.travel);
      const cover = Math.max(s.w / IMG_W, s.h / IMG_H);
      const zoom = Math.max(MIN_ZOOM, s.w / (IMG_W * cover * VISIBLE_FRACTION));
      let i = 0;
      let local = 0;
      let fx = FOCUS[0];
      let z = zoom;
      if (p < T_OVERVIEW) {
        const t = ease(p / T_OVERVIEW);
        fx = lerp(0.5, FOCUS[0], t);
        z = lerp(1, zoom, t);
      } else if (p > T_CHAPTER_END) {
        i = 4;
        local = 1;
        const t = ease((p - T_CHAPTER_END) / 0.08);
        fx = lerp(FOCUS[4], 0.5, t);
        z = lerp(zoom, 1, t);
      } else {
        const v = ((p - T_OVERVIEW) / 0.86) * 5;
        i = Math.min(4, Math.floor(v));
        local = v - i;
        const target = FOCUS[i];
        const prior = FOCUS[Math.max(0, i - 1)];
        fx = lerp(prior, target, ease(clamp(local / 0.18)));
      }
      select(i, clamp((local - 0.18) / 0.47));
      camera(fx, z);
    };

    const request = () => {
      if (!s.frame) s.frame = requestAnimationFrame(paint);
    };

    const headerOffset = () => {
      const header = document.querySelector("header");
      const hh = header ? header.getBoundingClientRect().height : 72;
      return Math.round(hh);
    };

    const measure = () => {
      s.resizeFrame = 0;
      stage.classList.remove("cm-motion", "cm-measuring");
      area.style.height = "";
      img.style.transform = "";
      s.enabled = false;
      chapters.forEach((c) => {
        (c as HTMLElement & { inert: boolean }).inert = false;
        c.removeAttribute("aria-hidden");
      });
      bits.forEach((_, i) => diagram(i, 1));

      const top = headerOffset();
      document.documentElement.style.setProperty("--cm-top", `${top}px`);

      if (
        s.ready &&
        !reduce.matches &&
        window.innerWidth >= 1100 &&
        window.innerHeight >= 720
      ) {
        stage.classList.add("cm-motion", "cm-measuring");
        const height = Math.max(
          ...chapters.map((c) => c.getBoundingClientRect().height),
        );
        document.documentElement.style.setProperty("--cm-copy-height", `${height}px`);
        stage.classList.remove("cm-measuring");
        if (stage.getBoundingClientRect().height <= window.innerHeight - top - 8) {
          s.enabled = true;
          s.travel = window.innerHeight * SCROLL_VIEWPORTS;
          area.style.height = `${stage.getBoundingClientRect().height + s.travel}px`;
          s.start = window.scrollY + area.getBoundingClientRect().top;
          s.w = visual.clientWidth;
          s.h = visual.clientHeight;
        } else {
          stage.classList.remove("cm-motion");
        }
      }
      if (s.enabled) paint();
      else select(0, 1);
    };

    const scheduleMeasure = () => {
      if (!s.resizeFrame) s.resizeFrame = requestAnimationFrame(measure);
    };

    const onLinkClick = (i: number) => (e: MouseEvent) => {
      if (!s.enabled) return;
      e.preventDefault();
      window.scrollTo({
        top: s.start + s.travel * (T_OVERVIEW + 0.86 * ((i + 0.75) / 5)),
        behavior: reduce.matches ? "auto" : "smooth",
      });
      history.replaceState(null, "", `#cm-${CHAPTERS[i].id}`);
    };
    const clickHandlers = links.map((a, i) => {
      const h = onLinkClick(i);
      a.addEventListener("click", h);
      return h;
    });

    const load = () => {
      s.ready = img.naturalWidth > 0;
      scheduleMeasure();
    };
    img.addEventListener("load", load);
    img.addEventListener("error", () => {
      s.ready = false;
      scheduleMeasure();
    });
    if (img.complete) load();

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("pageshow", scheduleMeasure);
    reduce.addEventListener("change", scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure);
    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(scheduleMeasure);
      chapters.forEach((c) => ro!.observe(c));
    }
    measure();

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      reduce.removeEventListener("change", scheduleMeasure);
      img.removeEventListener("load", load);
      links.forEach((a, i) => a.removeEventListener("click", clickHandlers[i]));
      ro?.disconnect();
      if (s.frame) cancelAnimationFrame(s.frame);
      if (s.resizeFrame) cancelAnimationFrame(s.resizeFrame);
    };
  }, []);

  return (
    <section id="journey" aria-labelledby="journey-heading" className="cm-section">
      <Container>
        <header className="cm-intro">
          <p className="cm-eyebrow">Complexity to clarity</p>
          <h2 id="journey-heading" className="cm-title">
            Inside a business transformation.
          </h2>
          <p className="cm-subtitle">
            The constraints we found. The changes we made.
          </p>
        </header>
      </Container>

      <div ref={areaRef} className="cm-area">
        <div ref={stageRef} className="cm-stage">
          <div ref={visualRef} className="cm-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src="/images/panorama-journey.webp"
              alt="An illustrated business journey through a catalog, discovery gateway, development bridge, pricing scales and brand storefront."
              className="cm-panorama"
              width={IMG_W}
              height={IMG_H}
              decoding="async"
            />
            <div className="cm-shade" aria-hidden="true" />
            <span ref={labelRef} className="cm-scene-label" aria-hidden="true">
              Scroll to explore the business
            </span>
          </div>

          <Container>
            <nav className="cm-nav" aria-label="Business transformation chapters">
              {CHAPTERS.map((c, i) => (
                <a
                  key={c.id}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={`#cm-${c.id}`}
                  aria-current={i === 0 ? "step" : undefined}
                >
                  <small>{c.number}</small> {c.nav}
                </a>
              ))}
            </nav>

            <div className="cm-chapters">
              {CHAPTERS.map((c, i) => (
                <article
                  key={c.id}
                  id={`cm-${c.id}`}
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                  className={`cm-chapter${i === 0 ? " is-active" : ""}`}
                >
                  <div
                    className="cm-diagram"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: OVERLAY_SVGS[c.id] }}
                  />
                  <div className="cm-copy">
                    <div className="cm-lead">
                      <small>
                        {c.number} / {c.nav}
                      </small>
                      <h3>{c.title}</h3>
                    </div>
                    <div className="cm-desc">
                      <p>{c.summary}</p>
                      {c.services.length > 0 && (
                        <ul className="cm-services">
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
                    <div className="cm-detail">
                      <div>
                        <small>The constraint</small>
                        <p>{c.constraint}</p>
                      </div>
                      <div>
                        <small>The change</small>
                        <p>{c.change}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>

          <div className="cm-cta">
            <ButtonLink href="/contact">Talk to us about your business</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
