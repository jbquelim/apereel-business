import Image from "next/image";
import { Container } from "@/components/container";
import { site, principles } from "@/lib/site";

export function Founder() {
  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="reveal-section py-24 sm:py-32"
    >
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative max-w-sm overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="/images/john-lim.png"
              alt={site.founder.name}
              width={1254}
              height={1254}
              sizes="(min-width: 1024px) 420px, 100vw"
              className="aspect-square w-full object-contain"
              priority={false}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 via-navy/40 to-transparent px-8 pt-16 pb-8">
              <p className="font-display text-3xl text-ink sm:text-4xl">
                {site.founder.name}
              </p>
              <p className="mt-2 text-sm text-ink/70">{site.founder.title}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                Email
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 inline-block text-ink transition-colors hover:text-electric"
              >
                {site.email}
              </a>
            </li>
            <li>
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                LinkedIn
              </p>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-ink transition-colors hover:text-electric"
              >
                linkedin.com/in/jblim
              </a>
            </li>
          </ul>
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
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <p className="font-display text-xl italic text-ink">
              &ldquo;{site.founder.philosophy}&rdquo;
            </p>
          </div>

        </div>

        {/* Principles */}
        <div className="lg:col-span-12 mt-12 border-t border-white/10 pt-10">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Principles
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle, index) => (
              <li
                key={principle}
                className="stagger-item flex items-baseline gap-4"
              >
                <span className="font-mono text-[11px] tracking-[0.22em] text-signal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-base text-ink">
                  {principle}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
