import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { getInsight, insights } from "@/lib/insights";
import { getSiteUrl, site } from "@/lib/site";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      title: `${post.metaTitle} | Apereel`,
      description: post.metaDescription,
      publishedTime: post.datePublished,
      authors: [site.founder.name],
    },
  };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();

  const base = getSiteUrl();
  const pageUrl = `${base}/insights/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}/#article`,
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.datePublished,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        author: { "@id": `${base}/#john-lim` },
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Apereel", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "Insights",
            item: `${base}/insights`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: pageUrl },
        ],
      },
    ],
  };

  const [lead, ...rest] = post.body;

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <section className="pt-36 pb-16 sm:pb-20">
          <Container>
            <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
              {post.tag}
            </p>
            <h1 className="text-display mt-5 max-w-4xl text-ink">
              {post.title}
            </h1>
            <p className="mt-8 font-mono text-[12px] tracking-[0.18em] text-muted uppercase">
              {site.founder.name} ·{" "}
              <time dateTime={post.datePublished}>
                {new Date(`${post.datePublished}T00:00:00`).toLocaleDateString(
                  "en-CA",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </time>
            </p>
          </Container>
        </section>

        <section className="pb-20 sm:pb-28">
          <Container>
            <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-muted">
              <p className="text-xl text-ink">{lead}</p>
              {rest.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Container>
        </section>
      </article>

      <section className="bg-navy-mid py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Put It to Work
          </p>
          <p className="font-display mt-6 max-w-3xl text-2xl leading-snug font-normal text-ink sm:text-3xl">
            See what your market data says before spending another dollar on
            marketing.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#audit">Run Your Free Website Audit</ButtonLink>
            <ButtonLink href="#contact" variant="secondary">
              Talk About Growth
            </ButtonLink>
          </div>
          <div className="mt-14 border-t border-white/10 pt-8">
            <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
              Related
            </p>
            <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-10">
              {post.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-ink/80 transition-colors hover:text-electric"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </main>
  );
}
