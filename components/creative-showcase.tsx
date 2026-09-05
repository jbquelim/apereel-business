import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { creativeCapabilities } from "@/lib/site";

function TransformationVisual() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
      <div className="overflow-hidden rounded-xl">
        <Image
          src="/images/standard-product-photo.png"
          alt="A standard e-commerce product photograph — single handbag on plain background"
          width={1024}
          height={1024}
          className="h-auto w-full"
          sizes="(min-width: 640px) 33vw, 100vw"
        />
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

      <div className="overflow-hidden rounded-xl">
        <Image
          src="/images/enhanced-creative.png"
          alt="Enhanced campaign creative — lifestyle photography with the product in context"
          width={1024}
          height={1024}
          className="h-auto w-full"
          sizes="(min-width: 640px) 33vw, 100vw"
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
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
              Visual Strategy
            </p>
            <h2
              id="creative-heading"
              className="font-display mt-4 text-3xl text-ink sm:text-4xl"
            >
              Once we know your competitive advantage, we make it visible.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              AI-assisted creative workflows produce campaign-quality visuals
              at a fraction of traditional cost. The value is not generating
              images — it&apos;s knowing what imagery should exist, and how it
              communicates why customers should choose your business.
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
