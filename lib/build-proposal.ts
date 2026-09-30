import type { GrowthReport } from "./growth-report";
import type { ProductPageProfile } from "./site-crawl";
import { SERVICE_TIERS, tiersForService, type ServiceTiers, type TierId } from "./service-tiers";

// A web development proposal drafted from a paid report: which tier fits,
// the scope as line items tied to what we measured, a price within the
// tier's range, and the analysis fee credited. Deterministic — no model —
// so every line traces back to a finding. John edits it before sending.

export type ProposalItem = { title: string; detail: string };

export type BuildProposal = {
  tier: TierId;
  tierLabel: string;
  tierName: string;
  /** Why this tier, in plain words. */
  reasons: string[];
  items: ProposalItem[];
  timeline: string;
  /** USD, before the credit. */
  price: number;
  /** USD already paid for the analysis, taken off the build. */
  credit: number;
  notes: string;
};

// What to do about each crawl finding, as a proposal line.
const FIX_ACTIONS: Record<string, (n: number, of: number) => ProposalItem> = {
  broken: (n) => ({ title: `Fix or redirect ${n === 1 ? "1 broken page" : `${n$(n)} broken pages`}`, detail: "Pages your sitemap lists that return an error, repaired or redirected to the right place." }),
  noindex: (n) => ({ title: `Make ${n === 1 ? "1 hidden page" : `${n$(n)} hidden pages`} visible to Google`, detail: "Remove the setting that keeps them out of search results, where that's a mistake." }),
  "product-no-schema": (n, of) => ({ title: `Add product data for Google to your product pages (${n$(n)} of the ${n$(of)} we checked had none)`, detail: "Price, stock and ratings shown in search results, set up once in your product template so every product gets it." }),
  "product-no-price": (n) => ({ title: `Add prices to the product data on ${pages(n)}`, detail: "So Google can show the price next to your result." }),
  "product-no-reviews": () => ({ title: "Install a reviews tool and show ratings on product pages", detail: "Collect reviews from past buyers and show stars in search results." }),
  "thin-category": (n, of) => ({ title: `Merge or strengthen ${n$(n)} thin categories (of the ${n$(of)} we checked)`, detail: "Categories with fewer than 4 products combined into stronger pages, with redirects so no link breaks." }),
  "no-title": (n) => ({ title: `Write titles for ${pages(n)}`, detail: "Titles written around the searches your buyers use." }),
  "dup-title": (n) => ({ title: `Make ${n$(n)} duplicate titles unique`, detail: "Each page gets its own title, so pages stop competing with each other." }),
  "no-description": (n) => ({ title: `Write meta descriptions for ${pages(n)}`, detail: "The snippet Google shows under your result, written to earn the click." }),
  "dup-description": (n) => ({ title: `Make ${n$(n)} duplicate descriptions unique`, detail: "So your results don't look interchangeable." }),
  "no-h1": (n) => ({ title: `Add a main heading to ${pages(n)}`, detail: "One clear heading that says what the page is about." }),
  "multi-h1": (n) => ({ title: `Reduce to one main heading on ${pages(n)}`, detail: "Template fix, applied site-wide." }),
  "alt-missing": (n) => ({ title: `Describe the images on ${pages(n)}`, detail: "Alt text for image search and screen readers." }),
  slow: (n) => ({ title: `Speed up ${n === 1 ? "1 slow page" : `${n$(n)} slow pages`}`, detail: "Server and template fixes for pages that took over 3 seconds to answer." }),
};

const n$ = (n: number) => n.toLocaleString("en-US");
const pages = (n: number) => `${n$(n)} page${n === 1 ? "" : "s"}`;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number) => Math.round(n / 250) * 250;

export function draftProposal(r: GrowthReport, paidCents: number, services: ServiceTiers[] = SERVICE_TIERS): BuildProposal {
  const web = tiersForService("web-development", services) ?? tiersForService("web-development")!;
  const crawl = r.crawl;
  const compare = r.productCompare;
  const findings = crawl?.findings ?? [];
  const products = crawl?.sitemapProducts ?? 0;
  const b2b = /b2b|wholesale|distribut|manufactur|oem/i.test(`${r.audit.industry?.businessModel ?? ""} ${r.audit.industry?.offering ?? ""}`);
  const platform = r.audit.techStack?.client.technologies.find((t) => t.category === "Platform")?.name ?? null;

  // Signals for each tier, stated as reasons the customer can check.
  const refresh: string[] = [];
  const rebuild: string[] = [];
  if (compare) {
    const rivals = compare.competitors;
    const best = (f: (p: ProductPageProfile) => number | null) => Math.max(...rivals.map((c) => f(c) ?? 0), 0);
    const you = compare.client;
    if ((you.ratingsPct ?? 0) + 30 < best((c) => c.ratingsPct)) refresh.push(`Competitors show reviews on up to ${best((c) => c.ratingsPct)}% of product pages; you show them on ${you.ratingsPct ?? 0}%.`);
    if ((you.avgImages ?? 0) * 1.5 < best((c) => c.avgImages)) refresh.push(`Competitors use up to ${best((c) => c.avgImages)} photos per product; you average ${you.avgImages ?? 0}.`);
  }
  if (r.preview) refresh.push("Your Preview already sketches the new homepage and product copy, so the design can start from it.");
  const conversionPriorities = (r.plan?.priorities ?? []).filter((p) => /conversion|web development|creative/i.test(p.service));
  if (conversionPriorities.length >= 2) refresh.push(`${conversionPriorities.length} of your priorities are about how the site looks and converts.`);
  const thin = findings.find((f) => f.key === "thin-category");
  if (thin && thin.of > 0 && thin.count / thin.of > 0.25 && products > 1500) {
    rebuild.push(`${thin.count} of the ${thin.of} categories we checked are thin, across a ${products.toLocaleString("en-US")}-product catalog: the structure needs rethinking, not patching.`);
  }
  if (b2b) rebuild.push("You sell to businesses: quote requests, spec sheets and part-number search are worth building properly.");
  if ((crawl?.avgResponseMs ?? 0) > 1500) rebuild.push(`Your server takes ${((crawl?.avgResponseMs ?? 0) / 1000).toFixed(1)} s on average to answer, which a template change won't fix.`);
  if (!platform) rebuild.push("We couldn't identify a standard e-commerce platform, which usually means custom work for every change.");

  const tierId: TierId = rebuild.length >= 2 ? "grow" : refresh.length >= 2 ? "build" : "fix";
  const tier = web.tiers.find((t) => t.id === tierId)!;

  const fixItems = findings
    .filter((f) => FIX_ACTIONS[f.key] && f.severity !== "low")
    .map((f) => FIX_ACTIONS[f.key](f.count, f.of));
  const lowItems = findings.filter((f) => FIX_ACTIONS[f.key] && f.severity === "low").map((f) => FIX_ACTIONS[f.key](f.count, f.of));
  const items: ProposalItem[] = [...fixItems, ...lowItems];
  items.push({ title: "A second crawl at launch", detail: "Every page re-checked, with a before and after report." });

  const advantage = r.audit.translateAdvantage?.strength
    ? `your advantage: ${r.audit.translateAdvantage.strength.replace(/\.$/, "")}`
    : "why customers choose you";
  // Every tier is a new design; the tier sets how bespoke it is.
  items.unshift(
    tierId === "fix"
      ? { title: "A premium template from our library, set up in your brand", detail: "Homepage, category, product, about and contact pages, in your colours, fonts and photography." }
      : tierId === "build"
        ? { title: "A custom design around your advantage", detail: `Homepage and page layouts designed around ${advantage}, with scroll animation and interactive sections.` }
        : { title: "A fully bespoke flagship design", detail: `Cinematic motion, 3D or film, built around ${advantage}.` },
  );
  if (tierId !== "fix" && compare && compare.competitors.length) {
    items.splice(1, 0, { title: "Product pages that match or beat your competitors'", detail: `Reviews, photos, spec tables and description depth set against ${compare.competitors.map((c) => c.name).join(", ")}.` });
  }
  if (tierId === "grow") {
    if (b2b) items.splice(2, 0, { title: "Business buyer features", detail: "Quote requests, downloadable spec sheets and search by part number." });
    items.splice(3, 0, { title: `Redirect map for every page${products ? ` (${products.toLocaleString("en-US")} products)` : ""}${platform ? `, including a move off ${platform} if it's holding you back` : ""}`, detail: "Built from our crawl, so rankings and links carry over to the new site." });
  }

  // Price inside the tier's range, scaled by what's actually there to do.
  const high = findings.filter((f) => f.severity === "high").length;
  const medium = findings.filter((f) => f.severity === "medium").length;
  const base = tier.price ?? 0;
  const price =
    tierId === "fix"
      ? round(clamp(base + high * 300 + medium * 150 + (products > 1000 ? 500 : 0), base, 4000))
      : tierId === "build"
        ? round(clamp(base + (products > 500 ? 2000 : 0) + (products > 2000 ? 2000 : 0) + high * 250, base, 14000))
        : round(base + (products > 2000 ? 5000 : 0) + (b2b ? 5000 : 0));

  const reasons =
    tierId === "grow" ? rebuild : tierId === "build" ? refresh : ["A premium template covers what your site needs; the problems we measured are fixed as part of the build."];

  return {
    tier: tierId,
    tierLabel: tier.label ?? tierId,
    tierName: tier.name,
    reasons,
    items,
    timeline: tier.timeline ?? "",
    price,
    credit: Math.round(paidCents / 100),
    notes: "",
  };
}
