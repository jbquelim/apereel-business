import { NextResponse } from "next/server";
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
};

type IndustryAnalysis = {
  industry: string;
  subIndustry: string;
  competitors: Competitor[];
  insight: string;
  channels: Channel[];
  topPlayer: string;
  keywords: Keyword[];
  totalKeywords: number;
  inventoryCategories: InventoryCategory[];
} | null;

type TrendPoint = {
  date: string;
  values: number[];
};

type TrendsData = {
  keywords: string[];
  timeline: TrendPoint[];
} | null;

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
  industry: IndustryAnalysis;
  trends: TrendsData;
  competitorInventories?: CompetitorInventory[];
  inventoryInsights?: string[];
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

async function fetchCompetitorSearchResults(industry: string, subIndustry: string, domain: string, country?: string | null): Promise<string | null> {
  const geo = country || "";
  const queries = [
    `${subIndustry} competitors ${domain}`,
    `best ${subIndustry} ${geo}`.trim(),
    `top ${subIndustry} stores ${geo}`.trim(),
  ];

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

async function fetchShopifyInventory(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${domain}/collections.json?limit=250`, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return null;
    const collections = (await res.json())?.collections;
    if (!Array.isArray(collections) || collections.length === 0) return null;

    type ShopifyCollection = { handle: string; title: string; products_count?: number };
    const biggest = (collections as ShopifyCollection[])
      .filter((c) => (c.products_count ?? 0) > 0)
      .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));
    const picked = biggest.length > 0 ? biggest : (collections as ShopifyCollection[]);

    const lines = (await Promise.all(
      picked.slice(0, 6).map(async (col: ShopifyCollection) => {
        try {
          const pRes = await fetch(
            `https://${domain}/collections/${col.handle}/products.json?limit=250`,
            {
              headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
              signal: AbortSignal.timeout(6000),
            },
          );
          if (!pRes.ok) return null;
          const products = (await pRes.json())?.products;
          if (!Array.isArray(products) || products.length === 0) return null;
          const prices = products
            .flatMap((p: { variants?: { price: string }[] }) =>
              (p.variants ?? []).map((v) => parseFloat(v.price)),
            )
            .filter((n: number) => Number.isFinite(n) && n > 0);
          const exactCount = col.products_count ?? products.length;
          const count = `${exactCount}${!col.products_count && products.length === 250 ? "+" : ""}`;
          if (prices.length === 0) return `Collection "${col.title}": ${count} products`;
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
          return `Collection "${col.title}": ${count} products, avg price $${Math.round(avg).toLocaleString()}, price range $${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
        } catch {
          return null;
        }
      }),
    )).filter(Boolean) as string[];

    if (lines.length === 0) return null;
    console.log("Shopify inventory data found for", domain);
    return `Live product data from ${domain} (exact figures from the store's product API — use these numbers verbatim):\n${lines.join("\n")}`;
  } catch {
    return null;
  }
}

async function fetchTextDirect(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function fetchSitemapProductUrls(domain: string): Promise<string[]> {
  const xml = await fetchTextDirect(`https://${domain}/sitemap.xml`, 10000);
  if (!xml || !/<(urlset|sitemapindex)/i.test(xml)) return [];

  let urls = extractLocs(xml);
  if (/<sitemapindex/i.test(xml)) {
    const children = [
      ...urls.filter((u) => /product/i.test(u)),
      ...urls.filter((u) => !/product/i.test(u) && !/image|blog|video|news/i.test(u)),
    ].slice(0, 3);
    const childXmls = await Promise.all(children.map((u) => fetchTextDirect(u, 10000)));
    urls = (childXmls.filter(Boolean) as string[]).flatMap(extractLocs);
  }

  return urls.filter((u) => {
    try {
      return /\/(products?|item|p)\/[^/]+\/?$/.test(new URL(u).pathname);
    } catch {
      return false;
    }
  });
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
  return [...groups.entries()]
    .filter(([, us]) => us.length >= 5)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([label, us]) => ({ label, urls: us }));
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

async function fetchSitemapInventory(domain: string): Promise<string | null> {
  const productUrls = await fetchSitemapProductUrls(domain);
  if (productUrls.length < 20) return null;

  const groups = groupProductUrls(productUrls);
  const lines: string[] = [`Total products in sitemap: ${productUrls.length.toLocaleString()}`];

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
  return `Sitemap inventory analysis for ${domain} (product counts are EXACT, taken from the site's sitemap; prices sampled from live product pages — use counts verbatim, derive avg/range from the sampled prices):\n${lines.join("\n")}`;
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

async function crawlSiteInventory(domain: string): Promise<string | null> {
  const shopify = await fetchShopifyInventory(domain);
  if (shopify) return shopify;

  const sitemap = await fetchSitemapInventory(domain);
  if (sitemap) return sitemap;

  const crawled = await crawlCollectionPages(domain);
  if (crawled) return crawled;

  const indexed = await searchIndexedInventory(domain);
  if (indexed) console.log("Falling back to search-indexed inventory for", domain);
  return indexed;
}

function normalizeInventoryCategory(cat: Partial<InventoryCategory> | null): InventoryCategory | null {
  if (!cat?.category || typeof cat.category !== "string") return null;
  const productCount =
    typeof cat.productCount === "number" && cat.productCount > 0 ? cat.productCount : null;
  const avgPrice = typeof cat.avgPrice === "string" && cat.avgPrice.trim() ? cat.avgPrice : null;
  const priceRange =
    typeof cat.priceRange === "string" && cat.priceRange.trim() ? cat.priceRange : null;
  if (productCount === null && avgPrice === null && priceRange === null) return null;
  return { category: cat.category, productCount, avgPrice, priceRange };
}

async function fetchCompetitorInventories(
  competitors: Competitor[],
): Promise<CompetitorInventory[]> {
  const crawlResults = await Promise.all(
    competitors.map(async (c) => ({
      name: c.name,
      domain: c.domain,
      data: await crawlSiteInventory(c.domain),
    })),
  );

  const withData = crawlResults.filter((r) => r.data);
  if (withData.length === 0) return [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const prompt = `Below is crawled inventory data for multiple competitor websites. Depending on the site it comes from the store's live product API (exact figures), crawled category pages (real on-page counts and prices), or search-engine-indexed pages.

${withData.map((r) => `=== ${r.name} (${r.domain}) ===\n${r.data}`).join("\n\n")}

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

    if (!res.ok) return [];

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) => ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""));
    if (!Array.isArray(parsed.competitors)) return [];

    return withData
      .map((r) => {
        const match = parsed.competitors.find(
          (c: { domain: string }) => c.domain === r.domain,
        );
        return {
          name: r.name,
          domain: r.domain,
          categories: Array.isArray(match?.categories)
            ? match.categories
                .map((cat: InventoryCategory) => normalizeInventoryCategory(cat))
                .filter(Boolean) as InventoryCategory[]
            : [],
        };
      })
      .filter((r) => r.categories.length > 0);
  } catch (err) {
    console.error("Competitor inventory analysis failed:", err);
    return [];
  }
}

async function generateInventoryInsights(
  domain: string,
  subIndustry: string,
  ownCategories: InventoryCategory[],
  competitorInventories: CompetitorInventory[],
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

${domain} (the client):
${ownCategories.length > 0 ? fmt(ownCategories) : "(no inventory data extracted)"}

${competitorInventories.map((c) => `${c.name} (${c.domain}):\n${fmt(c.categories)}`).join("\n\n")}

Write 3-4 sharp, specific insights comparing the client's inventory depth and price positioning against these competitors, and what that means for their search visibility and revenue opportunity. Categories with deeper inventory tend to rank better organically — use that lens where relevant.

Rules:
- Reference REAL numbers from the data above (product counts, prices) — at least one number per insight
- Each insight is one sentence, under 35 words, direct and confident, addressed to the client ("Your...")
- No hedging words like "may", "might", "could potentially"
- If the client has no inventory data, focus on what competitors' depth means for them

Respond with ONLY a JSON array of strings:
["insight one", "insight two", "insight three"]`;

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
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
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
  inventorySearchData?: string | null,
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
    inventorySearchData && `\nCRAWLED PRODUCT/COLLECTION DATA (real data from this website):\n${inventorySearchData}`,
  ].filter(Boolean);

  const models = [
    "claude-sonnet-4-20250514",
    "claude-sonnet-4-0",
    "claude-haiku-4-5-20251001",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
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

Respond with ONLY valid JSON, no markdown formatting:
{
  "industry": "broad industry name",
  "subIndustry": "specific niche or sub-category",
  "competitors": [
    { "name": "Company Name", "domain": "example.com", "strength": "What they do well that makes them a strong competitor" }
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
- Competitors must be the same TYPE of business (retailer vs retailer, service vs service)
- Competitors MUST be in the same geographic market as the business${country ? ` (${country})` : ""}
- Be specific with the sub-industry (e.g. "Fine Jewelry Retail" not just "Retail")
- Keep each "strength" under 15 words
- The "insight" should read like strategic consulting advice, not generic filler
- For "channels": estimate the typical traffic channel distribution for this specific industry/niche. Percentages must sum to 100. Use your knowledge of how businesses in this industry typically acquire traffic. Include channels like Direct, Organic Search, Paid Search, Social, Referral, Email, Display, AI Traffic as relevant. Only include channels with >= 2%.
- "topPlayer": name the single strongest competitor (the market leader) in this space
- For "keywords": estimate the top 8 organic keywords this website likely ranks for, based on its content, industry, and domain. For each keyword provide: "keyword" (the search term), "intent" (N=Navigational, C=Commercial, I=Informational, T=Transactional), "position" (estimated Google rank 1-100), "volume" (monthly search volume as string like "3.6K" or "22.2K"), "cpc" (estimated cost per click in USD), "traffic" (estimated monthly traffic percentage from this keyword). Sort by traffic descending.
- "totalKeywords": estimate the total number of organic keywords this domain likely ranks for
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
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        console.log("Anthropic model used:", model);
        break;
      }

      const errText = await res.text().catch(() => "");
      console.error(`Anthropic model ${model} failed:`, res.status, errText.slice(0, 200));

      if (res.status !== 404) break;
    }

    if (!res || !res.ok) return null;

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
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

    return {
      industry: parsed.industry,
      subIndustry: parsed.subIndustry ?? parsed.industry,
      competitors: parsed.competitors.slice(0, 5).map((c: { name: string; domain: string; strength: string }) => ({
        name: c.name,
        domain: c.domain,
        strength: c.strength,
      })),
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
      inventoryCategories: Array.isArray(parsed.inventoryCategories)
        ? (parsed.inventoryCategories
            .map((cat: InventoryCategory) => normalizeInventoryCategory(cat))
            .filter(Boolean) as InventoryCategory[])
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
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const { url: rawUrl, name, email } = body as {
    url?: string;
    name?: string;
    email?: string;
  };
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
    fetchPageSpeed(url),
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
  if (inventorySearchData) console.log("Inventory search data:", inventorySearchData.length, "chars");
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

  if (industry) {
    const competitorSearchData = await fetchCompetitorSearchResults(
      industry.industry, industry.subIndustry, domain, country,
    );

    if (competitorSearchData) {
      console.log("Competitor search data:", competitorSearchData.length, "chars");
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (apiKey) {
          const refineRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 2000,
              messages: [{
                role: "user",
                content: `You identified these competitors for ${domain} (a ${industry.subIndustry} business${country ? ` in ${country}` : ""}):
${industry.competitors.map((c, i) => `${i + 1}. ${c.name} (${c.domain}) — ${c.strength}`).join("\n")}

Here are REAL web search results about competitors in this space:
${competitorSearchData}

Based on the search results, refine the competitor list. Replace any competitors that are NOT direct competitors with actual competitors found in search results.

CRITICAL RULES:
- Competitors must be the SAME TYPE of business (retailer vs retailer, service vs service)
- A jewelry RETAILER's competitors are OTHER RETAILERS (e.g. Birks, Peoples Jewellers, Charm Diamond Centres), NEVER the luxury brands they sell (Cartier, Rolex, Tiffany, Omega, TAG Heuer are BRANDS not competitors)
- A clothing STORE's competitors are other stores, NOT fashion brands like Gucci or Nike
- Do NOT include ${domain} itself or any variation of it as a competitor
- Do NOT include any brand/manufacturer that the business SELLS or CARRIES${country ? `\n- ALL competitors MUST operate in ${country}. Do NOT include businesses from other countries.` : ""}

Respond with ONLY a JSON array of exactly 5 competitors:
[{"name": "Company", "domain": "example.com", "strength": "What makes them competitive"}]`,
              }],
            }),
          });

          if (refineRes.ok) {
            const refineData = await refineRes.json();
            const refineText = refineData.content?.[0]?.text ?? "";
            const jsonMatch = refineText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const refined = JSON.parse(jsonMatch[0].replace(/[\x00-\x1f\x7f]/g, (ch: string) => ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""));
              if (Array.isArray(refined) && refined.length > 0) {
                industry.competitors = refined.slice(0, 5).map((c: { name: string; domain: string; strength: string }) => ({
                  name: c.name,
                  domain: c.domain,
                  strength: c.strength,
                }));
                console.log("Competitors refined with search data");
              }
            }
          }
        }
      } catch (err) {
        console.error("Competitor refinement failed:", err);
      }
    }

  }

  let competitorInventories: CompetitorInventory[] = [];
  let trends: TrendsData = null;

  if (industry && industry.competitors.length > 0) {
    const top3 = industry.competitors.slice(0, 3);
    const [inventories, trendsResult] = await Promise.all([
      fetchCompetitorInventories(top3),
      fetchGoogleTrends(brandName, industry.competitors),
    ]);
    competitorInventories = inventories;
    trends = trendsResult;
    console.log("Competitor inventories found:", competitorInventories.length);
  }

  let inventoryInsights: string[] = [];
  if (
    industry &&
    (industry.inventoryCategories.length > 0 || competitorInventories.length > 0)
  ) {
    inventoryInsights = await generateInventoryInsights(
      domain,
      industry.subIndustry,
      industry.inventoryCategories,
      competitorInventories,
    );
    console.log("Inventory insights generated:", inventoryInsights.length);
  }

  const result: AuditResult = {
    url,
    scores,
    vitals,
    meta: metaData,
    industry,
    trends,
    competitorInventories: competitorInventories.length > 0 ? competitorInventories : undefined,
    inventoryInsights: inventoryInsights.length > 0 ? inventoryInsights : undefined,
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
        ].join("\n"),
      }),
    }).catch((err) => console.error("Audit notification email failed:", err));
  }

  return NextResponse.json({ ok: true, data: result });
}
