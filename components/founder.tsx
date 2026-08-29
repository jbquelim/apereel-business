import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function Founder() {
  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex aspect-[4/5] max-w-sm flex-col justify-between rounded-2xl border border-white/10 bg-navy-mid p-8">
            <p className="text-[11px] tracking-[0.22em] text-electric uppercase">
              Founder
            </p>
            <div>
              <p className="font-display text-5xl text-ink sm:text-6xl">
                {site.founder.name.split(" ")[0]}
                <br />
                {site.founder.name.split(" ")[1]}
              </p>
              <p className="mt-6 text-sm text-muted">{site.founder.title}</p>
              <p className="mt-1 text-sm text-muted/80">
                Also currently: {site.founder.currentRole}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 lg:pt-4">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            About
          </p>
          <h2
            id="founder-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-4xl"
          >
            {site.founder.name}
          </h2>
          <p className="mt-2 text-sm tracking-wide text-muted">
            {site.founder.title}
          </p>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
            {site.founder.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="text-ink font-display text-xl italic">
              &ldquo;{site.founder.philosophy}&rdquo;
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
