import { BROWSER_UA } from "./site-fetch";

// Shopify's public product feed (/products.json): exact titles, types and
// prices without any AI. Shared by the audit and the snapshot refresher.

export type ShopifyProduct = {
  title?: string;
  handle?: string;
  product_type?: string;
  variants?: { price: string }[];
};

export const GIFT_CARD_RE = /gift ?cards?|e-?gift/i;
export const SHOPIFY_PAGE_LIMIT = 8; // 8 × 250 = 2,000 products read per store

export function shopifyMinPrice(p: ShopifyProduct): number | null {
  const prices = (p.variants ?? []).map((v) => parseFloat(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function fetchShopifyJson<T>(url: string): Promise<T | null> {
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

/** Pages through the public feed; `complete` is false when capped. */
export async function readShopifyCatalog(domain: string): Promise<{ products: ShopifyProduct[]; complete: boolean }> {
  const products: ShopifyProduct[] = [];
  for (let page = 1; page <= SHOPIFY_PAGE_LIMIT; page++) {
    const data = await fetchShopifyJson<{ products?: ShopifyProduct[] }>(
      `https://${domain}/products.json?limit=250&page=${page}`,
    );
    const batch = data?.products;
    if (!Array.isArray(batch)) return { products, complete: page > 1 };
    products.push(...batch);
    if (batch.length < 250) return { products, complete: true };
  }
  return { products, complete: false };
}
