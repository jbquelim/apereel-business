"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/container";
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
  CURVES,
  CURVE_OPACITY,
  OFFER_LABELS,
  OFFER_LABEL_OPACITY,
  OUTCOME_LABELS,
  OUTCOME_LABEL_OPACITY,
  PARTICLES,
  VIEW_H,
  VIEW_W,
} from "@/lib/signal-states";

const STAGES = [
  {
    key: "offer",
    label: "Offer",
    heading: "Build a stronger signal.",
    body: "Align product selection, pricing, and customer experience to create a clearer offer.",
    image: "/images/signal/01-offer.svg",
    alt: "Scattered dots forming three gentle waves labeled Selection, Pricing, and Experience",
  },
  {
    key: "choice",
    label: "Choice",
    heading: "Stand out for a reason.",
    body: "Turn what makes your business different into a clear reason for customers to choose you.",
    image: "/images/signal/02-choice.svg",
    alt: "The waves converge and a group of dots turns blue, standing out from the field",
  },
  {
    key: "outcome",
    label: "Outcome",
    heading: "Connect attention to results.",
    body: "Track how a stronger business supports search visibility, qualified leads, conversions, and revenue.",
    image: "/images/signal/03-outcome.svg",
    alt: "The dots flow into four branches labeled Revenue, Conversions, Leads, and Rankings",
  },
] as const;

/*
 * Scroll timeline: stable reading holds with transitions between them.
 *   [0.00–0.26] hold Offer   [0.26–0.42] morph
 *   [0.42–0.60] hold Choice  [0.60–0.76] morph
 *   [0.76–1.00] hold Outcome
 */
const T1_START = 0.26;
const T1_END = 0.42;
const T2_START = 0.6;
const T2_END = 0.76;
const HOLD_CENTERS = [0.13, 0.51, 0.88];

const smooth = (t: number) => t * t * (3 - 2 * t);

function blend(p: number): { a: number; b: number; t: number } {
  if (p <= T1_START) return { a: 0, b: 0, t: 0 };
  if (p < T1_END) return { a: 0, b: 1, t: smooth((p - T1_START) / (T1_END - T1_START)) };
  if (p <= T2_START) return { a: 1, b: 1, t: 0 };
  if (p < T2_END) return { a: 1, b: 2, t: smooth((p - T2_START) / (T2_END - T2_START)) };
  return { a: 2, b: 2, t: 0 };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
const LABEL_FILL = "#152b50";

/** The single inline SVG scene. Initial JSX renders state 0 (server-safe);
 *  scroll updates mutate attributes imperatively — no React re-render per frame. */
function SignalScene({
  sceneRef,
}: {
  sceneRef: React.MutableRefObject<{
    dots: (SVGCircleElement | null)[];
    curves: (SVGPathElement | null)[];
    curveGroup: SVGGElement | null;
    offerGroup: SVGGElement | null;
    outcomeGroup: SVGGElement | null;
  }>;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Dots and curves morphing through three stages: a clearer offer, a reason to be chosen, and outcomes for revenue, conversions, leads, and rankings"
    >
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
      <g>
        {PARTICLES.map((row, i) => (
          <circle
            key={i}
            ref={(el) => {
              sceneRef.current.dots[i] = el;
            }}
            cx={row[0]}
            cy={row[1]}
            r={row[2]}
            opacity={row[3]}
            fill={particleFill(row[4])}
          />
        ))}
      </g>
      <g
        ref={(el) => {
          sceneRef.current.offerGroup = el;
        }}
        opacity={OFFER_LABEL_OPACITY[0]}
      >
        {OFFER_LABELS.map((l) => (
          <text
            key={l.text}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor as "middle"}
            fontSize={l.size}
            fontWeight={500}
            fill={LABEL_FILL}
            fontFamily={LABEL_FONT}
          >
            {l.text}
          </text>
        ))}
      </g>
      <g
        ref={(el) => {
          sceneRef.current.outcomeGroup = el;
        }}
        opacity={OUTCOME_LABEL_OPACITY[0]}
      >
        {OUTCOME_LABELS.map((l) => (
          <text
            key={l.text}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor as "start"}
            fontSize={l.size}
            fontWeight={500}
            fill={LABEL_FILL}
            fontFamily={LABEL_FONT}
          >
            {l.text}
          </text>
        ))}
      </g>
    </svg>
  );
}

function StageCopy({ stage, active }: { stage: (typeof STAGES)[number]; active: number }) {
  return (
    <div key={stage.key} className="tab-content">
      <p className="font-mono text-[11px] tracking-[0.24em] text-electric-deep uppercase">
        {String(active + 1).padStart(2, "0")} {stage.label}
      </p>
      <h2 className="font-display mt-4 text-3xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-4xl">
        {stage.heading}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-navy/60 sm:text-lg">
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
      {/* track between the first and last dot centers (columns are equal thirds) */}
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

function PinnedSignal() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const sceneRef = useRef<{
    dots: (SVGCircleElement | null)[];
    curves: (SVGPathElement | null)[];
    curveGroup: SVGGElement | null;
    offerGroup: SVGGElement | null;
    outcomeGroup: SVGGElement | null;
  }>({ dots: [], curves: [], curveGroup: null, offerGroup: null, outcomeGroup: null });

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
      el.setAttribute("cx", lerp(row[ai], row[bi], t).toFixed(1));
      el.setAttribute("cy", lerp(row[ai + 1], row[bi + 1], t).toFixed(1));
      el.setAttribute("r", lerp(row[ai + 2], row[bi + 2], t).toFixed(2));
      el.setAttribute("opacity", lerp(row[ai + 3], row[bi + 3], t).toFixed(2));
      el.setAttribute("fill", particleFill(lerp(row[ai + 4], row[bi + 4], t)));
    }
    for (let c = 0; c < CURVES[0].length; c++) {
      scene.curves[c]?.setAttribute("d", curvePath(a, c, b, t));
    }
    scene.curveGroup?.setAttribute(
      "opacity",
      lerp(CURVE_OPACITY[a], CURVE_OPACITY[b], t).toFixed(2),
    );
    scene.offerGroup?.setAttribute(
      "opacity",
      lerp(OFFER_LABEL_OPACITY[a], OFFER_LABEL_OPACITY[b], t).toFixed(2),
    );
    scene.outcomeGroup?.setAttribute(
      "opacity",
      lerp(OUTCOME_LABEL_OPACITY[a], OUTCOME_LABEL_OPACITY[b], t).toFixed(2),
    );

    setActive(p < (T1_START + T1_END) / 2 ? 0 : p < (T2_START + T2_END) / 2 ? 1 : 2);
  });

  const scrollToStage = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * HOLD_CENTERS[i], behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative h-[380svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center pt-[4.5rem] pb-6">
        <Container>
          <StageProgress active={active} onSelect={scrollToStage} />
          <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
            <StageCopy stage={STAGES[active]} active={active} />
            <div className="min-w-0">
              <SignalScene sceneRef={sceneRef} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

/** Mobile and reduced motion: three compact stacked stages, no pinning. */
function StackedSignal() {
  return (
    <div className="py-20 sm:py-24">
      <Container className="space-y-16 sm:space-y-20">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="grid items-center gap-6 sm:grid-cols-2 sm:gap-10">
            <div className={i % 2 === 1 ? "sm:order-last" : undefined}>
              <p className="font-mono text-[11px] tracking-[0.24em] text-electric-deep uppercase">
                {String(i + 1).padStart(2, "0")} {stage.label}
              </p>
              <h2 className="font-display mt-3 text-2xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-3xl">
                {stage.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-navy/60">
                {stage.body}
              </p>
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
              width={VIEW_W}
              height={VIEW_H}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-auto w-full"
            />
          </div>
        ))}
      </Container>
    </div>
  );
}

export function GrowthSignal() {
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pinned = isDesktop && !reduce;

  return (
    <section
      id="growth-signal"
      aria-label="How a stronger business becomes measurable growth"
      className="bg-ink"
    >
      <MotionProvider>{pinned ? <PinnedSignal /> : <StackedSignal />}</MotionProvider>
    </section>
  );
}
