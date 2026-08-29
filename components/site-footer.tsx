import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Digital growth consultancy. Business-first SEO, e-commerce,
            advertising, AI-powered development, and creative production —
            built around what already makes a business strong.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
            Navigate
          </p>
          <ul className="mt-4 space-y-3">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink/90 transition-colors hover:text-electric"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-ink/90 transition-colors hover:text-electric"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/90 transition-colors hover:text-electric"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-ink/90 transition-colors hover:text-electric"
              >
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-white/10 py-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Apereel. All rights reserved.</p>
        <p className="tracking-[0.12em] uppercase">
          Business before algorithms.
        </p>
      </Container>
    </footer>
  );
}
