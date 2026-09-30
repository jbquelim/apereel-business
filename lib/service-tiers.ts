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
  /** Display name of the level, when not Fix / Build / Grow (e.g. "Refresh"). */
  label?: string;
  /** Typical duration, e.g. "1 to 2 weeks". */
  timeline?: string;
};

export const tierLabel = (t: Tier) => t.label ?? (t.id === "fix" ? "Fix" : t.id === "build" ? "Build" : "Grow");

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
        label: "Static",
        name: "Static ads, made from your catalog",
        cadence: "monthly",
        summary: "Clean, on-brand ads built from your real products and prices.",
        scope: [
          "12 static ads a month from your products, prices and advantages",
          "Copy for Google, Meta and TikTok, written to each platform's limits",
          "Campaigns run on one platform, with conversion tracking set up",
        ],
        price: 600,
        timeline: "3-month minimum",
      },
      {
        id: "build",
        label: "Motion",
        name: "Animated and video ads that stop the scroll",
        cadence: "monthly",
        summary: "Movement and variety, tested every month.",
        scope: [
          "Everything in Static",
          "6 animated, carousel and short video ads a month",
          "Campaigns on two platforms, with retargeting",
          "New creative tested against your best performers every month",
        ],
        price: 1500,
        timeline: "3-month minimum",
      },
      {
        id: "grow",
        label: "Cinematic",
        name: "Cinematic video ads, without a film crew",
        cadence: "monthly",
        summary: "Big-brand production for every platform your buyers use.",
        scope: [
          "Everything in Motion",
          "Cinematic AI product films and hero video ads each month",
          "Google, Meta and TikTok run as one campaign plan",
          "Shopping feed management and a strategy call every two weeks",
        ],
        price: 3500,
        timeline: "3-month minimum",
      },
    ],
  },
  {
    slug: "web-development",
    tag: "Web Development",
    tiers: [
      {
        id: "fix",
        label: "Template",
        name: "A premium template, made yours",
        cadence: "project",
        summary: "A polished site fast, with every fix from your analysis built in.",
        scope: [
          "Every fix from your analysis implemented, proven by a second crawl",
          "A premium template from our library, set up in your brand, fonts and photography",
          "Homepage, category, product, about and contact pages",
          "Product data for Google, reviews and speed built in",
        ],
        price: 2000,
        pricePrefix: "from",
        timeline: "2 to 3 weeks",
      },
      {
        id: "build",
        label: "Custom",
        name: "A custom design around your advantage",
        cadence: "project",
        summary: "Designed for your business, not adapted from someone else's.",
        scope: [
          "Everything in Template",
          "Custom-designed homepage and page layouts built around what makes you different",
          "Scroll animation and interactive sections",
          "Product pages designed to beat your competitors', measured page by page",
        ],
        price: 6000,
        pricePrefix: "from",
        timeline: "4 to 6 weeks",
      },
      {
        id: "grow",
        label: "Signature",
        name: "A flagship site that sets the standard",
        cadence: "project",
        summary: "The site your competitors will be measured against.",
        scope: [
          "Everything in Custom",
          "Fully bespoke design with cinematic motion, 3D or film",
          "Custom features such as quote requests, configurators, part-number search and integrations",
          "A platform move if needed, with every page redirected from our crawl",
        ],
        price: 15000,
        pricePrefix: "from",
        timeline: "8 to 12 weeks",
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
        label: "Starter",
        name: "Your catalog, posted for you",
        cadence: "monthly",
        summary: "Content made from your own products, every week.",
        scope: [
          "Your products and your competitors' read by our crawler every month",
          "12 social posts a month made from your real products and prices",
          "Captions and hashtags written, ready to schedule",
        ],
        price: 500,
        timeline: "3-month minimum",
      },
      {
        id: "build",
        label: "Growth",
        name: "Content that brings in buyers",
        cadence: "monthly",
        summary: "Social and search content aimed at what your buyers look for.",
        scope: [
          "Everything in Starter",
          "8 short videos a month made from your product photos",
          "2 buying guides a month aimed at searches you have no page for",
          "A monthly note on what your competitors launched and changed",
        ],
        price: 1200,
        timeline: "3-month minimum",
      },
      {
        id: "grow",
        label: "Scale",
        name: "A content team, without hiring one",
        cadence: "monthly",
        summary: "Premium visuals at the volume bigger brands run.",
        scope: [
          "Everything in Growth, at 20 posts, 12 videos and 4 guides a month",
          "Premium AI product visuals and 2 email newsletters",
          "A content calendar planned around your launches and seasons",
        ],
        price: 2500,
        timeline: "3-month minimum",
      },
    ],
  },
];

export function tiersForService(slugOrTag: string, services: ServiceTiers[] = SERVICE_TIERS): ServiceTiers | undefined {
  return services.find((s) => s.slug === slugOrTag || s.tag === slugOrTag);
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
export function recommendTiers(
  priorities: { service: string; effort: string }[],
  services: ServiceTiers[] = SERVICE_TIERS,
) {
  const groups = new Map<string, { service: ServiceTiers; tier: Tier; covers: number[] }>();
  const seenServices = new Set<string>();
  priorities.forEach((p, i) => {
    const service = tiersForService(p.service, services);
    if (!service) return;
    seenServices.add(service.slug);
    const tierId: TierId = p.effort === "high" ? "build" : "fix";
    const key = `${service.slug}:${tierId}`;
    const existing = groups.get(key);
    if (existing) existing.covers.push(i + 1);
    else groups.set(key, { service, tier: service.tiers.find((t) => t.id === tierId)!, covers: [i + 1] });
  });
  const recs = [...groups.values()].sort((a, b) => a.covers[0] - b.covers[0]);
  return { recs, suggestGrow: seenServices.size >= 3 };
}
