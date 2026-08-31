import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-screen flex-col justify-end overflow-hidden pt-28 pb-16 sm:pb-20 lg:pb-24"
    >
      <Image
        src="/images/hero-bg.png"
        alt="Digital growth strategy visualization representing e-commerce SEO and business optimization"
        fill
        priority
        className="pointer-events-none object-cover object-right-bottom"
        sizes="100vw"
      />
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <Container className="relative">
        <h1 className="animate-rise font-display max-w-5xl text-[2.75rem] leading-[1.05] text-ink sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          {site.headline}
          <br />
          <span className="text-electric">{site.headlineLine2}</span>
        </h1>
        <p className="animate-rise-delay-1 mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl whitespace-pre-line">
          {site.supporting}
        </p>
        <p className="animate-rise-delay-1 mt-4 text-sm tracking-wide text-electric/80">
          For established e-commerce businesses ready for real growth.
        </p>
        <div className="animate-rise-delay-2 mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8 sm:gap-14">
          <div>
            <p className="font-display text-3xl text-ink sm:text-4xl">12+</p>
            <p className="mt-1 text-[12px] tracking-[0.1em] text-muted uppercase">
              Years Digital Marketing
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink sm:text-4xl">1,000+</p>
            <p className="mt-1 text-[12px] tracking-[0.1em] text-muted uppercase">
              Keywords Ranked Top 5
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink sm:text-4xl">20X</p>
            <p className="mt-1 text-[12px] tracking-[0.1em] text-muted uppercase">
              Revenue Growth
            </p>
          </div>
        </div>
        <div className="animate-rise-delay-3 mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/#contact">Tell Us About Your Business</ButtonLink>
          <ButtonLink href="/#approach" variant="secondary">
            Our Approach
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
