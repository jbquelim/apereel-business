"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import { cn } from "@/lib/cn";

type Scores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
};

type Vitals = {
  lcp: string | null;
  cls: string | null;
  fcp: string | null;
  si: string | null;
  tbt: string | null;
  tti: string | null;
};

type Meta = {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  h1: string | null;
  h1Count: number;
  hasCanonical: boolean;
  hasOgTags: boolean;
  hasTwitterCards: boolean;
  hasSchemaMarkup: boolean;
  hasViewport: boolean;
  isHttps: boolean;
  robotsMeta: string | null;
  imageCount: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
};

type Keyword = {
  keyword: string;
  intent: "N" | "C" | "I" | "T";
  position: number;
  volume: string;
  cpc: number;
  traffic: number;
};

type Competitor = {
  name: string;
  domain: string;
  strength: string;
};

type Channel = {
  name: string;
  percentage: number;
};

type IndustryAnalysis = {
  industry: string;
  subIndustry: string;
  competitors: Competitor[];
  insight: string;
  channels: Channel[];
  topPlayer: string;
  keywords: Keyword[];
  totalKeywords: number;
} | null;

type TrendPoint = {
  date: string;
  values: number[];
};

type TrendsData = {
  keywords: string[];
  timeline: TrendPoint[];
} | null;

type AuditData = {
  url: string;
  scores: Scores;
  vitals: Vitals;
  meta: Meta;
  industry: IndustryAnalysis;
  trends: TrendsData;
};

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  if (score === null) return null;
  const color =
    score >= 90
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-red-400";
  const strokeColor =
    score >= 90
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-amber-400"
        : "stroke-red-400";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/10"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000", strokeColor)}
            style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-display text-xl font-bold",
            color,
          )}
        >
          {score}
        </span>
      </div>
      <span className="text-[11px] tracking-[0.12em] text-muted uppercase">
        {label}
      </span>
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-navy px-4 py-3">
      <p className="text-[11px] tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-lg text-ink">{value}</p>
    </div>
  );
}

const CHANNEL_COLORS: Record<string, string> = {
  "Direct": "bg-indigo-500",
  "AI Traffic": "bg-purple-400",
  "Referral": "bg-emerald-400",
  "Organic Search": "bg-red-400",
  "Google AI Mode": "bg-amber-400",
  "Paid Search": "bg-pink-400",
  "Social": "bg-sky-400",
  "Email": "bg-orange-400",
  "Display": "bg-gray-400",
  "Other": "bg-gray-500",
};

function ChannelBar({ channel, maxPct }: { channel: Channel; maxPct: number }) {
  const barColor = CHANNEL_COLORS[channel.name] ?? "bg-gray-400";
  const widthPct = (channel.percentage / maxPct) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{channel.name}</span>
        <span className="font-mono text-[13px] font-bold text-ink">{channel.percentage}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5">
        <div
          className={cn("h-2.5 rounded-full transition-all duration-1000", barColor)}
          style={{
            width: `${widthPct}%`,
            transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>
    </div>
  );
}

const TREND_COLORS = [
  "#3d9eff",
  "#a78bfa",
  "#f472b6",
  "#34d399",
];

function TrendChart({ trends }: { trends: TrendsData }) {
  if (!trends || trends.timeline.length < 2) return null;

  const { keywords, timeline } = trends;
  const W = 600;
  const H = 200;
  const PAD_X = 0;
  const PAD_Y = 10;

  const allValues = timeline.flatMap((p) => p.values);
  const maxVal = Math.max(...allValues, 1);

  function buildPath(seriesIdx: number): string {
    const points = timeline.map((p, i) => {
      const x = PAD_X + (i / (timeline.length - 1)) * (W - PAD_X * 2);
      const y = PAD_Y + (1 - p.values[seriesIdx] / maxVal) * (H - PAD_Y * 2);
      return `${x},${y}`;
    });
    return `M${points.join("L")}`;
  }

  const dateLabels = [
    timeline[0].date,
    timeline[Math.floor(timeline.length / 2)].date,
    timeline[timeline.length - 1].date,
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {keywords.map((kw, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TREND_COLORS[i % TREND_COLORS.length] }}
            />
            <span className="text-[12px] text-muted">{kw}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H + 24}`}
          className="w-full"
          preserveAspectRatio="none"
          aria-label="Search interest trend chart"
        >
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = PAD_Y + (1 - pct / 100) * (H - PAD_Y * 2);
            return (
              <line
                key={pct}
                x1={PAD_X}
                y1={y}
                x2={W - PAD_X}
                y2={y}
                stroke="white"
                strokeOpacity={0.05}
              />
            );
          })}
          {keywords.map((_, i) => (
            <path
              key={i}
              d={buildPath(i)}
              fill="none"
              stroke={TREND_COLORS[i % TREND_COLORS.length]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          ))}
          {dateLabels.map((label, i) => {
            const x =
              i === 0 ? PAD_X + 4 : i === 1 ? W / 2 : W - PAD_X - 4;
            return (
              <text
                key={i}
                x={x}
                y={H + 18}
                fill="white"
                fillOpacity={0.3}
                fontSize="11"
                textAnchor={i === 0 ? "start" : i === 1 ? "middle" : "end"}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const INTENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  N: { label: "N", color: "text-purple-300", bg: "bg-purple-400/20" },
  C: { label: "C", color: "text-amber-300", bg: "bg-amber-400/20" },
  I: { label: "I", color: "text-sky-300", bg: "bg-sky-400/20" },
  T: { label: "T", color: "text-emerald-300", bg: "bg-emerald-400/20" },
};

function AuditResults({ data }: { data: AuditData }) {
  const hasScores = Object.values(data.scores).some((s) => s !== null);
  const hasVitals = Object.values(data.vitals).some((v) => v !== null);

  return (
    <div className="tab-content mt-10 space-y-8">
      <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              Audit Results
            </p>
            <p className="mt-1 font-mono text-sm text-muted break-all">
              {data.url}
            </p>
          </div>
          {data.industry && data.industry.totalKeywords > 0 && (
            <p className="hidden text-[12px] text-muted sm:block">
              <span className="font-medium text-ink">
                {data.industry.totalKeywords.toLocaleString()}
              </span>{" "}
              organic keywords
            </p>
          )}
        </div>

        {hasScores && (
          <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10">
            <ScoreRing score={data.scores.performance} label="Performance" />
            <ScoreRing score={data.scores.seo} label="SEO" />
            <ScoreRing score={data.scores.accessibility} label="Accessibility" />
            <ScoreRing score={data.scores.bestPractices} label="Best Practices" />
          </div>
        )}

        {hasVitals && (
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              Core Web Vitals
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <VitalCard label="Largest Contentful Paint" value={data.vitals.lcp} />
              <VitalCard label="Cumulative Layout Shift" value={data.vitals.cls} />
              <VitalCard label="Total Blocking Time" value={data.vitals.tbt} />
              <VitalCard label="First Contentful Paint" value={data.vitals.fcp} />
              <VitalCard label="Speed Index" value={data.vitals.si} />
              <VitalCard label="Time to Interactive" value={data.vitals.tti} />
            </div>
          </div>
        )}
      </div>

      {data.industry && (
        <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
            Competitive Analysis
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-electric/30 bg-electric/10 px-4 py-1.5 text-sm font-medium text-electric">
              {data.industry.industry}
            </span>
            {data.industry.subIndustry !== data.industry.industry && (
              <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
                {data.industry.subIndustry}
              </span>
            )}
          </div>

          {data.industry.insight && (
            <div className="mt-6 rounded-lg border border-electric/10 bg-electric/5 px-5 py-4">
              <p className="text-sm leading-relaxed text-ink/80">
                {data.industry.insight}
              </p>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              Top 5 Direct Competitors
            </p>
            <div className="space-y-2">
              {data.industry.competitors.map((competitor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-white/5 bg-navy px-4 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-electric/10 font-mono text-[12px] font-bold text-electric">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{competitor.name}</p>
                      <span className="hidden font-mono text-[12px] text-muted/60 sm:inline">
                        {competitor.domain}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted line-clamp-1">
                      {competitor.strength}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data.industry && data.industry.channels.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
                Market Trends & Channels
              </p>
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] tracking-wide text-muted/60 uppercase">
                Industry Estimate
              </span>
            </div>
            {data.industry.topPlayer && (
              <p className="hidden text-[12px] text-muted sm:block">
                Top market player:{" "}
                <span className="font-medium text-ink">{data.industry.topPlayer}</span>
              </p>
            )}
          </div>
          <div className="mt-6 space-y-4">
            {data.industry.channels
              .sort((a, b) => b.percentage - a.percentage)
              .map((channel, i) => (
                <ChannelBar
                  key={i}
                  channel={channel}
                  maxPct={Math.max(...data.industry!.channels.map((c) => c.percentage))}
                />
              ))}
          </div>
        </div>
      )}

      {data.trends && data.trends.timeline.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
              Search Interest — 90 Day Trend
            </p>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] tracking-wide text-emerald-400 uppercase">
              Google Trends
            </span>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Relative search interest (0–100) comparing your brand against top competitors
          </p>
          <div className="mt-5">
            <TrendChart trends={data.trends} />
          </div>
        </div>
      )}

      {data.industry && data.industry.keywords.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
                Organic Research
              </p>
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] tracking-wide text-muted/60 uppercase">
                AI Estimate
              </span>
            </div>
            {data.industry.totalKeywords > 0 && (
              <p className="text-[12px] text-muted">
                Top Organic Keywords{" "}
                <span className="font-medium text-ink">
                  {data.industry.totalKeywords.toLocaleString()}
                </span>
              </p>
            )}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] tracking-[0.1em] text-muted uppercase">
                  <th className="pb-3 pr-4 font-medium">Keyword</th>
                  <th className="pb-3 px-3 font-medium text-center">Intent</th>
                  <th className="pb-3 px-3 font-medium text-right">Pos.</th>
                  <th className="pb-3 px-3 font-medium text-right">Volume</th>
                  <th className="pb-3 px-3 font-medium text-right">CPC</th>
                  <th className="pb-3 pl-3 font-medium text-right">Traffic</th>
                </tr>
              </thead>
              <tbody>
                {data.industry.keywords.map((kw, i) => {
                  const intent = INTENT_LABELS[kw.intent] ?? INTENT_LABELS.I;
                  return (
                    <tr
                      key={i}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-electric">
                        {kw.keyword}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold",
                            intent.bg,
                            intent.color,
                          )}
                        >
                          {intent.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-ink">
                        {kw.position}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-ink">
                        {kw.volume}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted">
                        {kw.cpc.toFixed(2)}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-ink">
                        {kw.traffic.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.meta.title && (
        <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
            Search Preview
          </p>
          <div className="max-w-xl rounded-lg border border-white/5 bg-navy p-5">
            <p className="text-base text-[#8ab4f8] line-clamp-1">
              {data.meta.title}
            </p>
            <p className="mt-1 font-mono text-[13px] text-emerald-400/70 line-clamp-1">
              {data.url}
            </p>
            {data.meta.description && (
              <p className="mt-1 text-sm text-muted line-clamp-2">
                {data.meta.description}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-electric/20 bg-electric/5 p-6 sm:p-8">
        <p className="font-display text-xl text-ink">
          Want a deeper analysis?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This is a surface-level scan. A full Apereel audit covers keyword
          gaps, competitor positioning, conversion bottlenecks, and a
          prioritized action plan. Tell us about your business and we&apos;ll
          show you what&apos;s limiting your growth.
        </p>
        <a
          href="#contact"
          className="press-scale mt-4 inline-flex h-10 items-center rounded-full bg-electric px-5 text-[12px] font-semibold tracking-[0.08em] text-navy uppercase transition-colors duration-200 hover:bg-electric-deep"
        >
          Get a Full Audit
        </a>
      </div>
    </div>
  );
}

export function SiteAudit() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [data, setData] = useState<AuditData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setData(null);
    setErrorMessage("");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Unable to analyze this website.");
      }
      setData(body.data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <section
      id="audit"
      aria-labelledby="audit-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Free Website Audit
          </p>
          <h2
            id="audit-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            See how your website really performs.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Enter your URL for an instant analysis of your site&apos;s SEO
            health, performance, and technical foundation. No sign-up
            required.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your website URL"
            className="h-12 flex-1 rounded-full border border-white/12 bg-navy-mid px-5 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-electric"
            aria-label="Website URL"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="press-scale inline-flex h-12 items-center justify-center rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.08em] text-navy uppercase transition-colors duration-200 hover:bg-electric-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="60"
                    strokeDashoffset="15"
                    strokeLinecap="round"
                  />
                </svg>
                Analyzing…
              </span>
            ) : (
              "Analyze Site"
            )}
          </button>
        </form>

        {status === "loading" && (
          <div className="mt-10 flex flex-col items-center gap-4 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-electric/30 border-t-electric" />
            <p className="text-sm text-muted">
              Running performance and SEO analysis — this takes 15-30 seconds…
            </p>
          </div>
        )}

        {status === "error" && (
          <p className="mt-6 text-sm text-signal" role="alert">
            {errorMessage}
          </p>
        )}

        {status === "done" && data && <AuditResults data={data} />}
      </Container>
    </section>
  );
}
