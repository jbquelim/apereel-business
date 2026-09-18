import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { getServicePage, servicePages } from "@/lib/service-pages";
import { getSiteUrl } from "@/lib/site";

export function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: `${page.metaTitle} | Apereel`,
      description: page.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) notFound();

  const others = servicePages.filter((s) => s.slug !== page.slug);

  const base = getSiteUrl();
  const pageUrl = `${base}/services/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: page.tag,
        description: page.metaDescription,
        url: pageUrl,
        serviceType: page.tag,
        provider: { "@id": `${base}/#organization` },
        areaServed: "CA",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Apereel", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${base}/#services`,
          },
          { "@type": "ListItem", position: 3, name: page.tag, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="pt-36 pb-20 sm:pb-28">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            {page.tag}
          </p>
          <h1 className="text-display mt-5 max-w-4xl text-ink">{page.title}</h1>
          <div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
            {page.intro.map((p, i) => (
              <p key={i} className={i === 0 ? "text-ink" : undefined}>
                {p}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-mid py-20 sm:py-28">
        <Container>
          <h2 className="font-display text-3xl font-normal tracking-[-0.02em] text-ink sm:text-4xl">
            {page.deliverablesLabel}
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {page.deliverables.map((d) => (
              <div key={d.name}>
                <h3 className="text-lg font-medium text-ink">{d.name}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 max-w-2xl border-t border-white/10 pt-8 text-base leading-relaxed text-muted">
            {page.fit}
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Proof, Not Promises
          </p>
          <p className="font-display mt-6 max-w-3xl text-2xl leading-snug font-normal text-ink sm:text-3xl">
            {page.proof}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#audit">Run Your Free Website Audit</ButtonLink>
            <ButtonLink href="/#contact" variant="secondary">
              Talk About Growth
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-navy-mid py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Questions Worth Asking
          </p>
          <h2 className="font-display mt-6 text-3xl font-normal tracking-[-0.02em] text-ink sm:text-4xl">
            Straight answers
          </h2>
          <div className="mt-12 grid max-w-4xl gap-x-12 gap-y-10 sm:grid-cols-1">
            {page.faqs.map((f) => (
              <div key={f.question} className="border-t border-white/10 pt-8">
                <h3 className="text-lg font-medium text-ink">{f.question}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Other Capabilities
          </p>
          <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-ink/80 transition-colors hover:text-electric"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
