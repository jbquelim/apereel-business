"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LBM_PLATES } from "@/components/lbm-plates";

// "Living Business Machine" — five glass service plates on a dark stage.
// Scrolling drives one master timeline: each chapter brings its plate
// forward, plays its internal mechanism (reveal / draw / assemble / scan /
// barrier hooks in the SVGs), then holds the completed state. Ported from
// the standalone package study; enhancement is additive — without JS, on
// small/short screens, or under reduced motion the copy stack renders in
// normal flow with completed diagrams.

const CFG = {
  scrollViewports: 4,
  arriveUntil: 0.23,
  demonstrateUntil: 0.7,
  stageMinWidth: 1100,
};

const CHAPTERS = [
  {
    id: "research",
    num: "01",
    nav: "Research",
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
    title: "Make the next step easier.",
    description:
      "Improve the paths customers take from discovery to purchase, removing unnecessary friction.",
    points: ["Discover", "Compare", "Choose"],
    href: "/services/conversion-optimization",
    linkLabel: "conversion optimization",
  },
];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function LivingBusinessMachine() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root: HTMLElement = rootRef.current;

    const area = root.querySelector<HTMLElement>(".lbm-journey")!;
    const stage = root.querySelector<HTMLElement>(".lbm-stage")!;
    const plates = [...root.querySelectorAll<HTMLElement>(".lbm-plate")];
    const copies = [...root.querySelectorAll<HTMLElement>(".lbm-copy")];
    const links = [...root.querySelectorAll<HTMLAnchorElement>(".lbm-nav a")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let enabled = false;
    let frame = 0;
    let measureFrame = 0;
    let start = 0;
    let travel = 1;

    const bits = plates.map((p) => ({
      reveal: [...p.querySelectorAll<SVGElement>("[data-reveal]")],
      draw: [...p.querySelectorAll<SVGGeometryElement>("[data-draw]")],
      assemble: [...p.querySelectorAll<SVGGElement>("[data-assemble]")],
      scan: p.querySelector<SVGGElement>("[data-scan]"),
      barrier: p.querySelector<SVGGElement>("[data-barrier]"),
    }));

    function illustrate(i: number, t: number) {
      const b = bits[i];
      b.reveal.forEach((el) => {
        el.style.opacity = String(clamp((t - Number(el.dataset.reveal)) / 0.18));
      });
      b.draw.forEach((el) => {
        el.style.strokeDasharray = "1";
        el.style.strokeDashoffset = String(
          1 - clamp((t - Number(el.dataset.draw)) / 0.5),
        );
      });
      b.assemble.forEach((el) => {
        const [x, y] = (el.dataset.assemble ?? "0,0").split(",").map(Number);
        el.setAttribute(
          "transform",
          `translate(${x * (1 - t)} ${y * (1 - t)})`,
        );
      });
      if (b.scan) b.scan.setAttribute("transform", `translate(${-90 * (1 - t)} 0)`);
      if (b.barrier) {
        b.barrier.style.opacity = String(1 - t);
        b.barrier.setAttribute("transform", `translate(${t * 55} ${-t * 32})`);
      }
    }

    function select(i: number, t: number) {
      copies.forEach((c, j) => {
        c.classList.toggle("active", i === j);
        c.inert = enabled && i !== j;
        if (c.inert) c.setAttribute("aria-hidden", "true");
        else c.removeAttribute("aria-hidden");
      });
      links.forEach((a, j) => {
        if (i === j) a.setAttribute("aria-current", "step");
        else a.removeAttribute("aria-current");
      });
      plates.forEach((p, j) => illustrate(j, enabled ? (j === i ? t : j < i ? 1 : 0) : 1));
    }

    function paint() {
      frame = 0;
      if (!enabled) return;
      const progress = clamp((scrollY - start) / travel);
      const v = progress * 5;
      const i = Math.min(4, Math.floor(v));
      const local = progress === 1 ? 1 : v - i;
      const arrival = ease(clamp(local / CFG.arriveUntil));
      const focus = Math.max(0, i - 1) + (i ? arrival : 0);
      const demonstration = clamp(
        (local - CFG.arriveUntil) / (CFG.demonstrateUntil - CFG.arriveUntil),
      );
      select(i, demonstration);
      const pw = (plates[0].offsetHeight * 400) / 520;
      plates.forEach((p, j) => {
        const dist = j - focus;
        const weight = Math.max(0, 1 - Math.abs(dist));
        const x = dist * pw * 0.91;
        const z = weight * 100 - 90;
        const scale = 0.84 + weight * 0.13;
        p.style.transform = `translate(calc(-50% + ${x}px),-50%) translateZ(${z}px) rotateY(${-18 + weight * 18}deg) scale(${scale})`;
        p.style.opacity = String(0.28 + weight * 0.72);
        p.style.zIndex = String(Math.round(weight * 10));
        p.style.filter = `drop-shadow(0 10px ${8 + weight * 14}px rgba(61,158,255,${weight * 0.28}))`;
      });
    }

    function request() {
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function headerOffset() {
      const header = document.querySelector("header");
      return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    }

    function measure() {
      measureFrame = 0;
      enabled = false;
      root.classList.remove("enhanced", "measuring");
      area.style.height = "";
      plates.forEach((p) => p.removeAttribute("style"));
      select(0, 1);
      const top = headerOffset();
      root.style.setProperty("--lbm-top", `${top}px`);
      if (innerWidth >= CFG.stageMinWidth && !reduce.matches) {
        root.classList.add("enhanced", "measuring");
        const height = Math.max(
          ...copies.map((c) => c.getBoundingClientRect().height),
        );
        root.style.setProperty("--lbm-copy-height", `${height}px`);
        root.classList.remove("measuring");
        if (stage.offsetHeight < innerHeight - top - 8) {
          enabled = true;
          travel = innerHeight * CFG.scrollViewports;
          area.style.height = `${stage.offsetHeight + travel}px`;
          start = scrollY + area.getBoundingClientRect().top - top;
        } else {
          root.classList.remove("enhanced");
        }
      }
      if (enabled) paint();
    }

    function schedule() {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    }

    const clickHandlers = links.map((a, i) => {
      const onClick = (e: MouseEvent) => {
        if (!enabled) return;
        e.preventDefault();
        scrollTo({ top: start + (travel * (i + 0.82)) / 5, behavior: "smooth" });
        history.replaceState(null, "", a.hash);
      };
      a.addEventListener("click", onClick);
      return onClick;
    });

    // Deep link: the browser's native anchor jump lands inside the collapsed
    // copy stack and fires after our first measure. Re-assert the chapter's
    // completed timeline state on delayed ticks, cancelled by user input.
    function applyHash() {
      if (!enabled) return;
      const idx = CHAPTERS.findIndex((c) => `#${c.id}` === location.hash);
      if (idx >= 0) {
        // instant: the page uses CSS smooth scrolling, which would leave this
        // corrective jump animating (and losing races with native anchoring)
        scrollTo({ top: start + (travel * (idx + 0.82)) / 5, behavior: "instant" });
        paint();
      }
    }
    const hashTimers = [setTimeout(applyHash, 0), setTimeout(applyHash, 350), setTimeout(applyHash, 1000)];
    const cancelHash = () => hashTimers.forEach(clearTimeout);
    addEventListener("wheel", cancelHash, { passive: true, once: true });
    addEventListener("touchstart", cancelHash, { passive: true, once: true });
    addEventListener("keydown", cancelHash, { once: true });

    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    reduce.addEventListener("change", schedule);
    document.fonts.ready.then(schedule);
    measure();

    return () => {
      cancelHash();
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

  return (
    <section
      ref={rootRef}
      className="lbm"
      aria-labelledby="lbm-heading"
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8 pt-6 pb-8 sm:pt-10 sm:pb-10">
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
          Services
        </p>
        <h1
          id="lbm-heading"
          className="font-display mt-4 max-w-4xl text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-6xl"
        >
          Find what holds growth back.
        </h1>
        <p className="mt-4 text-lg text-muted sm:text-xl">
          Five capabilities. A stronger business.
        </p>
      </div>

      <div className="lbm-journey">
        <div className="lbm-stage">
          <div className="lbm-scene" aria-hidden="true">
            <div className="lbm-floor" />
            {LBM_PLATES.map((p) => (
              <div
                key={p.id}
                className="lbm-plate"
                dangerouslySetInnerHTML={{ __html: p.stage }}
              />
            ))}
            <p className="lbm-scene-caption">
              INSIGHT → VISIBILITY → DEMAND → EXPERIENCE → ACTION
            </p>
          </div>

          <nav className="lbm-nav" aria-label="Service chapters">
            {CHAPTERS.map((c) => (
              <a key={c.id} href={`#${c.id}`}>
                <span className="lbm-nav-num">{c.num}</span> {c.nav}
              </a>
            ))}
          </nav>

          <div className="lbm-copy-stack">
            {CHAPTERS.map((c, i) => (
              <article key={c.id} id={c.id} className="lbm-copy">
                <div className="lbm-copy-asset">
                  <div
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: LBM_PLATES[i].fallback }}
                  />
                </div>
                <div>
                  <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                    <span className="text-electric">{c.num}</span> / {c.nav}
                  </p>
                  <h2 className="font-display mt-2 text-2xl text-ink sm:text-3xl">
                    {c.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                    {c.description}
                  </p>
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
    </section>
  );
}
