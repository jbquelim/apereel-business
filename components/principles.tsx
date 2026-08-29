import { Container } from "@/components/container";
import { principles } from "@/lib/site";

export function Principles() {
  return (
    <section
      id="principles"
      aria-labelledby="principles-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          Principles
        </p>
        <h2
          id="principles-heading"
          className="font-display mt-4 max-w-xl text-3xl text-ink sm:text-4xl"
        >
          How the work is judged.
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
