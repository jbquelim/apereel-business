// Store bench: runs the AI-free parts of the website pipeline against a fixed
// set of real businesses of different kinds, so a change that breaks catalog
// reading, logo finding or sitemap counting shows up here, not on a client's
// site. Costs nothing (no AI). Run it after any change to the readers:
//
//   npx tsx tools/site-bench.mts [domain]
//
// Exits 1 when any store misses what it should give. Template layouts have
// their own bench: tools/site-qa.mts.

import { platformCatalog } from "../lib/platform-catalog";
import { fetchSitemapCatalog } from "../lib/site-fetch";
import { extractBrand } from "../lib/brand-extract";

type Expect = {
  domain: string;
  kind: string;
  platform: "shopify" | "bigcommerce" | "woocommerce" | null;
  /** At least this many products from the platform feed (null: no feed expected). */
  minProducts: number | null;
  logo: boolean;
};

// What each store gave when last checked by hand (2026-10-07). Counts are floors, not exact.
const STORES: Expect[] = [
  { domain: "onyxcoffeelab.com", kind: "large Shopify, hidden products, sitemaps per market, inline SVG logo", platform: "shopify", minProducts: 900, logo: true },
  { domain: "studs.com", kind: "small Shopify", platform: "shopify", minProducts: 150, logo: true },
  { domain: "grandbrass.com", kind: "BigCommerce, 20,000 products", platform: "bigcommerce", minProducts: 15_000, logo: true },
  { domain: "eatgrub.co.uk", kind: "WooCommerce", platform: "woocommerce", minProducts: 10, logo: true },
  { domain: "etlin-daniels.com", kind: "WordPress, blocks browser user agents, lazy-loaded logo", platform: null, minProducts: null, logo: true },
  { domain: "mrrooter.com", kind: "service business, no products", platform: null, minProducts: null, logo: true },
];

const only = process.argv[2];
const handle = (u: string) => u.replace(/[?#].*$/, "").replace(/\/$/, "").split("/").pop();

let failed = 0;
await Promise.all(
  STORES.filter((s) => !only || s.domain === only).map(async (s) => {
    const started = Date.now();
    const [feed, sitemap, brand] = await Promise.all([
      // The same time a build's catalog step has (lib/catalog-import).
      platformCatalog(s.domain, 170_000).catch((err: Error) => ({ error: err.message })),
      fetchSitemapCatalog(s.domain).catch(() => ({ productUrls: [] as string[] })),
      extractBrand(s.domain).catch(() => null),
    ]);
    const read = feed && "error" in feed ? null : feed;
    const products = read?.products.length ?? 0;
    const listed = new Set(sitemap.productUrls.map(handle)).size;
    const problems: string[] = [];
    if (feed && "error" in feed) problems.push(`catalog read incomplete: ${feed.error}`);
    else if (s.platform && read?.platform !== s.platform) problems.push(`platform: expected ${s.platform}, got ${read?.platform ?? "none"}`);
    if (s.minProducts != null && products < s.minProducts) problems.push(`feed gave ${products} products, expected at least ${s.minProducts}`);
    // A feed well short of the store's own sitemap is how the Shopify paging bug showed (248 of 952).
    if (read && listed >= 20 && products < listed * 0.9) problems.push(`feed gave ${products} products but the sitemap lists ${listed}`);
    if (s.logo && !brand?.logo) problems.push("no logo found");
    if (brand?.logo && !/^data:image\/svg|^https?:\/\/.+/.test(brand.logo)) problems.push(`logo isn't an address: ${brand.logo.slice(0, 60)}`);
    if (problems.length) failed++;
    const logo = brand?.logo ? (brand.logo.startsWith("data:") ? "inline svg" : "image") : "none";
    console.log(`${problems.length ? "FAIL" : "ok  "} ${s.domain} (${s.kind})`);
    console.log(`     feed: ${read ? `${read.platform}, ${products} products, ${read.categories.length} categories` : "none"} · sitemap: ${listed} products · logo: ${logo} · accent: ${brand?.accent ?? "none"} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
    for (const p of problems) console.log(`     - ${p}`);
  }),
);
console.log(failed ? `\n${failed} store(s) failed` : "\nAll stores passed");
process.exit(failed ? 1 : 0);
