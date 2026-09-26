import Image from "next/image";
import Link from "next/link";
import { principles, site } from "@/lib/site";

// About Apereel: the message leads, the founder signs it. Calm editorial
// layout on ivory; a single restrained reveal, no pinning or counters.
// Blue text uses #1a5fb8 (≈5.5:1 on ivory); electric-deep is only ≈4.4:1.

const HEADING = ["Business insight.", "Creative ambition.", "Practical execution."];

const VALUES = ["Business growth", "Quality production", "Faster delivery"];

// The site has no dedicated packages page; the services page is where the
// capabilities the copy calls "packages" are presented.
const PACKAGES_HREF = "/services";

export function Founder() {
  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="about-apereel reveal-section bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[45fr_55fr] lg:gap-x-20">
          {/* Left: the message, then a discreet signature */}
          <div className="reveal-stagger [container-type:inline-size]">
            <p className="font-mono text-[11px] font-semibold tracking-[0.28em] text-[#1a5fb8] uppercase">
              About Apereel
            </p>
            <h1
              id="founder-heading"
              className="font-display mt-6 text-[min(3.6rem,9.2cqi)] leading-[1.04] font-medium tracking-[-0.035em] text-navy"
            >
              {HEADING.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <span aria-hidden="true" className="mt-9 block h-px w-14 bg-electric-deep" />
            <p className="mt-7 max-w-[26ch] text-[clamp(1.3rem,1.9vw,1.6rem)] leading-[1.4] text-navy/80">
              Better marketing starts with understanding why customers should choose you.
            </p>
            <div className="mt-10 flex items-center gap-5">
              <Image
                src="/images/john-lim.png"
                alt={`Portrait of ${site.founder.name}`}
                width={1254}
                height={1254}
                sizes="72px"
                className="h-[72px] w-[72px] shrink-0 rounded-[4px] object-cover"
              />
              <div>
                <p className="text-[17px] font-medium text-navy">{site.founder.name}</p>
                <p className="mt-0.5 text-[15px] text-navy/60">Founder, Apereel</p>
              </div>
            </div>
          </div>

          {/* Right: the story, four paragraphs */}
          <div
            className="reveal-stagger space-y-7 text-[17px] leading-[1.75] text-navy/70 sm:text-[18px] lg:pt-1"
            style={{ transitionDelay: "80ms" }}
          >
            <p>
              Across decades in the industry, I’ve built and grown successful businesses in both
              B2B and B2C. That experience has shaped how I approach marketing: understand the
              customer, strengthen the offer, and make it easier for people to choose you.
            </p>
            <p>
              Apereel brings that thinking together with research, digital strategy, technology,
              and creative production. Our packages connect the capabilities your business needs,
              from SEO and advertising to website development, conversion optimization, and
              creative work supported by AI.
            </p>
            <p>
              <span className="font-medium text-navy">
                Our aim is to deliver marketing that grows your business, with high quality
                creative production at a more affordable cost and a faster pace.
              </span>{" "}
              We streamline workflows, reduce unnecessary handoffs, and use AI where it adds
              value. This helps you launch sooner, test more ideas, and improve without the
              overhead of a traditional agency model.
            </p>
            <p>
              Every engagement starts with a practical question: what would make the biggest
              difference to your business? We shape the work around the answer.
            </p>
          </div>
        </div>

        {/* Value statements: three understated labels between fine rules */}
        <ul
          className="reveal-stagger mt-16 grid border-y border-navy/15 py-6 sm:grid-cols-3 lg:mt-20"
          style={{ transitionDelay: "160ms" }}
        >
          {VALUES.map((value, i) => (
            <li
              key={value}
              className={
                i > 0
                  ? "border-t border-navy/10 py-3 sm:border-t-0 sm:border-l sm:border-navy/15 sm:py-2 sm:text-center"
                  : "py-3 sm:py-2 sm:text-center"
              }
            >
              <span className="text-[17px] text-navy sm:text-[18px]">{value}</span>
            </li>
          ))}
        </ul>

        {/* Principles: all six, 01–02 / 03–04 / 05–06 on desktop */}
        <div className="reveal-stagger mt-12 lg:mt-14" style={{ transitionDelay: "200ms" }}>
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.28em] text-[#1a5fb8] uppercase">
            Principles
          </h2>
          <ol className="mt-6 grid border-b border-navy/15 lg:grid-cols-2 lg:gap-x-16">
            {principles.map((principle, i) => (
              <li
                key={principle}
                className={
                  "relative grid grid-cols-[3.5rem_1fr] items-start gap-5 border-t border-navy/15 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-6" +
                  // a fine column rule beside the right-hand principles
                  (i % 2 === 1
                    ? " lg:pl-16 lg:before:absolute lg:before:top-7 lg:before:bottom-7 lg:before:left-0 lg:before:w-px lg:before:bg-navy/15 lg:before:content-['']"
                    : "")
                }
              >
                <span className="font-display text-[2.4rem] leading-none font-normal tracking-[-0.02em] text-[#1a5fb8] tabular-nums sm:text-[2.8rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[30ch] pt-1 text-[18px] leading-[1.55] text-navy sm:text-[19px]">
                  {principle}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Final CTA */}
        <div className="mt-10 flex lg:justify-end">
          <Link
            href={PACKAGES_HREF}
            className="press-scale inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#1a5fb8] px-6 text-[15px] font-medium text-[#1a5fb8] transition-colors duration-200 hover:bg-[#1a5fb8] hover:text-white"
          >
            Explore our packages
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
