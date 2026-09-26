import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { insights } from "@/lib/insights";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Founder essays on business-first digital growth: why rankings follow business strength, and what actually moved 20X revenue growth.",
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Insights | Apereel",
    description:
      "Founder essays on business-first digital growth, written from four years of 20X revenue growth.",
  },
};

export default function InsightsPage() {
  return (
    <main id="main">
      <section className="pt-36 pb-20 sm:pb-28">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Insights
          </p>
          <h1 className="text-display mt-5 max-w-4xl text-ink">
            What four years of 20X growth actually taught us
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            Essays by {site.founder.name}, written from the work — not the
            agency playbook.
          </p>
        </Container>
      </section>

      <section className="bg-navy-mid py-20 sm:py-28">
        <Container>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {insights.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/insights/${post.slug}`}
                  className="group block py-10"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <h2 className="font-display max-w-3xl text-2xl leading-snug font-normal text-ink transition-colors group-hover:text-electric sm:text-3xl">
                      {post.title}
                    </h2>
                    <time
                      dateTime={post.datePublished}
                      className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-muted uppercase"
                    >
                      {new Date(`${post.datePublished}T00:00:00`).toLocaleDateString(
                        "en-CA",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </time>
                  </div>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                    {post.metaDescription}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
