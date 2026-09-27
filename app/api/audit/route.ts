import { NextResponse, after } from "next/server";
import {
  recordAuditSnapshot,
  fetchSegmentBenchmark,
  fetchCompetitorSet,
  saveCompetitorSet,
  recordTechSnapshots,
} from "@/lib/marketdb";
import { recordLeadAndSendEmail } from "@/lib/leads";
import {
  taxonomyPromptBlock,
  normalizeClassification,
} from "@/lib/taxonomy";
import { fetchProofSignals, type ProofSignals } from "@/lib/proofSignals";
import {
  fetchSiteStack,
  stackGaps,
  type SiteStack,
  type TechCategory,
} from "@/lib/tech-stack";
import {
  competitorQueries,
  fetchExaCompanies,
  finalizeCompetitors,
  screenCompetitors,
  type CompetitorCandidate,
} from "@/lib/competitors";
import { runExperienceChecks, type ExperienceCheckResult } from "@/lib/experience-check";
import {
  matchProducts,
  formatCents,
  type RawProduct,
  type ProductMatch,
} from "@/lib/productMatch";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require("google-trends-api");

export const maxDuration = 180;

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function normalizeUrl(input: string): string | null {
  let url = input.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

type Competitor = {
  name: string;
  domain: string;
  strength: string;
};

type Channel = {
  name: string;
  percentage: number;
};

type Keyword = {
  keyword: string;
  intent: "N" | "C" | "I" | "T";
  position: number;
  volume: string;
  cpc: number;
  traffic: number;
};

type InventoryCategory = {
  category: string;
  productCount: number | null;
  avgPrice: string | null;
  priceRange: string | null;
};

type CompetitorInventory = {
  name: string;
  domain: string;
  categories: InventoryCategory[];
  source?: InventorySource;
  // Raw live-feed products, server-side only — stripped before the response.
  products?: RawProduct[];
};

type IndustryAnalysis = {
  industry: string;
  subIndustry: string;
  detectedCountry?: string | null;
  businessModel: string | null;
  // What the business actually sells and to whom — drives competitor search.
  offering: string;
  competitorQueries: string[];
  competitors: Competitor[];
  insight: string;
  channels: Channel[];
  topPlayer: string;
  keywords: Keyword[];
  totalKeywords: number;
  inventoryCategories: InventoryCategory[];
} | null;

type TranslateAdvantage = {
  strength: string;
  touchpoints: { name: string; action: string }[];
  services: { tag: string; reason: string }[];
} | null;

type TrendPoint = {
  date: string;
  values: number[];
};

type TrendsData = {
  keywords: string[];
  timeline: TrendPoint[];
} | null;

type ProductComparison = {
  clientTitle: string;
  clientPrice: string;
  competitorTitle: string;
  competitorPrice: string;
  competitorName: string;
  competitorDomain: string;
};

type MarketPosition = {
  segment: string;
  storesTracked: number;
  medianDepth: number | null;
  medianPrice: string | null;
  priceLow: string | null;
  priceHigh: string | null;
  clientDepth: number | null;
  clientPrice: string | null;
};

type AuditResult = {
  url: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  vitals: {
    lcp: string | null;
    cls: string | null;
    fcp: string | null;
    si: string | null;
    tbt: string | null;
    tti: string | null;
  };
  meta: {
    title: string | null;
    titleLength: number;
    description: string | null;
    descriptionLength: number;
    h1: string | null;
    h1Count: number;
    hasCanonical: boolean;
    hasOgTags: boolean;
    hasTwitterCards: boolean;
    hasSchemaMarkup: boolean;
    hasViewport: boolean;
    isHttps: boolean;
    robotsMeta: string | null;
    imageCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
  };
  experience?: ExperienceCheckResult | null;
  marketPosition?: MarketPosition;
  techStack?: {
    client: SiteStack;
    competitors: SiteStack[];
    gaps: { category: TechCategory; examples: string[]; competitorCount: number }[];
  };
  industry: IndustryAnalysis;
  trends: TrendsData;
  credibility?: {
    client: ProofSignals;
    competitors: { name: string; domain: string; signals: ProofSignals }[];
  };
  competitorInventories?: CompetitorInventory[];
  productComparisons?: ProductComparison[];
  inventoryInsights?: string[];
  translateAdvantage?: TranslateAdvantage;
  headline?: string;
};

async function fetchPageMeta(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    let res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 10000);
      res = await fetch(url, {
        signal: controller2.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
        redirect: "follow",
      });
      clearTimeout(timeout2);
    }
    clearTimeout(timeout);

    if (!res.ok) {
      console.error("fetchPageMeta: both attempts failed for", url, "status:", res.status);
      return null;
    }

    const html = await res.text();
    const maxLen = 200000;
    const doc = html.slice(0, maxLen);

    const extract = (pattern: RegExp): string | null => {
      const m = doc.match(pattern);
      return m?.[1]?.trim() ?? null;
    };

    const extractAll = (pattern: RegExp): string[] => {
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      while ((m = re.exec(doc)) !== null) {
        if (m[1]) matches.push(m[1].trim());
      }
      return matches;
    };

    const title =
      extract(/<title[^>]*>([^<]+)<\/title>/i) ?? null;
    const description =
      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ??
      extract(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ??
      null;

    const h1s = extractAll(/<h1[^>]*>([^<]*(?:<[^/][^>]*>[^<]*)*)<\/h1>/gi).map(
      (h) => h.replace(/<[^>]+>/g, "").trim(),
    );

    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(doc);
    const hasOgTags = /<meta[^>]*property=["']og:/i.test(doc);
    const hasTwitterCards = /<meta[^>]*name=["']twitter:/i.test(doc);
    const hasSchemaMarkup =
      /<script[^>]*type=["']application\/ld\+json["']/i.test(doc) ||
      /itemtype=["']https?:\/\/schema\.org/i.test(doc);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(doc);

    const robotsMeta =
      extract(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ?? null;

    const imgTags = doc.match(/<img[^>]*>/gi) ?? [];
    const imagesWithAlt = imgTags.filter((tag) =>
      /alt=["'][^"']+["']/i.test(tag),
    ).length;
    const imagesWithoutAlt = imgTags.length - imagesWithAlt;

    const bodyText = doc
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    const jsonLdBlocks = extractAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );
    const structuredData = jsonLdBlocks.length > 0 ? jsonLdBlocks.join("\n") : null;

    const experience = runExperienceChecks(doc, url.startsWith("https"));

    return {
      title,
      titleLength: title?.length ?? 0,
      description,
      descriptionLength: description?.length ?? 0,
      h1: h1s[0] ?? null,
      h1Count: h1s.length,
      hasCanonical,
      hasOgTags,
      hasTwitterCards,
      hasSchemaMarkup,
      hasViewport,
      isHttps: url.startsWith("https"),
      robotsMeta,
      imageCount: imgTags.length,
      imagesWithAlt,
      imagesWithoutAlt,
      bodyText,
      structuredData,
      experience,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchViaJina(targetUrl: string, timeoutMs = 15000): Promise<string | null> {
  try {
    const headers: Record<string, string> = { Accept: "text/plain" };
    if (process.env.JINA_API_KEY) headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
    const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchViaJinaReader(url: string): Promise<string | null> {
  const text = await fetchViaJina(url);
  return text ? text.slice(0, 8000) : null;
}

async function fetchViaWaybackMachine(url: string): Promise<string | null> {
  try {
    const domain = new URL(url).hostname;
    const availRes = await fetch(
      `https://archive.org/wayback/available?url=${domain}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!availRes.ok) return null;
    const availData = await availRes.json();
    const snapshotUrl = availData?.archived_snapshots?.closest?.url;
    if (!snapshotUrl) return null;

    const pageRes = await fetch(snapshotUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "text/html" },
    });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch {
    return null;
  }
}

async function fetchWebSearchResults(domain: string): Promise<string | null> {
  const sources = [
    `https://r.jina.ai/https://html.duckduckgo.com/html/?q=${encodeURIComponent(domain)}`,
    `https://r.jina.ai/https://www.google.com/search?q=${encodeURIComponent(domain)}`,
  ];

  for (const searchUrl of sources) {
    try {
      const res = await fetch(searchUrl, {
        headers: { Accept: "text/plain" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.length < 200) continue;
      console.log("Web search succeeded via:", searchUrl.includes("duckduckgo") ? "DuckDuckGo" : "Google");
      return `Web search results for "${domain}":\n\n${text.slice(0, 6000)}`;
    } catch {
      continue;
    }
  }

  console.error("All web search sources failed for:", domain);
  return null;
}

async function fetchCompetitorSearchResults(queries: string[]): Promise<string | null> {
  const results: string[] = [];
  for (const query of queries) {
    try {
      const res = await fetch(
        `https://r.jina.ai/https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(12000) },
      );
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.length > 200) {
        results.push(`Search: "${query}"\n${text.slice(0, 3000)}`);
      }
    } catch {}
    if (results.length >= 2) break;
  }
  return results.length > 0 ? results.join("\n\n---\n\n") : null;
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MAX_RAW_PRODUCTS = 150;

type ShopifyProduct = {
  title?: string;
  handle?: string;
  product_type?: string;
  variants?: { price: string }[];
};

const GIFT_CARD_RE = /gift ?cards?|e-?gift/i;
const SHOPIFY_PAGE_LIMIT = 8; // 8 × 250 = 2,000 products read per store

function shopifyMinPrice(p: ShopifyProduct): number | null {
  const prices = (p.variants ?? []).map((v) => parseFloat(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function describePrices(prices: number[]): string {
  if (prices.length === 0) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return `, avg price $${Math.round(avg).toLocaleString()}, price range $${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
}

async function fetchShopifyJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchShopifyInventory(
  domain: string,
): Promise<{ text: string; products: RawProduct[]; totalProducts?: number } | null> {
  try {
    // 1) The whole public catalog, grouped by product type: real categories
    //    with exact counts. Collections are often merchandising views (price
    //    bands, months, "shop all") that overlap and mislead.
    const catalog: ShopifyProduct[] = [];
    let complete = false;
    for (let page = 1; page <= SHOPIFY_PAGE_LIMIT; page++) {
      const data = await fetchShopifyJson<{ products?: ShopifyProduct[] }>(
        `https://${domain}/products.json?limit=250&page=${page}`,
      );
      const batch = data?.products;
      if (!Array.isArray(batch)) {
        if (page === 1) break;
        complete = true;
        break;
      }
      catalog.push(...batch);
      if (batch.length < 250) {
        complete = true;
        break;
      }
    }

    const sellable = catalog.filter((p) => p.title && p.handle && !GIFT_CARD_RE.test(`${p.title} ${p.product_type ?? ""}`));
    const rawProducts: RawProduct[] = sellable.slice(0, MAX_RAW_PRODUCTS).map((p) => {
      const min = shopifyMinPrice(p);
      return {
        title: p.title!,
        productType: p.product_type || null,
        priceCents: min != null ? Math.round(min * 100) : null,
        url: `https://${domain}/products/${p.handle}`,
      };
    });

    if (sellable.length >= 20) {
      const byType = new Map<string, ShopifyProduct[]>();
      for (const p of sellable) {
        const type = (p.product_type ?? "").trim();
        if (!type || JUNK_CATEGORY_RE.test(type)) continue;
        const key = type.toLowerCase();
        byType.set(key, [...(byType.get(key) ?? []), p]);
      }
      const groups = [...byType.values()]
        .filter((g) => g.length >= 3)
        .sort((a, b) => b.length - a.length)
        .slice(0, 8);
      const typed = groups.reduce((n, g) => n + g.length, 0);
      if (groups.length >= 2 && typed >= sellable.length * 0.4) {
        const total = `${sellable.length.toLocaleString()}${complete ? "" : "+"}`;
        const lines = [
          `Total products in catalog: ${total}${complete ? "" : ` (first ${SHOPIFY_PAGE_LIMIT * 250} read)`}`,
          ...groups.map((g) => {
            const prices = g.map(shopifyMinPrice).filter((n): n is number => n != null);
            return `Product type "${g[0].product_type!.trim()}": ${g.length} products${describePrices(prices)}`;
          }),
        ];
        console.log("Shopify catalog read for", domain, "-", sellable.length, "products,", groups.length, "types");
        return {
          text: `Live product data from ${domain} (exact figures from the store's public product feed, grouped by product type — use these numbers verbatim):\n${lines.join("\n")}`,
          products: rawProducts,
          totalProducts: complete ? sellable.length : undefined,
        };
      }
    }

    // 2) Fallback: named collections, skipping merchandising views.
    type ShopifyCollection = { handle: string; title: string; products_count?: number };
    const collections = (await fetchShopifyJson<{ collections?: ShopifyCollection[] }>(
      `https://${domain}/collections.json?limit=250`,
    ))?.collections;
    if (!Array.isArray(collections) || collections.length === 0) {
      return null;
    }
    const picked = collections
      .filter((c) => (c.products_count ?? 1) > 0 && !JUNK_CATEGORY_RE.test(c.title))
      .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
      .slice(0, 6);

    const seenHandles = new Set(rawProducts.map((p) => p.url));
    const lines = (await Promise.all(
      picked.map(async (col) => {
        const products = (await fetchShopifyJson<{ products?: ShopifyProduct[] }>(
          `https://${domain}/collections/${col.handle}/products.json?limit=250`,
        ))?.products;
        if (!Array.isArray(products) || products.length === 0) return null;
        for (const p of products) {
          if (rawProducts.length >= MAX_RAW_PRODUCTS) break;
          const url = `https://${domain}/products/${p.handle}`;
          if (!p.title || !p.handle || seenHandles.has(url) || GIFT_CARD_RE.test(p.title)) continue;
          seenHandles.add(url);
          const min = shopifyMinPrice(p);
          rawProducts.push({
            title: p.title,
            productType: p.product_type || null,
            priceCents: min != null ? Math.round(min * 100) : null,
            url,
          });
        }
        const prices = products.map(shopifyMinPrice).filter((n): n is number => n != null);
        const exactCount = col.products_count ?? products.length;
        const count = `${exactCount}${!col.products_count && products.length === 250 ? "+" : ""}`;
        return `Collection "${col.title}": ${count} products${describePrices(prices)}`;
      }),
    )).filter(Boolean) as string[];

    if (lines.length === 0) return null;
    console.log("Shopify collections read for", domain);
    return {
      text: `Live product data from ${domain} (exact figures from the store's product API — use these numbers verbatim):\n${lines.join("\n")}`,
      products: rawProducts,
    };
  } catch {
    return null;
  }
}

// Some firewalls (e.g. WordPress security plugins) 403 a full desktop-Chrome
// user agent that arrives without Chrome's client hints, yet allow a plain
// one — so a blocked request is retried once with the plain agent.
const PLAIN_UA = "Mozilla/5.0";

async function fetchTextDirect(url: string, timeoutMs = 8000): Promise<string | null> {
  for (const ua of [BROWSER_UA, PLAIN_UA]) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, Accept: "*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return await res.text();
      if (![401, 403, 406, 429].includes(res.status)) return null;
    } catch {
      return null;
    }
  }
  return null;
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

// Language-variant duplicates (/fr/product/x mirrors /product/x) inflate counts.
const LANG_PREFIX_RE = /^\/[a-z]{2}(?:-[a-z]{2})?\/(?=.)/i;
const PRODUCT_PATH_RE = /\/(products?|item|p)\/[^/]+\/?$/;

type SitemapCatalog = { productUrls: string[]; categoryPages: number };

async function fetchSitemapCatalog(domain: string): Promise<SitemapCatalog> {
  // robots.txt names the real sitemaps (often sitemap_index.xml on WordPress,
  // or several per product line); fall back to the conventional locations.
  const robots = await fetchTextDirect(`https://${domain}/robots.txt`, 8000);
  const declared = robots
    ? [...new Set([...robots.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]))]
    : [];
  const roots = declared.length > 0
    ? declared.slice(0, 6)
    : [`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`];

  const rootXmls: string[] = [];
  for (const root of roots) {
    const text = await fetchTextDirect(root, 10000);
    if (text && /<(urlset|sitemapindex)/i.test(text)) {
      rootXmls.push(text);
      if (declared.length === 0) break; // conventional fallbacks: first hit wins
    }
  }
  if (rootXmls.length === 0) return { productUrls: [], categoryPages: 0 };

  const isProductCategoryMap = (u: string) => /product_cat|product-cat|collection/i.test(u);
  const isCategoryMap = (u: string) => isProductCategoryMap(u) || /categor/i.test(u);
  const urls: string[] = [];
  const childMaps: string[] = [];
  for (const xml of rootXmls) {
    if (/<sitemapindex/i.test(xml)) childMaps.push(...extractLocs(xml));
    else urls.push(...extractLocs(xml));
  }

  let categoryPages = 0;
  if (childMaps.length > 0) {
    // WooCommerce splits products across product-sitemap.xml, -sitemap2 …;
    // tags and attribute (pa_) maps are not products.
    const productMaps = childMaps.filter(
      (u) => /product/i.test(u) && !isCategoryMap(u) && !/product_tag|product-tag|pa_|brand/i.test(u),
    );
    const children = (productMaps.length > 0
      ? productMaps
      : childMaps.filter((u) => !/image|blog|post|video|news|page|author|tag/i.test(u))
    ).slice(0, 8);
    const categoryMap = childMaps.find(isProductCategoryMap) ?? childMaps.find(isCategoryMap);
    const [childXmls, categoryXml] = await Promise.all([
      Promise.all(children.map((u) => fetchTextDirect(u, 10000))),
      categoryMap ? fetchTextDirect(categoryMap, 10000) : Promise.resolve(null),
    ]);
    urls.push(...(childXmls.filter(Boolean) as string[]).flatMap(extractLocs));
    categoryPages = categoryXml ? extractLocs(categoryXml).length : 0;
  }

  const productUrls = [...new Set(urls)].filter((u) => {
    try {
      const path = new URL(u).pathname;
      return PRODUCT_PATH_RE.test(path) && !LANG_PREFIX_RE.test(path);
    } catch {
      return false;
    }
  });
  return { productUrls, categoryPages };
}

function groupProductUrls(productUrls: string[]): { label: string; urls: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const u of productUrls) {
    const slug = new URL(u).pathname.replace(/\/$/, "").split("/").pop() ?? "";
    const token = slug.split("-")[0]?.toLowerCase() ?? "";
    if (!token || /^\d+$/.test(token)) continue;
    const list = groups.get(token) ?? [];
    list.push(u);
    groups.set(token, list);
  }
  const top = [...groups.entries()]
    .filter(([, us]) => us.length >= 5)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6);
  // First-slug-word groups only mean something when they cover most of the
  // catalog (brand- or type-led slugs). Scattered part numbers produce tiny
  // groups that read as a "thin catalog" — report the total instead.
  const covered = top.reduce((n, [, us]) => n + us.length, 0);
  if (covered < productUrls.length * 0.4) return [];
  return top.map(([label, us]) => ({ label, urls: us }));
}

async function sampleProductPrices(urls: string[], sampleSize: number): Promise<number[]> {
  const step = Math.max(1, Math.floor(urls.length / sampleSize));
  const picks = Array.from(
    { length: Math.min(sampleSize, urls.length) },
    (_, i) => urls[Math.min(i * step, urls.length - 1)],
  );
  const prices = await Promise.all(
    picks.map(async (u) => {
      const html = await fetchTextDirect(u, 6000);
      if (!html) return null;
      const m = html.match(/"price"\s*:\s*"?(\d[\d.]*)/);
      const val = m ? parseFloat(m[1]) : NaN;
      return Number.isFinite(val) && val > 0 ? val : null;
    }),
  );
  return prices.filter((p): p is number => p !== null);
}

async function fetchSitemapInventory(
  domain: string,
): Promise<{ text: string; totalProducts: number; categoryPages: number } | null> {
  const { productUrls, categoryPages } = await fetchSitemapCatalog(domain);
  if (productUrls.length < 20) return null;

  const groups = groupProductUrls(productUrls);
  const lines: string[] = [`Total products in sitemap: ${productUrls.length.toLocaleString()}`];
  if (categoryPages > 0) lines.push(`Product category pages in sitemap: ${categoryPages.toLocaleString()}`);
  if (groups.length === 0) {
    lines.push("Category breakdown: not derivable from product URLs (slugs are part numbers or model names) — report the total only");
  }

  const sampled = await Promise.all(
    groups.slice(0, 4).map(async (g) => {
      const prices = await sampleProductPrices(g.urls, 5);
      const priceNote =
        prices.length > 0
          ? `, sampled live prices: ${prices.map((p) => `$${Math.round(p).toLocaleString()}`).join(", ")}`
          : "";
      return `Category slug "${g.label}": ${g.urls.length.toLocaleString()} products${priceNote}`;
    }),
  );
  lines.push(...sampled);
  for (const g of groups.slice(4)) {
    lines.push(`Category slug "${g.label}": ${g.urls.length.toLocaleString()} products`);
  }

  console.log("Sitemap inventory found for", domain, "-", productUrls.length, "products");
  return {
    text: `Sitemap inventory analysis for ${domain} (product counts are EXACT, taken from the site's sitemap; prices sampled from live product pages — use counts verbatim, derive avg/range from the sampled prices):\n${lines.join("\n")}`,
    totalProducts: productUrls.length,
    categoryPages,
  };
}

function extractCollectionLinks(markdown: string, domain: string): string[] {
  const root = domain.replace(/^www\./, "");
  const linkRe = /\]\((https?:\/\/[^\s)]+)\)/g;
  const seen = new Set<string>();
  const links: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(markdown)) !== null && links.length < 8) {
    try {
      const u = new URL(m[1]);
      if (!u.hostname.replace(/^www\./, "").endsWith(root)) continue;
      const path = u.pathname.toLowerCase();
      if (!/(collections?|categor|shop|store|catalog|products?)/.test(path)) continue;
      if (/(privacy|terms|blog|about|contact|account|cart|login|policy|faq|financ|bag|checkout|wishlist|search|gift-card|customer|help|service)/.test(path)) continue;
      if (/\.(webp|jpe?g|png|gif|svg|avif|ico|pdf|css|js|xml)$/.test(path)) continue;
      if (/wp-content|wp-includes|\/cdn\/|\/assets\//.test(path)) continue;
      const key = u.origin + u.pathname.replace(/\/$/, "");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push(key);
    } catch {}
  }
  return links;
}

function digestCollectionPage(text: string, url: string): string | null {
  const title = text.match(/^Title:\s*(.+)$/m)?.[1]?.trim() ?? url;
  const counts = [
    ...new Set(
      (text.match(/[\d,]*[1-9][\d,]*\s*(?:products|items|results)/gi) ?? []).map((c) =>
        c.replace(/\s+/g, " ").trim(),
      ),
    ),
  ].slice(0, 5);
  const prices = (text.match(/\$\s?[\d,]*[1-9][\d,]*(?:\.\d{2})?/g) ?? []).slice(0, 60);
  if (counts.length === 0 && prices.length === 0) return null;
  return [
    `Page: ${title} (${url})`,
    counts.length > 0 ? `Product counts seen on page: ${counts.join(", ")}` : null,
    prices.length > 0 ? `Prices seen on page: ${prices.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function crawlCollectionPages(domain: string): Promise<string | null> {
  const home = await fetchViaJina(`https://${domain}`, 20000);
  if (!home) return null;

  const links = extractCollectionLinks(home, domain).slice(0, 3);
  if (links.length === 0) return null;

  const digests = (await Promise.all(
    links.map(async (link) => {
      const text = await fetchViaJina(link, 20000);
      return text ? digestCollectionPage(text, link) : null;
    }),
  )).filter(Boolean) as string[];

  if (digests.length === 0) return null;
  console.log("Crawled", digests.length, "collection pages from", domain);
  return `Crawled category/collection pages from ${domain} (real on-page data):\n\n${digests.join("\n\n")}`;
}

async function searchIndexedInventory(domain: string): Promise<string | null> {
  const queries = [
    `site:${domain} collections`,
    `site:${domain} products price`,
  ];

  const results = (await Promise.all(
    queries.map(async (query) => {
      try {
        const res = await fetch(
          `https://r.jina.ai/https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(10000) },
        );
        if (!res.ok) return null;
        const text = await res.text();
        if (text && text.length > 200) {
          return `Search: "${query}"\n${text.slice(0, 5000)}`;
        }
      } catch {}
      return null;
    }),
  )).filter(Boolean) as string[];

  if (results.length === 0) return null;
  return results.join("\n\n---\n\n");
}

type InventorySource = "live" | "sitemap" | "crawl" | "search";

type CrawledInventory = {
  data: string;
  source: InventorySource;
  products?: RawProduct[];
  // Exact catalog size when a live feed or sitemap lists every product.
  totalProducts?: number;
  categoryPages?: number;
};

const SOURCE_NOTES: Record<InventorySource, string> = {
  live: "live product API — exact figures",
  sitemap: "sitemap crawl — real category URLs and counts",
  crawl: "directly crawled category pages — real on-page counts and prices",
  search: "search-engine snippets — unreliable",
};

// "mejuri.com" geo-redirects to a localized path where the product feed
// 404s, while "www.mejuri.com" serves it — so feeds and sitemaps are tried on
// the host as typed and on its www / non-www twin.
function hostVariants(domain: string): string[] {
  const d = domain.toLowerCase();
  return [d, d.startsWith("www.") ? d.slice(4) : `www.${d}`];
}

async function crawlSiteInventory(domain: string): Promise<CrawledInventory | null> {
  for (const host of hostVariants(domain)) {
    const shopify = await fetchShopifyInventory(host);
    if (shopify) {
      return { data: shopify.text, source: "live", products: shopify.products, totalProducts: shopify.totalProducts };
    }
  }

  for (const host of hostVariants(domain)) {
    const sitemap = await fetchSitemapInventory(host);
    if (sitemap) {
      return {
        data: sitemap.text,
        source: "sitemap",
        totalProducts: sitemap.totalProducts,
        categoryPages: sitemap.categoryPages,
      };
    }
  }

  const crawled = await crawlCollectionPages(domain);
  if (crawled) return { data: crawled, source: "crawl" };

  const indexed = await searchIndexedInventory(domain);
  if (indexed) console.log("Falling back to search-indexed inventory for", domain);
  return indexed ? { data: indexed, source: "search" } : null;
}

// Promo events, price-filter views, and navigational indexes are not merchandising
// categories — comparing them against real assortment produces junk insights.
const JUNK_CATEGORY_RE = new RegExp(
  [
    "black friday", "cyber monday", "boxing day", "clearance", "flash sale",
    "last chance", "gift ?cards?", "\\bsale\\b", "\\bsales\\b", "\\d+%\\s*off",
    "april fools?", "valentine", "mother'?s day", "father'?s day",
    "^(online|web|member|app)?\\s*exclusives?$", "as seen (in|on)", "\\b(cnn|forbes|vogue|gq|oprah|buzzfeed)\\b",
    "^best ?sellers?$", "^new in$", "^trending( now)?$", "^featured$", "^back in stock$",
    "^top (picks|rated)$", "^staff picks$", "^most (popular|loved)$",
    "(spring|summer|fall|autumn|winter|holiday)\\s+(essentials|edits?|picks|favou?rites|shop)",
    "(above|under|over|below)\\s*\\$", "^\\$[\\d,]+",
    // Price-band and "shop by" views ("Shop By Under 500", "Under 300")
    "\\b(above|under|over|below)\\s*\\d", "^shop by\\b",
    // Month-named drops are merchandising calendars, not assortment
    "^(january|february|march|april|may|june|july|august|september|october|november|december)( (drop|edit|collection|launch))?$",
    "^shop all$", "^all products?$", "^collections?$", "^products?$", "^all$", "^new arrivals?$",
    // Whole-store views ("All Jewelry", "Shop All Rings") are catalog totals,
    // not categories — comparing them to a segment's deepest category misleads
    "^(shop )?all (products?|items|jewe?l(le)?ry|collections?|categories|styles|pieces|the)\\b", "^shop all\\b",
  ].join("|"),
  "i",
);

// The extraction prompt asks for averages rounded to $10, but the model doesn't
// always comply — enforce it here so displayed precision never exceeds what
// crawled data supports.
function roundAvgPrice(raw: string): string {
  return raw.replace(/\$\s*([\d,]+(?:\.\d+)?)/, (_, n: string) => {
    const v = parseFloat(n.replace(/,/g, ""));
    if (!Number.isFinite(v)) return `$${n}`;
    if (v < 100) return `$${Math.round(v)}`;
    return `$${(Math.round(v / 10) * 10).toLocaleString("en-US")}`;
  });
}

function normalizeInventoryCategory(
  cat: Partial<InventoryCategory> | null,
  allowBare = false,
): InventoryCategory | null {
  if (!cat?.category || typeof cat.category !== "string") return null;
  if (JUNK_CATEGORY_RE.test(cat.category.trim())) return null;
  const productCount =
    typeof cat.productCount === "number" && cat.productCount > 0 ? cat.productCount : null;
  const avgPrice =
    typeof cat.avgPrice === "string" && cat.avgPrice.trim() ? roundAvgPrice(cat.avgPrice) : null;
  const priceRange =
    typeof cat.priceRange === "string" && cat.priceRange.trim() ? cat.priceRange : null;
  if (!allowBare && productCount === null && avgPrice === null && priceRange === null) return null;
  // A bare navigational index row ("Collections", "Watches") with a count but no
  // price signal is usually a failed crawl of the whole site, not a category —
  // keep it only if it carries price data or a specific name.
  if (avgPrice === null && priceRange === null && /^(collections?|categories|items)$/i.test(cat.category.trim())) {
    return null;
  }
  return { category: cat.category, productCount, avgPrice, priceRange };
}

// Multiple "collections" sharing an identical to-the-dollar price ceiling are
// views of the same underlying catalog (campaign collections spanning the whole
// store), not distinct categories — presenting them side by side double-counts
// the assortment. Round ceilings ($500) can legitimately repeat across real
// categories, so only a non-round maximum counts as a fingerprint. Keep the
// deepest view from each group.
function dropOverlappingStoreViews(cats: InventoryCategory[]): InventoryCategory[] {
  const groups = new Map<number, InventoryCategory[]>();
  for (const c of cats) {
    const m = c.priceRange?.match(/\$\s*([\d,]+)(?:\.\d+)?\s*$/);
    const max = m ? Number(m[1].replace(/,/g, "")) : null;
    if (max !== null && max % 100 !== 0) {
      groups.set(max, [...(groups.get(max) ?? []), c]);
    }
  }
  const drop = new Set<InventoryCategory>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const keep = group.reduce((a, b) =>
      (b.productCount ?? 0) > (a.productCount ?? 0) ? b : a,
    );
    for (const c of group) if (c !== keep) drop.add(c);
  }
  if (drop.size > 0) {
    console.log(
      "Dropped overlapping store-wide collections:",
      [...drop].map((c) => c.category).join(", "),
    );
  }
  return cats.filter((c) => !drop.has(c));
}

type CatalogSize = { name: string; domain: string; totalProducts: number; categoryPages: number };

async function fetchCompetitorInventories(
  competitors: Competitor[],
): Promise<{ inventories: CompetitorInventory[]; catalogs: CatalogSize[] }> {
  const crawlResults = await Promise.all(
    competitors.map(async (c) => ({
      name: c.name,
      domain: c.domain,
      inventory: await crawlSiteInventory(c.domain),
    })),
  );

  // Search-snippet data is too unreliable to present as a competitor's real
  // assortment — a wrong table is worse than no table. Only live API, sitemap,
  // and directly crawled pages qualify for display.
  const withData = crawlResults.filter(
    (r): r is typeof r & { inventory: CrawledInventory } =>
      r.inventory !== null && r.inventory.source !== "search",
  );
  const dropped = crawlResults.filter((r) => r.inventory?.source === "search");
  if (dropped.length > 0) {
    console.log(
      "Dropped search-only competitor inventory for:",
      dropped.map((r) => r.domain).join(", "),
    );
  }
  const catalogs: CatalogSize[] = crawlResults
    .filter((r) => (r.inventory?.totalProducts ?? 0) > 0)
    .map((r) => ({
      name: r.name,
      domain: r.domain,
      totalProducts: r.inventory!.totalProducts!,
      categoryPages: r.inventory!.categoryPages ?? 0,
    }));
  if (withData.length === 0) return { inventories: [], catalogs };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { inventories: [], catalogs };

  const prompt = `Below is crawled inventory data for multiple competitor websites. Each competitor's data source is noted — treat live API figures as exact, and be conservative with anything derived.

${withData.map((r) => `=== ${r.name} (${r.domain}) — source: ${SOURCE_NOTES[r.inventory.source]} ===\n${r.inventory.data}`).join("\n\n")}

For each competitor, extract their inventory categories from the data above. Look for:
- Collection/category names from page titles and URLs (clean them up: "Watches for Men and Women | Maison Birks" -> "Watches"; slug tokens like "watch" -> "Watches", brand tokens like "roberto" -> the brand, e.g. "Roberto Coin")
- Product counts (e.g., "219 products", "620 Results", "1,166 items")
- Price figures. When a page lists many individual prices, compute the range from min to max and estimate avgPrice as a typical mid value. Round-number sequences like $1,000, $5,000, $10,000, $20,000, $50,000 are price FILTER buckets, not products — use them only for the range, not the average.

Respond with ONLY valid JSON:
{
  "competitors": [
    {
      "domain": "example.com",
      "categories": [
        { "category": "Category Name", "productCount": 150, "avgPrice": "$89.50", "priceRange": "$12 - $450" }
      ]
    }
  ]
}

Rules:
- "Live product data" lines already contain exact counts, avg and range — copy those numbers verbatim
- Use null for any field you cannot determine from the data — never guess or invent numbers
- OMIT any category where productCount, avgPrice AND priceRange would all be null; a bare category name is useless
- OMIT promo events (Black Friday, sales), price-filter views ("Above $2,000", "Under $500"), and bare site indexes ("Collections", "All Products") — they are not real merchandising categories
- Do NOT collapse an entire store into one generic category (e.g. "Men's Clothing" for a menswear retailer, "Jewelry" for a jeweler). If the data doesn't support at least 2 specific categories for a competitor, return an empty categories array for them instead
- Derived averages must be rounded to the nearest $10 ("$790", never "$787.50"); never present a derived number with more precision than the data supports
- Product counts must appear verbatim in the data — if no count is stated, use null; never estimate one
- If a competitor has no meaningful product data, return an empty categories array for them
- Do NOT invent categories that don't appear in the data`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return { inventories: [], catalogs };

    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { inventories: [], catalogs };

    const parsed = JSON.parse(jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) => ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""));
    if (!Array.isArray(parsed.competitors)) return { inventories: [], catalogs };

    const inventories = withData
      .map((r) => {
        const match = parsed.competitors.find(
          (c: { domain: string }) => c.domain === r.domain,
        );
        return {
          name: r.name,
          domain: r.domain,
          source: r.inventory.source,
          products: r.inventory.products,
          categories: Array.isArray(match?.categories)
            ? dropOverlappingStoreViews(
                match.categories
                  .map((cat: InventoryCategory) => normalizeInventoryCategory(cat))
                  .filter(Boolean) as InventoryCategory[],
              )
            : [],
        };
      })
      .filter((r) => r.categories.length > 0);
    return { inventories, catalogs };
  } catch (err) {
    console.error("Competitor inventory analysis failed:", err);
    return { inventories: [], catalogs };
  }
}

async function generateInventoryInsights(
  domain: string,
  subIndustry: string,
  ownCategories: InventoryCategory[],
  competitorInventories: CompetitorInventory[],
  productMatches: ProductMatch[] = [],
  marketPosition?: MarketPosition,
  catalogs: CatalogSize[] = [],
): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const fmt = (cats: InventoryCategory[]) =>
    cats
      .map(
        (c) =>
          `- ${c.category}: ${c.productCount != null ? `${c.productCount.toLocaleString()} products` : "count unknown"}${c.avgPrice ? `, avg ${c.avgPrice}` : ""}${c.priceRange ? `, range ${c.priceRange}` : ""}`,
      )
      .join("\n");

  const prompt = `You are a senior e-commerce strategy consultant. Below is real crawled inventory data for ${domain} (a ${subIndustry} business) and its competitors.

${catalogs.length > 0 ? `=== CATALOG SIZE (exact count of product pages in each site's sitemap) ===
${catalogs.map((c) => `- ${c.name} (${c.domain}): ${c.totalProducts.toLocaleString()} products${c.categoryPages ? ` across ${c.categoryPages.toLocaleString()} category pages` : ""}`).join("\n")}

` : ""}=== THE CLIENT: ${domain} — every category below BELONGS TO THE CLIENT ===
${ownCategories.length > 0 ? fmt(ownCategories) : "(no inventory data extracted)"}

=== COMPETITORS (NOT the client) ===
${competitorInventories.map((c) => `${c.name} (${c.domain}):\n${fmt(c.categories)}`).join("\n\n")}
${productMatches.length > 0 ? `
=== MATCHED COMPARABLE PRODUCTS (exact prices from live product feeds) ===
${productMatches.map((m) => `- CLIENT'S "${m.clientTitle}" (${formatCents(m.clientPriceCents)}) vs ${m.competitorName}'s "${m.competitorTitle}" (${formatCents(m.competitorPriceCents)})`).join("\n")}` : ""}
${marketPosition ? `
=== SEGMENT BENCHMARK (our proprietary market index of ${marketPosition.storesTracked} ${marketPosition.segment} stores) ===
- Median assortment depth (deepest tracked category per store): ${marketPosition.medianDepth ?? "n/a"} products
- Median store price point: ${marketPosition.medianPrice ?? "n/a"}; middle half of stores range ${marketPosition.priceLow ?? "n/a"} to ${marketPosition.priceHigh ?? "n/a"}
- The client's numbers: depth ${marketPosition.clientDepth ?? "unknown"}, price point ${marketPosition.clientPrice ?? "unknown"}` : ""}

Write 3-4 sharp, specific insights comparing the client's inventory depth and price positioning against these competitors, and what that means for their search visibility and revenue opportunity. Categories with deeper inventory tend to rank better organically — use that lens where relevant.

Rules:
- Reference REAL numbers from the data above (product counts, prices) — at least one number per insight
- Before writing each insight, verify which business each number belongs to: "Your X" must only reference categories in THE CLIENT section, and competitor numbers must be attributed to the right competitor by name
- Each insight is one sentence, under 35 words, direct and confident, addressed to the client ("Your...")
- Collections on the same site can overlap heavily — NEVER add product counts from different categories together or claim a combined total across categories
- Individual products may ONLY be compared using the MATCHED COMPARABLE PRODUCTS pairs above, quoting both product names verbatim — never pair up products yourself
- When the SEGMENT BENCHMARK block is present, ground at least one insight in it (e.g. "the median store in your segment carries...") using ONLY the numbers provided there — it is the strongest evidence available; never invent segment statistics
- No hedging words like "may", "might", "could potentially"
- If the client has no inventory data, focus on what competitors' depth means for them
- Category rows are a partial view of a catalog; when CATALOG SIZE is given, it is the authoritative total for that site
${CRAWL_GUARDRAIL}

Respond with ONLY a JSON array of strings:
["insight one", "insight two", "insight three"]`;

  try {
    let res: Response | null = null;
    for (const model of ["claude-opus-5-5", "claude-sonnet-5", "claude-haiku-4-5"]) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          // Opus 5.5 thinking is always-on; "disabled" 400s there. Thinking
          // spends output tokens, so give those attempts extra headroom.
          max_tokens: model === "claude-opus-5-5" ? 6000 : 1000,
          ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) break;
    }
    if (!res || !res.ok) return [];
    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(
      jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) =>
        ch === "\n" || ch === "\r" || ch === "\t" ? " " : "",
      ),
    );
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string" && s.length > 0).slice(0, 4)
      : [];
  } catch (err) {
    console.error("Inventory insights failed:", err);
    return [];
  }
}

// Missing data is a limitation of our crawler, not a fact about the client.
const CRAWL_GUARDRAIL = `- Missing or unmeasured client data means OUR crawler could not read it. NEVER claim or imply the client's site has no catalog, hides its products, is uncrawlable, or is invisible to search because of it
- Never call a competitor's catalog thin, small or shallow unless an exact CATALOG SIZE figure shows it`;

const APEREEL_SERVICES = [
  "Research & Competitive Analysis",
  "SEO",
  "Advertising",
  "Web Development",
  "Conversion Optimization",
  "Premium Creative",
] as const;

async function generateTranslateAdvantage(
  domain: string,
  industry: NonNullable<IndustryAnalysis>,
  inventoryInsights: string[],
): Promise<TranslateAdvantage> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const signals = [
    `Business: ${domain} — ${industry.subIndustry}`,
    industry.insight && `Competitive landscape: ${industry.insight}`,
    industry.competitors.length > 0 &&
      `Competitors: ${industry.competitors.map((c) => `${c.name} (${c.strength})`).join("; ")}`,
    industry.inventoryCategories.length > 0 &&
      `Client inventory (belongs to ${domain}): ${industry.inventoryCategories
        .map((c) => `${c.category}${c.productCount ? ` — ${c.productCount} products` : ""}${c.priceRange ? `, ${c.priceRange}` : ""}`)
        .join("; ")}`,
    inventoryInsights.length > 0 && `Inventory analysis findings:\n${inventoryInsights.map((s) => `- ${s}`).join("\n")}`,
  ].filter(Boolean);

  const prompt = `You are a senior e-commerce strategy consultant. Based on this real audit data for ${domain}, identify their single clearest competitive advantage and how to make it visible across their digital touchpoints.

${signals.join("\n\n")}

Respond with ONLY valid JSON, no markdown:
{
  "strength": "One sentence naming their single clearest competitive advantage, grounded in a REAL number or fact from the data above. Addressed to the client ('Your...'). Under 30 words.",
  "touchpoints": [
    { "name": "Touchpoint name", "action": "What to change there so the advantage is visible, under 12 words" }
  ],
  "services": [
    { "tag": "Service name from the allowed list", "reason": "Why this service unlocks the advantage for THIS business specifically, under 15 words" }
  ]
}

Rules:
- "strength" must reference data belonging to ${domain} (the client) — never attribute a competitor's numbers to the client
${CRAWL_GUARDRAIL}
- The advantage MUST be consistent with how this market actually competes (see "Competitive landscape" above). If customers in this market buy on service, expertise, brand authorization, or experience rather than price, do NOT recommend price-led or discount positioning — choose the strongest DEFENSIBLE position instead, even if a price or count statistic looks bigger
- Prefer an advantage a competitor cannot easily copy (authorized dealer status, regional dominance, service depth, exclusive lines) over raw catalog size or price, when the data supports one
- Exactly 3-4 touchpoints, chosen from: Website, Product Pages, Category Navigation, Search & Filtering, Creative, Messaging
- Exactly 2-3 services, "tag" MUST be one of: ${APEREEL_SERVICES.join(", ")}
- No hedging words like "may", "might", "could potentially"
- If the data shows no clear advantage, pick the biggest opportunity instead and frame it as what they can own`;

  try {
    let res: Response | null = null;
    for (const model of ["claude-opus-5-5", "claude-sonnet-5", "claude-haiku-4-5"]) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          // Opus 5.5 thinking is always-on; "disabled" 400s there. Thinking
          // spends output tokens, so give those attempts extra headroom.
          max_tokens: model === "claude-opus-5-5" ? 6000 : 1000,
          ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) break;
    }
    if (!res || !res.ok) return null;
    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(
      jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) =>
        ch === "\n" || ch === "\r" || ch === "\t" ? " " : "",
      ),
    );
    if (!parsed.strength || !Array.isArray(parsed.touchpoints) || !Array.isArray(parsed.services)) {
      return null;
    }
    const allowedTags = new Set<string>(APEREEL_SERVICES);
    return {
      strength: String(parsed.strength),
      touchpoints: parsed.touchpoints
        .filter((t: { name?: string; action?: string }) => t?.name && t?.action)
        .slice(0, 4)
        .map((t: { name: string; action: string }) => ({ name: t.name, action: t.action })),
      services: parsed.services
        .filter((s: { tag?: string; reason?: string }) => s?.tag && s?.reason && allowedTags.has(s.tag))
        .slice(0, 3)
        .map((s: { tag: string; reason: string }) => ({ tag: s.tag, reason: s.reason })),
    };
  } catch (err) {
    console.error("Translate advantage failed:", err);
    return null;
  }
}

async function generateHeadlineFinding(
  domain: string,
  industry: NonNullable<IndustryAnalysis>,
  inventoryInsights: string[],
  translateAdvantage: TranslateAdvantage,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const sections = [
    `Business: ${domain} — ${industry.subIndustry}`,
    industry.insight && `Competitive landscape: ${industry.insight}`,
    inventoryInsights.length > 0 && `Inventory findings:\n${inventoryInsights.map((s) => `- ${s}`).join("\n")}`,
    translateAdvantage && `Identified advantage: ${translateAdvantage.strength}`,
  ].filter(Boolean);

  const prompt = `You are a senior strategy consultant summarizing an audit for a busy CEO. Below are the audit's findings for ${domain}.

${sections.join("\n\n")}

Write the single most important takeaway of this audit — the one sentence the CEO should read before anything else. It must be consistent with the identified advantage (do not introduce a different strategy), grounded in the findings, addressed to the client ("Your..."), under 35 words, direct and confident, no hedging.

${CRAWL_GUARDRAIL}

Respond with ONLY the sentence. No quotes, no preamble.`;

  try {
    let res: Response | null = null;
    for (const model of ["claude-opus-5-5", "claude-sonnet-5", "claude-haiku-4-5"]) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          // Opus 5.5 thinking is always-on; "disabled" 400s there. Thinking
          // spends output tokens, so give those attempts extra headroom.
          max_tokens: model === "claude-opus-5-5" ? 4000 : 200,
          ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) break;
    }
    if (!res || !res.ok) return null;
    const data = await res.json();
    const text: string =
      data.content?.find((b: { type: string }) => b.type === "text")?.text?.trim() ?? "";
    if (!text || text.length > 400) return null;
    return text.replace(/^["']|["']$/g, "");
  } catch (err) {
    console.error("Headline finding failed:", err);
    return null;
  }
}

function detectCountry(domain: string): string | null {
  const tld = domain.split(".").pop()?.toLowerCase();
  const tldMap: Record<string, string> = {
    ca: "Canada", us: "United States", uk: "United Kingdom", au: "Australia",
    nz: "New Zealand", de: "Germany", fr: "France", it: "Italy",
    es: "Spain", nl: "Netherlands", be: "Belgium", jp: "Japan",
    kr: "South Korea", sg: "Singapore", hk: "Hong Kong", in: "India",
    br: "Brazil", mx: "Mexico", za: "South Africa", ie: "Ireland",
    ph: "Philippines", ae: "United Arab Emirates",
  };
  if (tld && tldMap[tld]) return tldMap[tld];
  return null;
}

async function fetchSiteClues(url: string): Promise<string | null> {
  const origin = new URL(url).origin;
  const targets = [`${origin}/sitemap.xml`, `${origin}/robots.txt`];
  const results: string[] = [];

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      });
      if (res.ok) {
        const text = await res.text();
        results.push(`--- ${target} ---\n${text.slice(0, 4000)}`);
      }
    } catch {}
  }

  return results.length > 0 ? results.join("\n\n") : null;
}



async function fetchPageSpeed(url: string) {
  const categories = [
    "performance",
    "seo",
    "accessibility",
    "best-practices",
  ];
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
  });
  for (const cat of categories) params.append("category", cat);

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error("PageSpeed API error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();

    const cats = data.lighthouseResult?.categories ?? {};
    const audits = data.lighthouseResult?.audits ?? {};

    return {
      scores: {
        performance: cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
        seo: cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
        accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
        bestPractices: cats["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null,
      },
      vitals: {
        lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
        cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
        fcp: audits["first-contentful-paint"]?.displayValue ?? null,
        si: audits["speed-index"]?.displayValue ?? null,
        tbt: audits["total-blocking-time"]?.displayValue ?? null,
        tti: audits["interactive"]?.displayValue ?? null,
      },
    };
  } catch {
    return null;
  }
}

async function fetchIndustryAnalysis(
  url: string,
  title: string | null,
  description: string | null,
  h1: string | null,
  bodyText?: string | null,
  structuredData?: string | null,
  googleSearchData?: string | null,
  inventorySearchData?: CrawledInventory | null,
  country?: string | null,
): Promise<IndustryAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const domain = new URL(url).hostname;
  const pageSignals = [
    title && `Title: ${title}`,
    description && `Description: ${description}`,
    h1 && `H1: ${h1}`,
    `Domain: ${domain}`,
    country && `Country: ${country}`,
    bodyText && `Page content (excerpt):\n${bodyText}`,
    structuredData && `Structured data (JSON-LD):\n${structuredData}`,
    googleSearchData && `\nVERIFIED DATA FROM WEB SEARCH (use this as factual information):\n${googleSearchData}`,
    inventorySearchData && `\nCRAWLED PRODUCT/COLLECTION DATA from this website (source: ${SOURCE_NOTES[inventorySearchData.source]}):\n${inventorySearchData.data}`,
  ].filter(Boolean);

  const models = [
    "claude-opus-5-5",
    "claude-sonnet-5",
    "claude-haiku-4-5",
  ];

  const prompt = `Analyze this website and identify its industry, then provide competitive intelligence including top 5 direct competitors and market traffic channel estimates.

Website signals:
${pageSignals.join("\n")}
${googleSearchData ? `
IMPORTANT: VERIFIED DATA FROM GOOGLE SEARCH is provided above. This is the most reliable source of information about this business. You MUST use it to determine:
- What this business actually does (industry, products, services)
- Who their direct competitors are
- Their market position and strengths

Even if the main page content is missing, blocked, or shows a CAPTCHA/challenge screen, the Google search data is sufficient to perform a complete analysis. DO NOT return "Unable to determine" or "Insufficient data" when Google search data is available.` : `
NOTE: No external search data was available and the main page content may be limited. If you have enough signals from the title, description, domain name, or page content to identify the business, proceed with the analysis. Only return insufficient data if you truly cannot determine what the business does.`}

CRITICAL: Competitors must be DIRECT competitors — businesses of the same type that compete for the same customers. NOT brands, suppliers, or parent companies they may carry.
${country ? `\nGEOGRAPHIC CONSTRAINT: This business operates in ${country}. ALL competitors MUST also operate in ${country}. Do NOT include competitors from other countries. Only list businesses that have a physical or strong online presence serving ${country} customers.` : ""}

Examples of correct competitor identification:
- A jewelry RETAILER's competitors are other jewelry RETAILERS (e.g. Birks, Knar Jewellery, Mejuri), NOT jewelry brands they sell (NOT Cartier, Rolex, Tiffany)
- A shoe STORE's competitors are other shoe STORES, NOT shoe manufacturers
- A restaurant's competitors are other restaurants, NOT food suppliers
- A clothing BOUTIQUE's competitors are other boutiques, NOT fashion brands like Gucci

CLASSIFICATION TAXONOMY — you MUST pick "industry" from the left side and "subIndustry" from that industry's options. Never invent a label:
${taxonomyPromptBlock()}

Respond with ONLY valid JSON, no markdown formatting:
{
  "industry": "EXACTLY one industry from the taxonomy above",
  "subIndustry": "EXACTLY one of that industry's sub-segments",
  "country": "country where this business is based/primarily operates, from page signals (currency, address, TLD, shipping) — or null if genuinely unclear",
  "businessModel": "retail | b2b | hybrid — 'retail' sells to consumers at listed prices; 'b2b' sells to businesses via quotes, RFQs, or sales conversations (manufacturers, distributors, professional services); 'hybrid' does both",
  "offering": "One specific sentence: what this business makes or sells, and to whom (e.g. 'Stamped metal hardware, lamp parts and custom wire harnesses for lighting, HVAC and appliance OEMs'). Name the actual products, not the category label",
  "competitorQueries": ["2-3 search queries a buyer would type to find ALTERNATIVE suppliers of this business's core offering, specific to what it makes and its market (e.g. 'custom wire harness manufacturer Canada', 'lamp parts supplier Canada'). Never use a generic category label on its own"],
  "competitors": [
    { "name": "Brand name ONLY — never a page title, tagline, or product description", "domain": "example.com", "strength": "What they do well that makes them a strong competitor" }
  ],
  "insight": "2-3 sentences analyzing the competitive landscape. What do the top competitors have in common? Where are customers potentially underserved? Where does this business have an opportunity to differentiate and win?",
  "channels": [
    { "name": "Direct", "percentage": 40 },
    { "name": "Organic Search", "percentage": 25 },
    { "name": "Paid Search", "percentage": 15 },
    { "name": "Social", "percentage": 10 },
    { "name": "Referral", "percentage": 5 },
    { "name": "Email", "percentage": 3 },
    { "name": "Display", "percentage": 2 }
  ],
  "topPlayer": "Name of the dominant competitor in this market",
  "keywords": [
    { "keyword": "example keyword", "intent": "C", "position": 1, "volume": "3.6K", "cpc": 0.28, "traffic": 5.16 }
  ],
  "totalKeywords": 8311,
  "inventoryCategories": [
    { "category": "Category Name", "productCount": 150, "avgPrice": "$89.50", "priceRange": "$12 - $450" }
  ],
}

Rules:
- Do NOT include the analyzed website itself in the competitors list
- Competitors must be the same TYPE of business (retailer vs retailer, service vs service, manufacturer vs manufacturer)
- Every competitor must overlap with the CORE of the "offering" — what the business makes or sells — not merely share a broad category label (a lamp-parts and wire-harness MANUFACTURER is not competing with an electronic-components DISTRIBUTOR or a parts-search DATABASE)
- Only list a competitor when you are confident its domain is real; fewer than 5 accurate competitors is better than padding the list
- Competitors MUST be in the same geographic market as the business${country ? ` (${country})` : ""}
- Be specific with the sub-industry (e.g. "Fine Jewelry Retail" not just "Retail")
- Keep each "strength" under 15 words
- The "insight" should read like strategic consulting advice, not generic filler
- For "channels": estimate the typical traffic channel distribution for this specific industry/niche. Percentages must sum to 100. Use your knowledge of how businesses in this industry typically acquire traffic. Include channels like Direct, Organic Search, Paid Search, Social, Referral, Email, Display, AI Traffic as relevant. Only include channels with >= 2%.
- "topPlayer": name the single strongest competitor (the market leader) in this space
- For "keywords": estimate the top 8 organic keywords this website likely ranks for, based on its content, industry, and domain. For each keyword provide: "keyword" (the search term), "intent" (N=Navigational, C=Commercial, I=Informational, T=Transactional), "position" (estimated Google rank 1-100 — a rough estimate is fine, it is displayed as a band like "Top 3" or "Page 1"), "volume" (APPROXIMATE monthly search volume as a rounded string with a tilde, like "~2K" or "~500" — never false precision like "3.6K"), "cpc" (estimated cost per click in USD), "traffic" (estimated monthly traffic percentage from this keyword). Sort by traffic descending.
- "totalKeywords": rough order-of-magnitude estimate of total organic keywords this domain ranks for, rounded to the nearest hundred
- For "inventoryCategories": If CRAWLED PRODUCT/COLLECTION DATA is provided above, extract REAL product categories, product counts, and price ranges directly from it. Look for collection names, "X products"/"X results" counts, and price figures (e.g. "$5,000 - $10,000", "219 products"). Sitemap data marked EXACT should be copied verbatim; rename slug tokens to proper labels ("watch" -> "Watches", brand tokens like "roberto" -> "Roberto Coin"). When sampled live prices are given, derive avgPrice (typical mid value) and priceRange (min - max) from them. Use null for any field not present in the data — never invent numbers — and omit categories where all of productCount, avgPrice and priceRange would be null. If no crawled data is available, return an empty array [].`;

  try {
    let res: Response | null = null;

    for (const model of models) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          // Opus 5.5 thinking is always-on; "disabled" 400s there. Thinking
          // spends output tokens, so give those attempts extra headroom.
          max_tokens: model === "claude-opus-5-5" ? 12000 : 4000,
          ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        console.log("Anthropic model used:", model);
        break;
      }

      const errText = await res.text().catch(() => "");
      console.error(`Anthropic model ${model} failed:`, res.status, errText.slice(0, 200));
    }

    if (!res || !res.ok) return null;

    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Anthropic response not JSON:", text.slice(0, 200));
      return null;
    }
    const sanitized = jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) => {
      if (ch === "\n" || ch === "\r" || ch === "\t") return " ";
      return "";
    });
    const parsed = JSON.parse(sanitized);

    if (!parsed.industry || !Array.isArray(parsed.competitors)) return null;

    // Snap free text onto the pinned taxonomy and drop marketplace/giant
    // "competitors" — peer groups must contain peers.
    const classified = normalizeClassification(parsed.industry, parsed.subIndustry);

    return {
      industry: classified.industry,
      subIndustry: classified.subIndustry,
      detectedCountry: typeof parsed.country === "string" && parsed.country.trim() && parsed.country.length < 40
        ? parsed.country.trim()
        : null,
      offering: typeof parsed.offering === "string" ? parsed.offering.trim().slice(0, 300) : "",
      competitorQueries: Array.isArray(parsed.competitorQueries) ? parsed.competitorQueries : [],
      competitors: screenCompetitors(parsed.competitors, domain).slice(0, 5),
      insight: parsed.insight ?? "",
      channels: Array.isArray(parsed.channels)
        ? parsed.channels.map((ch: { name: string; percentage: number }) => ({
            name: ch.name,
            percentage: ch.percentage,
          }))
        : [],
      topPlayer: parsed.topPlayer ?? "",
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.slice(0, 8).map((kw: Keyword) => ({
            keyword: kw.keyword,
            intent: kw.intent,
            position: kw.position,
            volume: kw.volume,
            cpc: kw.cpc,
            traffic: kw.traffic,
          }))
        : [],
      totalKeywords: parsed.totalKeywords ?? 0,
      businessModel: ["retail", "b2b", "hybrid"].includes(parsed.businessModel)
        ? parsed.businessModel
        : null,
      inventoryCategories: Array.isArray(parsed.inventoryCategories)
        ? dropOverlappingStoreViews(
            parsed.inventoryCategories
              // B2B service lines legitimately have no counts or prices — a
              // bare named offering is still worth keeping for them.
              .map((cat: InventoryCategory) =>
                normalizeInventoryCategory(cat, parsed.businessModel === "b2b"),
              )
              .filter(Boolean) as InventoryCategory[],
          )
        : [],
    };
  } catch (err) {
    console.error("Industry analysis failed:", err);
    return null;
  }
}

async function fetchGoogleTrends(
  brandName: string,
  competitors: Competitor[],
): Promise<TrendsData> {
  try {
    const topCompetitors = competitors.slice(0, 3).map((c) => c.name);
    const keywords = [brandName, ...topCompetitors];

    const raw = await googleTrends.interestOverTime({
      keyword: keywords,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      geo: "",
    });

    const data = JSON.parse(raw);
    const timelineData = data.default?.timelineData ?? [];

    if (timelineData.length === 0) return null;

    const timeline: TrendPoint[] = timelineData.map(
      (point: { formattedTime: string; value: number[] }) => ({
        date: point.formattedTime,
        values: point.value,
      }),
    );

    return { keywords, timeline };
  } catch (err) {
    console.error("Google Trends failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const { url: rawUrl, name, email, mode } = body as {
    url?: string;
    name?: string;
    email?: string;
    mode?: string;
  };

  // Ingest mode: dataset collection only. Skips PageSpeed, trends, and all
  // visitor-facing prose (insights, translate advantage, headline) — the
  // pipeline keeps classification, inventory crawl, competitor discovery,
  // and persistence. Secret-gated so it also bypasses the visitor rate limit.
  const isIngest =
    mode === "ingest" &&
    !!process.env.CRON_SECRET &&
    request.headers.get("x-ingest-secret") === process.env.CRON_SECRET;

  if (!isIngest && rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }
  const url = normalizeUrl(rawUrl ?? "");

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid website URL." },
      { status: 400 },
    );
  }

  const domain = new URL(url).hostname;

  const country = detectCountry(domain);

  const [meta, pageSpeed, webSearchData, inventorySearchData] = await Promise.all([
    fetchPageMeta(url),
    isIngest ? Promise.resolve(null) : fetchPageSpeed(url),
    fetchWebSearchResults(domain),
    crawlSiteInventory(domain),
  ]);

  let fallbackContent: string | null = null;
  const googleSearchData: string | null = webSearchData;
  if (!meta) {
    console.log("Direct fetch failed, trying fallbacks for", url);
    const [jina, wayback, siteClues] = await Promise.all([
      fetchViaJinaReader(url),
      fetchViaWaybackMachine(url),
      fetchSiteClues(url),
    ]);
    fallbackContent = jina ?? wayback ?? siteClues;
    if (fallbackContent) console.log("Fallback content:", fallbackContent.length, "chars");
  }
  if (googleSearchData) console.log("Web search data:", googleSearchData.length, "chars");
  if (inventorySearchData)
    console.log(
      "Inventory data:", inventorySearchData.data.length, "chars, source:", inventorySearchData.source,
    );
  if (country) console.log("Detected country:", country);

  const hasAnyData = meta || pageSpeed || fallbackContent;
  const canRunAI = !!process.env.ANTHROPIC_API_KEY;

  if (!hasAnyData && !canRunAI) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to analyze this website. Please check the URL and make sure the site is accessible.",
      },
      { status: 422 },
    );
  }

  const scores = pageSpeed?.scores ?? {
    performance: null,
    seo: null,
    accessibility: null,
    bestPractices: null,
  };

  const vitals = pageSpeed?.vitals ?? {
    lcp: null,
    cls: null,
    fcp: null,
    si: null,
    tbt: null,
    tti: null,
  };

  const metaData = meta ?? {
    title: null,
    titleLength: 0,
    description: null,
    descriptionLength: 0,
    h1: null,
    h1Count: 0,
    hasCanonical: false,
    hasOgTags: false,
    hasTwitterCards: false,
    hasSchemaMarkup: false,
    hasViewport: false,
    isHttps: url.startsWith("https"),
    robotsMeta: null,
    imageCount: 0,
    imagesWithAlt: 0,
    imagesWithoutAlt: 0,
  };

  const industry = await fetchIndustryAnalysis(
    url,
    meta?.title ?? null,
    meta?.description ?? null,
    meta?.h1 ?? null,
    meta?.bodyText ?? fallbackContent,
    meta?.structuredData ?? null,
    googleSearchData,
    inventorySearchData,
    country,
  );

  const brandName =
    meta?.title?.split(/[|\-–—]/)[0]?.trim() ??
    new URL(url).hostname.replace(/^www\./, "").split(".")[0];

  // A saved set (≤30 days old) keeps reports consistent for the same business.
  const savedCompetitors = industry ? await fetchCompetitorSet(domain) : null;
  if (industry && savedCompetitors) {
    industry.competitors = savedCompetitors;
    console.log("Using saved competitor set:", savedCompetitors.map((c) => c.domain));
  } else if (industry) {
    const original: CompetitorCandidate[] = industry.competitors;
    let refined: CompetitorCandidate[] = [];
    const queries = competitorQueries({
      suggested: industry.competitorQueries,
      subIndustry: industry.subIndustry,
      businessModel: industry.businessModel,
      country,
    });
    console.log("Competitor queries:", queries);
    const [webResults, exaResults] = await Promise.all([
      fetchCompetitorSearchResults(queries),
      fetchExaCompanies({ offering: industry.offering, country, clientDomain: domain }),
    ]);
    if (exaResults) console.log("Exa company results added");
    const competitorSearchData = [exaResults, webResults].filter(Boolean).join("\n\n---\n\n") || null;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (competitorSearchData && apiKey) {
      console.log("Competitor search data:", competitorSearchData.length, "chars");
      const refinePrompt = `You are checking the competitor list for ${domain}.

WHAT THIS BUSINESS SELLS: ${industry.offering || industry.subIndustry}
BUSINESS MODEL: ${industry.businessModel ?? "unknown"}${country ? `\nMARKET: ${country}` : ""}

Current competitor list:
${original.map((c, i) => `${i + 1}. ${c.name} (${c.domain}) — ${c.strength}`).join("\n")}

Web search results for buyers looking for alternatives:
${competitorSearchData}

Return the best list of up to 5 DIRECT competitors. A direct competitor sells substantially the same products or services to the same kind of customer. Test every candidate, including the current ones, against WHAT THIS BUSINESS SELLS:
- The current list comes from memory. Candidates from the company database (headquarters, staff, traffic shown) are verified businesses — when one overlaps the offering at least as closely as a current pick, prefer the database candidate.${country ? `\n- Prefer businesses headquartered in ${country}; include a business from elsewhere only if it clearly competes for ${country} customers and no closer ${country} match exists.` : ""}
- Otherwise keep current competitors that pass the test, and add search-result businesses that clearly pass it.
- Same business model: manufacturers compete with manufacturers, retailers with retailers, service firms with service firms. A distributor, marketplace, directory or parts-search database is NOT a competitor of a manufacturer.
- Sharing a broad category label is not enough (an electronic-components distributor does not compete with a lamp-parts and wire-harness manufacturer).
- Never include ${domain}, any brand this business sells or carries, or a directory/listing site${country ? `\n- Every competitor must serve customers in ${country}` : ""}
- Use each company's real website domain. Fewer than 5 correct competitors is better than a padded list.

Respond with ONLY a JSON array:
[{"name": "Company", "domain": "example.com", "strength": "What makes them competitive, under 15 words"}]`;

      for (const model of ["claude-sonnet-5", "claude-haiku-4-5"]) {
        try {
          const refineRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model,
              max_tokens: 2000,
              thinking: { type: "disabled" },
              messages: [{ role: "user", content: refinePrompt }],
            }),
          });
          if (!refineRes.ok) {
            console.error(`Competitor refine ${model} failed:`, refineRes.status);
            continue;
          }
          const refineData = await refineRes.json();
          const refineText = refineData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
          const jsonMatch = refineText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) => ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""));
            if (Array.isArray(parsed)) refined = screenCompetitors(parsed, domain);
          }
          console.log(`Competitors refined with search data (${model}):`, refined.map((c) => c.domain));
          break;
        } catch (err) {
          console.error("Competitor refinement failed:", err);
        }
      }
    }

    // Refined picks first, topped up from the original list; every domain
    // must answer over HTTP, so invented competitors never reach the page.
    industry.competitors = await finalizeCompetitors(refined, original, domain);
    console.log("Final competitors:", industry.competitors.map((c) => c.domain));
    const toSave = industry.competitors;
    const offering = industry.offering || null;
    after(() => saveCompetitorSet(domain, toSave, offering));
  }

  let competitorInventories: CompetitorInventory[] = [];
  let competitorCatalogs: CatalogSize[] = [];
  let trends: TrendsData = null;
  let siteStacks: (SiteStack | null)[] = [];

  if (industry && industry.competitors.length > 0) {
    const top3 = industry.competitors.slice(0, 3);
    const [inventoryResult, trendsResult, stacks] = await Promise.all([
      fetchCompetitorInventories(top3),
      isIngest ? Promise.resolve(null) : fetchGoogleTrends(brandName, industry.competitors),
      Promise.all([
        fetchSiteStack(brandName, domain),
        ...industry.competitors.map((c) => fetchSiteStack(c.name, c.domain)),
      ]),
    ]);
    siteStacks = stacks;
    competitorInventories = inventoryResult.inventories;
    competitorCatalogs = inventoryResult.catalogs;
    trends = trendsResult;
    console.log("Competitor inventories found:", competitorInventories.length);
  }

  // Product-level price comparison: only when both sides have live product
  // feeds with exact titles and prices — matched pairs are the sole place the
  // audit may compare individual products.
  let productMatches: ProductMatch[] = [];
  const clientProducts = inventorySearchData?.products ?? [];
  if (clientProducts.length > 0) {
    const liveCompetitors = competitorInventories
      .filter((c): c is CompetitorInventory & { products: RawProduct[] } =>
        !!c.products && c.products.length > 0,
      )
      .map((c) => ({ name: c.name, domain: c.domain, products: c.products }));
    if (liveCompetitors.length > 0) {
      productMatches = matchProducts(clientProducts, liveCompetitors);
      if (productMatches.length > 0)
        console.log("Product matches found:", productMatches.length);
    }
  }
  const productComparisons: ProductComparison[] = productMatches.map((m) => ({
    clientTitle: m.clientTitle,
    clientPrice: formatCents(m.clientPriceCents),
    competitorTitle: m.competitorTitle,
    competitorPrice: formatCents(m.competitorPriceCents),
    competitorName: m.competitorName,
    competitorDomain: m.competitorDomain,
  }));

  // B2B and hybrid businesses hide prices, so their comparable dimension is
  // credibility: the proof buyers look for while researching suppliers.
  let credibility: AuditResult["credibility"];
  if (industry && (industry.businessModel === "b2b" || industry.businessModel === "hybrid")) {
    const top3 = industry.competitors.slice(0, 3);
    const [clientProof, ...compProofs] = await Promise.all([
      fetchProofSignals(domain),
      ...top3.map((c) => fetchProofSignals(c.domain.replace(/^www\./, ""))),
    ]);
    if (clientProof) {
      credibility = {
        client: clientProof,
        competitors: top3
          .map((c, i) => ({ name: c.name, domain: c.domain, signals: compProofs[i] }))
          .filter(
            (c): c is { name: string; domain: string; signals: ProofSignals } =>
              c.signals !== null,
          ),
      };
      console.log("Credibility benchmarks:", 1 + credibility.competitors.length, "sites");
    }
  }

  // Segment benchmark from the market index: median depth and price points
  // for the client's segment, with the client's own numbers alongside.
  let marketPosition: MarketPosition | undefined;
  // B2B sellers quote rather than list prices, so a store-price benchmark
  // would compare them against the wrong thing.
  if (industry && industry.businessModel !== "b2b") {
    const bench = await fetchSegmentBenchmark(industry.industry, industry.subIndustry);
    if (bench) {
      const cats = industry.inventoryCategories;
      const clientDepth =
        cats.length > 0
          ? cats.reduce((m, c) => Math.max(m, c.productCount ?? 0), 0) || null
          : null;
      const clientPrices = cats
        .map((c) => parseFloat((c.avgPrice ?? "").replace(/[$,]/g, "")))
        .filter((n) => Number.isFinite(n) && n > 0);
      const clientPriceCents =
        clientPrices.length > 0
          ? Math.round((clientPrices.reduce((a, b) => a + b, 0) / clientPrices.length) * 100)
          : null;
      marketPosition = {
        segment: bench.segment,
        storesTracked: bench.storesTracked,
        medianDepth: bench.medianDepth,
        medianPrice: bench.medianPriceCents != null ? roundAvgPrice(formatCents(bench.medianPriceCents)) : null,
        priceLow: bench.priceLowCents != null ? roundAvgPrice(formatCents(bench.priceLowCents)) : null,
        priceHigh: bench.priceHighCents != null ? roundAvgPrice(formatCents(bench.priceHighCents)) : null,
        clientDepth,
        // an average of category averages — round like every other derived price
        clientPrice: clientPriceCents != null ? roundAvgPrice(formatCents(clientPriceCents)) : null,
      };
      console.log("Market position:", bench.segment, bench.storesTracked, "stores");
    }
  }

  // Exact catalog sizes (sitemap / live feed) for the client and competitors.
  const catalogs: CatalogSize[] = [
    ...(inventorySearchData?.totalProducts
      ? [{
          name: `${brandName} (the client)`,
          domain,
          totalProducts: inventorySearchData.totalProducts,
          categoryPages: inventorySearchData.categoryPages ?? 0,
        }]
      : []),
    ...competitorCatalogs,
  ];

  let inventoryInsights: string[] = [];
  if (
    !isIngest &&
    industry &&
    (industry.inventoryCategories.length > 0 || competitorInventories.length > 0 || catalogs.length > 0)
  ) {
    inventoryInsights = await generateInventoryInsights(
      domain,
      industry.subIndustry,
      industry.inventoryCategories,
      competitorInventories,
      productMatches,
      marketPosition,
      catalogs,
    );
    console.log("Inventory insights generated:", inventoryInsights.length);
  }

  let translateAdvantage: TranslateAdvantage = null;
  let headline: string | null = null;
  if (!isIngest && industry) {
    translateAdvantage = await generateTranslateAdvantage(
      domain,
      industry,
      inventoryInsights,
    );
    if (translateAdvantage) console.log("Translate advantage generated");
    headline = await generateHeadlineFinding(
      domain,
      industry,
      inventoryInsights,
      translateAdvantage,
    );
    if (headline) console.log("Headline finding generated");
  }

  // Grow the market dataset from every audit: the client, its inventory-crawled
  // competitors, and competitors identified but not yet crawled (queued for
  // snowball discovery). Runs after the response is sent.
  after(() => {
    const crawledDomains = new Set(competitorInventories.map((c) => c.domain));
    return recordAuditSnapshot([
      {
        domain,
        name: brandName ?? null,
        industry: industry?.industry ?? null,
        subIndustry: industry?.subIndustry ?? null,
        country: country ?? industry?.detectedCountry ?? null,
        source: inventorySearchData?.source ?? null,
        discoveredFrom: null,
        categories: industry?.inventoryCategories ?? [],
        businessModel: industry?.businessModel ?? null,
        proof: credibility?.client ?? null,
        products: inventorySearchData?.products ?? null,
      },
      ...competitorInventories.map((c) => ({
        domain: c.domain,
        name: c.name as string | null,
        industry: industry?.industry ?? null,
        subIndustry: industry?.subIndustry ?? null,
        country: country ?? industry?.detectedCountry ?? null,
        source: c.source ?? null,
        discoveredFrom: domain,
        categories: c.categories,
        businessModel: industry?.businessModel ?? null,
        proof:
          credibility?.competitors.find(
            (p) => p.domain.replace(/^www\./, "") === c.domain.replace(/^www\./, ""),
          )?.signals ?? null,
        products: c.products ?? null,
      })),
      ...(industry?.competitors ?? [])
        .filter((c) => !crawledDomains.has(c.domain))
        .map((c) => ({
          domain: c.domain,
          name: c.name as string | null,
          industry: industry?.industry ?? null,
          subIndustry: industry?.subIndustry ?? null,
          country: country ?? industry?.detectedCountry ?? null,
          source: null,
          discoveredFrom: domain,
          categories: [],
          businessModel: industry?.businessModel ?? null,
        })),
    ]);
  });

  const [clientStack, ...competitorStacks] = siteStacks;
  const readableStacks = competitorStacks.filter((st): st is SiteStack => st !== null);
  const techStack = clientStack && readableStacks.length > 0
    ? { client: clientStack, competitors: readableStacks, gaps: stackGaps(clientStack, readableStacks) }
    : undefined;
  const allStacks = siteStacks.filter((st): st is SiteStack => st !== null);
  if (allStacks.length > 0) after(() => recordTechSnapshots(allStacks));

  if (isIngest) {
    return NextResponse.json({
      ok: true,
      ingest: true,
      domain,
      industry: industry?.industry ?? null,
      competitorsDiscovered: industry?.competitors.length ?? 0,
    });
  }

  // A visitor who left an email becomes a lead, and gets one follow-up built
  // from their audit's own findings. Runs after the response is sent.
  if (email && email.includes("@")) {
    after(() =>
      recordLeadAndSendEmail({
        email,
        name: name ?? null,
        domain,
        url,
        industry: industry?.industry ?? null,
        subIndustry: industry?.subIndustry ?? null,
        businessModel: industry?.businessModel ?? null,
        headline: headline ?? null,
        insights: inventoryInsights,
        competitors: (industry?.competitors ?? []).map((c) => ({
          name: c.name,
          domain: c.domain,
        })),
      }),
    );
  }

  const result: AuditResult = {
    url,
    scores,
    vitals,
    meta: metaData,
    experience: meta?.experience ?? null,
    industry,
    trends,
    credibility,
    marketPosition,
    techStack,
    competitorInventories:
      competitorInventories.length > 0
        ? competitorInventories.map((c) => ({
            name: c.name,
            domain: c.domain,
            categories: c.categories,
            source: c.source,
          }))
        : undefined,
    productComparisons: productComparisons.length > 0 ? productComparisons : undefined,
    inventoryInsights: inventoryInsights.length > 0 ? inventoryInsights : undefined,
    translateAdvantage: translateAdvantage ?? undefined,
    headline: headline ?? undefined,
  };

  if (name && email && process.env.RESEND_API_KEY) {
    const to = process.env.CONTACT_TO_EMAIL || "john@apereel.com";
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [to],
        subject: `Audit lead: ${name} — ${url}`,
        text: [
          `New audit lead`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Website: ${url}`,
          ``,
          `Industry: ${industry?.industry ?? "N/A"}`,
          `Sub-industry: ${industry?.subIndustry ?? "N/A"}`,
          `Top competitor: ${industry?.topPlayer ?? "N/A"}`,
          ``,
          `Performance: ${scores.performance ?? "N/A"}`,
          `SEO: ${scores.seo ?? "N/A"}`,
          `Accessibility: ${scores.accessibility ?? "N/A"}`,
          ``,
          `Experience checks: ${
            result.experience
              ? `${result.experience.passed}/${result.experience.findings.length} passed${
                  result.experience.failed + result.experience.warned > 0
                    ? ` — flagged: ${result.experience.findings
                        .filter((f) => f.status !== "pass")
                        .map((f) => f.label)
                        .join("; ")}`
                    : ""
                }`
              : "N/A"
          }`,
        ].join("\n"),
      }),
    }).catch((err) => console.error("Audit notification email failed:", err));
  }

  return NextResponse.json({ ok: true, data: result });
}
