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
import {
  TREND_MAX,
  TREND_MONTHS,
  TREND_START,
  TREND_VALUES,
} from "@/lib/proof-trend";

/*
 * Evidence: the chart is a native SVG redrawn from the real Semrush report
 * screenshot (public/images/organic-growth-trend.png) — bar values were
 * measured from the report image itself (lib/proof-trend.ts) and are
 * approximate. The source note says so, and the untouched report stays one
 * click away. The package's synthetic illustrative bars are NOT used.
 */

const REPORT_SRC = "/images/organic-growth-trend.png";

const METRICS = [
  { id: "keywords", value: "8.6K", label: "Ranking keywords" },
  { id: "traffic", value: "58.6K", label: "Estimated organic traffic" },
  { id: "nonbrand", value: "87%", label: "Nonbranded traffic share" },
] as const;

/** Which metrics each chapter emphasizes (all equal in chapter 0). */
const EMPHASIS: Record<number, string[]> = {
  0: [],
  1: ["keywords"],
  2: ["traffic", "nonbrand"],
};

const CHAPTERS = [
  {
    id: "foundations",
    title: "Business foundations",
    description:
      "We strengthened product selection, accelerated inventory launches, and made shopping easier.",
  },
  {
    id: "visibility",
    title: "Search visibility",
    description:
      "Track how the business appeared across more organic search queries over time.",
  },
  {
    id: "discovery",
    title: "Customer discovery",
    description:
      "See how much estimated organic traffic came from searches beyond the company name.",
  },
] as const;

const SOURCE_NOTE =
  "Chart redrawn from the Semrush organic keyword trend report for a luxury ecommerce retailer, 2022 to 2026. Monthly values are approximate. Traffic figures are estimates. Figures shown during the sweep are scaled approximations.";

/* Final snapshot values; during the chapter 2 sweep the keywords cell tracks
   the real digitized series and the other two scale with it (approximate,
   disclosed in the source note). */
const KEYWORDS_FINAL = 8500;
const TRAFFIC_FINAL = 58600;
const NONBRAND_FINAL = 87;

/*
 * Timeline (motion-spec.json):
 *   [0.00–0.20] chapter 0 hold   [0.20–0.30] crossfade
 *   [0.30–0.68] chapter 1 — inspection line sweeps the time axis
 *   [0.68–0.78] crossfade        [0.78–1.00] chapter 2 hold + CTA
 */
const CHAPTER_TARGETS = [0.1, 0.49, 0.89];
const chapterAt = (p: number) => (p < 0.25 ? 0 : p < 0.73 ? 1 : 2);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── Chart geometry (chart-frame.svg production scaffold) ─────────── */
const CW = 1280;
const CH = 440;
const PX = 72;
const PY = 72;
const PW = 1176;
const PH = 304;
const N = TREND_VALUES.length;
const SLOT = PW / N;
const BW = SLOT * 0.62;
const barX = (i: number) => PX + i * SLOT + (SLOT - BW) / 2;
const barCX = (i: number) => barX(i) + BW / 2;
const barH = (v: number) => (v / TREND_MAX) * PH;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function obsDate(i: number): string {
  const m = Math.round((i / (N - 1)) * TREND_MONTHS);
  return `${MONTHS[m % 12]} ${TREND_START.year + Math.floor(m / 12)}`;
}

/** Per-bar brightness at progress p; the sweep brightens bars it has passed. */
function barOpacity(i: number, p: number, markerX: number): number {
  const swept = 0.4 + 0.6 * clamp01((markerX - barCX(i) + 30) / 60);
  const pre = p < 0.2 ? 1 : p < 0.3 ? 1 - (p - 0.2) / 0.1 : 0;
  const post = p > 0.78 ? 1 : p > 0.68 ? (p - 0.68) / 0.1 : 0;
  const mid = 1 - pre - post;
  return pre * 0.8 + post * 1 + mid * swept;
}

const markerOpacity = (p: number) =>
  Math.min(clamp01((p - 0.28) / 0.02), 1 - clamp01((p - 0.68) / 0.02));

type ChartRefs = {
  bars: (SVGRectElement | null)[];
  marker: SVGGElement | null;
  markerLine: SVGLineElement | null;
  markerDot: SVGCircleElement | null;
  tip: SVGGElement | null;
  tipValue: SVGTextElement | null;
  tipDate: SVGTextElement | null;
};

const TIP_W = 168;

function TrendChart({
  chartRef,
  animated,
}: {
  chartRef?: React.MutableRefObject<ChartRefs>;
  animated: boolean;
}) {
  const gridVals = [0, 5000, 10000, 15000];
  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      className="h-auto w-full"
      role="img"
      aria-label="Organic keyword trend from 2022 to 2026, redrawn from the Semrush report: ranking keywords grow from about three and a half thousand to about eight and a half thousand, with dips and recoveries along the way"
    >
      <defs>
        <linearGradient id="proof-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d9eff" />
          <stop offset="100%" stopColor="#1d6fd4" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <text x={PX} y={40} fontSize={17} fontWeight={600} fill="#f4f1ea" fontFamily="var(--font-plus-jakarta), sans-serif">
        Organic keyword trend
      </text>
      <text x={PX} y={58} fontSize={12.5} fill="#9aa4b8" fontFamily="var(--font-plus-jakarta), sans-serif">
        Redrawn from the Semrush report. Values are approximate.
      </text>

      {gridVals.map((v) => {
        const y = PY + PH - (v / TREND_MAX) * PH;
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={PX + PW} y2={y} stroke="#f4f1ea" strokeOpacity={v === 0 ? 0.25 : 0.08} strokeWidth="1" />
            <text x={PX - 10} y={y + 4} textAnchor="end" fontSize={12} fill="#9aa4b8" fontFamily="var(--font-ibm-plex), monospace">
              {v === 0 ? "0" : `${v / 1000}K`}
            </text>
          </g>
        );
      })}

      {[0, 12, 24, 36, 48].map((m) => (
        <text
          key={m}
          x={PX + (m / TREND_MONTHS) * PW}
          y={PY + PH + 26}
          textAnchor={m === 0 ? "start" : m === TREND_MONTHS ? "end" : "middle"}
          fontSize={12.5}
          fill="#9aa4b8"
          fontFamily="var(--font-ibm-plex), monospace"
        >
          {TREND_START.year + m / 12}
        </text>
      ))}

      {TREND_VALUES.map((v, i) => (
        <rect
          key={i}
          ref={(el) => {
            if (chartRef) chartRef.current.bars[i] = el;
          }}
          x={barX(i)}
          y={PY + PH - barH(v)}
          width={BW}
          height={barH(v)}
          rx={2.5}
          fill="url(#proof-bar-grad)"
          opacity={animated ? 0.8 : 1}
        />
      ))}

      {animated && (
        <g
          ref={(el) => {
            if (chartRef) chartRef.current.marker = el;
          }}
          opacity={0}
          aria-hidden="true"
        >
          <line
            ref={(el) => {
              if (chartRef) chartRef.current.markerLine = el;
            }}
            x1={PX}
            y1={PY - 6}
            x2={PX}
            y2={PY + PH}
            stroke="#3d9eff"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <circle
            ref={(el) => {
              if (chartRef) chartRef.current.markerDot = el;
            }}
            cx={PX}
            cy={PY - 10}
            r={4.5}
            fill="#3d9eff"
          />
          <g
            ref={(el) => {
              if (chartRef) chartRef.current.tip = el;
            }}
          >
            <rect width={TIP_W} height={44} rx={8} fill="#132240" stroke="#3d9eff" strokeOpacity="0.35" />
            <text
              ref={(el) => {
                if (chartRef) chartRef.current.tipValue = el;
              }}
              x={12}
              y={19}
              fontSize={14}
              fontWeight={600}
              fill="#f4f1ea"
              fontFamily="var(--font-plus-jakarta), sans-serif"
            >
              ≈3.5K keywords
            </text>
            <text
              ref={(el) => {
                if (chartRef) chartRef.current.tipDate = el;
              }}
              x={12}
              y={35}
              fontSize={12}
              fill="#9aa4b8"
              fontFamily="var(--font-plus-jakarta), sans-serif"
            >
              Jan 2022
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

/** Accessible data companion for the redrawn chart. */
function TrendTable() {
  return (
    // wrapper div, not the table, carries sr-only: tables treat width as a
    // minimum, so a bare sr-only table leaks its min-content width
    <div className="sr-only">
      <TrendTableInner />
    </div>
  );
}

function TrendTableInner() {
  return (
    <table>
      <caption>
        Approximate monthly ranking keyword counts, redrawn from the Semrush
        report, January 2022 to January 2026
      </caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">Approximate ranking keywords</th>
        </tr>
      </thead>
      <tbody>
        {TREND_VALUES.map((v, i) => (
          <tr key={i}>
            <td>{obsDate(i)}</td>
            <td>{v.toLocaleString("en-US")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricCell({
  metric,
  active,
  valueRef,
}: {
  metric: (typeof METRICS)[number];
  active: number;
  valueRef?: (el: HTMLParagraphElement | null) => void;
}) {
  const emphasized = EMPHASIS[active].includes(metric.id);
  const neutral = EMPHASIS[active].length === 0;
  return (
    <div
      className={cn(
        "rounded-[var(--radius-child)] border px-5 py-3 text-center transition-[border-color,opacity] duration-500",
        emphasized ? "border-electric/50" : "border-white/10",
        neutral || emphasized ? "opacity-100" : "opacity-55",
      )}
    >
      <p
        ref={valueRef}
        className={cn(
          "font-mono text-3xl tabular-nums transition-colors duration-500 sm:text-4xl",
          emphasized ? "text-electric" : "text-ink",
        )}
      >
        {metric.value}
      </p>
      <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
        {metric.label}
      </p>
    </div>
  );
}

function ChapterButton({
  chapter,
  index,
  active,
  onSelect,
}: {
  chapter: (typeof CHAPTERS)[number];
  index: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  const on = index === active;
  return (
    <button
      type="button"
      aria-current={on ? "true" : undefined}
      onClick={() => onSelect(index)}
      className="press-scale group flex items-center gap-3 text-left"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] transition-colors duration-300",
          on
            ? "border-electric bg-electric font-bold text-navy"
            : "border-white/20 text-muted group-hover:border-white/40",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-300 sm:text-[15px]",
          on ? "text-ink" : "text-muted group-hover:text-ink/80",
        )}
      >
        {chapter.title}
      </span>
    </button>
  );
}

function Cta() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href="/work"
        className="press-scale inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-deep hover:text-ink"
      >
        Explore the case study
        <span aria-hidden="true">→</span>
      </Link>
      <a
        href={REPORT_SRC}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        View the original report
      </a>
    </div>
  );
}

function Intro() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 sm:px-8">
      <div className="grid gap-8 pt-16 pb-6 sm:pt-20 sm:pb-8 lg:grid-cols-2 lg:items-end lg:gap-16">
        <div>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            What real SEO looks like
          </p>
          <h2
            id="proof-scroll-heading"
            className="font-display mt-4 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-5xl"
          >
            Proof, not promises.
          </h2>
          <p className="mt-4 text-lg text-muted sm:text-xl">
            Four years of growth for one ecommerce business.
          </p>
        </div>
        <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          We strengthened product selection, accelerated inventory launches,
          and improved the shopping experience.
        </p>
      </div>
    </div>
  );
}

function PinnedProof() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const metricRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const chartRef = useRef<ChartRefs>({
    bars: [],
    marker: null,
    markerLine: null,
    markerDot: null,
    tip: null,
    tipValue: null,
    tipDate: null,
  });

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const c = chartRef.current;
    const f = clamp01((p - 0.3) / 0.38);
    const markerX = PX + f * PW;

    // metric cells count with the sweep: keywords from the real series,
    // traffic and share scaled to the same level (≈, disclosed); at rest
    // all three show the true final snapshots
    const [kwEl, trEl, nbEl] = metricRefs.current;
    const inSweep = p > 0.3 && p < 0.68;
    if (inSweep) {
      const kv = TREND_VALUES[Math.round(f * (N - 1))];
      const frac = Math.min(1, kv / KEYWORDS_FINAL);
      if (kwEl) kwEl.textContent = `${(kv / 1000).toFixed(1)}K`;
      if (trEl) trEl.textContent = `${((TRAFFIC_FINAL * frac) / 1000).toFixed(1)}K`;
      if (nbEl) nbEl.textContent = `${Math.round(NONBRAND_FINAL * frac)}%`;
    } else {
      if (kwEl) kwEl.textContent = METRICS[0].value;
      if (trEl) trEl.textContent = METRICS[1].value;
      if (nbEl) nbEl.textContent = METRICS[2].value;
    }

    for (let i = 0; i < N; i++) {
      c.bars[i]?.setAttribute("opacity", barOpacity(i, p, markerX).toFixed(2));
    }

    const mo = markerOpacity(p);
    c.marker?.setAttribute("opacity", mo.toFixed(2));
    if (mo > 0) {
      c.markerLine?.setAttribute("x1", markerX.toFixed(1));
      c.markerLine?.setAttribute("x2", markerX.toFixed(1));
      c.markerDot?.setAttribute("cx", markerX.toFixed(1));
      const i = Math.round(f * (N - 1));
      if (c.tipValue)
        c.tipValue.textContent = `≈${(TREND_VALUES[i] / 1000).toFixed(1)}K keywords`;
      if (c.tipDate) c.tipDate.textContent = obsDate(i);
      // clamp the tooltip inside the plot at both edges
      const tx = Math.min(Math.max(markerX - TIP_W / 2, PX + 2), PX + PW - TIP_W - 2);
      c.tip?.setAttribute("transform", `translate(${tx.toFixed(1)} 6)`);
    }

    setActive(chapterAt(p));
  });

  const scrollToChapter = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * CHAPTER_TARGETS[i], behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative mb-14 h-[300svh]">
      <div className="sticky top-0 flex h-svh flex-col pt-[5.25rem] pb-4">
        <div className="mx-auto flex w-full max-w-[1160px] min-h-0 flex-1 flex-col justify-center px-6 sm:px-8">
          <div className="mb-4 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-12">
            <div>
              <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                What real SEO looks like
              </p>
              <h2
                id="proof-scroll-heading"
                className="font-display mt-1 text-3xl font-normal tracking-[-0.02em] text-ink text-balance xl:text-4xl"
              >
                Proof, not promises.
              </h2>
              <p className="mt-1.5 text-base text-muted">
                Four years of growth for one ecommerce business.
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end lg:text-right">
              We strengthened product selection, accelerated inventory
              launches, and improved the shopping experience.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-3">
            {METRICS.map((m, i) => (
              <MetricCell
                key={m.id}
                metric={m}
                active={active}
                valueRef={(el) => {
                  metricRefs.current[i] = el;
                }}
              />
            ))}
          </div>

          <div className="mt-3 rounded-[var(--radius-parent)] border border-white/10 bg-navy-mid/60 px-4 py-2">
            {/* narrow the chart on shorter viewports so the full stage always fits */}
            <div
              className="mx-auto w-full"
              style={{ maxWidth: "min(100%, calc((100svh - 29rem) * 2.9))" }}
            >
              <TrendChart chartRef={chartRef} animated />
            </div>
            <TrendTable />
          </div>

          <div className="mt-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                {CHAPTERS.map((c, i) => (
                  <ChapterButton
                    key={c.id}
                    chapter={c}
                    index={i}
                    active={active}
                    onSelect={scrollToChapter}
                  />
                ))}
              </div>
              <Cta />
            </div>
            {/* reserved description area: fixed height so the row never shifts */}
            <div className="mt-2 min-h-[2.25rem]">
              <p
                key={CHAPTERS[active].id}
                className="tab-content max-w-3xl text-[15px] leading-relaxed text-muted"
              >
                {CHAPTERS[active].description}
              </p>
            </div>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted/50">
              {SOURCE_NOTE}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Static mode: mobile, short screens, reduced motion, and the no-JS baseline. */
function StaticProof() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 pb-20 sm:px-8 sm:pb-24">
      <div className="grid gap-3 sm:grid-cols-3">
        {METRICS.map((m) => (
          <MetricCell key={m.id} metric={m} active={0} />
        ))}
      </div>
      <div className="mt-5 rounded-[var(--radius-parent)] border border-white/10 bg-navy-mid/60 px-3 py-3 sm:px-4">
        <TrendChart animated={false} />
        <TrendTable />
      </div>
      <div className="mt-8 space-y-6">
        {CHAPTERS.map((c, i) => (
          <div key={c.id} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[12px] text-muted"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink">{c.title}</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                {c.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-5">
        <Cta />
        <p className="max-w-xl text-[12px] leading-relaxed text-muted/60">{SOURCE_NOTE}</p>
      </div>
    </div>
  );
}

export function ProofScroll() {
  const reduce = useReducedMotion();
  const [pinnable, setPinnable] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      // pin only when the full stage fits comfortably below the header
      setPinnable(window.innerWidth >= 1024 && window.innerHeight >= 740);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const pinned = pinnable && !reduce;

  return (
    <section id="proof" aria-labelledby="proof-scroll-heading" className="bg-navy">
      <MotionProvider>
        {pinned ? (
          <PinnedProof />
        ) : (
          <>
            <Intro />
            <StaticProof />
          </>
        )}
      </MotionProvider>
    </section>
  );
}
