import { Container } from "@/components/container";
import Image from "next/image";

const rankings = [
  {
    label: "Global watch brand",
    position: 3,
    kd: 51,
    difficulty: "Very Hard",
    volume: "33,100",
  },
  {
    label: "Broad industry term",
    position: 5,
    kd: 50,
    difficulty: "Very Hard",
    volume: "22,200",
  },
  {
    label: "International luxury brand",
    position: 2,
    kd: 44,
    difficulty: "Hard",
    volume: "135,000",
  },
  {
    label: "Luxury brand name",
    position: 2,
    kd: 42,
    difficulty: "Hard",
    volume: "33,100",
  },
  {
    label: "Primary product category",
    position: 1,
    kd: 34,
    difficulty: "Hard",
    volume: "12,100",
  },
  {
    label: "Premium brand name",
    position: 2,
    kd: 33,
    difficulty: "Hard",
    volume: "27,100",
  },
];

export function KeywordPerformance() {
  return (
    <section
      id="keyword-performance"
      aria-labelledby="kd-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        {/* --- Two-column: header+cards left, screenshot right --- */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: header + keyword cards */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
              Search Visibility
            </p>
            <h2
              id="kd-heading"
              className="font-display mt-4 text-3xl text-navy sm:text-4xl"
            >
              Ranking Against the Market Leaders
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
              <p>
                Ranking on page 1 for the searches that drive revenue,
                <br />
                including terms where even established retailers
                <br />
                struggle to appear.
              </p>
              <p>
                These rankings were built with inventory depth
                <br />
                and business strength, not backlink campaigns.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {rankings.map((r) => (
                <div
                  key={r.label}
                  className="rounded-xl border border-navy/10 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <p
                      className={`font-display text-3xl ${r.position === 1 ? "text-electric" : "text-ink"}`}
                    >
                      #{r.position}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        r.difficulty === "Very Hard"
                          ? "bg-signal/10 text-signal"
                          : "bg-electric/10 text-electric"
                      }`}
                    >
                      {r.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink">{r.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    {r.volume} people search this every month
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-md text-xs leading-relaxed text-muted/60">
              Difficulty ratings reflect how competitive each search term is.
              &ldquo;Very Hard&rdquo; means even large, established brands
              struggle to reach page 1. Data via Semrush. Results for a luxury
              e-commerce retailer.
            </p>
          </div>

          {/* Right: ranking positions screenshot + text below */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
              <Image
                src="/images/ranking-positions.png"
                alt="Strong ranking positions across competitive commercial searches with search terms obscured"
                width={1060}
                height={1023}
                className="w-full"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">
                Visibility Where Demand Exists
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Strong positions across highly competitive searches with
                meaningful customer demand. Search terms have been intentionally
                obscured to protect confidential business information.
              </p>
              <p className="mt-3 text-[11px] tracking-[0.1em] text-muted/60 italic">
                Search terms obscured to protect confidential business data.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
