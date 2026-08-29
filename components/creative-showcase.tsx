import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { creativeCapabilities } from "@/lib/site";

function TransformationVisual() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
      <div className="rounded-xl border border-white/10 bg-navy-mid p-6">
        <svg
          viewBox="0 0 200 180"
          role="img"
          aria-label="A basic product photograph — single item, plain background"
          className="mx-auto h-auto w-full max-w-[180px]"
        >
          <rect
            x="20"
            y="10"
            width="160"
            height="160"
            rx="4"
            fill="#0c1730"
            stroke="rgba(244,241,234,0.1)"
          />
          <rect
            x="50"
            y="100"
            width="100"
            height="50"
            rx="3"
            fill="rgba(244,241,234,0.06)"
          />
          <rect
            x="65"
            y="30"
            width="70"
            height="70"
            rx="35"
            fill="none"
            stroke="rgba(244,241,234,0.18)"
            strokeWidth="1.5"
          />
          <rect
            x="80"
            y="45"
            width="40"
            height="40"
            rx="20"
            fill="rgba(244,241,234,0.1)"
          />
          <rect
            x="60"
            y="155"
            width="80"
            height="4"
            rx="2"
            fill="rgba(244,241,234,0.12)"
          />
        </svg>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          Standard Product Photo
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
          viewBox="0 0 200 180"
          role="img"
          aria-label="A premium campaign layout — hero image, headline, product feature, styled composition"
          className="mx-auto h-auto w-full max-w-[180px]"
        >
          <rect
            x="10"
            y="10"
            width="180"
            height="160"
            rx="4"
            fill="#0c1730"
            stroke="rgba(61,158,255,0.2)"
          />
          <rect
            x="10"
            y="10"
            width="180"
            height="90"
            rx="4"
            fill="rgba(61,158,255,0.08)"
          />
          <rect
            x="20"
            y="20"
            width="56"
            height="6"
            rx="2"
            fill="rgba(244,241,234,0.25)"
          />
          <rect
            x="20"
            y="30"
            width="40"
            height="4"
            rx="2"
            fill="rgba(244,241,234,0.12)"
          />
          <circle cx="150" cy="60" r="28" fill="rgba(61,158,255,0.12)" />
          <circle cx="150" cy="60" r="16" fill="rgba(61,158,255,0.2)" />
          <circle cx="150" cy="60" r="6" fill="#3d9eff" fillOpacity="0.5" />
          <rect
            x="20"
            y="110"
            width="76"
            height="50"
            rx="3"
            fill="rgba(61,158,255,0.06)"
          />
          <rect
            x="104"
            y="110"
            width="76"
            height="50"
            rx="3"
            fill="rgba(212,90,78,0.06)"
          />
          <rect
            x="30"
            y="120"
            width="56"
            height="5"
            rx="2"
            fill="rgba(244,241,234,0.15)"
          />
          <rect
            x="30"
            y="130"
            width="36"
            height="4"
            rx="2"
            fill="rgba(244,241,234,0.08)"
          />
          <rect
            x="114"
            y="120"
            width="56"
            height="5"
            rx="2"
            fill="rgba(244,241,234,0.15)"
          />
          <rect
            x="114"
            y="130"
            width="36"
            height="4"
            rx="2"
            fill="rgba(244,241,234,0.08)"
          />
          <rect
            x="20"
            y="46"
            width="60"
            height="18"
            rx="9"
            fill="rgba(61,158,255,0.2)"
          />
          <rect
            x="30"
            y="52"
            width="40"
            height="6"
            rx="3"
            fill="rgba(244,241,234,0.2)"
          />
        </svg>
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.16em] text-electric uppercase">
          Campaign Creative
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
              The value is not generating images. The value is knowing what
              imagery should be created, why it should exist, and how it shapes
              the customer&apos;s perception of the brand.
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
              All creative examples shown are concept demonstrations unless
              otherwise noted.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
