import { site, services, getSiteUrl } from "@/lib/site";

export function JsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}/#organization`,
        name: site.name,
        url,
        email: site.email,
        description: site.supporting,
        slogan: `${site.headline} ${site.headlineLine2}`,
        founder: {
          "@type": "Person",
          name: site.founder.name,
          jobTitle: site.founder.title,
          sameAs: [site.linkedin],
        },
        areaServed: "CA",
        knowsAbout: services.map((s: { title: string; body: string }) => s.title),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Digital Growth Services",
          itemListElement: services.map(
            (s: { title: string; body: string }, i: number) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: s.title,
                description: s.body,
                position: i + 1,
              },
            }),
          ),
        },
        sameAs: [site.linkedin],
      },
      {
        "@type": "Person",
        "@id": `${url}/#john-lim`,
        name: site.founder.name,
        jobTitle: "Founder",
        worksFor: { "@id": `${url}/#organization` },
        description: site.founder.bio.join(" "),
        sameAs: [site.linkedin],
        email: site.email,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: site.name,
        url,
        publisher: { "@id": `${url}/#organization` },
        description: site.supporting,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
