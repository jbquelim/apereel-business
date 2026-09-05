import { Container } from "@/components/container";

export function GrowthProof() {
  return (
    <section
      id="growth-proof"
      aria-labelledby="growth-proof-heading"
      className="reveal-section bg-ink py-24 sm:py-32"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
              <p className="mb-6 text-[11px] font-semibold tracking-[0.18em] text-navy/40 uppercase">
                Organic Search Traffic, E-commerce Retailer
              </p>
              <svg
                viewBox="0 0 580 270"
                className="w-full"
                role="img"
                aria-label="Organic traffic growth chart showing 268% growth from September 2022 to August 2026"
              >
                <defs>
                  <linearGradient
                    id="chart-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgba(61,158,255,0.25)" />
                    <stop offset="100%" stopColor="rgba(61,158,255,0)" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line
                  x1="40"
                  y1="60"
                  x2="540"
                  y2="60"
                  stroke="rgba(7,14,28,0.06)"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="120"
                  x2="540"
                  y2="120"
                  stroke="rgba(7,14,28,0.06)"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="180"
                  x2="540"
                  y2="180"
                  stroke="rgba(7,14,28,0.06)"
                  strokeWidth="1"
                />

                {/* X-axis */}
                <line
                  x1="40"
                  y1="238"
                  x2="540"
                  y2="238"
                  stroke="rgba(7,14,28,0.1)"
                  strokeWidth="1"
                />

                {/* Starting baseline dashed reference */}
                <line
                  x1="40"
                  y1="179"
                  x2="540"
                  y2="179"
                  stroke="rgba(7,14,28,0.1)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x="544"
                  y="183"
                  fill="rgba(7,14,28,0.3)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  baseline
                </text>

                {/* Gradient fill under curve */}
                <path
                  d="M 40 179 C 130 170, 200 148, 290 115 S 430 48, 540 22 L 540 238 L 40 238 Z"
                  fill="url(#chart-fill)"
                  className="growth-chart-fill"
                />

                {/* Growth curve */}
                <path
                  d="M 40 179 C 130 170, 200 148, 290 115 S 430 48, 540 22"
                  fill="none"
                  stroke="#3d9eff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="growth-chart-line"
                />

                {/* Start point */}
                <circle
                  cx="40"
                  cy="179"
                  r="3"
                  fill="rgba(7,14,28,0.3)"
                  className="growth-chart-dot"
                />

                {/* End point */}
                <circle
                  cx="540"
                  cy="22"
                  r="8"
                  fill="rgba(61,158,255,0.15)"
                  className="growth-chart-dot"
                />
                <circle
                  cx="540"
                  cy="22"
                  r="4"
                  fill="#3d9eff"
                  className="growth-chart-dot"
                />

                {/* Year labels */}
                <text
                  x="40"
                  y="256"
                  fill="rgba(7,14,28,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2022
                </text>
                <text
                  x="165"
                  y="256"
                  fill="rgba(7,14,28,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2023
                </text>
                <text
                  x="290"
                  y="256"
                  fill="rgba(7,14,28,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2024
                </text>
                <text
                  x="415"
                  y="256"
                  fill="rgba(7,14,28,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2025
                </text>
                <text
                  x="510"
                  y="256"
                  fill="rgba(7,14,28,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2026
                </text>
              </svg>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
              Result
            </p>
            <h2
              id="growth-proof-heading"
              className="font-display mt-4 text-3xl text-navy sm:text-4xl"
            >
              Traffic grew 270%.
              <br />
              Revenue grew 20X.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-navy/60">
              Four years managing digital growth for an e-commerce
              retailer. Organic traffic nearly quadrupled. But revenue grew
              twenty times, because the business got stronger, not just the
              SEO.
            </p>
            <div className="mt-10 flex flex-wrap gap-8 border-t border-navy/10 pt-8 sm:gap-12">
              <div>
                <p className="font-display text-3xl text-navy sm:text-4xl">
                  20X
                </p>
                <p className="mt-1 text-[12px] tracking-[0.1em] text-navy/60 uppercase">
                  Revenue Growth
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-navy sm:text-4xl">
                  270%
                </p>
                <p className="mt-1 text-[12px] tracking-[0.1em] text-navy/60 uppercase">
                  Organic Traffic Growth
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-electric sm:text-4xl">
                  165%
                </p>
                <p className="mt-1 text-[12px] tracking-[0.1em] text-navy/60 uppercase">
                  SEO Value Growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
