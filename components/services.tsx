import { Container } from "@/components/container";
import { serviceGroups } from "@/lib/site";

export function Services() {
  let counter = 0;
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Services
          </p>
          <h2
            id="services-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-5xl"
          >
            Work defined by business outcomes.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Each engagement is built around commercial results — stronger
            offers, clearer experiences, better visibility, and systems that
            scale what already works.
          </p>
        </div>
        <div className="mt-14 space-y-10">
          {serviceGroups.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                {group.label}
              </p>
              <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
                {group.services.map((service) => {
                  counter++;
                  return (
                    <li
                      key={service.title}
                      className="bg-navy-mid p-7 transition-colors duration-300 hover:bg-navy-lift"
                    >
                      <p className="font-mono text-[11px] tracking-[0.2em] text-electric">
                        {String(counter).padStart(2, "0")}
                      </p>
                      <h3 className="mt-4 text-[15px] font-semibold leading-snug text-ink">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-[13px] leading-relaxed text-muted">
                        {service.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
