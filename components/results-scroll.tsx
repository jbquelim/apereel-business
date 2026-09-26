"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  MotionProvider,
  animate,
  useInView,
  useReducedMotion,
} from "@/components/motion";

/*
 * Results section (apereel-results-scroll package). Endpoint comparison on a
 * shared 0×–20× scale: traffic ~4× (rounded from the measured 270% increase,
 * preserved in the source note), revenue 20×. When the section comes into
 * view each headline value counts up from 1× with its bar, once, as soon as
 * the user lands. On desktop the section also pins briefly (a scroll hold).
 * Reduced motion shows the final values. No time series or
 * causal claims. Case study resolves to /work; report URL and exact period
 * were not supplied and are not invented.
 */

const COPY = {
  heading: "More visibility. A bigger business.",
  description:
    "Over four years, organic traffic nearly quadrupled and revenue reached 20 times its starting level.",
  context: "One client · Four year comparison",
  traffic: { value: "~4×", prefix: "~", end: 4, label: "Organic traffic", support: "Approximately 300% growth" },
  revenue: { value: "20×", prefix: "", end: 20, label: "Revenue", support: "Times the starting level" },
  comparisonNote: "Each metric is relative to its own starting level.",
  sourceNote: "Traffic rounded from a measured 270% increase.",
  pillars: [
    "Stronger product selection.",
    "Faster inventory launches.",
    "A better shopping experience.",
  ],
  cta: "Explore the case study",
  caseStudyUrl: "/work",
} as const;

/* Shared 0×–20× track: baseline 1× at 5%, traffic ~4× at 20%, revenue at 100%. */
const BASELINE = 0.05;
const TRAFFIC_END = 0.2;
const REVENUE_END = 1;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Metric = { value: string; prefix: string; end: number; label: string; support: string };
/** Headline value while its bar grows (t 0→1). Floored, so every metric
 *  reaches its real value only at t = 1 — both counts land together. */
const countText = (m: Metric, t: number) =>
  `${m.prefix}${Math.floor(1 + (m.end - 1) * clamp01(t) + 1e-9)}×`;

type BarRefs = {
  traffic: HTMLDivElement | null;
  revenue: HTMLDivElement | null;
  trafficLabel: HTMLSpanElement | null;
  revenueLabel: HTMLSpanElement | null;
  trafficValue: HTMLSpanElement | null;
  revenueValue: HTMLSpanElement | null;
};

function Bar({
  metric,
  endFraction,
  fillRef,
  labelRef,
  valueRef,
  complete,
}: {
  metric: Metric;
  endFraction: number;
  fillRef?: (el: HTMLDivElement | null) => void;
  labelRef?: (el: HTMLSpanElement | null) => void;
  valueRef?: (el: HTMLSpanElement | null) => void;
  complete: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-4xl text-navy tabular-nums sm:text-5xl">
            {/* counting copy is decorative; assistive tech gets the real value */}
            <span ref={valueRef} aria-hidden="true">
              {complete ? metric.value : countText(metric, 0)}
            </span>
            <span className="sr-only">{metric.value}</span>
          </p>
          <p className="mt-1 text-[15px] font-medium text-navy">{metric.label}</p>
          <p className="text-[13px] text-navy/55">{metric.support}</p>
        </div>
      </div>
      <div aria-hidden="true" className="relative mt-8">
        {/* full gray track = 20× scale */}
        <div className="h-2.5 w-full rounded-full bg-navy/10">
          <div
            ref={fillRef}
            className="h-2.5 rounded-full bg-electric-deep"
            style={{ width: `${(complete ? endFraction : BASELINE) * 100}%` }}
          />
        </div>
        {/* 1× baseline marker */}
        <span
          className="absolute top-[-4px] h-[18px] w-px bg-navy/30"
          style={{ left: `${BASELINE * 100}%` }}
        />
        <span
          className="absolute top-[16px] font-mono text-[10px] text-navy/40"
          style={{ left: `${BASELINE * 100}%`, transform: "translateX(-50%)" }}
        >
          1×
        </span>
        {/* endpoint label sits at the blue endpoint */}
        <span
          ref={labelRef}
          className="absolute top-[-24px] font-mono text-[12px] font-semibold text-electric-deep transition-opacity duration-200"
          style={{
            left: `${endFraction * 100}%`,
            transform: endFraction > 0.9 ? "translateX(-100%)" : "translateX(-50%)",
            opacity: complete ? 1 : 0,
          }}
        >
          {metric.value}
        </span>
        <span className="absolute top-[16px] right-0 font-mono text-[10px] text-navy/40">
          20× scale
        </span>
      </div>
    </div>
  );
}

type RefSetter = <K extends keyof BarRefs>(key: K) => (el: BarRefs[K]) => void;

function Panel({
  setRef,
  complete,
}: {
  setRef?: RefSetter;
  complete: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-parent)] bg-white p-6 sm:p-8">
      <p className="font-mono text-[10px] tracking-[0.2em] text-navy/45 uppercase">
        Final results
      </p>
      <div className="mt-5 space-y-9">
        <Bar
          metric={COPY.traffic}
          endFraction={TRAFFIC_END}
          fillRef={setRef?.("traffic")}
          labelRef={setRef?.("trafficLabel")}
          valueRef={setRef?.("trafficValue")}
          complete={complete}
        />
        <Bar
          metric={COPY.revenue}
          endFraction={REVENUE_END}
          fillRef={setRef?.("revenue")}
          labelRef={setRef?.("revenueLabel")}
          valueRef={setRef?.("revenueValue")}
          complete={complete}
        />
      </div>
      <div className="mt-8 border-t border-navy/10 pt-4">
        <p className="text-[12px] leading-relaxed text-navy/55">{COPY.comparisonNote}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-navy/55">{COPY.sourceNote}</p>
      </div>
      {/* accessible summary of the comparison */}
      <p className="sr-only">
        Endpoint comparison on a shared zero to twenty times scale. Organic
        traffic ended at approximately four times its starting level, rounded
        from a measured 270 percent increase. Revenue ended at twenty times its
        starting level. Each metric is relative to its own starting level.
      </p>
    </div>
  );
}

function LeftColumn({ emphasized }: { emphasized: boolean }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.24em] text-navy/50 uppercase">
        Result
      </p>
      <h2
        id="results-scroll-heading"
        className="font-display mt-3 text-4xl font-normal tracking-[-0.02em] text-navy text-balance sm:text-5xl"
      >
        {COPY.heading}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-navy/60 sm:text-lg">
        {COPY.description}
      </p>
      <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-navy/45">
        {COPY.context}
      </p>
      <Link
        href={COPY.caseStudyUrl}
        className={cn(
          "press-scale mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-300",
          emphasized
            ? "bg-electric-deep text-white hover:bg-electric hover:text-navy"
            : "bg-navy text-ink hover:bg-electric-deep hover:text-white",
        )}
      >
        {COPY.cta}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function Pillars({ visible }: { visible: boolean }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {COPY.pillars.map((pillar, i) => (
        <li
          key={pillar}
          className={cn(
            "rounded-[var(--radius-child)] bg-white/60 px-5 py-4 text-[15px] font-medium text-navy transition-[opacity,transform] duration-500",
            visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
          style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
        >
          {pillar}
        </li>
      ))}
    </ul>
  );
}

/*
 * Plays once, on its own, as soon as the user lands on the section — no scrolling
 * needed. One eased clock drives both metrics together: traffic ~1×→~4× and
 * revenue 1×→20× grow and count in parallel and finish on the same frame;
 * then the endpoint labels, pillars and CTA emphasis land.
 */
const PLAY_SECONDS = 0.8;

function useBars() {
  const barRefs = useRef<BarRefs>({
    traffic: null,
    revenue: null,
    trafficLabel: null,
    revenueLabel: null,
    trafficValue: null,
    revenueValue: null,
  });
  const setRef: RefSetter = (key) => (el) => {
    barRefs.current[key] = el;
  };
  // stable: it only reads refs, so effects can depend on it without restarting
  const paint = useCallback((t: number) => {
    const b = barRefs.current;
    if (b.traffic) b.traffic.style.width = `${(BASELINE + (TRAFFIC_END - BASELINE) * t) * 100}%`;
    if (b.revenue) b.revenue.style.width = `${(BASELINE + (REVENUE_END - BASELINE) * t) * 100}%`;
    // headline values count with their bars
    if (b.trafficValue) b.trafficValue.textContent = countText(COPY.traffic, t);
    if (b.revenueValue) b.revenueValue.textContent = countText(COPY.revenue, t);
    // endpoint labels appear together once both bars are complete
    const labels = t >= 1 ? "1" : "0";
    if (b.trafficLabel) b.trafficLabel.style.opacity = labels;
    if (b.revenueLabel) b.revenueLabel.style.opacity = labels;
  }, []);
  return { setRef, paint };
}

function Layout({
  setRef,
  done,
  rootRef,
  panelRef,
}: {
  setRef: RefSetter;
  done: boolean;
  rootRef?: React.Ref<HTMLDivElement>;
  panelRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[1160px] px-6 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <LeftColumn emphasized={done} />
        <div ref={panelRef}>
          <Panel setRef={setRef} complete={done} />
        </div>
      </div>
      <div className="mt-8">
        <Pillars visible={done} />
      </div>
    </div>
  );
}

/*
 * Scroll hold (desktop): the section pins under the header for a short stretch
 * of scroll. The count still plays on its own the moment the section lands;
 * the pin just keeps the finished result on screen a little longer before the
 * page moves on.
 */
function PinnedResults() {
  return (
    <div className="relative h-[165svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center pt-20">
        <AnimatedResults />
      </div>
    </div>
  );
}

function AnimatedResults() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { setRef, paint } = useBars();
  const panelRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  // Start when the user has landed, not while the section slides in: its top
  // has reached the top 15% of the viewport, or the whole results card is on
  // screen (tall viewports, where the top may never get that high).
  const topReached = useInView(rootRef, { margin: "0px 0px -85% 0px", once: true });
  const cardInFull = useInView(panelRef, { amount: "all", once: true });
  const inView = topReached || cardInFull;
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    // reduced motion: land on the final state without the count
    const run = animate(0, 1, {
      duration: reduce ? 0 : PLAY_SECONDS,
      ease: [0.45, 0, 0.25, 1],
      onUpdate: paint,
      onComplete: () => setDone(true),
    });
    return () => run.stop();
  }, [inView, reduce, paint]);

  return <Layout setRef={setRef} done={done} rootRef={rootRef} panelRef={panelRef} />;
}

export function ResultsScroll() {
  const reduce = useReducedMotion();
  const [pinnable, setPinnable] = useState(false);

  useEffect(() => {
    // pin only when the whole composition fits below the header
    const evaluate = () => setPinnable(window.innerWidth >= 1024 && window.innerHeight >= 700);
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  return (
    <section
      id="results"
      aria-labelledby="results-scroll-heading"
      className="bg-ink"
    >
      <MotionProvider>
        {pinnable && !reduce ? <PinnedResults /> : <AnimatedResults />}
      </MotionProvider>
    </section>
  );
}
