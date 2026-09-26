"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  MotionProvider,
  animate,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "@/components/motion";

/*
 * Ranking explorer (apereel-ranking-scroll package). Six snapshot records
 * transcribed from the site's existing ranking cards — Semrush attributed,
 * anonymized, no history implied. One data-driven component: the stage SVGs
 * were used as state references only. Links resolve to real destinations:
 * /work and the site's existing anonymized report screenshot.
 */

// difficulty ratings match the site's existing ranking cards (Semrush KD)
const ROWS = [
  { id: "primary-category", label: "Primary product category", position: 1, monthlySearches: 12100, difficulty: "Hard" },
  { id: "international-brand", label: "International brand", position: 2, monthlySearches: 135000, difficulty: "Hard" },
  { id: "premium-brand", label: "Premium brand name", position: 2, monthlySearches: 27100, difficulty: "Hard" },
  { id: "brand-name", label: "Brand name", position: 2, monthlySearches: 33100, difficulty: "Hard" },
  { id: "industry-term", label: "Broad industry term", position: 5, monthlySearches: 22200, difficulty: "Very Hard" },
] as const;

const COPY = {
  eyebrow: "Search visibility",
  title: "Visibility where customers are searching.",
  description:
    "Selected organic rankings across brand and product searches with meaningful demand.",
  panelTitle: "Organic search position",
  volumeLabel: "Est. monthly searches",
  panelNote: "Selected organic ranking",
  sourceNote: "Data via Semrush. Selected rankings. Search terms anonymized.",
  cta: "Explore the case study",
  reportCta: "View source report",
  caseStudyUrl: "/work",
  sourceReportUrl: "/images/ranking-positions.png",
} as const;

/** Interval centers per motion-spec.json: (i + 0.5) / n. */
const TARGETS = ROWS.map((_, i) => (i + 0.5) / ROWS.length);
const indexAt = (p: number) =>
  Math.min(ROWS.length - 1, Math.floor(p * ROWS.length));

// One bar per example (01–05, matching the table and the 0X / 05 counter).
// The active example's bar fills left to right while its rank counts down
// from #99, so every scroll step visibly advances even when two examples
// share the same real rank.
const RANK_FROM = 99;

function RankLadder({ active, fill }: { active: number; fill: number }) {
  return (
    <div aria-hidden="true" className="flex h-full flex-col justify-between py-1">
      {ROWS.map((row, i) => {
        const on = i === active;
        const f = on ? fill : 0;
        return (
          <div key={row.id} className="flex items-center gap-3">
            <span
              className={cn(
                "w-5 font-mono text-[11px] tabular-nums transition-colors duration-200",
                on && f > 0.02 ? "text-ink" : "text-muted/50",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* equal widths on purpose: length does not encode performance */}
            <div className="relative h-[11px] w-full overflow-hidden rounded-full bg-white/8">
              <span
                className="absolute inset-0 origin-left rounded-full bg-electric"
                style={{ transform: `scaleX(${f.toFixed(4)})` }}
              />
              <span
                className={cn(
                  "absolute top-1/2 left-[3px] h-[5px] w-[5px] -translate-y-1/2 rounded-full",
                  f > 0.02 ? "bg-white" : "bg-white/25",
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Panel({
  active,
  progressRef,
  landed = true,
}: {
  active: number;
  progressRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Pinned mode: hold the first count until the section has actually pinned. */
  landed?: boolean;
}) {
  const row = ROWS[active];
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.5 });
  // Start at the final values (server render / no JS); arm the start state on
  // mount only if the panel is still below the fold, so nothing visibly resets.
  // rank and fill are tagged with the row they belong to, so a newly selected
  // row starts at #99 / empty on its first frame instead of flashing old values
  const [rankState, setRankState] = useState({ id: row.id as string, v: row.position as number });
  const [volume, setVolume] = useState<number>(row.monthlySearches);
  const [fillState, setFillState] = useState({ id: row.id as string, v: 1 });
  const volumeRef = useRef<number>(row.monthlySearches);
  const armed = useRef(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || reduce) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      armed.current = true;
      setFillState({ id: row.id, v: 0 });
      setRankState({ id: row.id, v: RANK_FROM });
      setVolume(0);
      volumeRef.current = 0;
    }
    // mount-time arming only; later row changes are handled by the tween effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    if (reduce || !inView || !landed) return;
    if (!armed.current && rankState.id === row.id && rankState.v === row.position) return;
    armed.current = false;
    const rankAnim = animate(RANK_FROM, row.position, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setRankState({ id: row.id, v }),
    });
    // progress fill: steady left-to-right sweep, finishing with the count
    const fillAnim = animate(0, 1, {
      duration: 1.15,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (v) => setFillState({ id: row.id, v }),
    });
    const volumeAnim = animate(volumeRef.current, row.monthlySearches, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        volumeRef.current = v;
        setVolume(v);
      },
    });
    return () => {
      rankAnim.stop();
      fillAnim.stop();
      volumeAnim.stop();
    };
    // re-run per keyword (and on first view/landing); rank/volume are animation output
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.id, inView, reduce, landed]);

  // reduced motion: always the real values, no tween
  const shownRank = reduce ? row.position : rankState.id === row.id ? rankState.v : RANK_FROM;
  const shownVolume = reduce ? row.monthlySearches : volume;
  const shownFill = reduce ? 1 : fillState.id === row.id ? fillState.v : 0;

  return (
    <div
      ref={rootRef}
      className="flex h-full flex-col rounded-[var(--radius-parent)] border border-white/10 bg-navy-mid/60 p-6"
    >
      <p className="text-[15px] font-semibold text-ink">{COPY.panelTitle}</p>
      <div className="mt-0.5 min-h-[1.25rem]">
        <p
          key={row.id}
          className="tab-content font-mono text-[11px] tracking-[0.18em] text-electric uppercase"
        >
          {row.label}
        </p>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-[1fr_auto] gap-6">
        <RankLadder active={active} fill={shownFill} />
        <div className="flex w-[150px] flex-col border-l border-white/10 pl-6">
          {/* counts down from #99; the visible value is decorative motion, the
              real figure is always in the table and the sr-only text */}
          <p className="font-mono text-5xl text-electric tabular-nums">
            <span className="text-3xl">#</span>
            <span aria-hidden="true">{Math.round(shownRank)}</span>
            <span className="sr-only">{row.position}</span>
          </p>
          <div className="mt-4 min-h-[3.5rem]">
            <p>
              <span className="block font-mono text-2xl text-ink tabular-nums">
                <span aria-hidden="true">{Math.round(shownVolume).toLocaleString("en-US")}</span>
                <span className="sr-only">{row.monthlySearches.toLocaleString("en-US")}</span>
              </span>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                {COPY.volumeLabel}
              </span>
            </p>
          </div>
          <div className="mt-4 min-h-[3.25rem]">
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
              Keyword difficulty
            </p>
            {/* keyed by value: consecutive rows with the same rating never flash */}
            <span
              key={`diff-${row.difficulty}`}
              className={cn(
                "tab-content mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.1em] uppercase",
                row.difficulty === "Very Hard"
                  ? "border-signal/40 text-signal"
                  : "border-white/20 text-muted",
              )}
            >
              {row.difficulty}
            </span>
          </div>
          <p className="mt-auto pt-3 text-[12px] leading-snug text-muted/70">{COPY.panelNote}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4">
        <p className="font-mono text-[12px] text-muted tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")}
        </p>
        <div aria-hidden="true" className="h-px flex-1 bg-white/10">
          <div
            ref={progressRef}
            className="h-px origin-left bg-electric"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}

function EvidenceTable({
  active,
  onSelect,
}: {
  active: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <table className="w-full border-separate border-spacing-0 text-left">
      <thead>
        <tr>
          {["Search category", "Position", "Est. monthly searches"].map((h, i) => (
            <th
              key={h}
              scope="col"
              className={cn(
                "border-b border-white/10 pb-2 font-mono text-[10px] font-medium tracking-[0.16em] text-muted/70 uppercase",
                i > 0 && "text-right",
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row, i) => {
          const on = i === active;
          return (
            <tr
              key={row.id}
              className={cn(
                "transition-colors duration-200",
                on ? "bg-white/5" : "hover:bg-white/[0.025]",
              )}
            >
              <td
                className={cn(
                  "relative border-b border-white/5 py-0 pl-4 transition-colors duration-200",
                )}
              >
                {/* blue edge marker */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1 bottom-1 left-0 w-[2.5px] rounded-full transition-colors duration-200",
                    on ? "bg-electric" : "bg-transparent",
                  )}
                />
                {onSelect ? (
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    aria-label={`Show example ${i + 1}: ${row.label}`}
                    onClick={() => onSelect(i)}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span className="font-mono text-[11px] text-muted/50 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[15px] font-medium transition-colors duration-200",
                        on ? "text-ink" : "text-ink/75",
                      )}
                    >
                      {row.label}
                    </span>
                  </button>
                ) : (
                  <span className="flex items-center gap-3 py-3.5">
                    <span className="font-mono text-[11px] text-muted/50 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] font-medium text-ink/85">{row.label}</span>
                  </span>
                )}
              </td>
              <td className="border-b border-white/5 py-3.5 text-right font-mono text-[15px] text-ink tabular-nums">
                {row.position}
              </td>
              <td className="border-b border-white/5 py-3.5 pr-1 text-right font-mono text-[15px] text-ink/85 tabular-nums">
                {row.monthlySearches.toLocaleString("en-US")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Links() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href={COPY.caseStudyUrl}
        className="press-scale inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-deep hover:text-ink"
      >
        {COPY.cta}
        <span aria-hidden="true">→</span>
      </Link>
      <a
        href={COPY.sourceReportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        {COPY.reportCta}
      </a>
    </div>
  );
}

function Intro() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 sm:px-8">
      <div className="max-w-2xl pt-16 pb-8 sm:pt-20 sm:pb-10">
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
          {COPY.eyebrow}
        </p>
        <h2
          id="ranking-explorer-heading"
          className="font-display mt-3 text-4xl font-normal tracking-[-0.02em] text-ink text-balance sm:text-5xl"
        >
          {COPY.title}
        </h2>
        <p className="mt-4 text-lg text-muted">{COPY.description}</p>
      </div>
    </div>
  );
}

function PinnedExplorer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  // becomes true once the user lands on the stage: the first row's count
  // plays then, not while the section is still sliding in
  const [landed, setLanded] = useState(false);
  // programmatic-scroll hold: keep the requested row selected during the
  // smooth jump so intermediate rows never flash; released on arrival or
  // when the user interrupts
  const holdRef = useRef<{ index: number; target: number } | null>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // landing: the section top has come within 15% of the viewport top (the
  // stage is essentially in place; stopping a few px short still counts)
  const { scrollYProgress: arrival } = useScroll({
    target: wrapperRef,
    offset: ["start 15%", "start start"],
  });
  useMotionValueEvent(arrival, "change", (q) => {
    if (q > 0 && !landed) setLanded(true);
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    }

    const hold = holdRef.current;
    if (hold) {
      if (Math.abs(p - hold.target) < 0.02) holdRef.current = null;
      setActive(hold.index);
      return;
    }
    setActive(indexAt(p));
  });

  useEffect(() => {
    const cancel = () => {
      holdRef.current = null;
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, []);

  const selectRow = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    holdRef.current = { index: i, target: TARGETS[i] };
    setActive(i);
    window.scrollTo({ top: top + range * TARGETS[i], behavior: "smooth" });
  };

  return (
    // 100svh stage + 80svh of scroll per row: every ranking holds for most
    // of a screen before the next one takes over (the last holds until release)
    <div ref={wrapperRef} className="relative mb-14 h-[500svh]">
      <div className="sticky top-0 flex h-svh flex-col pt-[5.25rem] pb-4">
        <div className="mx-auto flex w-full max-w-[1160px] min-h-0 flex-1 flex-col justify-center px-6 sm:px-8">
          <div className="mb-6 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-12">
            <div>
              <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                {COPY.eyebrow}
              </p>
              <h2
                id="ranking-explorer-heading"
                className="font-display mt-1 text-3xl font-normal tracking-[-0.02em] text-ink text-balance xl:text-4xl"
              >
                {COPY.title}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end lg:text-right">
              {COPY.description}
            </p>
          </div>
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
            <div className="flex flex-col">
              <EvidenceTable active={active} onSelect={selectRow} />
              <div className="mt-6">
                <Links />
              </div>
            </div>
            <div className="flex flex-col">
              <Panel active={active} progressRef={progressFillRef} landed={landed} />
              <p className="mt-3 text-right text-[11px] text-muted/50">{COPY.sourceNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Static mode: mobile, short screens, reduced motion, and the no-JS baseline. */
function StaticExplorer() {
  const [active, setActive] = useState(0);
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 pb-20 sm:px-8 sm:pb-24">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div>
          <EvidenceTable active={active} onSelect={setActive} />
          <div className="mt-6">
            <Links />
          </div>
        </div>
        <div>
          <Panel active={active} />
          <p className="mt-3 text-[11px] text-muted/50 lg:text-right">{COPY.sourceNote}</p>
        </div>
      </div>
    </div>
  );
}

export function RankingExplorer() {
  const reduce = useReducedMotion();
  const [pinnable, setPinnable] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      // pin only when the full stage fits below the header
      setPinnable(window.innerWidth >= 1100 && window.innerHeight >= 680);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const pinned = pinnable && !reduce;

  return (
    <section
      id="ranking-explorer"
      aria-labelledby="ranking-explorer-heading"
      className="bg-navy"
    >
      <MotionProvider>
        {pinned ? (
          <PinnedExplorer />
        ) : (
          <>
            <Intro />
            <StaticExplorer />
          </>
        )}
      </MotionProvider>
    </section>
  );
}
