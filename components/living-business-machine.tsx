"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { LBM_OVERLAYS } from "@/components/lbm-overlays";

// "Living Business Machine" — five rendered glass service panels standing on
// one shared platform. The panel interiors are flattened raster artwork, so
// motion is whole-panel only: one scroll timeline lifts, turns toward the
// viewer and lights the active panel while its copy swaps in below; then the
// panel's traced light overlay plays its sequence and holds. Neighbors
// stay visible. Enhancement is additive — without JS, under 1100px, on short
// viewports or with reduced motion, the section is a static composition
// (Development lit) followed by stacked, readable service sections.

const CFG = {
  scrollViewports: 4.5,
  arriveUntil: 0.25,
  // internal overlay sequence runs 25–70% of a chapter; the rest is a hold
  sequenceUntil: 0.7,
  stageMinWidth: 1100,
  sceneMinHeight: 340,
};

const icon = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const CHAPTERS = [
  {
    id: "research",
    num: "01",
    nav: "Research",
    icon: icon("M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20"),
    title: "Find out why customers choose.",
    description:
      "Understand customer needs, competing offers and the gaps your business can address.",
    points: ["Customer demand", "Competitive landscape", "Commercial opportunity"],
    href: "/services/research-competitive-analysis",
    linkLabel: "research & competitive analysis",
  },
  {
    id: "seo",
    num: "02",
    nav: "SEO",
    icon: icon("M3 5h4M3 10h3M3 15h4M14 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM17.5 13.5 21 17"),
    title: "Connect intent to the right page.",
    description:
      "Make your business easier to discover through useful pages that answer relevant searches.",
    points: ["Search intent", "Useful pages", "Clear structure"],
    href: "/services/seo",
    linkLabel: "SEO",
  },
  {
    id: "advertising",
    num: "03",
    nav: "Advertising",
    icon: icon("M4 10v4h3l7 4V6l-7 4H4ZM17.5 9.5a3.5 3.5 0 0 1 0 5M7 14l1 5h2.5"),
    title: "Reach people with a reason to buy.",
    description:
      "Build campaigns around relevant audiences and a competitive offer.",
    points: ["Relevant audience", "Compelling offer", "Useful destination"],
    href: "/services/advertising",
    linkLabel: "advertising",
  },
  {
    id: "development",
    num: "04",
    nav: "Development",
    icon: icon("M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"),
    title: "Turn ideas into working improvements.",
    description:
      "Build, test and release digital experiences that solve practical business problems.",
    points: ["Build", "Test", "Ship"],
    href: "/services/web-development",
    linkLabel: "web development",
  },
  {
    id: "conversion",
    num: "05",
    nav: "Conversion",
    icon: icon("M5 20v-4M10 20v-8M15 20v-11M20 20V5M3 20h18"),
    title: "Make the next step easier.",
    description:
      "Improve the paths customers take from discovery to purchase, removing unnecessary friction.",
    points: ["Discover", "Compare", "Choose"],
    href: "/services/conversion-optimization",
    linkLabel: "conversion optimization",
  },
];

// Overlays are traced SVG light effects (pulses, rings, highlights) sitting
// inside the same wrapper as each panel image, so they share its scale,
// perspective and transforms. They add light only — the baked-in objects in
// the PNGs never move.

// Rendered panels: 1086×1448 with transparent exterior (glass ≈ 7.5–92.5% x,
// 4.5–95% y). Stored as WebP with lossless alpha in /public.
const PANEL_W = 1086;
const PANEL_H = 1448;
const panelSrc = (id: string) => `/images/services-glass/${id}.webp`;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => t * t * (3 - 2 * t);

// ── Overlay engine ──────────────────────────────────────────────────────
// Each animated SVG element carries data-k (kind) and data-a ("start,end"
// window inside the card's 0–1 sequence). Path lengths and pulse positions
// are sampled once; per frame only attributes are written, and only for a
// card whose sequence value changed.
type FxEl = {
  el: SVGElement;
  kind: string;
  a: number;
  b: number;
  peak: number;
  rest: number;
  len?: number;
  seg?: number;
  pts?: Float32Array;
  cx?: number;
  cy?: number;
};
type Fx = { els: FxEl[]; last: number };
const SAMPLES = 64;

function buildFx(svg: SVGSVGElement): Fx {
  const els = [...svg.querySelectorAll<SVGElement>("[data-k]")].map((el) => {
    const [a, b] = (el.dataset.a ?? "0,1").split(",").map(Number);
    const fx: FxEl = {
      el,
      kind: el.dataset.k!,
      a,
      b,
      peak: Number(el.dataset.peak ?? 1),
      rest: Number(el.dataset.rest ?? 0),
    };
    if (fx.kind === "streak") {
      const path = el as unknown as SVGPathElement;
      fx.len = path.getTotalLength();
      fx.seg = Number(el.dataset.seg ?? 80);
      el.setAttribute("stroke-dasharray", `${fx.seg} ${fx.len + fx.seg}`);
    } else if (fx.kind === "pulse") {
      const path = svg.querySelector<SVGPathElement>(`[id="${el.dataset.path}"]`);
      if (path) {
        const len = path.getTotalLength();
        fx.pts = new Float32Array(SAMPLES * 2 + 2);
        for (let i = 0; i <= SAMPLES; i++) {
          const pt = path.getPointAtLength((len * i) / SAMPLES);
          fx.pts[i * 2] = pt.x;
          fx.pts[i * 2 + 1] = pt.y;
        }
      }
    } else if (fx.kind === "ring") {
      fx.cx = Number(el.getAttribute("cx"));
      fx.cy = Number(el.getAttribute("cy"));
    }
    return fx;
  });
  return { els, last: -1 };
}

function applyFx(fx: Fx, t: number) {
  if (t === fx.last) return;
  fx.last = t;
  for (const f of fx.els) {
    const local = clamp((t - f.a) / (f.b - f.a));
    const moving = local > 0 && local < 1;
    let op = 0;
    if (f.kind === "glow") {
      // rise to peak, settle to the restrained completed level
      op =
        local <= 0
          ? 0
          : local < 0.5
            ? f.peak * ease(local / 0.5)
            : f.rest + (f.peak - f.rest) * (1 - ease((local - 0.5) / 0.5));
    } else if (f.kind === "ring") {
      op = moving ? f.peak * (1 - local) * Math.min(1, local * 6) : 0;
      const s = 0.22 + 0.78 * (1 - (1 - local) ** 2);
      f.el.setAttribute(
        "transform",
        `translate(${f.cx} ${f.cy}) scale(${s.toFixed(3)}) translate(${-f.cx!} ${-f.cy!})`,
      );
    } else if (f.kind === "pulse" || f.kind === "streak") {
      op = moving ? Math.min(1, local * 8, (1 - local) * 8) : 0;
      const e = ease(local);
      if (f.kind === "pulse" && f.pts) {
        const x = e * SAMPLES;
        const i = Math.min(SAMPLES - 1, Math.floor(x));
        const r = x - i;
        const p = f.pts;
        f.el.setAttribute("cx", (p[i * 2] + (p[i * 2 + 2] - p[i * 2]) * r).toFixed(1));
        f.el.setAttribute("cy", (p[i * 2 + 1] + (p[i * 2 + 3] - p[i * 2 + 1]) * r).toFixed(1));
      } else if (f.kind === "streak") {
        op *= 0.75;
        f.el.setAttribute("stroke-dashoffset", (f.seg! - e * f.len!).toFixed(1));
      }
    }
    f.el.setAttribute("opacity", op.toFixed(3));
  }
}

export function LivingBusinessMachine() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root: HTMLElement = rootRef.current;

    const area = root.querySelector<HTMLElement>(".lbm-journey")!;
    const stage = root.querySelector<HTMLElement>(".lbm-stage")!;
    const band = root.querySelector<HTMLElement>(".lbm-band")!;
    const plates = [...root.querySelectorAll<HTMLElement>(".lbm-plate")];
    const copies = [...root.querySelectorAll<HTMLElement>(".lbm-copy")];
    const links = [...root.querySelectorAll<HTMLAnchorElement>(".lbm-nav a")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sceneFx = plates.map((p) => {
      const svg = p.querySelector<SVGSVGElement>("svg.lbm-fx");
      return svg ? buildFx(svg) : null;
    });
    // Static panels (small screens) always show the completed state.
    root.querySelectorAll<SVGSVGElement>(".lbm-copy-asset svg.lbm-fx").forEach((svg) =>
      applyFx(buildFx(svg), 1),
    );
    const setSequence = (j: number, t: number) => {
      const fx = sceneFx[j];
      if (fx) applyFx(fx, t);
    };

    let enabled = false;
    let visible = true;
    let frame = 0;
    let measureFrame = 0;
    let start = 0;
    let travel = 1;
    let current = -1;
    const lastW = plates.map(() => "");

    function select(i: number) {
      if (i === current) return;
      current = i;
      copies.forEach((c, j) => {
        c.classList.toggle("active", i === j);
        c.inert = enabled && i !== j;
        if (c.inert) c.setAttribute("aria-hidden", "true");
        else c.removeAttribute("aria-hidden");
      });
      links.forEach((a, j) => {
        if (enabled && i === j) a.setAttribute("aria-current", "step");
        else a.removeAttribute("aria-current");
      });
    }

    function paint() {
      frame = 0;
      if (!enabled) return;
      const progress = clamp((scrollY - start) / travel);
      const v = progress * 5;
      const i = Math.min(4, Math.floor(v));
      const local = progress === 1 ? 1 : v - i;
      // Arrival: focus glides from the previous panel to this one.
      const arrival = ease(clamp(local / CFG.arriveUntil));
      const focus = i === 0 ? 0 : i - 1 + arrival;
      // Sequence: the arrived panel's light builds and its overlay plays,
      // then both hold for reading.
      const sequence = clamp((local - CFG.arriveUntil) / (CFG.sequenceUntil - CFG.arriveUntil));
      const emphasis = 0.55 + 0.45 * ease(sequence);
      select(i);
      plates.forEach((_, j) => setSequence(j, j < i ? 1 : j > i ? 0 : sequence));
      plates.forEach((p, j) => {
        const w = Math.max(0, 1 - Math.abs(j - focus));
        const key = `${w.toFixed(3)}|${(w * emphasis).toFixed(3)}`;
        if (key === lastW[j]) return;
        lastW[j] = key;
        p.style.setProperty("--w", w.toFixed(3));
        p.style.setProperty("--glow", (w * emphasis).toFixed(3));
        p.style.zIndex = String(10 - Math.round(Math.abs(j - focus) * 2));
      });
    }

    function request() {
      if (visible && !frame) frame = requestAnimationFrame(paint);
    }

    function headerOffset() {
      const header = document.querySelector<HTMLElement>("body > header, header.fixed");
      return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    }

    function reset() {
      enabled = false;
      current = -1;
      root.classList.remove("enhanced", "measuring");
      area.style.height = "";
      plates.forEach((p, j) => {
        p.style.removeProperty("--w");
        p.style.removeProperty("--glow");
        p.style.zIndex = "";
        lastW[j] = "";
      });
      root.style.removeProperty("--lbm-scene-h");
    }

    function measure() {
      measureFrame = 0;
      reset();
      select(-1);
      const top = headerOffset();
      root.style.setProperty("--lbm-top", `${top}px`);
      if (innerWidth >= CFG.stageMinWidth && !reduce.matches) {
        root.classList.add("enhanced", "measuring");
        const copyHeight = Math.max(...copies.map((c) => c.getBoundingClientRect().height));
        root.style.setProperty("--lbm-copy-height", `${Math.ceil(copyHeight)}px`);
        root.classList.remove("measuring");
        const available = innerHeight - top - band.offsetHeight;
        const sceneH = Math.min(available, innerWidth * 0.46, 680);
        if (sceneH >= CFG.sceneMinHeight) {
          enabled = true;
          root.style.setProperty("--lbm-scene-h", `${Math.floor(sceneH)}px`);
          travel = innerHeight * CFG.scrollViewports;
          area.style.height = `${stage.offsetHeight + travel}px`;
          start = scrollY + area.getBoundingClientRect().top - top;
        } else {
          root.classList.remove("enhanced");
        }
      }
      if (enabled) paint();
      else {
        select(-1);
        plates.forEach((_, j) => setSequence(j, 1));
      }
    }

    function schedule() {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    }

    const chapterTop = (i: number) => start + (travel * (i + 0.82)) / 5;

    const clickHandlers = links.map((a, i) => {
      const onClick = (e: MouseEvent) => {
        if (!enabled) return;
        e.preventDefault();
        scrollTo({ top: chapterTop(i), behavior: reduce.matches ? "instant" : "smooth" });
        history.replaceState(null, "", a.hash);
      };
      a.addEventListener("click", onClick);
      return onClick;
    });

    // Deep link: the native anchor jump lands inside the collapsed copy stack
    // and can fire after our first measure. Re-assert the chapter's readable
    // state on a few delayed ticks, cancelled by any user input.
    function applyHash() {
      if (!enabled) return;
      const idx = CHAPTERS.findIndex((c) => `#${c.id}` === location.hash);
      if (idx >= 0) {
        scrollTo({ top: chapterTop(idx), behavior: "instant" });
        paint();
      }
    }
    const hashTimers = [setTimeout(applyHash, 0), setTimeout(applyHash, 350), setTimeout(applyHash, 1000)];
    const cancelHash = () => hashTimers.forEach(clearTimeout);
    addEventListener("wheel", cancelHash, { passive: true, once: true });
    addEventListener("touchstart", cancelHash, { passive: true, once: true });
    addEventListener("keydown", cancelHash, { once: true });

    // Header height or copy wrapping can change without a window resize.
    const ro = new ResizeObserver(schedule);
    // Skip timeline work while the section is off screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });
    io.observe(area);
    const header = document.querySelector<HTMLElement>("body > header, header.fixed");
    if (header) ro.observe(header);

    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    reduce.addEventListener("change", schedule);
    document.fonts.ready.then(schedule);
    measure();

    return () => {
      cancelHash();
      ro.disconnect();
      io.disconnect();
      removeEventListener("wheel", cancelHash);
      removeEventListener("touchstart", cancelHash);
      removeEventListener("keydown", cancelHash);
      removeEventListener("scroll", request);
      removeEventListener("resize", schedule);
      removeEventListener("pageshow", schedule);
      reduce.removeEventListener("change", schedule);
      links.forEach((a, i) => a.removeEventListener("click", clickHandlers[i]));
      if (frame) cancelAnimationFrame(frame);
      if (measureFrame) cancelAnimationFrame(measureFrame);
    };
  }, []);

  const markFailed = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.closest<HTMLElement>(".lbm-plate, .lbm-copy-asset")?.setAttribute("data-failed", "");
  };

  return (
    <section ref={rootRef} className="lbm" aria-labelledby="lbm-heading">
      <div className="lbm-intro">
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">Services</p>
        <h1 id="lbm-heading" className="lbm-heading">
          Find what holds growth back.
        </h1>
        <p className="lbm-lede">Five capabilities. A stronger business.</p>
      </div>

      <div className="lbm-journey">
        <div className="lbm-stage">
          <div className="lbm-scene" aria-hidden="true">
            <Image
              className="lbm-platform"
              src="/images/services-glass/platform.webp"
              alt=""
              width={1672}
              height={941}
              sizes="100vw"
              loading="eager"
            />
            <div className="lbm-world">
              <div className="lbm-row">
                {CHAPTERS.map((c) => (
                  <div key={c.id} className="lbm-plate">
                    <div className="lbm-folder" />
                    <div className="lbm-spine" />
                    <div className="lbm-face">
                      <div className="lbm-plate-glow" />
                      <Image
                        src={panelSrc(c.id)}
                        alt=""
                        width={PANEL_W}
                        height={PANEL_H}
                        sizes="(min-width: 768px) 22vw, 1px"
                        loading="eager"
                        fetchPriority={c.id === "development" ? "high" : "auto"}
                        onError={markFailed}
                      />
                      <div
                        className="lbm-fx-wrap"
                        dangerouslySetInnerHTML={{ __html: LBM_OVERLAYS[c.id] }}
                      />
                      <span className="lbm-plate-label">
                        <span>{c.num}</span> {c.nav}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="lbm-scene-caption">
              Insight <span>→</span> Visibility <span>→</span> Demand <span>→</span> Experience <span>→</span> Action
            </p>
          </div>

          <div className="lbm-band">
            <nav className="lbm-nav" aria-label="Service chapters">
              {CHAPTERS.map((c) => (
                <a key={c.id} href={`#${c.id}`}>
                  {c.icon}
                  <span>
                    <span className="lbm-nav-num">{c.num}</span> {c.nav}
                  </span>
                </a>
              ))}
            </nav>

            <div className="lbm-copy-stack">
              {CHAPTERS.map((c) => (
                <article key={c.id} id={c.id} className="lbm-copy">
                  <div className="lbm-copy-asset" aria-hidden="true">
                    <Image
                      src={panelSrc(c.id)}
                      alt=""
                      width={PANEL_W}
                      height={PANEL_H}
                      sizes="(max-width: 767px) 70vw, 1px"
                      onError={markFailed}
                    />
                    <div
                      className="lbm-fx-wrap"
                      dangerouslySetInnerHTML={{
                        // own id namespace: this copy shares the document with the stage overlay
                        __html: LBM_OVERLAYS[c.id].replaceAll(`${c.id}-`, `${c.id}-m-`),
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">
                      {c.num} / {c.nav}
                    </p>
                    <h2 className="lbm-copy-title">{c.title}</h2>
                    <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{c.description}</p>
                    <Link className="lbm-copy-link" href={c.href}>
                      More about {c.linkLabel}
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </div>
                  <ul className="lbm-points">
                    {c.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
