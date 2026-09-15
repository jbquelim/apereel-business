import { Container } from "@/components/container";
import { principles } from "@/lib/site";

export function Principles() {
  return (
    <section
      id="principles"
      aria-labelledby="principles-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container>
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
          Principles
        </p>
        <h2
          id="principles-heading"
          className="font-display mt-4 max-w-xl text-4xl font-normal tracking-[-0.02em] text-ink sm:text-5xl"
        >
          Six rules. Zero exceptions.
        </h2>
        <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {principles.map((principle, index) => (
            <li
              key={principle}
              className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <span className="font-mono text-[11px] tracking-[0.22em] text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-2xl text-ink sm:text-4xl">
                {principle}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
