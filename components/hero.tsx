import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { CountUp } from "@/components/count-up";
import { site } from "@/lib/site";

const STATS = [
  { value: "12+", label: "Years Digital Marketing" },
  { value: "1,000+", label: "Keywords Ranked Top 5" },
  { value: "20X", label: "Revenue Growth" },
];

export function Hero() {
  // One highlighted element per view: the leading metric of line 2.
  const [highlight, ...rest] = site.headlineLine2.split(" ");
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-end pt-28 pb-16 sm:pb-20 lg:pb-24"
    >
      <Container className="relative">
        <p className="animate-rise font-mono text-[13px] tracking-[0.08em] text-muted uppercase">
          A digital growth consultancy for e-commerce businesses
        </p>
        <h1 className="animate-rise text-display mt-6 max-w-6xl text-ink">
          {site.headline}
          <br />
          <span className="text-electric">{highlight}</span> {rest.join(" ")}
        </h1>
        <p className="animate-rise-delay-1 mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl whitespace-pre-line">
          {site.supporting}
        </p>
        <div className="animate-rise-delay-2 mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8 sm:gap-16">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl text-ink sm:text-5xl">
                <CountUp value={s.value} />
              </p>
              <p className="mt-2 font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="animate-rise-delay-3 mt-14 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/#contact">Tell Us About Your Business</ButtonLink>
          <ButtonLink href="/#approach" variant="secondary">
            Our Approach
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
