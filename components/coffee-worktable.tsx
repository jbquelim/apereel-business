"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { ButtonLink } from "@/components/button-link";

// Creative services as a guided photographic tour of one coffee-campaign
// worktable. A single flattened photograph is the whole world: one camera
// translates and scales it as a plane (no cut-outs, nothing moves on its own),
// while live HTML carries the headline, the four service chapters and the CTA.
//
// One progress source — native scroll through the pinned stage — renders
// camera, scene labels, highlight outlines, copy and nav state. Forward and
// reverse scrolling are the same pure function of progress.
//
// The server-rendered layout is the static version (overview image, four
// chapter blocks with matching crops, CTA). Mobile, short or narrow screens and
// reduced motion keep it; the stage enhances only when it fits.

const IMG_SRC = "/images/coffee-worktable/worktable.webp";
const IW = 1586;
const IH = 992;

const CFG = {
  travel: 3000, // px of scroll through the tour
  stageMinWidth: 1024,
  minStageHeight: 560,
  minAspect: 1.55, // narrower stages crop the desk's sides and crowd the opening copy
  maxScale: 1.45, // CSS px per source px — the plate is ~1.6K, keep enlargement modest
  enterPx: 18,
  exitPx: 12,
};

type Rect = [x0: number, y0: number, x1: number, y1: number];
type Quad = [number, number][];

// Each stop frames a region of the source image (px) into a region of the
// stage (fractions). Scale fits the region, capped; translation centres it and
// is clamped so no empty edge is ever exposed.
type Stop = {
  id: string;
  num: string;
  label: string;
  title: string;
  items: string[];
  region: Rect;
  screen: Rect;
  side: "left" | "right";
  outlines: Quad[];
};

const STOPS: Stop[] = [
  {
    id: "photography",
    num: "01",
    label: "Photography",
    title: "Make the product worth a closer look.",
    items: ["Product photography concepts", "Lifestyle imagery", "Image enhancement"],
    region: [25, 262, 486, 830],
    screen: [0.02, 0.04, 0.48, 0.96],
    side: "right",
    outlines: [[[33, 335], [432, 272], [478, 745], [37, 822]]],
  },
  {
    id: "campaign",
    num: "02",
    label: "Campaign",
    title: "Give the idea a consistent voice.",
    items: ["Advertising creatives", "Campaign visuals", "Brand storytelling"],
    region: [432, 205, 792, 845],
    screen: [0.36, 0.03, 0.9, 0.97],
    side: "left",
    outlines: [
      [[440, 275], [748, 230], [785, 412], [455, 448]],
      [[487, 437], [728, 413], [745, 520], [500, 552]],
      [[470, 598], [743, 552], [780, 792], [493, 837]],
    ],
  },
  {
    id: "film",
    num: "03",
    label: "Film",
    title: "Bring the story into motion.",
    items: ["Commercial video concepts", "Motion graphics", "Social media creative"],
    region: [760, 450, 1192, 856],
    screen: [0.4, 0.05, 0.95, 0.95],
    side: "left",
    outlines: [
      [[769, 482], [1086, 457], [1120, 645], [782, 680]],
      [[780, 678], [1176, 682], [1184, 848], [778, 840]],
    ],
  },
  {
    id: "distribution",
    num: "04",
    label: "Distribution",
    title: "Carry the idea across every touchpoint.",
    items: [
      "Website hero imagery",
      "Creative variations for advertising",
      "Visual content for web, social, and paid media",
    ],
    region: [1108, 245, 1580, 900],
    screen: [0.42, 0.03, 0.98, 0.97],
    side: "left",
    outlines: [
      [[1155, 262], [1572, 358], [1528, 610], [1120, 522]],
      [[1422, 614], [1547, 632], [1522, 885], [1382, 860]],
    ],
  },
];

// Scene labels, anchored to the objects they name (source px, degrees).
const LABELS = [
  { num: "01", text: "Photography", at: [50, 318], rot: -9 },
  { num: "02", text: "Campaign", at: [492, 584], rot: -9.6 },
  { num: "03", text: "Film", at: [1044, 451], rot: -4.3 }, // clear tabletop right of the cup print
  { num: "04", text: "Distribution", at: [1196, 256], rot: 12 },
] as const;

// Timeline (progress 0–1): overview hold → four stop holds → overview + CTA.
const HOLDS: [number, number][] = [
  [0.16, 0.28],
  [0.34, 0.46],
  [0.52, 0.64],
  [0.7, 0.82],
];
const OVERVIEW_OUT = 0.08;
const OVERVIEW_BACK = 0.9;
const COPY_PAD = 0.03; // each stop's copy window extends this far either side of its hold
const FINAL_IN: [number, number] = [0.88, 0.94];
const DISCLOSURE = "AI-assisted creative concept demonstration.";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const ease = (t: number) => 1 - (1 - t) ** 3;

type Cam = { s: number; tx: number; ty: number };

// Static-layout crop: a uniform 5:4 frame centred on the stop's region,
// widened or heightened to that aspect and kept inside the plate.
const CROP_ASPECT = 5 / 4;
function cropStyle([x0, y0, x1, y1]: Rect): CSSProperties {
  let w = x1 - x0;
  let h = y1 - y0;
  if (w / h < CROP_ASPECT) w = h * CROP_ASPECT;
  else h = w / CROP_ASPECT;
  const x = clamp((x0 + x1) / 2 - w / 2, 0, IW - w);
  const y = clamp((y0 + y1) / 2 - h / 2, 0, IH - h);
  return {
    aspectRatio: `${CROP_ASPECT}`,
    backgroundImage: `url(${IMG_SRC})`,
    backgroundSize: `${(IW / w) * 100}% auto`,
    backgroundPosition: `${(x / (IW - w)) * 100}% ${(y / (IH - h)) * 100}%`,
  };
}

export function CoffeeWorktable() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root: HTMLElement = rootRef.current;
    const journey = root.querySelector<HTMLElement>(".cw-journey")!;
    const world = root.querySelector<HTMLElement>(".cw-world")!;
    const labels = [...root.querySelectorAll<HTMLElement>(".cw-label")];
    const outlines = [...root.querySelectorAll<SVGGElement>(".cw-outline")];
    const chapters = [...root.querySelectorAll<HTMLElement>(".cw-chapter")];
    const scrims = [...root.querySelectorAll<HTMLElement>(".cw-scrim")];
    const intro = root.querySelector<HTMLElement>(".cw-intro")!;
    const final = root.querySelector<HTMLElement>(".cw-final")!;
    const navButtons = [...root.querySelectorAll<HTMLButtonElement>(".cw-nav-stop")];
    const skip = root.querySelector<HTMLAnchorElement>(".cw-skip")!;
    const controls = root.querySelector<HTMLElement>(".cw-controls")!;
    const cta = final.querySelector<HTMLAnchorElement>("a")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let enabled = false;
    let W = 0;
    let H = 0;
    let start = 0;
    let overview: Cam = { s: 1, tx: 0, ty: 0 };
    let cams: Cam[] = [];
    let keys: { p: number; cam: Cam }[] = [];
    let frame = 0;
    let measureFrame = 0;
    let shown = -2;
    const last = new Map<Element, string>();

    const setStyle = (el: HTMLElement | SVGElement, css: string) => {
      if (last.get(el) === css) return;
      last.set(el, css);
      el.style.cssText = css;
    };

    function frameRegion([x0, y0, x1, y1]: Rect, [sx0, sy0, sx1, sy1]: Rect, base: number): Cam {
      const s = clamp(
        Math.min(((sx1 - sx0) * W) / (x1 - x0), ((sy1 - sy0) * H) / (y1 - y0)),
        base,
        Math.max(base, CFG.maxScale),
      );
      const tx = ((sx0 + sx1) / 2) * W - ((x0 + x1) / 2) * s;
      const ty = ((sy0 + sy1) / 2) * H - ((y0 + y1) / 2) * s;
      return { s, tx: clamp(tx, W - IW * s, 0), ty: clamp(ty, H - IH * s, 0) };
    }

    // Interpolating clamped cameras stays clamped: the no-empty-edge
    // constraints are linear in (s, tx, ty).
    function camAt(p: number): Cam {
      if (p <= keys[0].p) return keys[0].cam;
      for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1];
        const b = keys[i];
        if (p <= b.p) {
          const t = smooth(clamp((p - a.p) / (b.p - a.p)));
          return {
            s: a.cam.s + (b.cam.s - a.cam.s) * t,
            tx: a.cam.tx + (b.cam.tx - a.cam.tx) * t,
            ty: a.cam.ty + (b.cam.ty - a.cam.ty) * t,
          };
        }
      }
      return keys[keys.length - 1].cam;
    }

    // 20% reveal, 60% hold, 20% exit of a window.
    function windowed(p: number, a: number, b: number) {
      const len = b - a;
      const i = ease(clamp((p - a) / (len * 0.2)));
      const o = ease(clamp((p - (b - len * 0.2)) / (len * 0.2)));
      return { i, o, op: i * (1 - o) };
    }

    function render(p: number) {
      const cam = camAt(p);
      setStyle(world, `transform:translate3d(${cam.tx.toFixed(2)}px,${cam.ty.toFixed(2)}px,0) scale(${cam.s.toFixed(5)})`);

      // Scene labels read at the overview only; they follow the plane.
      const labelOp = Math.max(1 - clamp((p - 0.06) / 0.05), clamp((p - 0.85) / 0.05));
      LABELS.forEach((l, i) => {
        const x = cam.tx + l.at[0] * cam.s;
        const y = cam.ty + l.at[1] * cam.s;
        setStyle(
          labels[i],
          `opacity:${labelOp.toFixed(3)};transform:translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${l.rot}deg) translateY(-100%)`,
        );
      });

      let current = -1;
      HOLDS.forEach(([h0, h1], i) => {
        const { i: enter, o: exit, op } = windowed(p, h0 - COPY_PAD, h1 + COPY_PAD);
        if (p >= h0 - COPY_PAD && p < h1 + COPY_PAD) current = i;
        const y = (1 - enter) * CFG.enterPx - exit * CFG.exitPx;
        setStyle(chapters[i], `opacity:${op.toFixed(3)};transform:translate3d(0,${y.toFixed(1)}px,0)`);
        setStyle(scrims[i], `opacity:${op.toFixed(3)}`);
        setStyle(outlines[i], `opacity:${(op * 0.85).toFixed(3)}`);
      });

      const introOp = 1 - ease(clamp((p - 0.04) / 0.05));
      setStyle(intro, `opacity:${introOp.toFixed(3)};transform:translate3d(0,${(-(1 - introOp) * CFG.exitPx).toFixed(1)}px,0)`);
      const fin = ease(clamp((p - FINAL_IN[0]) / (FINAL_IN[1] - FINAL_IN[0])));
      setStyle(final, `opacity:${fin.toFixed(3)};transform:translate3d(0,${((1 - fin) * CFG.enterPx).toFixed(1)}px,0)`);
      final.toggleAttribute("data-live", fin > 0.5);
      // Tour controls hand the bottom edge over to the CTA.
      setStyle(controls, `opacity:${(1 - fin).toFixed(3)};visibility:${fin > 0.98 ? "hidden" : "visible"}`);

      const navCurrent = p >= FINAL_IN[0] ? -1 : current;
      if (navCurrent !== shown) {
        shown = navCurrent;
        navButtons.forEach((b, j) => {
          if (j === navCurrent) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
      }
    }

    const progress = () => clamp((scrollY - start) / CFG.travel);
    const toScroll = (p: number) => start + p * CFG.travel;
    const behavior = (): ScrollBehavior => (reduce.matches ? "instant" : "smooth");

    function update() {
      frame = 0;
      if (enabled) render(progress());
    }
    function request() {
      if (enabled && !frame) frame = requestAnimationFrame(update);
    }
    function headerOffset() {
      const header = document.querySelector<HTMLElement>("body > header, header.fixed");
      return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    }

    function clearInline() {
      for (const el of last.keys()) (el as HTMLElement).style.cssText = "";
      last.clear();
      final.removeAttribute("data-live");
      navButtons.forEach((b) => b.removeAttribute("aria-current"));
      shown = -2;
    }

    function measure() {
      measureFrame = 0;
      const top = headerOffset();
      W = root.clientWidth;
      H = innerHeight - top;
      const ok =
        !reduce.matches && W >= CFG.stageMinWidth && H >= CFG.minStageHeight && W / H >= CFG.minAspect;
      root.style.setProperty("--cw-top", `${top}px`);
      root.style.setProperty("--cw-stage-h", `${Math.floor(H)}px`);
      if (!ok) {
        enabled = false;
        root.classList.remove("enhanced");
        journey.style.height = "";
        clearInline();
        return;
      }
      root.classList.add("enhanced");
      enabled = true;
      journey.style.height = `${H + CFG.travel}px`;
      start = scrollY + journey.getBoundingClientRect().top - top;

      // Overview: cover the stage, anchored to the top so the headline sits
      // in the desk's upper negative space.
      const base = Math.max(W / IW, H / IH);
      overview = { s: base, tx: (W - IW * base) / 2, ty: 0 };
      // Opening/closing copy is sized and placed in plate units so it always
      // fits the desk's upper negative space.
      root.style.setProperty("--cw-s", base.toFixed(4));
      root.style.setProperty("--cw-ox", `${overview.tx.toFixed(1)}px`);
      cams = STOPS.map((s) => frameRegion(s.region, s.screen, base));
      keys = [
        { p: 0, cam: overview },
        { p: OVERVIEW_OUT, cam: overview },
        ...HOLDS.flatMap(([h0, h1], i) => [
          { p: h0, cam: cams[i] },
          { p: h1, cam: cams[i] },
        ]),
        { p: OVERVIEW_BACK, cam: overview },
        { p: 1, cam: overview },
      ];
      render(progress());
    }
    function schedule() {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    }

    // Navigation drives the same timeline: it only scrolls.
    const stopHandlers = navButtons.map((b, i) => {
      const onClick = () => {
        if (!enabled) return;
        const [h0, h1] = HOLDS[i];
        scrollTo({ top: toScroll((h0 + h1) / 2), behavior: behavior() });
      };
      b.addEventListener("click", onClick);
      return onClick;
    });
    const onSkip = (e: MouseEvent) => {
      if (!enabled) return; // static layout: the plain anchor jump is right
      e.preventDefault();
      scrollTo({ top: toScroll(1), behavior: behavior() });
      cta.focus({ preventScroll: true });
    };
    skip.addEventListener("click", onSkip);
    // Keyboard focus reaching the CTA brings the final composition into view.
    const onFinalFocus = () => {
      if (enabled && progress() < FINAL_IN[1]) scrollTo({ top: toScroll(1), behavior: "instant" });
    };
    final.addEventListener("focusin", onFinalFocus);

    const ro = new ResizeObserver(schedule);
    const header = document.querySelector<HTMLElement>("body > header, header.fixed");
    if (header) ro.observe(header);
    ro.observe(root);

    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    reduce.addEventListener("change", schedule);
    document.fonts.ready.then(schedule);
    measure();

    return () => {
      ro.disconnect();
      removeEventListener("scroll", request);
      removeEventListener("resize", schedule);
      removeEventListener("pageshow", schedule);
      reduce.removeEventListener("change", schedule);
      navButtons.forEach((b, i) => b.removeEventListener("click", stopHandlers[i]));
      skip.removeEventListener("click", onSkip);
      final.removeEventListener("focusin", onFinalFocus);
      if (frame) cancelAnimationFrame(frame);
      if (measureFrame) cancelAnimationFrame(measureFrame);
    };
  }, []);

  return (
    <section ref={rootRef} id="creative-worktable" className="cw" aria-labelledby="cw-heading" tabIndex={-1}>
      <div className="cw-journey">
        <div className="cw-stage">
          {/* The world: one photographic plane under one transform */}
          <div className="cw-world">
            <Image
              src={IMG_SRC}
              alt="A coffee campaign laid out on a navy worktable: product prints, a contact sheet, a tablet, a storyboard, a laptop and a phone."
              width={IW}
              height={IH}
              unoptimized
              className="cw-img"
            />
            <svg className="cw-outlines" viewBox={`0 0 ${IW} ${IH}`} aria-hidden="true">
              {STOPS.map((s) => (
                <g key={s.id} className="cw-outline">
                  {s.outlines.map((q, j) => (
                    <polygon key={j} points={q.map(([x, y]) => `${x},${y}`).join(" ")} />
                  ))}
                </g>
              ))}
            </svg>
          </div>

          <div className="cw-labels" aria-hidden="true">
            {LABELS.map((l) => (
              <span key={l.num} className="cw-label">
                <span className="cw-num">{l.num}</span> {l.text}
              </span>
            ))}
          </div>

          {STOPS.map((s) => (
            <div key={s.id} className={`cw-scrim cw-scrim-${s.side}`} aria-hidden="true" />
          ))}

          <div className="cw-intro">
            <p className="cw-eyebrow">AI-assisted creative production</p>
            <h2 id="cw-heading" className="cw-headline">
              From one product.
              <br />A complete creative world.
            </h2>
            <p className="cw-sub">Photography, campaigns, film, and digital content—shaped by one creative direction.</p>
          </div>

          <ol className="cw-chapters">
            {STOPS.map((s) => (
              <li key={s.id} id={`cw-${s.id}`} className={`cw-chapter cw-side-${s.side}`}>
                <div className="cw-crop" style={cropStyle(s.region)} aria-hidden="true" />
                <p className="cw-kicker">
                  <span className="cw-num">{s.num}</span> {s.label}
                </p>
                <h3 className="cw-title">{s.title}</h3>
                <ul className="cw-items">
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div id="cw-cta" className="cw-final">
            <div className="cw-final-head">
              <h3 className="cw-final-title">What could your product become?</h3>
              <p className="cw-final-body">Bring us the product. We’ll help shape the story.</p>
            </div>
            {/* Bottom-centre, so it stays on screen long after the pin releases */}
            <div className="cw-final-row">
              <ButtonLink href="/contact">Talk to Apereel</ButtonLink>
              <p className="cw-disclosure">{DISCLOSURE}</p>
            </div>
          </div>

          <div className="cw-controls">
            <nav className="cw-nav" aria-label="Creative tour stops">
              {STOPS.map((s) => (
                <button key={s.id} type="button" className="cw-nav-stop" aria-label={`Go to ${s.num} ${s.label}`}>
                  <span className="cw-num">{s.num}</span>
                  <span className="cw-nav-label">{s.label}</span>
                </button>
              ))}
            </nav>
            <a className="cw-skip" href="#cw-cta">
              Skip tour
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
