import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32"
    >
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-70" />
      <Container className="relative">
        <p className="animate-rise text-[11px] font-semibold tracking-[0.28em] text-electric uppercase">
          {site.tagline}
        </p>
        <h1 className="animate-rise-delay-1 font-display mt-6 max-w-4xl text-[2.35rem] leading-[1.12] text-ink text-balance sm:text-5xl md:text-6xl lg:text-[4.35rem]">
          {site.headline}
        </h1>
        <p className="animate-rise-delay-2 mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {site.supporting}
        </p>
        <ul className="animate-rise-delay-3 mt-10 flex flex-wrap gap-2">
          {site.capabilities.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-[11px] tracking-[0.08em] text-ink/85 uppercase"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="animate-rise-delay-4 mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/#approach">Our Approach</ButtonLink>
          <ButtonLink href="/#contact" variant="secondary">
            Work With Apereel
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
