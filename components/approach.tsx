import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { approach } from "@/lib/site";

export function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            The Apereel Method
          </p>
          <h2
            id="approach-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            Discover. Strengthen. Translate. Amplify. Optimize.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            A repeatable system for digital growth. We do not start with
            tactics. We start with the business, then use marketing, technology,
            and experience to amplify what is already true.
          </p>
        </div>
        <ol className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {approach.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-4 py-10 sm:grid-cols-12 sm:items-baseline"
            >
              <p className="font-mono text-[12px] tracking-[0.22em] text-electric sm:col-span-2">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display text-2xl text-ink sm:col-span-3 sm:text-3xl">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-muted sm:col-span-7">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <ButtonLink href="/#contact" variant="secondary">
            Find Your Growth Opportunity
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
