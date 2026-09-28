// Three ways to buy every service: Fix (one-off quick wins), Build (a
// project), Grow (monthly). Scopes are drafts for John to edit.
//
// PRICES: `price` is null until John sets it. While any tier of a service is
// unpriced, its tier table stays off the public service page (preview with
// ?tiers=preview) and reports say the price is confirmed on a call.

export type TierId = "fix" | "build" | "grow";

export type Tier = {
  id: TierId;
  name: string;
  cadence: "one-time" | "project" | "monthly";
  summary: string;
  scope: string[];
  /** USD. null = not priced yet. */
  price: number | null;
  /** Shown before the price, e.g. "from". */
  pricePrefix?: string;
};

export type ServiceTiers = { slug: string; tag: string; tiers: [Tier, Tier, Tier] };

export const SERVICE_TIERS: ServiceTiers[] = [
  {
    slug: "research-competitive-analysis",
    tag: "Research & Competitive Analysis",
    tiers: [
      {
        id: "fix",
        name: "Competitive snapshot",
        cadence: "one-time",
        summary: "A fast, evidence-based read on where you stand.",
        scope: [
          "Your assortment and pricing against your top five competitors",
          "The gaps worth acting on, ranked by likely impact",
          "A walkthrough call to agree what to do first",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Market deep dive",
        cadence: "project",
        summary: "The full picture before you commit budget.",
        scope: [
          "Category-by-category assortment and price mapping",
          "Demand mapping: what buyers search for that the market underserves",
          "An opportunity map with a sequenced plan",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Market watch",
        cadence: "monthly",
        summary: "Know when competitors move, before it costs you.",
        scope: [
          "Monthly tracking of competitor prices, catalogs and marketing tools",
          "Alerts when a competitor makes a significant move",
          "A quarterly review of what changed and what to do",
        ],
        price: null,
      },
    ],
  },
  {
    slug: "seo",
    tag: "SEO",
    tiers: [
      {
        id: "fix",
        name: "Technical and on-page fixes",
        cadence: "one-time",
        summary: "Fix what stops Google understanding your pages.",
        scope: [
          "Titles, headings, meta descriptions and canonical tags on key pages",
          "Product and breadcrumb structured data",
          "Indexing and crawl issues",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Catalog architecture",
        cadence: "project",
        summary: "Turn your catalog's depth into rankings.",
        scope: [
          "Category and product page structure built around how buyers search",
          "A keyword-to-page map for your commercial searches",
          "Category hub content that earns rankings",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Monthly SEO",
        cadence: "monthly",
        summary: "Compounding visibility, reported against revenue.",
        scope: [
          "New and improved pages every month",
          "Ranking and search traffic tracking",
          "A monthly report tied to leads and sales",
        ],
        price: null,
      },
    ],
  },
  {
    slug: "advertising",
    tag: "Advertising",
    tiers: [
      {
        id: "fix",
        name: "Tracking and account fix",
        cadence: "one-time",
        summary: "Make sure every ad dollar is measured.",
        scope: [
          "Conversion tracking audited and repaired",
          "Wasted spend identified and removed",
          "Account structure cleaned up",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Campaign launch",
        cadence: "project",
        summary: "Campaigns built on competitive data, not guesses.",
        scope: [
          "Campaign strategy from your competitive position",
          "Google and Meta campaigns set up",
          "Landing pages aligned to each offer",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Managed campaigns",
        cadence: "monthly",
        summary: "Ongoing management judged on business results.",
        scope: [
          "Google and Meta campaign management",
          "Continuous testing of offers and creative",
          "Monthly reporting against leads and revenue",
        ],
        price: null,
      },
    ],
  },
  {
    slug: "web-development",
    tag: "Web Development",
    tiers: [
      {
        id: "fix",
        name: "Speed and fix sprint",
        cadence: "one-time",
        summary: "Faster pages and fewer broken moments.",
        scope: [
          "Page speed improvements on key templates",
          "Bug and usability fixes buyers run into",
          "Before and after measurements",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Site build or rebuild",
        cadence: "project",
        summary: "A site built around how your customers buy.",
        scope: [
          "E-commerce or B2B site development on the right platform",
          "AI-assisted delivery for speed and lower cost",
          "Performance engineered in from the start",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Ongoing development",
        cadence: "monthly",
        summary: "Changes in days, not weeks.",
        scope: [
          "A monthly block of development time",
          "New features, pages and integrations",
          "Your team trained to make everyday changes",
        ],
        price: null,
      },
    ],
  },
  {
    slug: "conversion-optimization",
    tag: "Conversion Optimization",
    tiers: [
      {
        id: "fix",
        name: "Purchase-path audit",
        cadence: "one-time",
        summary: "Find where buyers drop off, and fix the quick wins.",
        scope: [
          "Your path from landing to purchase or quote reviewed",
          "Decision-confidence gaps: pricing, shipping, returns, trust",
          "Quick wins implemented",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Discovery and product page rebuild",
        cadence: "project",
        summary: "Help buyers find the right product and choose it.",
        scope: [
          "Navigation, filters and search rebuilt",
          "Product and category pages redesigned for confidence",
          "Quote and checkout flows simplified",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Monthly testing program",
        cadence: "monthly",
        summary: "Measured improvement, month after month.",
        scope: [
          "A testing roadmap prioritised by revenue impact",
          "Tests designed, built and analysed",
          "A monthly results report",
        ],
        price: null,
      },
    ],
  },
  {
    slug: "premium-creative",
    tag: "Premium Creative",
    tiers: [
      {
        id: "fix",
        name: "Product image set",
        cadence: "one-time",
        summary: "Make your best products look their best.",
        scope: [
          "Enhanced imagery for your top products",
          "Consistent, on-brand styling",
          "Sized for web, marketplaces and ads",
        ],
        price: null,
      },
      {
        id: "build",
        name: "Campaign creative",
        cadence: "project",
        summary: "One idea, carried across every channel.",
        scope: [
          "Campaign concept and creative direction",
          "Photography, film or motion concepts",
          "Assets for web, social and paid media",
        ],
        price: null,
        pricePrefix: "from",
      },
      {
        id: "grow",
        name: "Monthly creative",
        cadence: "monthly",
        summary: "Fresh assets without a production team.",
        scope: [
          "A monthly allowance of creative assets",
          "Variations for ad testing",
          "Seasonal and launch creative",
        ],
        price: null,
      },
    ],
  },
];

export function tiersForService(slugOrTag: string): ServiceTiers | undefined {
  return SERVICE_TIERS.find((s) => s.slug === slugOrTag || s.tag === slugOrTag);
}

export const isPriced = (s: ServiceTiers) => s.tiers.every((t) => t.price != null);

export function priceLabel(t: Tier): string {
  if (t.price == null) return "Price confirmed on a short call";
  const amount = `$${t.price.toLocaleString("en-US")}`;
  const unit = t.cadence === "monthly" ? " / month" : "";
  return `${t.pricePrefix ? `${t.pricePrefix} ` : ""}${amount}${unit}`;
}

/**
 * Which tiers fit a Growth Plan, from its priorities alone (deterministic):
 * within each service, high-effort priorities point to Build and the rest to
 * Fix, so a service can get both. Grow is suggested when the plan spans three
 * or more services.
 */
export function recommendTiers(priorities: { service: string; effort: string }[]) {
  const groups = new Map<string, { service: ServiceTiers; tier: Tier; covers: number[] }>();
  const services = new Set<string>();
  priorities.forEach((p, i) => {
    const service = tiersForService(p.service);
    if (!service) return;
    services.add(service.slug);
    const tierId: TierId = p.effort === "high" ? "build" : "fix";
    const key = `${service.slug}:${tierId}`;
    const existing = groups.get(key);
    if (existing) existing.covers.push(i + 1);
    else groups.set(key, { service, tier: service.tiers.find((t) => t.id === tierId)!, covers: [i + 1] });
  });
  const recs = [...groups.values()].sort((a, b) => a.covers[0] - b.covers[0]);
  return { recs, suggestGrow: services.size >= 3 };
}
