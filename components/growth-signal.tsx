"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  MotionProvider,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "@/components/motion";
import {
  ACCENT_RGB,
  BASE_RGB,
  CHOICE_CALLOUT,
  CURVES,
  CURVE_OPACITY,
  OFFER_ANCHORS,
  OFFER_LABELS,
  OUTCOME_LABELS,
  PARTICLES,
  PRIMARY_CURVE,
  VIEW_H,
  VIEW_W,
  VIEW_X,
  VIEW_Y,
} from "@/lib/signal-states";

const STAGES = [
  {
    key: "offer",
    label: "Offer",
    heading: "Build a stronger signal.",
    body: "Align product selection, pricing, and customer experience to create a clearer offer.",
    image: "/images/signal/01-offer.svg",
    alt: "Scattered dots forming three gentle waves, anchored by Selection, Pricing, and Experience",
    details: [
      { title: "Selection", desc: "What customers want" },
      { title: "Pricing", desc: "A competitive offer" },
      { title: "Experience", desc: "Easier buying journey" },
    ],
  },
  {
    key: "choice",
    label: "Choice",
    heading: "Stand out for a reason.",
    body: "Turn what makes your business different into a clear reason for customers to choose you.",
    image: "/images/signal/02-choice.svg",
    alt: "One confident blue wave stands out from quieter supporting waves — your advantage",
    details: [],
  },
  {
    key: "outcome",
    label: "Outcome",
    heading: "Connect attention to results.",
    body: "Track how a stronger business supports search visibility, qualified leads, conversions, and revenue.",
    image: "/images/signal/03-outcome.svg",
    alt: "The signal separates into four gently rising branches: Rankings, Qualified leads, Conversions, and Revenue",
    details: [
      { title: "Rankings", desc: "Visibility where demand exists" },
      { title: "Qualified leads", desc: "Interest from relevant customers" },
      { title: "Conversions", desc: "More visitors taking action" },
      { title: "Revenue", desc: "Commercial impact" },
    ],
  },
] as const;

/*
 * Scroll timeline: stable reading holds with transitions between them.
 *   [0.00–0.26] hold Offer   [0.26–0.42] morph
 *   [0.42–0.60] hold Choice  [0.60–0.76] morph
 *   [0.76–1.00] hold Outcome
 */
const T1S = 0.26;
const T1E = 0.42;
const T2S = 0.6;
const T2E = 0.76;
const HOLD_CENTERS = [0.13, 0.51, 0.88];

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function blend(p: number): { a: number; b: number; t: number } {
  if (p <= T1S) return { a: 0, b: 0, t: 0 };
  if (p < T1E) return { a: 0, b: 1, t: smooth((p - T1S) / (T1E - T1S)) };
  if (p <= T2S) return { a: 1, b: 1, t: 0 };
  if (p < T2E) return { a: 1, b: 2, t: smooth((p - T2S) / (T2E - T2S)) };
  return { a: 2, b: 2, t: 0 };
}

/** Staggered reveal inside the Offer hold, fading out before the morph lands. */
function offerLabelOpacity(i: number, p: number): number {
  const appear = clamp01((p - (0.03 + i * 0.045)) / 0.03);
  const exit = 1 - clamp01((p - T1S) / ((T1E - T1S) * 0.45));
  return appear * exit;
}

function calloutOpacity(p: number): number {
  const appear = clamp01((p - (T1E + 0.01)) / 0.03);
  const exit = 1 - clamp01((p - T2S) / ((T2E - T2S) * 0.35));
  return appear * exit;
}

function primaryPathOpacity(p: number): number {
  const appear = clamp01((p - (T1S + (T1E - T1S) * 0.55)) / ((T1E - T1S) * 0.45));
  const exit = 1 - clamp01((p - T2S) / ((T2E - T2S) * 0.4));
  return appear * exit;
}

function outcomeLabelOpacity(i: number, p: number): number {
  return clamp01((p - (0.78 + i * 0.045)) / 0.03);
}

function particleFill(accent: number): string {
  if (accent <= 0) return `rgb(${BASE_RGB[0]},${BASE_RGB[1]},${BASE_RGB[2]})`;
  const r = Math.round(lerp(BASE_RGB[0], ACCENT_RGB[0], accent));
  const g = Math.round(lerp(BASE_RGB[1], ACCENT_RGB[1], accent));
  const b = Math.round(lerp(BASE_RGB[2], ACCENT_RGB[2], accent));
  return `rgb(${r},${g},${b})`;
}

function curvePath(state: number, curve: number, stateB?: number, t = 0): string {
  const a = CURVES[state][curve];
  const b = stateB === undefined ? a : CURVES[stateB][curve];
  const parts: string[] = [];
  for (let i = 0; i < a.length; i += 2) {
    const x = lerp(a[i], b[i], t);
    const y = lerp(a[i + 1], b[i + 1], t);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return parts.join(" ");
}

const LABEL_FONT = "var(--font-plus-jakarta), Inter, Arial, sans-serif";
const NAVY = "#152b50";
const ACCENT = "#1769ff";

type SceneRefs = {
  dots: (SVGCircleElement | null)[];
  curves: (SVGPathElement | null)[];
  curveGroup: SVGGElement | null;
  primaryPath: SVGPathElement | null;
  offerGroups: (SVGGElement | null)[];
  callout: SVGGElement | null;
  outcomeGroups: (SVGGElement | null)[];
};

/** The single inline SVG scene. Initial JSX renders state 0 (server-safe);
 *  scroll updates mutate attributes imperatively — no React re-render per frame. */
function SignalScene({ sceneRef }: { sceneRef: React.MutableRefObject<SceneRefs> }) {
  return (
    <svg
      viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Dots and curves morphing through three stages: a clearer offer anchored by selection, pricing, and experience; one wave standing out as your advantage; then four gently rising branches for rankings, qualified leads, conversions, and revenue"
    >
      <defs>
        <radialGradient id="signal-wash" cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.055" />
          <stop offset="78%" stopColor={ACCENT} stopOpacity="0.02" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect
        x={VIEW_X}
        y={VIEW_Y}
        width={VIEW_W}
        height={VIEW_H}
        rx="28"
        fill="url(#signal-wash)"
      />

      {/* tier 3: quiet supporting curves */}
      <g
        ref={(el) => {
          sceneRef.current.curveGroup = el;
        }}
        fill="none"
        stroke="#b9c9dd"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={CURVE_OPACITY[0]}
      >
        {CURVES[0].map((_, c) => (
          <path
            key={c}
            ref={(el) => {
              sceneRef.current.curves[c] = el;
            }}
            d={curvePath(0, c)}
          />
        ))}
      </g>

      {/* tier 1: continuous blue stroke beneath the Choice-stage dots */}
      <path
        ref={(el) => {
          sceneRef.current.primaryPath = el;
        }}
        d={curvePath(1, PRIMARY_CURVE)}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={0}
      />

      {/* tier 2: particles (accent dots enlarge as they turn blue) */}
      <g>
        {PARTICLES.map((row, i) => (
          <circle
            key={i}
            ref={(el) => {
              sceneRef.current.dots[i] = el;
            }}
            cx={row[0]}
            cy={row[1]}
            r={row[2] * (1 + 0.35 * row[4])}
            opacity={row[3]}
            fill={particleFill(row[4])}
          />
        ))}
      </g>

      {/* Stage 1 — anchor labels with rings, leader lines, descriptions */}
      {OFFER_LABELS.map((l, i) => {
        const [ax, ay] = OFFER_ANCHORS[i];
        return (
          <g
            key={l.title}
            ref={(el) => {
              sceneRef.current.offerGroups[i] = el;
            }}
            opacity={0}
          >
            <line
              x1={l.x}
              y1={l.y + 27}
              x2={ax}
              y2={ay - 9}
              stroke={ACCENT}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <circle cx={ax} cy={ay} r={11} fill="none" stroke={ACCENT} strokeOpacity="0.3" strokeWidth="1.5" />
            <circle cx={ax} cy={ay} r={5} fill={ACCENT} />
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              fontSize={20}
              fontWeight={600}
              fill={NAVY}
              fontFamily={LABEL_FONT}
            >
              {l.title}
            </text>
            <text
              x={l.x}
              y={l.y + 19}
              textAnchor="middle"
              fontSize={15}
              fill={NAVY}
              fillOpacity="0.55"
              fontFamily={LABEL_FONT}
            >
              {l.desc}
            </text>
          </g>
        );
      })}

      {/* Stage 2 — "Your advantage" callout at the primary wave's crest */}
      <g
        ref={(el) => {
          sceneRef.current.callout = el;
        }}
        opacity={0}
      >
        <line
          x1={CHOICE_CALLOUT.x + 32}
          y1={CHOICE_CALLOUT.y - 38}
          x2={CHOICE_CALLOUT.x + 3}
          y2={CHOICE_CALLOUT.y - 8}
          stroke={ACCENT}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <circle cx={CHOICE_CALLOUT.x} cy={CHOICE_CALLOUT.y} r={10} fill="none" stroke={ACCENT} strokeOpacity="0.3" strokeWidth="1.5" />
        <text
          x={CHOICE_CALLOUT.x + 38}
          y={CHOICE_CALLOUT.y - 44}
          fontSize={17}
          fontWeight={600}
          fill={ACCENT}
          fontFamily={LABEL_FONT}
        >
          Your advantage
        </text>
      </g>

      {/* Stage 3 — branch endpoints with outlined markers and label groups */}
      {OUTCOME_LABELS.map((l, i) => (
        <g
          key={l.title}
          ref={(el) => {
            sceneRef.current.outcomeGroups[i] = el;
          }}
          opacity={0}
        >
          <circle cx={l.x} cy={l.y} r={8} fill="#f4f1ea" stroke={ACCENT} strokeWidth="2.5" />
          <text
            x={l.x + 20}
            y={l.y - 1}
            fontSize={19}
            fontWeight={600}
            fill={NAVY}
            fontFamily={LABEL_FONT}
          >
            {l.title}
          </text>
          <text x={l.x + 20} y={l.y + 17} fontSize={15} fill={NAVY} fillOpacity="0.6" fontFamily={LABEL_FONT}>
            {l.desc.map((line, li) => (
              <tspan key={li} x={l.x + 20} dy={li === 0 ? 0 : 17}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StageCopy({ stage, active }: { stage: (typeof STAGES)[number]; active: number }) {
  return (
    <div key={stage.key} className="tab-content">
      <p className="font-mono text-[11px] tracking-[0.24em] text-electric-deep uppercase">
        {String(active + 1).padStart(2, "0")} {stage.label}
      </p>
      <h3 className="font-display mt-3 text-2xl font-normal tracking-[-0.02em] text-navy text-balance lg:text-3xl xl:mt-4 xl:text-4xl">
        {stage.heading}
      </h3>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-navy/60 xl:mt-4 xl:text-lg">
        {stage.body}
      </p>
      {active === STAGES.length - 1 && (
        <Link
          href="/work"
          className="press-scale mt-7 inline-flex items-center gap-2 rounded-full border border-electric-deep/30 px-5 py-3 text-sm font-semibold text-electric-deep transition-colors hover:bg-electric-deep hover:text-white"
        >
          Explore our case studies
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

function StageProgress({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div role="group" aria-label="Stages" className="relative mx-auto w-full max-w-md">
      <span
        aria-hidden="true"
        className="absolute top-[4px] right-[16.66%] left-[16.66%] h-px bg-navy/15"
      />
      <div className="relative grid grid-cols-3">
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-current={i === active ? "step" : undefined}
            onClick={() => onSelect(i)}
            className="press-scale group flex flex-col items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-[9px] w-[9px] rounded-full transition-colors duration-300",
                i === active
                  ? "bg-electric-deep"
                  : "bg-navy/25 group-hover:bg-navy/40",
              )}
            />
            <span
              className={cn(
                "text-sm transition-colors duration-300",
                i === active
                  ? "font-semibold text-electric-deep"
                  : "text-navy/40 group-hover:text-navy/70",
              )}
            >
              {String(i + 1).padStart(2, "0")} {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PinnedSignal({ onUnfit }: { onUnfit: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const sceneRef = useRef<SceneRefs>({
    dots: [],
    curves: [],
    curveGroup: null,
    primaryPath: null,
    offerGroups: [],
    callout: null,
    outcomeGroups: [],
  });

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const { a, b, t } = blend(p);
    const scene = sceneRef.current;

    for (let i = 0; i < PARTICLES.length; i++) {
      const el = scene.dots[i];
      if (!el) continue;
      const row = PARTICLES[i];
      const ai = a * 5;
      const bi = b * 5;
      const accent = lerp(row[ai + 4], row[bi + 4], t);
      el.setAttribute("cx", lerp(row[ai], row[bi], t).toFixed(1));
      el.setAttribute("cy", lerp(row[ai + 1], row[bi + 1], t).toFixed(1));
      el.setAttribute(
        "r",
        (lerp(row[ai + 2], row[bi + 2], t) * (1 + 0.35 * accent)).toFixed(2),
      );
      el.setAttribute("opacity", lerp(row[ai + 3], row[bi + 3], t).toFixed(2));
      el.setAttribute("fill", particleFill(accent));
    }
    for (let c = 0; c < CURVES[0].length; c++) {
      scene.curves[c]?.setAttribute("d", curvePath(a, c, b, t));
    }
    scene.curveGroup?.setAttribute(
      "opacity",
      lerp(CURVE_OPACITY[a], CURVE_OPACITY[b], t).toFixed(2),
    );
    if (scene.primaryPath) {
      scene.primaryPath.setAttribute("d", curvePath(a, PRIMARY_CURVE, b, t));
      scene.primaryPath.setAttribute("opacity", primaryPathOpacity(p).toFixed(2));
    }
    for (let i = 0; i < scene.offerGroups.length; i++) {
      scene.offerGroups[i]?.setAttribute("opacity", offerLabelOpacity(i, p).toFixed(2));
    }
    scene.callout?.setAttribute("opacity", calloutOpacity(p).toFixed(2));
    for (let i = 0; i < scene.outcomeGroups.length; i++) {
      scene.outcomeGroups[i]?.setAttribute("opacity", outcomeLabelOpacity(i, p).toFixed(2));
    }

    setActive(p < (T1S + T1E) / 2 ? 0 : p < (T2S + T2E) / 2 ? 1 : 2);
  });

  // Fall back to the stacked layout if the pinned stage can't fit below the
  // header (narrow-and-short windows); checked on mount and on resize.
  useEffect(() => {
    const check = () => {
      const el = contentRef.current;
      const header = document.querySelector<HTMLElement>("body > header, header.fixed");
      const top = header ? header.getBoundingClientRect().height : 0;
      if (el && el.offsetHeight > window.innerHeight - top - 8) onUnfit();
    };
    check();
    const ro = new ResizeObserver(check);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [onUnfit]);

  const scrollToStage = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * HOLD_CENTERS[i], behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative h-[380svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center pt-[4.25rem] pb-4">
        {/* below xl the scene takes a larger share so its SVG labels stay legible */}
        <div ref={contentRef} className="mx-auto w-[94%] max-w-[1480px] xl:w-[90%]">
          <div className="mb-5 text-center xl:mb-8">
            <h2
              id="growth-signal-heading"
              className="font-display text-2xl font-normal tracking-[-0.02em] text-navy text-balance lg:text-3xl xl:text-4xl"
            >
              What good digital growth looks like.
            </h2>
            <p className="mt-2 text-base text-navy/60 lg:mt-3 lg:text-lg">
              Three things to look for before investing more in marketing.
            </p>
          </div>
          <StageProgress active={active} onSelect={scrollToStage} />
          <div className="mt-5 grid items-center gap-5 lg:mt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,13fr)] lg:gap-8 xl:grid-cols-[minmax(0,7fr)_minmax(0,12fr)] xl:gap-12">
            <StageCopy stage={STAGES[active]} active={active} />
            <div className="min-w-0">
              <SignalScene sceneRef={sceneRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile and reduced motion: three compact stacked stages, no pinning. */
function StackedSignal() {
  return (
    <div className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1120px] space-y-16 px-6 sm:space-y-20 sm:px-8">
        <div>
          <h2
            id="growth-signal-heading"
            className="font-display text-3xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-4xl"
          >
            What good digital growth looks like.
          </h2>
          <p className="mt-3 text-lg text-navy/60">
            Three things to look for before investing more in marketing.
          </p>
        </div>
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="grid items-center gap-6 sm:grid-cols-2 sm:gap-10">
            <div className={i % 2 === 1 ? "sm:order-last" : undefined}>
              <p className="font-mono text-[11px] tracking-[0.24em] text-electric-deep uppercase">
                {String(i + 1).padStart(2, "0")} {stage.label}
              </p>
              <h3 className="font-display mt-3 text-2xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-3xl">
                {stage.heading}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-navy/60">
                {stage.body}
              </p>
              {stage.details.length > 0 && (
                <dl className="mt-5 space-y-2.5">
                  {stage.details.map((d) => (
                    <div key={d.title} className="flex items-baseline gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-electric-deep"
                      />
                      <dt className="text-sm font-semibold text-navy">{d.title}</dt>
                      <dd className="text-sm text-navy/55">{d.desc}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {i === STAGES.length - 1 && (
                <Link
                  href="/work"
                  className="press-scale mt-6 inline-flex items-center gap-2 rounded-full border border-electric-deep/30 px-5 py-3 text-sm font-semibold text-electric-deep transition-colors hover:bg-electric-deep hover:text-white"
                >
                  Explore our case studies
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            {/* Static per-stage SVGs are separate documents via <img>, so the
                shared IDs inside them can never collide. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stage.image}
              alt={stage.alt}
              width={1200}
              height={680}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GrowthSignal() {
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  // the pinned stage reports when it can't fit; reset on any resize so a
  // larger window gets the pinned version back
  const [fits, setFits] = useState(true);
  const onUnfit = useCallback(() => setFits(false), []);
  useEffect(() => {
    const reset = () => setFits(true);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);

  useEffect(() => {
    // pin on any desktop/tablet-width window tall enough for the stage;
    // phones and short screens get the stacked variant with HTML text
    const mq = window.matchMedia("(min-width: 700px) and (min-height: 600px)");
    const id = requestAnimationFrame(() => setIsDesktop(mq.matches));
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const pinned = isDesktop && fits && !reduce;

  return (
    <section
      id="growth-signal"
      aria-labelledby="growth-signal-heading"
      className="bg-ink"
    >
      <MotionProvider>{pinned ? <PinnedSignal onUnfit={onUnfit} /> : <StackedSignal />}</MotionProvider>
    </section>
  );
}
