import { Container } from "@/components/container";
import { perspectives } from "@/lib/site";

export function Perspectives() {
  return (
    <section
      id="perspectives"
      aria-labelledby="perspectives-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Perspectives
          </p>
          <h2
            id="perspectives-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-4xl"
          >
            Thinking that shapes the work.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Observations from years of managing e-commerce growth, competitive
            analysis, and business-first digital strategy.
          </p>
        </div>
        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {perspectives.map((item) => (
            <li
              key={item.title}
              className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <div className="flex items-start gap-4 sm:items-center">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-electric/60 sm:mt-0"
                  aria-hidden="true"
                />
                <p className="font-display text-lg text-ink sm:text-xl">
                  {item.title}
                </p>
              </div>
              <span className="ml-5.5 shrink-0 font-mono text-[10px] tracking-[0.18em] text-muted uppercase sm:ml-0">
                {item.category}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
