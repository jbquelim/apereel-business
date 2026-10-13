// Three ways to buy every service: Fix (one-off quick wins), Build (a
// project), Grow (monthly). Scopes are drafts for John to edit.
//
// PRICES: `price` is null until John sets it. While any tier of a service is
// unpriced, its tier table stays off the public service page (preview with
// ?tiers=preview) and reports say the price is confirmed on a call.

import { ANALYSIS_TIERS } from "./analysis-tiers";

export type TierId = "fix" | "build" | "grow";

/**
 * SEO and conversion optimization are part of every website (web-development),
 * not services bought on their own. Their pages point to the website tiers.
 */
export const INCLUDED_IN_WEBSITE: Record<string, string> = {
  seo: "SEO is built into every Apereel website: titles, headings, product data for Google and a sitemap. Custom and Signature add a full catalog structured around how buyers search.",
  "conversion-optimization":
    "Conversion optimization is built into every Apereel website: every conversion fix from your analysis is part of the build, and Custom and Signature set your product pages against your competitors'.",
};

/** After launch: one conversion retest and the fix it calls for. */
export const CONVERSION_RETEST = { price: 100, label: "Conversion retest and fix", detail: "One test on your live site and the fix it calls for, $100 each, whenever you want one." };

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
  // Research is the three paid analyses (lib/analysis-tiers): one source for names, scope and price.
  {
    slug: "research-competitive-analysis",
    tag: "Research & Competitive Analysis",
    tiers: ANALYSIS_TIERS.map((a, i) => ({
      id: (["fix", "build", "grow"] as const)[i],
      label: a.name,
      name: a.tagline,
      cadence: "one-time",
      summary: a.delivery,
      scope: a.includes,
      price: a.priceCents / 100,
    })) as [Tier, Tier, Tier],
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
          "SEO built in: titles, headings, product data for Google and a sitemap",
          "Every conversion fix from your analysis built in",
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
          "Catalog SEO: categories structured around how buyers search",
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
    // SEO and conversion work is part of the website; research is the analysis they already bought.
    const slug = /\b(seo|conversion)/i.test(p.service) ? "web-development" : p.service;
    const service = tiersForService(slug, services);
    if (!service || service.slug === "research-competitive-analysis") return;
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
