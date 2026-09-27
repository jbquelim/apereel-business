import { fetchSitemapCatalog, fetchTextDirect } from "./site-fetch";

// Growth Plan page audit: picks one page of each type (home, category,
// product), reads the HTML, and runs deterministic checks. No model involved —
// every issue here is something we observed on the page.

export type PageType = "Homepage" | "Category page" | "Product page";

export type PageIssue = { severity: "high" | "medium" | "low"; text: string };

export type PageCheck = {
  type: PageType;
  url: string;
  title: string | null;
  titleLength: number;
  metaDescriptionLength: number;
  h1Count: number;
  hasCanonical: boolean;
  noindex: boolean;
  structuredData: string[]; // schema.org @types found in JSON-LD
  productOffer: { hasPrice: boolean; hasAvailability: boolean } | null;
  images: number;
  imagesMissingAlt: number;
  words: number;
  issues: PageIssue[];
};

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

function jsonLdTypes(html: string): { types: string[]; offer: PageCheck["productOffer"] } {
  const types = new Set<string>();
  // Prices often sit on variant offers (Shopify ProductGroup → hasVariant →
  // offers) rather than the parent Product, so any Offer node counts.
  let offerHasPrice = false;
  let offerHasAvailability = false;
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    const names = (Array.isArray(t) ? t : t ? [t] : []).filter((n): n is string => typeof n === "string");
    names.forEach((n) => types.add(n));
    if (names.some((n) => n === "Offer" || n === "AggregateOffer")) {
      if (obj.price != null || obj.lowPrice != null || obj.priceSpecification != null) offerHasPrice = true;
      if (obj.availability != null) offerHasAvailability = true;
    }
    for (const v of Object.values(obj)) if (v && typeof v === "object") visit(v);
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(m[1].trim()));
    } catch {
      /* malformed JSON-LD: skip */
    }
  }
  const isProduct = types.has("Product") || types.has("ProductGroup");
  return {
    types: [...types],
    offer: isProduct ? { hasPrice: offerHasPrice, hasAvailability: offerHasAvailability } : null,
  };
}

export function checkPage(type: PageType, url: string, html: string): PageCheck {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1] ??
    "";
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const noindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = imgs.filter((t) => !/\balt=["'][^"']+["']/i.test(t)).length;
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const words = (decode(text).match(/[A-Za-zÀ-ÿ0-9][\wÀ-ÿ'-]*/g) ?? []).length;
  const { types, offer } = jsonLdTypes(html);

  const issues: PageIssue[] = [];
  const t = title ? decode(title) : null;
  if (noindex) issues.push({ severity: "high", text: "Page tells search engines not to index it (noindex)." });
  if (!t) issues.push({ severity: "high", text: "No page title." });
  else if (t.length > 65) issues.push({ severity: "low", text: `Title is ${t.length} characters; Google usually cuts it off around 60.` });
  else if (t.length < 20) issues.push({ severity: "medium", text: `Title is only ${t.length} characters, leaving out search terms buyers use.` });
  if (!desc) issues.push({ severity: "medium", text: "No meta description, so Google writes its own snippet for search results." });
  if (h1Count === 0) issues.push({ severity: "medium", text: "No main heading (H1) on the page." });
  else if (h1Count > 1) issues.push({ severity: "low", text: `${h1Count} main headings (H1); one clear H1 is stronger.` });
  if (!hasCanonical) issues.push({ severity: "low", text: "No canonical tag, so duplicate versions of this page can compete with each other." });
  if (type === "Product page") {
    if (!types.includes("Product") && !types.includes("ProductGroup")) {
      issues.push({ severity: "high", text: "No Product structured data, so Google can't show price, stock or ratings in results." });
    } else if (offer && (!offer.hasPrice || !offer.hasAvailability)) {
      issues.push({
        severity: "medium",
        text: `Product structured data is missing ${[!offer.hasPrice && "price", !offer.hasAvailability && "availability"].filter(Boolean).join(" and ")}.`,
      });
    }
  }
  if (type !== "Homepage" && !types.includes("BreadcrumbList")) {
    issues.push({ severity: "low", text: "No breadcrumb structured data to show the page's place in the catalog." });
  }
  if (imgs.length > 0 && imagesMissingAlt / imgs.length > 0.3) {
    issues.push({ severity: "low", text: `${imagesMissingAlt} of ${imgs.length} images have no description (alt text).` });
  }
  if (type === "Category page" && words < 120) {
    issues.push({ severity: "medium", text: `Only about ${words} words of text; category pages rank better with a short buying guide.` });
  }

  return {
    type,
    url,
    title: t,
    titleLength: t?.length ?? 0,
    metaDescriptionLength: decode(desc).length,
    h1Count,
    hasCanonical,
    noindex,
    structuredData: types,
    productOffer: offer,
    images: imgs.length,
    imagesMissingAlt,
    words,
    issues,
  };
}

const CATEGORY_LINK_RE = /\/(collections?|product-category|category|categories|shop|c)\/[^/?#]+\/?$/i;
const PRODUCT_LINK_RE = /\/(products?|item|p)\/[^/?#]+\/?$/i;

function linksFrom(html: string, base: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname.replace(/^www\./, "") === new URL(base).hostname.replace(/^www\./, "")) out.add(u.origin + u.pathname);
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

/** One page per type, from the sitemap when possible, else from homepage links. */
export async function samplePages(siteUrl: string): Promise<{ type: PageType; url: string; html: string }[]> {
  const host = new URL(siteUrl).hostname;
  const home = (await fetchTextDirect(`https://${host}/`, 12000)) ??
    (await fetchTextDirect(`https://${host.startsWith("www.") ? host.slice(4) : `www.${host}`}/`, 12000));
  if (!home) return [];
  const pages: { type: PageType; url: string; html: string }[] = [{ type: "Homepage", url: `https://${host}/`, html: home }];

  const catalog = await fetchSitemapCatalog(host);
  const links = linksFrom(home, `https://${host}/`);
  const pick = (list: string[]) => list[Math.floor(list.length / 3)] ?? list[0];
  const categoryUrl = pick(catalog.categoryUrls) ?? links.find((u) => CATEGORY_LINK_RE.test(new URL(u).pathname));
  const productUrl = pick(catalog.productUrls) ?? links.find((u) => PRODUCT_LINK_RE.test(new URL(u).pathname));

  const [categoryHtml, productHtml] = await Promise.all([
    categoryUrl ? fetchTextDirect(categoryUrl, 12000) : Promise.resolve(null),
    productUrl ? fetchTextDirect(productUrl, 12000) : Promise.resolve(null),
  ]);
  if (categoryUrl && categoryHtml) pages.push({ type: "Category page", url: categoryUrl, html: categoryHtml });
  if (productUrl && productHtml) pages.push({ type: "Product page", url: productUrl, html: productHtml });
  return pages;
}

export type PageSpeedResult = { performance: number | null; lcp: string | null; cls: string | null; tbt: string | null };

/** Mobile PageSpeed for one URL; null when Google can't measure it. */
export async function pageSpeed(url: string): Promise<PageSpeedResult | null> {
  const params = new URLSearchParams({ url, strategy: "mobile", category: "performance" });
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, {
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const lh = data.lighthouseResult;
    const score = lh?.categories?.performance?.score;
    return {
      performance: typeof score === "number" ? Math.round(score * 100) : null,
      lcp: lh?.audits?.["largest-contentful-paint"]?.displayValue ?? null,
      cls: lh?.audits?.["cumulative-layout-shift"]?.displayValue ?? null,
      tbt: lh?.audits?.["total-blocking-time"]?.displayValue ?? null,
    };
  } catch {
    return null;
  }
}
