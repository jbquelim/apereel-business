import { Container } from "@/components/container";
import { site } from "@/lib/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            About Apereel
          </p>
          <h2
            id="about-heading"
            className="font-display mt-4 text-3xl text-ink sm:text-4xl"
          >
            A strategic growth partner, not a technical marketing vendor.
          </h2>
        </div>
        <div className="space-y-6 text-base leading-relaxed text-muted lg:col-span-8 lg:pt-8">
          <p>
            Apereel combines business strategy, digital marketing, e-commerce, web
            development, SEO, UX, advertising, and AI to solve real business
            problems. The work starts with the commercial reality of the company
            — what it sells, who it serves, and why a customer should choose it.
          </p>
          <p>
            We are not a traditional SEO or content agency. Technical SEO such as
            metadata, headings, URLs, schema, site structure, and performance are
            fundamentals. They are expected. They are not the strategy.
          </p>
          <p>
            The competitive advantage comes from understanding what makes a
            business genuinely better for customers, then translating that
            strength into a stronger digital presence.{" "}
            <span className="text-ink">
              {site.secondary}
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
