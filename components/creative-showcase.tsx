import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { creativeCapabilities } from "@/lib/site";

function TransformationVisual() {
  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="overflow-hidden rounded-xl">
        <Image
          src="/images/standard-product-photo.png"
          alt="A standard e-commerce product photograph"
          width={1024}
          height={1024}
          className="h-auto w-full"
          sizes="(min-width: 640px) 40vw, 100vw"
        />
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <svg
            viewBox="0 0 48 48"
            className="h-12 w-12 text-electric sm:h-14 sm:w-14"
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
          <p className="text-center font-mono text-[11px] tracking-[0.18em] text-electric uppercase">
            AI Creative
            <br />
            Direction
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl">
        <Image
          src="/images/enhanced-creative.png"
          alt="Enhanced campaign creative with lifestyle photography"
          width={1024}
          height={1024}
          className="h-auto w-full"
          sizes="(min-width: 640px) 40vw, 100vw"
        />
      </div>
    </div>
  );
}

export function CreativeShowcase() {
  return (
    <section
      id="creative"
      aria-labelledby="creative-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            AI-Powered Creative Production
          </p>
          <h2
            id="creative-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-4xl"
          >
            Creative production without the six-figure budget.
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
            <p>
              AI-assisted creative workflows produce campaign-quality visuals
              at a fraction of traditional cost, so you compete visually with
              companies that outspend you ten to one.
            </p>
            <p>
              The value is not generating images. The value is knowing what
              imagery should be created, why it should exist, and how it shapes
              the customer&apos;s perception of the brand.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <TransformationVisual />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto]">
          <div className="rounded-xl border border-white/10 bg-navy-mid p-6 sm:p-8">
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
          <div className="flex items-center">
            <ButtonLink href="/#contact" variant="secondary">
              Talk to Apereel
            </ButtonLink>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-muted">
          All creative examples shown are concept demonstrations unless
          otherwise noted.
        </p>
      </Container>
    </section>
  );
}
