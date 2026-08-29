import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { creativeCapabilities } from "@/lib/site";

function TransformationVisual() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
      <div className="rounded-xl border border-white/10 bg-navy-mid p-6">
        <svg
          viewBox="0 0 200 160"
          role="img"
          aria-label="Simple product photograph representation"
          className="mx-auto h-auto w-full max-w-[180px]"
        >
          <rect
            x="30"
            y="10"
            width="140"
            height="140"
            rx="6"
            fill="#132240"
            stroke="rgba(244,241,234,0.12)"
          />
          <rect
            x="55"
            y="35"
            width="90"
            height="90"
            rx="4"
            fill="rgba(244,241,234,0.08)"
          />
          <circle
            cx="100"
            cy="80"
            r="28"
            fill="none"
            stroke="rgba(244,241,234,0.2)"
            strokeWidth="1.5"
          />
          <circle cx="100" cy="80" r="10" fill="rgba(244,241,234,0.15)" />
        </svg>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          Standard Asset
        </p>
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <svg
            viewBox="0 0 48 48"
            className="h-10 w-10 text-electric sm:h-12 sm:w-12"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M16 24h16M28 18l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-center font-mono text-[9px] tracking-[0.14em] text-electric uppercase">
            AI Creative
            <br />
            Direction
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-electric/25 bg-navy-mid p-6">
        <svg
          viewBox="0 0 200 160"
          role="img"
          aria-label="Premium campaign composition representation"
          className="mx-auto h-auto w-full max-w-[180px]"
        >
          <defs>
            <linearGradient
              id="creative-grad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#3d9eff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d45a4e" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <rect
            x="10"
            y="10"
            width="180"
            height="140"
            rx="6"
            fill="url(#creative-grad)"
            stroke="rgba(61,158,255,0.25)"
          />
          <rect
            x="20"
            y="20"
            width="76"
            height="56"
            rx="4"
            fill="rgba(61,158,255,0.12)"
          />
          <rect
            x="104"
            y="20"
            width="76"
            height="120"
            rx="4"
            fill="rgba(61,158,255,0.08)"
          />
          <rect
            x="20"
            y="84"
            width="76"
            height="56"
            rx="4"
            fill="rgba(212,90,78,0.1)"
          />
          <circle cx="58" cy="48" r="14" fill="rgba(61,158,255,0.2)" />
          <circle cx="142" cy="80" r="20" fill="rgba(61,158,255,0.15)" />
          <circle cx="142" cy="80" r="8" fill="#3d9eff" fillOpacity="0.4" />
          <rect
            x="114"
            y="115"
            width="56"
            height="8"
            rx="2"
            fill="rgba(244,241,234,0.18)"
          />
          <rect
            x="114"
            y="128"
            width="36"
            height="6"
            rx="2"
            fill="rgba(244,241,234,0.1)"
          />
        </svg>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.16em] text-electric uppercase">
          Premium Campaign Asset
        </p>
      </div>
    </div>
  );
}

export function CreativeShowcase() {
  return (
    <section
      id="creative"
      aria-labelledby="creative-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
              AI-Powered Creative Production
            </p>
            <h2
              id="creative-heading"
              className="font-display mt-4 text-3xl text-ink sm:text-4xl"
            >
              Premium creative should not be limited to enterprise production
              budgets.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              AI-assisted creative workflows allow Apereel to dramatically
              increase creative output, experimentation, and visual quality while
              reducing the cost and time required to produce professional
              campaigns.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              The value is not simply generating images. The value is knowing
              what imagery should be created, why it should exist, where it
              should be used, and how it contributes to the customer&apos;s
              perception of the brand.
            </p>
            <div className="mt-8">
              <ButtonLink href="/#contact" variant="secondary">
                Talk to Apereel
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-7">
            <TransformationVisual />

            <div className="mt-8 rounded-xl border border-white/10 bg-navy-mid p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
                Capabilities
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
                {creativeCapabilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px] text-ink/80"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-electric"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-muted">
              Give your brand the visual presence of a global company without
              requiring a global production budget. All creative examples shown
              are concept demonstrations unless otherwise noted.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
