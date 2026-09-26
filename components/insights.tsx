import { Container } from "@/components/container";
import { perspectives } from "@/lib/site";

// "Before we start" — editorial two-column list: an introduction on the
// left, numbered questions with their answers always visible on the right.
export function Perspectives() {
  return (
    <section
      id="perspectives"
      aria-labelledby="perspectives-heading"
      className="reveal-section bg-ink py-24 sm:py-32 lg:py-10"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-20 lg:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.24em] text-electric-deep uppercase">
              Before we start
            </p>
            <h2
              id="perspectives-heading"
              className="font-display mt-5 text-4xl leading-[1.02] font-medium tracking-[-0.035em] text-navy text-balance sm:text-5xl lg:text-[3rem]"
            >
              The questions your current agency isn&rsquo;t asking.
            </h2>
            <p className="mt-6 max-w-xs text-lg leading-snug text-navy/80">
              These should come up before any marketing plan.
            </p>
            <span aria-hidden="true" className="mt-8 block h-0.5 w-12 bg-electric-deep" />
          </div>

          <ol className="border-t border-navy/20">
            {perspectives.map((item, i) => (
              <li
                key={item.title}
                className="reveal-stagger grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-5 border-b border-navy/20 py-8 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-8 sm:py-10 lg:grid-cols-[4rem_minmax(0,1fr)] lg:py-5"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-4xl leading-none font-light tracking-[-0.04em] text-electric-deep tabular-nums sm:text-6xl lg:text-5xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-[10px] font-medium tracking-[0.24em] text-navy/70 uppercase">
                    {item.category}
                  </p>
                  <h3 className="font-display mt-2.5 text-2xl leading-[1.15] font-medium tracking-[-0.02em] text-navy text-balance sm:text-[2rem] lg:mt-2 lg:text-[1.4rem]">
                    {item.title}
                  </h3>
                  <div className="mt-4 max-w-[46ch] space-y-3 text-[1.05rem] leading-relaxed text-navy/75 sm:text-lg lg:mt-2 lg:max-w-[62ch] lg:space-y-1.5 lg:text-[0.95rem] lg:leading-normal">
                    {item.answer.split("\n\n").map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
