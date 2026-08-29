import { Container } from "@/components/container";
import { experience } from "@/lib/site";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Proven Experience
          </p>
          <h2
            id="experience-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-4xl"
          >
            Selected work, described without confidential client detail.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Experience across e-commerce growth, digital transformation, and
            brand-compliant implementation — focused on outcomes the business
            can feel, not vanity metrics.
          </p>
          <div
            className="mt-10 hidden h-24 items-end gap-1.5 lg:flex"
            aria-hidden="true"
          >
            {[32, 40, 36, 52, 48, 64, 58, 72, 68, 84, 78, 96].map((height, i) => (
              <span
                key={i}
                className="w-full rounded-sm bg-electric/20"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <p className="mt-3 hidden font-mono text-[10px] tracking-[0.18em] text-muted uppercase lg:block">
            Direction of growth — illustrative, not a client metric
          </p>
        </div>
        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
          {experience.map((item) => (
            <li key={item} className="flex gap-4 py-5">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric"
                aria-hidden="true"
              />
              <p className="text-base text-ink/95">{item}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
