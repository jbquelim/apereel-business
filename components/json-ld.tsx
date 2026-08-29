import { site, getSiteUrl } from "@/lib/site";

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
        slogan: site.headline,
        founder: {
          "@type": "Person",
          name: site.founder.name,
          jobTitle: site.founder.title,
          sameAs: [site.linkedin],
        },
        areaServed: "CA",
        knowsAbout: [
          "Digital marketing strategy",
          "E-commerce growth",
          "Business-first SEO",
          "Digital advertising",
          "AI-powered web development",
          "Conversion optimization",
          "User experience",
          "Digital transformation",
        ],
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
