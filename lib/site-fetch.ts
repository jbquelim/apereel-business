// Shared site fetching: plain-text fetch with a firewall-friendly retry, and
// sitemap discovery that finds a site's product and category pages.

export const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Some firewalls (e.g. WordPress security plugins) 403 a full desktop-Chrome
// user agent that arrives without Chrome's client hints, yet allow a plain
// one — so a blocked request is retried once with the plain agent.
const PLAIN_UA = "Mozilla/5.0";

export async function fetchTextDirect(url: string, timeoutMs = 8000): Promise<string | null> {
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
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

// Language-variant duplicates (/fr/product/x mirrors /product/x) inflate counts.
const LANG_PREFIX_RE = /^\/[a-z]{2}(?:-[a-z]{2})?\/(?=.)/i;
const PRODUCT_PATH_RE = /\/(products?|item|p)\/[^/]+\/?$/;

export type SitemapCatalog = { productUrls: string[]; categoryPages: number; categoryUrls: string[] };

export async function fetchSitemapCatalog(domain: string): Promise<SitemapCatalog> {
  // robots.txt names the real sitemaps (often sitemap_index.xml on WordPress,
  // or several per product line); fall back to the conventional locations.
  const robots = await fetchTextDirect(`https://${domain}/robots.txt`, 8000);
  const declared = robots
    ? [...new Set([...robots.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]))]
    : [];
  const roots = declared.length > 0
    ? declared.slice(0, 6)
    : [`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`, `https://${domain}/xmlsitemap.php`];

  const rootXmls: string[] = [];
  for (const root of roots) {
    const text = await fetchTextDirect(root, 10000);
    if (text && /<(urlset|sitemapindex)/i.test(text)) {
      rootXmls.push(text);
      if (declared.length === 0) break; // conventional fallbacks: first hit wins
    }
  }
  if (rootXmls.length === 0) return { productUrls: [], categoryPages: 0, categoryUrls: [] };

  const isProductCategoryMap = (u: string) => /product_cat|product-cat|collection/i.test(u);
  const isCategoryMap = (u: string) => isProductCategoryMap(u) || /categor/i.test(u);
  const urls: string[] = [];
  const childMaps: string[] = [];
  for (const xml of rootXmls) {
    if (/<sitemapindex/i.test(xml)) childMaps.push(...extractLocs(xml));
    else urls.push(...extractLocs(xml));
  }

  let categoryUrls: string[] = [];
  // URLs from a sitemap that is itself named for products (BigCommerce's
  // xmlsitemap.php?type=products, WooCommerce product-sitemap.xml) are
  // products whatever their path looks like.
  const fromProductMaps: string[] = [];
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
    if (productMaps.length > 0) fromProductMaps.push(...(childXmls.filter(Boolean) as string[]).flatMap(extractLocs));
    categoryUrls = categoryXml ? extractLocs(categoryXml).filter((u) => !LANG_PREFIX_RE.test(safePath(u))) : [];
  }

  let productUrls = [...new Set(urls)].filter((u) => {
    try {
      const path = new URL(u).pathname;
      return PRODUCT_PATH_RE.test(path) && !LANG_PREFIX_RE.test(path);
    } catch {
      return false;
    }
  });
  if (productUrls.length === 0 && fromProductMaps.length > 0) {
    productUrls = [...new Set(fromProductMaps)].filter((u) => !LANG_PREFIX_RE.test(safePath(u)) && safePath(u).length > 1);
  }
  return { productUrls, categoryPages: categoryUrls.length, categoryUrls };
}


function safePath(u: string): string {
  try {
    return new URL(u).pathname;
  } catch {
    return "";
  }
}

/**
 * True when HTML is a bot challenge or block page rather than the site —
 * e.g. SiteGround's sgcaptcha redirect, Cloudflare's "Just a moment",
 * Incapsula, Wordfence, or a near-empty shell. Hosts often serve these to
 * data-centre IPs (Vercel, crawlers) while real visitors see the site, so
 * anything read from such a page must never be reported as the client's.
 */
export function isBlockedPage(html: string): boolean {
  const head = html.slice(0, 20_000);
  if (/\.well-known\/sgcaptcha|sgcaptcha/i.test(head)) return true;
  if (/cf-chl-|challenge-platform|cf_chl_opt|<title>\s*Just a moment/i.test(head)) return true;
  if (/_Incapsula_Resource|Incapsula incident|<title>\s*Attention Required/i.test(head)) return true;
  if (/wordfence|<title>\s*(Access denied|403 Forbidden|Forbidden|Blocked)/i.test(head)) return true;
  if (/Checking your browser before accessing|Please enable JavaScript and cookies to continue/i.test(head)) return true;
  // A real page has some text; a meta-refresh shell or empty body doesn't.
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const words = (text.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? []).length;
  return html.length < 2_000 && words < 40;
}
