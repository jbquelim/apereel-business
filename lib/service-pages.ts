// Dedicated service pages: the rankable surface for service-intent searches.
// Copy expands the positioning in lib/site.ts — same claims, same proof,
// no invented numbers (confidentiality-claims).

export type ServicePage = {
  slug: string;
  tag: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  deliverablesLabel: string;
  deliverables: { name: string; detail: string }[];
  fit: string;
  proof: string;
};

export const servicePages: ServicePage[] = [
  {
    slug: "research-competitive-analysis",
    tag: "Research & Competitive Analysis",
    title: "Find out why customers aren't buying",
    metaTitle: "Research & Competitive Analysis for E-Commerce",
    metaDescription:
      "Competitive research that finds the commercial levers moving revenue: assortment gaps, pricing position, and why customers choose your competitors.",
    intro: [
      "Most agencies measure traffic. We measure why customers buy, and why they don't.",
      "Before we recommend anything, we study your market: the companies already winning, the high-demand searches driving their visibility, and where customers are still underserved. We crawl competitors' live product data — real assortment, real prices — not survey estimates.",
      "The output is not a report that flatters the data you already have. It is a map of the commercial levers that actually move revenue: assortment gaps, pricing position, merchandising, channel mix, and the experience that turns browsers into buyers.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Competitor assortment analysis",
        detail:
          "Live crawls of competitor catalogs: category depth, product counts, price ranges, and where their inventory beats yours.",
      },
      {
        name: "Pricing position",
        detail:
          "Where your prices sit against the market for comparable products, and which categories are losing on price rather than marketing.",
      },
      {
        name: "Demand mapping",
        detail:
          "The searches your market actually uses, who owns them today, and which ones your business deserves to win.",
      },
      {
        name: "Opportunity map",
        detail:
          "A ranked list of moves: what to fix, what to build, and what to amplify — each tied to a revenue case, not a vanity metric.",
      },
    ],
    fit: "For e-commerce businesses that suspect the real problem isn't marketing — and want evidence before spending another dollar on it.",
    proof:
      "This research-first method is how we found the inventory and pricing problems behind a client's flat SEO results — and drove 20X revenue growth in four years by fixing the business first.",
  },
  {
    slug: "seo",
    tag: "SEO",
    title: "Rank for the searches that drive revenue",
    metaTitle: "Business-First SEO for E-Commerce",
    metaDescription:
      "SEO built on inventory depth and business strength, not content volume. Rank for commercial searches because you're the better answer.",
    intro: [
      "Rankings follow from being the better choice for the customer, not from producing more content about topics no one searches.",
      "Most SEO programs produce blog posts and backlinks because those are easy to invoice. We took a different lesson from four years of e-commerce growth: the categories with stronger, deeper inventory consistently outrank those with better 'SEO'. Google rewards businesses that deserve to win the search.",
      "So we strengthen the business case behind every page — assortment, pricing, product data, shopping experience — then make that value unmistakable to search engines.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Commercial keyword strategy",
        detail:
          "Target the searches that end in purchases, ranked by revenue potential — not search volume trophies.",
      },
      {
        name: "Category and product page architecture",
        detail:
          "Structure the catalog around how customers actually shop, so every category page is a landing page that deserves to rank.",
      },
      {
        name: "Technical foundation",
        detail:
          "Crawlability, structured data, performance, and indexation handled as infrastructure — mandatory, not the strategy.",
      },
      {
        name: "Inventory-led content",
        detail:
          "Content built from what you actually sell and know, not filler produced to feed a publishing quota.",
      },
    ],
    fit: "For e-commerce businesses tired of paying for content that ranks for nothing commercial, or agencies that never once looked at the product catalog.",
    proof:
      "This approach ranked a client in the top 5 for over 1,000 keywords — including commercial searches where established national retailers struggle to appear.",
  },
  {
    slug: "advertising",
    tag: "Advertising",
    title: "Turn ad spend into an investment",
    metaTitle: "E-Commerce Advertising Management",
    metaDescription:
      "Paid advertising built around the offers and products that already deserve to win. Ad spend as investment, not expense.",
    intro: [
      "Ad spend that chases traffic is an expense. Ad spend that amplifies genuine competitive advantage is an investment.",
      "Most underperforming ad accounts share a root cause: the ads are fine, but they point at products with no price advantage, categories with thin selection, or pages that waste the click. More budget makes that problem more expensive.",
      "We build campaigns around the offers, audiences, and products that already deserve to win — after the research has shown which those are.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Campaign strategy from competitive data",
        detail:
          "Spend concentrated where you hold a real advantage: price, selection, availability, or experience.",
      },
      {
        name: "Google & Meta management",
        detail:
          "Full-funnel campaign build and management with budgets accountable to revenue and margin, not clicks.",
      },
      {
        name: "Offer and landing alignment",
        detail:
          "Every ad lands on a page built to convert that specific intent — no generic homepage dumps.",
      },
      {
        name: "Measurement that reaches the business",
        detail:
          "Reporting on qualified traffic, sales, and margin. If performance never reaches the P&L, it isn't performance.",
      },
    ],
    fit: "For businesses spending on ads whose real question is 'why isn't this profitable' — not 'how do I spend more'.",
    proof:
      "Advertising is one lever inside the method that drove 20X e-commerce revenue growth — deployed after pricing and inventory earned the right to amplify.",
  },
  {
    slug: "web-development",
    tag: "Web Development",
    title: "Ship website changes in hours, not weeks",
    metaTitle: "AI-Assisted Web Development for E-Commerce",
    metaDescription:
      "Stop waiting in an agency's development queue. AI-assisted development ships website changes in hours and cuts cycles from weeks to days.",
    intro: [
      "Your last agency charged you three weeks of development to change a banner.",
      "For most e-commerce teams the constraint is not ideas or strategy — it is the inability to execute without waiting in someone else's queue. Simple UX fixes sit for weeks. Feature requests take months. The compounding cost is every improvement that never ships.",
      "We build digital platforms with AI-assisted development so changes ship in hours. In one engagement, development cycles dropped from three-to-four weeks to under 24 hours — the team shipped more in one month than the previous agency delivered in six.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "E-commerce platform development",
        detail:
          "Shopify and custom storefront work: product discovery, navigation, filtering, and the paths that turn browsing into buying.",
      },
      {
        name: "AI-assisted delivery",
        detail:
          "Modern AI tooling in the development loop — velocity without sacrificing code quality or performance budgets.",
      },
      {
        name: "Performance engineering",
        detail:
          "Core Web Vitals treated as a budget. Fast sites convert better and rank better; slow ones pay twice.",
      },
      {
        name: "Team enablement",
        detail:
          "Internal teams equipped to build, test, and ship without external dependency for every small change.",
      },
    ],
    fit: "For teams whose improvement list is long, whose agency queue is longer, and who are done paying weeks-of-development prices for hours of work.",
    proof:
      "Development cycles cut from 3–4 weeks to under 24 hours in a live engagement — more shipped in one month than the previous agency delivered in six.",
  },
  {
    slug: "conversion-optimization",
    tag: "Conversion Optimization",
    title: "Earn more from the traffic you already have",
    metaTitle: "Conversion Optimization for E-Commerce",
    metaDescription:
      "Fix the paths customers actually take from discovery to purchase. Earn more revenue from every visitor you already have.",
    intro: [
      "You already have demand. The question is how much of it you're wasting.",
      "Before buying more traffic, look at what happens to the traffic you have: where product discovery breaks, where filters fail, where the checkout leaks, and where customers give up on finding what you actually stock.",
      "We fix the paths customers take from discovery to purchase. In one engagement, rebuilding product discovery around how people actually shop improved discovery by 35% — customers found products faster, bounce rates dropped, and the assortment finally performed at the level it deserved.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Purchase-path audit",
        detail:
          "Where visitors drop between landing and order: navigation, search, filtering, product pages, cart, and checkout.",
      },
      {
        name: "Product discovery rebuilds",
        detail:
          "Navigation and filtering built around how customers shop your category — not how the org chart is structured.",
      },
      {
        name: "Decision-confidence fixes",
        detail:
          "The trust, information, and comparison gaps that stall purchases, fixed page by page.",
      },
      {
        name: "Measured iteration",
        detail:
          "Changes shipped fast, measured against revenue per visitor, kept or killed on evidence.",
      },
    ],
    fit: "For stores with real traffic and an underperforming conversion rate — especially where strong assortment is hidden behind weak product discovery.",
    proof:
      "Product discovery improved 35% in a live engagement: faster finding, lower bounce, and an assortment that finally performed to its potential.",
  },
  {
    slug: "premium-creative",
    tag: "Premium Creative",
    title: "Compete visually without the six-figure budget",
    metaTitle: "Premium Creative Production for E-Commerce",
    metaDescription:
      "Campaign and product creative at global-brand production quality, delivered with AI-assisted workflows at a fraction of the cost.",
    intro: [
      "Customers judge your business by its creative before they read a word. Competing against companies ten times your size used to mean six-figure production budgets — or looking like the smaller player you are.",
      "AI-assisted creative workflows changed that equation. Production quality that matches global brands is now a process problem, not a budget problem — if the direction is right.",
      "We produce campaign, product, and brand creative that holds its own next to the biggest players in your market, art-directed so it looks designed, not generated.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Campaign creative",
        detail:
          "Hero imagery, seasonal campaigns, and ad creative produced at volume without the volume price tag.",
      },
      {
        name: "Product visualization",
        detail:
          "Product imagery and motion that makes the catalog feel premium — often the difference in a comparison shopper's decision.",
      },
      {
        name: "Brand-compliant execution",
        detail:
          "Work inside exacting brand standards — we've maintained full brand authorization across multiple global-brand partnerships.",
      },
      {
        name: "Creative direction",
        detail:
          "AI output is only as good as its direction. Every asset passes an art-direction bar before a customer sees it.",
      },
    ],
    fit: "For businesses whose creative budget can't match their competitors' — but whose creative can no longer afford to look it.",
    proof:
      "Brand-compliant storefronts and creative maintained across global-brand partnerships while contributing to 20X revenue growth.",
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((s) => s.slug === slug);
}
