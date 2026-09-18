// Founder essays: the distribution engine. Each essay is written from real
// experience already public on this site — same claims, same proof, no
// invented numbers (confidentiality-claims). Every essay doubles as a
// LinkedIn post that links back here.

export type Insight = {
  slug: string;
  tag: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string; // ISO date
  // Plain paragraphs. The article page renders the first as the lead.
  body: string[];
  related: { href: string; label: string }[];
};

export const insights: Insight[] = [
  {
    slug: "the-answer-wasnt-more-seo",
    tag: "Founder Essay",
    title: "The answer wasn't more SEO. It was a better business.",
    metaTitle: "The Answer Wasn't More SEO. It Was a Better Business.",
    metaDescription:
      "Four years of e-commerce growth taught me that rankings follow business strength. What I stopped buying from agencies, and what I fixed instead.",
    datePublished: "2026-09-17",
    body: [
      "For years I did what the agencies recommended. Content calendars, backlink campaigns, keyword strategies. Some of it worked. Most of it never reached revenue.",
      "Then I noticed a pattern no agency had mentioned. The product categories where we carried deeper inventory outranked the competition. Where competitors had better assortments, they won. This held regardless of how much SEO effort either side spent.",
      "Google wasn't rewarding our optimization. It was measuring, imperfectly but relentlessly, which store deserved the customer.",
      "That changes the question. Instead of “how do we rank higher,” you ask “why should a customer choose us?” The second question is harder. It implicates pricing, inventory, and the shopping experience. No agency deliverable answers it for you.",
      "So we fixed the business. Categories that lost on price got repriced. Thin categories got deeper. Product discovery got rebuilt around how customers actually shop. SEO became the amplifier of those decisions instead of a substitute for them.",
      "The result was 20X revenue growth in four years, with top-5 rankings for over 1,000 keywords. That included commercial searches where established national retailers struggle to appear. Not because we out-optimized them. Because in those categories, we were the better answer.",
      "If your content budget isn't producing revenue, try this before renewing the retainer. Pick your five most important categories. For each one, ask: would a careful shopper choose us over the top-ranked competitor, at our prices, with our selection? Where the honest answer is no, that is your ranking problem. It will not be fixed by publishing more.",
      "If your agency never asks why customers should choose you, they are answering the wrong question.",
    ],
    related: [
      { href: "/services/seo", label: "Business-First SEO" },
      {
        href: "/services/research-competitive-analysis",
        label: "Research & Competitive Analysis",
      },
    ],
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
