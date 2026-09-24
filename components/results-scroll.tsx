"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  MotionProvider,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "@/components/motion";

/*
 * Results section (apereel-results-scroll package). Endpoint comparison on a
 * shared 0×–20× scale: traffic ~4× (rounded from the measured 270% increase,
 * preserved in the source note), revenue 20×. Headline values never animate;
 * scroll only reveals the bars and supporting statements. No time series or
 * causal claims. Case study resolves to /work; report URL and exact period
 * were not supplied and are not invented.
 */

const COPY = {
  heading: "More visibility. A bigger business.",
  description:
    "Over four years, organic traffic nearly quadrupled and revenue reached 20 times its starting level.",
  context: "One ecommerce retailer · Four year comparison",
  traffic: { value: "~4×", label: "Organic traffic", support: "Approximately 300% growth" },
  revenue: { value: "20×", label: "Revenue", support: "Times the starting level" },
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

/* Timeline per motion-spec.json. */
const trafficFraction = (p: number) => BASELINE + 0.15 * clamp01((p - 0.12) / 0.28);
const revenueFraction = (p: number) => BASELINE + 0.95 * clamp01((p - 0.5) / 0.28);
const TRAFFIC_DONE = 0.4;
const REVENUE_DONE = 0.78;

type BarRefs = {
  traffic: HTMLDivElement | null;
  revenue: HTMLDivElement | null;
  trafficLabel: HTMLSpanElement | null;
  revenueLabel: HTMLSpanElement | null;
};

function Bar({
  metric,
  endFraction,
  fillRef,
  labelRef,
  complete,
}: {
  metric: { value: string; label: string; support: string };
  endFraction: number;
  fillRef?: (el: HTMLDivElement | null) => void;
  labelRef?: (el: HTMLSpanElement | null) => void;
  complete: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-4xl text-navy sm:text-5xl">{metric.value}</p>
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

function Panel({
  barRefs,
  complete,
}: {
  barRefs?: React.MutableRefObject<BarRefs>;
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
          fillRef={barRefs ? (el) => (barRefs.current.traffic = el) : undefined}
          labelRef={barRefs ? (el) => (barRefs.current.trafficLabel = el) : undefined}
          complete={complete}
        />
        <Bar
          metric={COPY.revenue}
          endFraction={REVENUE_END}
          fillRef={barRefs ? (el) => (barRefs.current.revenue = el) : undefined}
          labelRef={barRefs ? (el) => (barRefs.current.revenueLabel = el) : undefined}
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

function PinnedResults() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<BarRefs>({
    traffic: null,
    revenue: null,
    trafficLabel: null,
    revenueLabel: null,
  });
  const [finalHold, setFinalHold] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const b = barRefs.current;
    if (b.traffic) b.traffic.style.width = `${trafficFraction(p) * 100}%`;
    if (b.revenue) b.revenue.style.width = `${revenueFraction(p) * 100}%`;
    // endpoint labels appear only once their reveal completes
    if (b.trafficLabel) b.trafficLabel.style.opacity = p >= TRAFFIC_DONE ? "1" : "0";
    if (b.revenueLabel) b.revenueLabel.style.opacity = p >= REVENUE_DONE ? "1" : "0";
    setFinalHold(p >= REVENUE_DONE);
  });

  return (
    <div ref={wrapperRef} className="relative h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col pt-[5.25rem] pb-5">
        <div className="mx-auto flex w-full max-w-[1160px] min-h-0 flex-1 flex-col justify-center px-6 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <LeftColumn emphasized={finalHold} />
            <Panel barRefs={barRefs} complete={false} />
          </div>
          <div className="mt-8">
            <Pillars visible={finalHold} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Static mode: mobile, short screens, reduced motion, no-JS — complete state. */
function StaticResults() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-16 sm:px-8 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <LeftColumn emphasized={false} />
        <Panel complete />
      </div>
      <div className="mt-8">
        <Pillars visible />
      </div>
    </div>
  );
}

export function ResultsScroll() {
  const reduce = useReducedMotion();
  const [pinnable, setPinnable] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      // pin only when the full composition fits below the header
      setPinnable(window.innerWidth >= 1100 && window.innerHeight >= 700);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const pinned = pinnable && !reduce;

  return (
    <section
      id="results"
      aria-labelledby="results-scroll-heading"
      className="bg-ink"
    >
      <MotionProvider>{pinned ? <PinnedResults /> : <StaticResults />}</MotionProvider>
    </section>
  );
}
