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
  /** AI change requests included (per month for monthly tiers). */
  requests?: number;
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
        summary: "On-brand image ads from your real products and prices.",
        scope: [
          "10 static ads a month from your products, prices and advantages",
          "Headlines and copy for Google, Meta and TikTok, written to each platform's limits",
          "Ready to upload to your own ad accounts",
          "10 AI change requests a month",
        ],
        price: 50,
        requests: 10,
      },
      {
        id: "build",
        label: "Motion",
        name: "Animated ads that stop the scroll",
        cadence: "monthly",
        summary: "Movement and variety for every platform.",
        scope: [
          "Everything in Static",
          "5 animated and carousel ads a month",
          "Angles taken from what your competitors do and don't say",
          "25 AI change requests a month",
        ],
        price: 100,
        requests: 25,
      },
      {
        id: "grow",
        label: "Cinematic",
        name: "Cinematic video ads, without a film crew",
        cadence: "monthly",
        summary: "Big-brand production for Google, Meta and TikTok.",
        scope: [
          "Everything in Motion",
          "2 cinematic AI video ads a month of your products",
          "Sized for YouTube, Reels and TikTok",
          "50 AI change requests a month",
        ],
        price: 200,
        requests: 50,
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
        name: "A site from our template library, filled with your business",
        cadence: "one-time",
        summary: "Pick the design for your industry; AI builds it from your own products.",
        scope: [
          "A template for your industry from our library",
          "Your products, photos and prices brought in from our crawl of your site",
          "Every fix from your analysis built in: product data for Google, titles, headings",
          "Up to 5 pages",
          "Hosting for 12 months included, then $10 a month",
          "10 AI change requests",
        ],
        price: 100,
        requests: 10,
      },
      {
        id: "build",
        label: "Custom",
        name: "A design built around your advantage",
        cadence: "one-time",
        summary: "AI combines the best sections for your business, not a one-size template.",
        scope: [
          "Everything in Template",
          "Layouts designed around what makes you different, from your analysis",
          "Product pages set up to beat your competitors', measured page by page",
          "Scroll animation and interactive sections",
          "Up to 15 pages, your full catalog",
          "Hosting for 12 months included, then $10 a month",
          "30 AI change requests",
        ],
        price: 300,
        requests: 30,
      },
      {
        id: "grow",
        label: "Signature",
        name: "A flagship site with cinematic design",
        cadence: "one-time",
        summary: "The look of a big-brand site, built by AI in a fraction of the time.",
        scope: [
          "Everything in Custom",
          "Cinematic hero film and premium AI visuals of your products",
          "Quote request and lead forms",
          "Every page of your old site redirected, so your rankings carry over",
          "Unlimited pages",
          "Hosting for 12 months included, then $10 a month",
          "60 AI change requests",
        ],
        price: 500,
        requests: 60,
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
        summary: "Social posts made from your own products, every week.",
        scope: [
          "Your products and your competitors' read by our crawler every month",
          "12 social posts a month from your real products and prices",
          "Captions and hashtags written, ready to schedule",
          "10 AI change requests a month",
        ],
        price: 100,
        requests: 10,
      },
      {
        id: "build",
        label: "Growth",
        name: "Content that brings in buyers",
        cadence: "monthly",
        summary: "Social and search content aimed at what your buyers look for.",
        scope: [
          "20 social posts and 4 short videos a month",
          "2 buying guides a month aimed at searches you have no page for",
          "25 AI change requests a month",
        ],
        price: 200,
        requests: 25,
      },
      {
        id: "grow",
        label: "Scale",
        name: "A content team, without hiring one",
        cadence: "monthly",
        summary: "Premium visuals at the volume bigger brands run.",
        scope: [
          "30 social posts, 8 short videos and 4 buying guides a month",
          "Premium AI product visuals and 2 email newsletters",
          "A monthly note on what your competitors launched and changed",
          "50 AI change requests a month",
        ],
        price: 300,
        requests: 50,
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
