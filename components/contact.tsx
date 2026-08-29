import { Container } from "@/components/container";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-white/10 py-20 sm:py-28"
    >
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Contact
          </p>
          <h2
            id="contact-heading"
            className="font-display mt-4 text-3xl text-ink text-balance sm:text-5xl"
          >
            Let&apos;s grow what already makes your business strong.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Share the context. We will look at the business first — then the
            digital work that can amplify it.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
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
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
