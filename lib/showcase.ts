import { GIFT_CARD_RE, readShopifyCatalog, shopifyMinPrice } from "./shopify-feed";
import { fetchSitemapCatalog, fetchTextDirect, isBlockedPage } from "./site-fetch";

// A handful of the business's real products (name, price, image, link) for
// the $30 preview — from the public Shopify feed, or else from product pages
// found in the sitemap. Everything shown is read from their own site.

export type ShowcaseProduct = { title: string; price: string | null; image: string | null; url: string };

const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 })}`;

async function fromShopify(domain: string): Promise<ShowcaseProduct[]> {
  for (const host of [domain, domain.startsWith("www.") ? domain.slice(4) : `www.${domain}`]) {
    const { products } = await readShopifyCatalog(host);
    const sellable = products.filter((p) => p.title && p.handle && p.images?.[0]?.src && !GIFT_CARD_RE.test(`${p.title} ${p.product_type ?? ""}`));
    if (sellable.length < 4) continue;
    // Spread across the biggest product types rather than the first page.
    const byType = new Map<string, typeof sellable>();
    for (const p of sellable) byType.set(p.product_type || "", [...(byType.get(p.product_type || "") ?? []), p]);
    const types = [...byType.values()].sort((a, b) => b.length - a.length).slice(0, 3);
    const picked = types.flatMap((list) => list.slice(0, 2)).slice(0, 6);
    return picked.map((p) => {
      const price = shopifyMinPrice(p);
      return { title: p.title!, price: price != null && price > 0 ? money(price) : null, image: p.images?.[0]?.src ?? null, url: `https://${host}/products/${p.handle}` };
    });
  }
  return [];
}

function fromProductHtml(url: string, html: string): ShowcaseProduct | null {
  let title: string | null = null;
  let image: string | null = null;
  let price: string | null = null;
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const nodes = [JSON.parse(m[1].trim())].flat(3);
      const stack = [...nodes];
      while (stack.length) {
        const n = stack.pop();
        if (!n || typeof n !== "object") continue;
        const types = [n["@type"]].flat();
        if (types.includes("Product")) {
          title ??= typeof n.name === "string" ? n.name : null;
          const img = [n.image].flat()[0];
          image ??= typeof img === "string" ? img : typeof img?.url === "string" ? img.url : null;
          const offer = [n.offers].flat()[0];
          const p = offer?.price ?? offer?.lowPrice;
          // B2B catalogs often publish 0 for "price on request".
          if (p != null && !price && Number.isFinite(Number(p)) && Number(p) > 0) price = money(Number(p));
        }
        for (const v of Object.values(n)) if (v && typeof v === "object") stack.push(v);
      }
    } catch {
      /* skip malformed JSON-LD */
    }
  }
  title ??= html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? null;
  image ??= html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? null;
  return title ? { title: title.replace(/\s+/g, " ").trim(), price, image, url } : null;
}

async function fromSitemap(domain: string): Promise<ShowcaseProduct[]> {
  const { productUrls } = await fetchSitemapCatalog(domain.replace(/^www\./, ""));
  if (productUrls.length === 0) return [];
  const step = Math.max(1, Math.floor(productUrls.length / 10));
  const sample = Array.from({ length: Math.min(10, productUrls.length) }, (_, i) => productUrls[i * step]);
  const pages = await Promise.all(
    sample.map(async (u) => {
      const html = await fetchTextDirect(u, 10000);
      return html && !isBlockedPage(html) ? fromProductHtml(u, html) : null;
    }),
  );
  return pages.filter((p): p is ShowcaseProduct => p !== null).slice(0, 6);
}

export async function collectShowcase(domain: string): Promise<ShowcaseProduct[]> {
  const shopify = await fromShopify(domain).catch(() => []);
  return shopify.length >= 4 ? shopify : fromSitemap(domain).catch(() => []);
}
