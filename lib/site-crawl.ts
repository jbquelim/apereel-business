import { BROWSER_UA, fetchSitemapCatalog, isBlockedPage } from "./site-fetch";
import { readShopifyCatalog } from "./shopify-feed";
import { recordPageSnapshots } from "./marketdb";

// Paid-tier crawl: reads hundreds of a site's pages (from its sitemap) and
// reports every problem by URL, then reads a few product pages from each
// competitor for a side-by-side. Every page read is saved to page_snapshots,
// so the index of page-level facts grows with each report. No AI involved.

export type PageKind = "home" | "category" | "product";

export type PageFacts = {
  url: string;
  kind: PageKind;
  status: number | null;
  blocked: boolean;
  ms: number | null;
  bytes: number | null;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  canonical: string | null;
  noindex: boolean;
  schemaTypes: string[];
  hasProductSchema: boolean;
  hasPrice: boolean;
  hasAvailability: boolean;
  price: number | null;
  currency: string | null;
  ratingValue: number | null;
  reviewCount: number | null;
  reviewWidget: boolean;
  images: number;
  imagesMissingAlt: number;
  words: number;
  specTable: boolean;
  productLinks: number;
  /** The page's main image (og:image), kept for content and ad creation. */
  image: string | null;
};

export type CrawlFinding = {
  key: string;
  severity: "high" | "medium" | "low";
  label: string;
  why: string;
  count: number;
  of: number;
  urls: string[];
};

export type SiteCrawl = {
  domain: string;
  crawledAt: string;
  sitemapProducts: number;
  sitemapCategories: number;
  crawled: { home: number; category: number; product: number };
  blocked: number;
  /** True when the site refused most of our requests (firewall). */
  mostlyBlocked: boolean;
  avgResponseMs: number | null;
  findings: CrawlFinding[];
};

export type ProductPageProfile = {
  name: string;
  domain: string;
  pages: number;
  priceInSchemaPct: number | null;
  ratingsPct: number | null;
  specTablePct: number | null;
  avgImages: number | null;
  avgWords: number | null;
  avgResponseMs: number | null;
  examples: string[];
};

export type CompetitorCompare = {
  client: ProductPageProfile;
  competitors: ProductPageProfile[];
  /** Competitors whose product pages we couldn't read (firewall, no links). */
  unreadable?: string[];
};

const MAX_CATEGORIES = 200;
const MAX_PRODUCTS = 1000;
// Gentle on small shops: at most 4 requests in flight per site.
const PARALLEL = 4;
const PAGE_TIMEOUT_MS = 12_000;
const MAX_URLS_PER_FINDING = 100;
const PLAIN_UA = "Mozilla/5.0";
// Ratings actually on the page: ratings markup, or a reviews tool's widget.
// (Empty theme placeholders like a "product-reviews" block don't count.)
const REVIEW_WIDGET_RE = /itemprop=["']aggregateRating|judge\.me|jdgm-|yotpo|okendo|stamped\.io|reviews\.io|trustpilot|bazaarvoice|powerreviews|loox\.io|class=["'][^"']*star-rating[^"']*["'][^>]*aria-label=["']Rated/i;

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&ndash;/g, "–").replace(/\s+/g, " ").trim();

/** Evenly spread picks, so a sample covers the whole catalog, not its first page. */
function spread<T>(list: T[], n: number): T[] {
  if (list.length <= n) return list;
  const step = list.length / n;
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)]);
}

async function fetchPage(url: string): Promise<{ status: number | null; html: string | null; ms: number | null }> {
  for (const ua of [BROWSER_UA, PLAIN_UA]) {
    const started = Date.now();
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, Accept: "text/html,*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      });
      const ms = Date.now() - started;
      if (res.ok) return { status: res.status, html: await res.text(), ms };
      if (![401, 403, 406, 429].includes(res.status) || ua === PLAIN_UA) return { status: res.status, html: null, ms };
    } catch {
      return { status: null, html: null, ms: null };
    }
  }
  return { status: null, html: null, ms: null };
}

function readJsonLd(html: string) {
  const types = new Set<string>();
  let hasPrice = false;
  let hasAvailability = false;
  let price: number | null = null;
  let currency: string | null = null;
  let ratingValue: number | null = null;
  let reviewCount: number | null = null;
  const num = (v: unknown) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) : NaN;
    return Number.isFinite(n) ? n : null;
  };
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    const names = (Array.isArray(t) ? t : t ? [t] : []).filter((n): n is string => typeof n === "string");
    names.forEach((n) => types.add(n));
    if (names.some((n) => n === "Offer" || n === "AggregateOffer")) {
      const p = num(obj.price ?? obj.lowPrice);
      if (p != null || obj.priceSpecification != null) hasPrice = true;
      if (p != null && price == null) price = p;
      if (typeof obj.priceCurrency === "string" && !currency) currency = obj.priceCurrency;
      if (obj.availability != null) hasAvailability = true;
    }
    if (names.includes("AggregateRating")) {
      ratingValue ??= num(obj.ratingValue);
      reviewCount ??= num(obj.reviewCount ?? obj.ratingCount);
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
  return { types: [...types], hasPrice, hasAvailability, price, currency, ratingValue, reviewCount };
}

export function readFacts(url: string, kind: PageKind, html: string, status: number | null, ms: number | null, productSet?: Set<string>): PageFacts {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1] ??
    null;
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1] ??
    null;
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  const main = body.replace(/<(header|nav|footer)\b[\s\S]*?<\/\1>/gi, " ");
  const text = main
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const ld = readJsonLd(html);
  let productLinks = 0;
  if (productSet && kind === "category") {
    const seen = new Set<string>();
    for (const m of main.matchAll(/href=["']([^"'#?]+)/gi)) {
      try {
        const u = new URL(m[1], url);
        const key = (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
        if (productSet.has(key)) seen.add(key);
      } catch {
        /* ignore */
      }
    }
    productLinks = seen.size;
  }
  return {
    url,
    kind,
    status,
    blocked: false,
    ms,
    bytes: html.length,
    title: title ? decode(title) || null : null,
    metaDescription: desc ? decode(desc) || null : null,
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    canonical,
    noindex: /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),
    schemaTypes: ld.types,
    hasProductSchema: ld.types.includes("Product") || ld.types.includes("ProductGroup"),
    hasPrice: ld.hasPrice,
    hasAvailability: ld.hasAvailability,
    price: ld.price,
    currency: ld.currency,
    ratingValue: ld.ratingValue,
    reviewCount: ld.reviewCount,
    reviewWidget: ld.ratingValue != null || REVIEW_WIDGET_RE.test(html),
    images: imgs.length,
    imagesMissingAlt: imgs.filter((t) => !/\balt=["'][^"']+["']/i.test(t)).length,
    words: (decode(text).match(/[A-Za-zÀ-ÿ0-9][\wÀ-ÿ'-]*/g) ?? []).length,
    specTable: /<table[\s>]|<dl[\s>]|woocommerce-product-attributes|product-specs|specifications/i.test(main),
    productLinks,
    image: (() => {
      const raw =
        html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
      try {
        return raw ? new URL(decode(raw), url).toString().slice(0, 1000) : null;
      } catch {
        return null;
      }
    })(),
  };
}

async function crawlList(
  items: { url: string; kind: PageKind }[],
  deadline: number,
  productSet?: Set<string>,
): Promise<PageFacts[]> {
  const out: PageFacts[] = [];
  let next = 0;
  let consecutiveBlocked = 0;
  const worker = async () => {
    while (next < items.length && Date.now() < deadline && consecutiveBlocked < 15) {
      const { url, kind } = items[next++];
      const { status, html, ms } = await fetchPage(url);
      if (html && !isBlockedPage(html)) {
        consecutiveBlocked = 0;
        out.push(readFacts(url, kind, html, status, ms, productSet));
      } else {
        const blocked = !!html || status === 403 || status === 429 || status === 401;
        consecutiveBlocked = blocked ? consecutiveBlocked + 1 : 0;
        out.push({
          ...readFacts(url, kind, "", status, ms),
          blocked,
          bytes: null,
        });
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return out;
}

const key = (u: string) => {
  try {
    const x = new URL(u);
    return (x.hostname.replace(/^www\./, "") + x.pathname).replace(/\/$/, "");
  } catch {
    return u;
  }
};

function finding(
  f: Omit<CrawlFinding, "count" | "urls">,
  pages: PageFacts[],
): CrawlFinding | null {
  if (pages.length === 0) return null;
  return { ...f, count: pages.length, urls: pages.slice(0, MAX_URLS_PER_FINDING).map((p) => p.url) };
}

function findingsFrom(pages: PageFacts[]): CrawlFinding[] {
  const ok = pages.filter((p) => !p.blocked && p.status != null && p.status < 400);
  const products = ok.filter((p) => p.kind === "product");
  const categories = ok.filter((p) => p.kind === "category");
  const broken = pages.filter((p) => !p.blocked && p.status != null && p.status >= 400);

  const byTitle = new Map<string, PageFacts[]>();
  for (const p of ok) if (p.title) byTitle.set(p.title.toLowerCase(), [...(byTitle.get(p.title.toLowerCase()) ?? []), p]);
  const dupTitles = [...byTitle.values()].filter((g) => g.length > 1).flat();
  const byDesc = new Map<string, PageFacts[]>();
  for (const p of ok) if (p.metaDescription) byDesc.set(p.metaDescription.toLowerCase(), [...(byDesc.get(p.metaDescription.toLowerCase()) ?? []), p]);
  const dupDescs = [...byDesc.values()].filter((g) => g.length > 1).flat();

  const all: (CrawlFinding | null)[] = [
    finding({ key: "broken", severity: "high", label: "Pages listed in your sitemap that return an error", why: "Google is told these pages exist, then finds an error; buyers who land there leave.", of: pages.length }, broken),
    finding({ key: "noindex", severity: "high", label: "Pages that tell Google not to index them", why: "They can never appear in search results.", of: ok.length }, ok.filter((p) => p.noindex)),
    finding({ key: "product-no-schema", severity: "high", label: "Product pages with no product data for Google", why: "Google can't show price, stock or ratings for them in search results.", of: products.length }, products.filter((p) => !p.hasProductSchema)),
    finding({ key: "product-no-price", severity: "medium", label: "Product pages whose product data has no price", why: "Without a price Google won't show the product in shopping-style results.", of: products.length }, products.filter((p) => p.hasProductSchema && !p.hasPrice)),
    finding({ key: "product-no-availability", severity: "low", label: "Product pages whose product data has no stock status", why: "Google can't say 'In stock' next to the result.", of: products.length }, products.filter((p) => p.hasProductSchema && !p.hasAvailability)),
    finding({ key: "product-no-reviews", severity: "medium", label: "Product pages with no reviews or ratings", why: "Ratings are one of the strongest reasons buyers choose one result over another.", of: products.length }, products.filter((p) => !p.reviewWidget)),
    finding({ key: "thin-category", severity: "medium", label: "Category pages linking to fewer than 4 products", why: "Thin categories compete with each other and rarely rank; merging them builds stronger pages.", of: categories.length }, categories.filter((p) => p.productLinks < 4)),
    finding({ key: "no-title", severity: "high", label: "Pages with no title", why: "The title is what Google shows as the headline of your result.", of: ok.length }, ok.filter((p) => !p.title)),
    finding({ key: "dup-title", severity: "medium", label: "Pages sharing a title with another page", why: "Google can't tell which page to show, so they compete with each other.", of: ok.length }, dupTitles),
    finding({ key: "no-description", severity: "low", label: "Pages with no meta description", why: "Google writes its own snippet, usually a weaker one.", of: ok.length }, ok.filter((p) => !p.metaDescription)),
    finding({ key: "dup-description", severity: "low", label: "Pages sharing a meta description with another page", why: "Identical snippets make results look interchangeable.", of: ok.length }, dupDescs),
    finding({ key: "no-h1", severity: "medium", label: "Pages with no main heading (H1)", why: "The H1 tells Google and buyers what the page is about.", of: ok.length }, ok.filter((p) => p.h1Count === 0)),
    finding({ key: "multi-h1", severity: "low", label: "Pages with more than one main heading (H1)", why: "One clear H1 is a stronger signal than several.", of: ok.length }, ok.filter((p) => p.h1Count > 1)),
    finding({ key: "alt-missing", severity: "low", label: "Pages where most images have no description (alt text)", why: "Image search and screen readers rely on it.", of: ok.length }, ok.filter((p) => p.images >= 3 && p.imagesMissingAlt / p.images > 0.5)),
    finding({ key: "slow", severity: "medium", label: "Pages that took over 3 seconds for the server to answer", why: "Slow responses cost rankings and buyers before the page even draws.", of: ok.length }, ok.filter((p) => (p.ms ?? 0) > 3000)),
    finding({ key: "canonical-elsewhere", severity: "low", label: "Pages that point Google to a different address (canonical)", why: "Fine for true duplicates; a mistake if the page should rank on its own.", of: ok.length }, ok.filter((p) => p.canonical && key(p.canonical) !== key(p.url))),
  ];
  const order = { high: 0, medium: 1, low: 2 };
  return all
    .filter((f): f is CrawlFinding => !!f)
    .sort((a, b) => order[a.severity] - order[b.severity] || b.count / Math.max(b.of, 1) - a.count / Math.max(a.of, 1));
}

const PRODUCT_PATH_RE = /\/(products?|item|p)\/[^/?#]+\/?$/i;
const CATEGORY_PATH_RE = /\/(collections?|product-category|category|categories|shop|c)\/[^/?#]+\/?$/i;

function siteLinks(html: string, base: string): string[] {
  const host = new URL(base).hostname.replace(/^www\./, "");
  const out = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname.replace(/^www\./, "") === host) out.add(u.origin + u.pathname);
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

// A product page by its content, not its address: platforms like BigCommerce
// use flat slugs. Markers are independent of Google product data, so the
// side-by-side's "price in product data" figure stays fair.
const PRODUCT_PAGE_RE = /og:type["'][^>]*content=["']product["']|content=["']product["'][^>]*og:type|<form[^>]+action=["'][^"']*\/cart\/add|name=["']add-to-cart["'][^>]*value=["']\d+/i;
const NOT_CONTENT_RE = /\/(cart|checkout|account|login|register|search|blog|news|contact|about|careers|privacy|terms|policies|pages?)\b/i;

/** Product pages found by browsing: the homepage, then a few category pages. */
async function productUrlsFromLinks(domain: string): Promise<string[]> {
  for (const host of [domain, `www.${domain}`]) {
    const home = await fetchPage(`https://${host}/`);
    if (!home.html || isBlockedPage(home.html)) continue;
    const links = siteLinks(home.html, `https://${host}/`).filter((u) => !NOT_CONTENT_RE.test(new URL(u).pathname) && new URL(u).pathname.length > 1);
    const byPath = links.filter((u) => PRODUCT_PATH_RE.test(new URL(u).pathname));
    if (byPath.length >= 6) return byPath;
    // Otherwise open a few category pages and test their links by content.
    const categories = links.filter((u) => CATEGORY_PATH_RE.test(new URL(u).pathname) || new URL(u).pathname.split("/").filter(Boolean).length >= 1).slice(0, 4);
    const candidates = new Set(byPath);
    const catPages = await Promise.all(categories.map((u) => fetchPage(u)));
    catPages.forEach((p, i) => {
      if (p.html && !isBlockedPage(p.html)) {
        siteLinks(p.html, categories[i]).filter((u) => !NOT_CONTENT_RE.test(new URL(u).pathname) && !links.includes(u)).forEach((u) => candidates.add(u));
      }
    });
    const sample = spread([...candidates].filter((u) => new URL(u).pathname.length > 1), 16);
    const checked = await Promise.all(sample.map(async (u) => ({ u, page: await fetchPage(u) })));
    const products = checked.filter(({ page }) => page.html && !isBlockedPage(page.html) && PRODUCT_PAGE_RE.test(page.html)).map(({ u }) => u);
    if (products.length > 0) return products;
  }
  return [];
}

async function productUrlsFor(domain: string): Promise<{ productUrls: string[]; categoryUrls: string[] }> {
  const catalog = await fetchSitemapCatalog(domain);
  if (catalog.productUrls.length > 0) return catalog;
  // Shopify stores without a readable sitemap: the public feed lists products.
  const feed = await readShopifyCatalog(domain).catch(() => ({ products: [] }));
  const fromFeed = feed.products.filter((p) => p.handle).map((p) => `https://${domain}/products/${p.handle}`);
  if (fromFeed.length > 0) return { productUrls: fromFeed, categoryUrls: catalog.categoryUrls };
  return { productUrls: await productUrlsFromLinks(domain), categoryUrls: catalog.categoryUrls };
}

/** Reads up to ~1,200 pages of the client's site within the time budget. */
export async function crawlSite(domain: string, budgetMs: number): Promise<{ crawl: SiteCrawl; pages: PageFacts[] }> {
  const deadline = Date.now() + budgetMs;
  const { productUrls, categoryUrls } = await productUrlsFor(domain);
  const productSet = new Set(productUrls.map(key));
  const items = [
    { url: `https://${domain}/`, kind: "home" as const },
    ...spread(categoryUrls, MAX_CATEGORIES).map((url) => ({ url, kind: "category" as const })),
    ...spread(productUrls, MAX_PRODUCTS).map((url) => ({ url, kind: "product" as const })),
  ];
  const pages = await crawlList(items, deadline, productSet);
  const read = pages.filter((p) => !p.blocked && p.status != null && p.status < 400);
  const blocked = pages.filter((p) => p.blocked).length;
  const times = read.map((p) => p.ms).filter((n): n is number => n != null);
  await recordPageSnapshots(domain, "client", pages);
  return {
    pages,
    crawl: {
      domain,
      crawledAt: new Date().toISOString(),
      sitemapProducts: productUrls.length,
      sitemapCategories: categoryUrls.length,
      crawled: {
        home: read.filter((p) => p.kind === "home").length,
        category: read.filter((p) => p.kind === "category").length,
        product: read.filter((p) => p.kind === "product").length,
      },
      blocked,
      mostlyBlocked: pages.length > 0 && blocked / pages.length > 0.5,
      avgResponseMs: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
      findings: findingsFrom(pages),
    },
  };
}

function profile(name: string, domain: string, pages: PageFacts[]): ProductPageProfile {
  const ok = pages.filter((p) => p.kind === "product" && !p.blocked && p.status != null && p.status < 400);
  const pct = (f: (p: PageFacts) => boolean) => (ok.length ? Math.round((ok.filter(f).length / ok.length) * 100) : null);
  const avg = (f: (p: PageFacts) => number | null) => {
    const v = ok.map(f).filter((n): n is number => n != null);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
  };
  return {
    name,
    domain,
    pages: ok.length,
    priceInSchemaPct: pct((p) => p.hasPrice),
    ratingsPct: pct((p) => p.reviewWidget),
    specTablePct: pct((p) => p.specTable),
    avgImages: avg((p) => p.images),
    avgWords: avg((p) => p.words),
    avgResponseMs: avg((p) => p.ms),
    examples: ok.slice(0, 3).map((p) => p.url),
  };
}

/** The client's product pages against a handful from each competitor. */
export async function compareProductPages(
  client: { name: string; domain: string; pages: PageFacts[] },
  competitors: { name: string; domain: string }[],
  budgetMs: number,
): Promise<CompetitorCompare> {
  const deadline = Date.now() + budgetMs;
  const rows = await Promise.all(
    competitors.slice(0, 4).map(async (c) => {
      const domain = c.domain.replace(/^www\./, "");
      const { productUrls } = await productUrlsFor(domain).catch(() => ({ productUrls: [] as string[] }));
      const pages = await crawlList(spread(productUrls, 6).map((url) => ({ url, kind: "product" as const })), deadline);
      await recordPageSnapshots(domain, "competitor", pages);
      return profile(c.name, domain, pages);
    }),
  );
  return {
    client: profile(client.name, client.domain, client.pages),
    competitors: rows.filter((r) => r.pages > 0),
    unreadable: rows.filter((r) => r.pages === 0).map((r) => r.name),
  };
}
