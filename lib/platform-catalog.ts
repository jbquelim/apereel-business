import { BROWSER_UA } from "./site-fetch";

// Reads a store's full catalog from the public feeds its own storefront
// uses, with the store's real categories:
//   BigCommerce  storefront GraphQL (with the token the store publishes in its pages)
//   Shopify      /products.json and /collections/*/products.json
//   WooCommerce  Store API (/wp-json/wc/store/v1)
// Only public catalog data, the same a visitor's browser loads. Returns null
// when none applies; the crawler is the fallback.

export type PlatformCategory = { key: string; name: string; parentKey: string | null; url: string | null };
export type PlatformProduct = { url: string; title: string; price: number | null; currency: string | null; image: string | null; categoryKeys: string[] };
export type PlatformCatalog = { platform: "bigcommerce" | "shopify" | "woocommerce"; categories: PlatformCategory[]; products: PlatformProduct[] };

const CATCH_ALL = /^(all|frontpage|home|sale|new|new-arrivals|best-sellers?|featured|clearance|gift-cards?|shop-all.*|all-products)$/i;
/** Promotions, not categories ("25% off sitewide", "Black Friday deals"). */
const PROMO = /\b(sale|off|sitewide|clearance|discount(?:ed)?|deals?|promo|black[- ]friday|cyber[- ]monday|bogo)\b|%/i;
/** The store's own working collections ("404 recommendations", "Piercing test"), never shown to buyers. */
const INTERNAL = /\b(test|testing|404|recommendations?|hidden|draft|internal|staff|do[- ]not|upsell|cross[- ]?sell|search|homepage|algolia|klaviyo)\b/i;

async function getText(url: string, init?: RequestInit): Promise<{ status: number; text: string } | null> {
  try {
    const res = await fetch(url, { ...init, headers: { "User-Agent": BROWSER_UA, Accept: "application/json,text/html,*/*", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(20_000) });
    return { status: res.status, text: await res.text() };
  } catch {
    return null;
  }
}
/**
 * A catalog that could only be read in part (a page kept failing, or time ran
 * out). Thrown, never returned: a site built from part of a catalog looks
 * complete and isn't. The build step retries, then reports it to John.
 */
export class IncompleteCatalog extends Error {}

/** JSON from a feed; throttling and server errors are retried twice (Shopify answers 429 under load). */
async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, attempt * 2000));
    const r = await getText(url, init);
    if (r && (r.status === 429 || r.status >= 500)) continue;
    if (!r) continue;
    if (r.status >= 400) return null;
    try {
      return JSON.parse(r.text) as T;
    } catch {
      return null;
    }
  }
  return null;
}

// ---------- BigCommerce ----------
type BcCat = { entityId: number; name: string; path: string; children?: BcCat[] };
type BcProducts = { data?: { site?: { products?: { pageInfo: { hasNextPage: boolean; endCursor: string }; edges: { node: { name: string; path: string; prices?: { price?: { value: number; currencyCode: string } }; defaultImage?: { url: string } | null; categories?: { edges: { node: { entityId: number } }[] } } }[] } } } };

async function bigcommerce(host: string, deadline: number, max: number): Promise<PlatformCatalog | null> {
  const home = await getText(`https://${host}/`);
  const token = home?.text.match(/storefrontToken:\s*"([A-Za-z0-9_.-]{100,})"/)?.[1] ?? home?.text.match(/graphQLToken\\?":\\?"([A-Za-z0-9_.-]{100,})/)?.[1] ?? home?.text.match(/(eyJ0eXAiOiJKV1Qi[A-Za-z0-9_.-]{100,})/)?.[1];
  if (!token) return null;
  const gql = <T>(query: string, variables: object = {}) =>
    getJson<T>(`https://${host}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Origin: `https://${host}` },
      body: JSON.stringify({ query, variables }),
    });
  const tree = await gql<{ data?: { site?: { categoryTree?: BcCat[] } } }>(
    `query { site { categoryTree { entityId name path children { entityId name path children { entityId name path children { entityId name path } } } } } }`,
  );
  const roots = tree?.data?.site?.categoryTree;
  if (!roots) return null;
  const categories: PlatformCategory[] = [];
  const walk = (list: BcCat[], parent: string | null) => {
    for (const c of list) {
      categories.push({ key: String(c.entityId), name: c.name, parentKey: parent, url: `https://${host}${c.path}` });
      if (c.children?.length) walk(c.children, String(c.entityId));
    }
  };
  walk(roots, null);

  const products: PlatformProduct[] = [];
  let after: string | null = null;
  for (let i = 0; products.length < max; i++) {
    if (Date.now() > deadline || i >= 600) throw new IncompleteCatalog(`${host}: read ${products.length} products before running out of time`);
    const page: BcProducts | null = await gql<BcProducts>(
      `query($after: String) { site { products(first: 50, after: $after) { pageInfo { hasNextPage endCursor } edges { node { name path prices { price { value currencyCode } } defaultImage { url(width: 1280) } categories(first: 20) { edges { node { entityId } } } } } } } }`,
      { after },
    );
    const conn: NonNullable<NonNullable<NonNullable<BcProducts["data"]>["site"]>["products"]> | undefined = page?.data?.site?.products;
    if (!conn) {
      if (!products.length) break;
      throw new IncompleteCatalog(`${host}: a catalog page failed after ${products.length} products`);
    }
    for (const { node } of conn.edges) {
      products.push({
        url: `https://${host}${node.path}`,
        title: node.name,
        price: node.prices?.price?.value ?? null,
        currency: node.prices?.price?.currencyCode ?? null,
        image: node.defaultImage?.url ?? null,
        categoryKeys: (node.categories?.edges ?? []).map((e: { node: { entityId: number } }) => String(e.node.entityId)),
      });
    }
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return products.length ? { platform: "bigcommerce", categories, products } : null;
}

// ---------- Shopify ----------
type ShopProduct = { handle: string; title: string; product_type?: string; images?: { src: string }[]; variants?: { price: string }[] };

async function shopify(host: string, deadline: number, max: number): Promise<PlatformCatalog | null> {
  const first = await getJson<{ products: ShopProduct[] }>(`https://${host}/products.json?limit=250&page=1`);
  if (!first?.products) return null;
  const all: ShopProduct[] = [...first.products];
  // Pages can come back short of 250 (unpublished products are dropped) and still not be the last: read until an empty page.
  for (let page = 2; first.products.length > 0 && all.length < max; page++) {
    if (Date.now() > deadline || page > 80) throw new IncompleteCatalog(`${host}: read ${all.length} products before running out of time`);
    const next = await getJson<{ products: ShopProduct[] }>(`https://${host}/products.json?limit=250&page=${page}`);
    if (!next?.products) throw new IncompleteCatalog(`${host}: catalog page ${page} failed after ${all.length} products`);
    if (!next.products.length) break;
    all.push(...next.products);
  }
  const byHandle = new Map(all.map((p) => [p.handle, p]));
  const keys = new Map<string, string[]>();
  const categories: PlatformCategory[] = [];
  // Collections are the store's own categories; membership comes from each collection's feed.
  const cols = (await getJson<{ collections: { handle: string; title: string }[] }>(`https://${host}/collections.json?limit=250`))?.collections ?? [];
  for (const c of cols.filter((c) => !CATCH_ALL.test(c.handle) && !PROMO.test(c.handle) && !PROMO.test(c.title) && !INTERNAL.test(c.handle) && !INTERNAL.test(c.title)).slice(0, 80)) {
    if (Date.now() > deadline) break;
    let n = 0;
    for (let page = 1; page <= 10; page++) {
      const r = await getJson<{ products: { handle: string }[] }>(`https://${host}/collections/${c.handle}/products.json?limit=250&page=${page}`);
      if (!r?.products?.length) break;
      for (const p of r.products) if (byHandle.has(p.handle)) {
        keys.set(p.handle, [...(keys.get(p.handle) ?? []), `c:${c.handle}`]);
        n++;
      }
      if (r.products.length < 200) break;
    }
    if (n) categories.push({ key: `c:${c.handle}`, name: c.title, parentKey: null, url: `https://${host}/collections/${c.handle}` });
  }
  // Product types fill in for products in no collection.
  for (const p of all) {
    if (keys.has(p.handle) || !p.product_type) continue;
    const k = `t:${p.product_type.toLowerCase()}`;
    if (!categories.some((c) => c.key === k)) categories.push({ key: k, name: p.product_type, parentKey: null, url: null });
    keys.set(p.handle, [k]);
  }
  const products = all.map((p) => {
    const prices = (p.variants ?? []).map((v) => Number(v.price)).filter((x) => x > 0);
    return {
      url: `https://${host}/products/${p.handle}`,
      title: p.title,
      price: prices.length ? Math.min(...prices) : null,
      currency: null,
      image: p.images?.[0]?.src ?? null,
      categoryKeys: keys.get(p.handle) ?? [],
    };
  });
  return products.length ? { platform: "shopify", categories, products } : null;
}

// ---------- WooCommerce ----------
type WooProduct = { permalink: string; name: string; prices?: { price: string; currency_code: string; currency_minor_unit: number }; images?: { src: string }[]; categories?: { id: number }[] };
type WooCat = { id: number; name: string; parent: number; link?: string; permalink?: string };

async function woocommerce(host: string, deadline: number, max: number): Promise<PlatformCatalog | null> {
  const api = `https://${host}/wp-json/wc/store/v1`;
  // Some stores' servers fail on 100 products a page (eatgrub.co.uk): smaller pages then.
  let size = 0;
  let first: WooProduct[] | null = null;
  for (const n of [100, 50, 20]) {
    first = await getJson<WooProduct[]>(`${api}/products?per_page=${n}&page=1`);
    if (Array.isArray(first)) {
      size = n;
      break;
    }
  }
  if (!Array.isArray(first)) return null;
  const all = [...first];
  // A page the server fails on (one product it can't serve breaks the whole page) is read in halves,
  // down to single products; a product that still fails is skipped.
  let skipped = 0;
  const range = async (offset: number, n: number): Promise<{ items: WooProduct[]; end: boolean }> => {
    const r = await getJson<WooProduct[]>(`${api}/products?per_page=${n}&page=${offset / n + 1}`);
    if (Array.isArray(r)) return { items: r, end: r.length < n };
    if (n === 1) {
      skipped++;
      return { items: [], end: false };
    }
    const half = [50, 25, 20, 10, 5, 2, 1].find((m) => m < n && n % m === 0)!;
    const items: WooProduct[] = [];
    for (let o = offset; o < offset + n; o += half) {
      const part = await range(o, half);
      items.push(...part.items);
      if (part.end) return { items, end: true };
    }
    return { items, end: false };
  };
  for (let offset = first.length, end = first.length < size; !end && all.length < max; offset += size) {
    if (Date.now() > deadline || offset > 100_000) throw new IncompleteCatalog(`${host}: read ${all.length} products before running out of time`);
    const part = await range(offset, size);
    all.push(...part.items);
    end = part.end || (part.items.length === 0 && skipped === 0);
  }
  if (skipped > Math.max(2, all.length * 0.05)) throw new IncompleteCatalog(`${host}: ${skipped} products could not be read`);
  const cats: WooCat[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await getJson<WooCat[]>(`${api}/products/categories?per_page=100&page=${page}`);
    if (!Array.isArray(r) || !r.length) break;
    cats.push(...r);
    if (r.length < 100) break;
  }
  const categories = cats.map((c) => ({ key: String(c.id), name: c.name.replace(/&amp;/g, "&"), parentKey: c.parent ? String(c.parent) : null, url: c.link ?? c.permalink ?? null }));
  const products = all.map((p) => {
    const unit = p.prices?.currency_minor_unit ?? 2;
    const price = p.prices?.price ? Number(p.prices.price) / 10 ** unit : null;
    return {
      url: p.permalink,
      title: p.name.replace(/&amp;/g, "&").replace(/&#8211;/g, "–"),
      price: price && price > 0 ? price : null,
      currency: p.prices?.currency_code ?? null,
      image: p.images?.[0]?.src ?? null,
      categoryKeys: (p.categories ?? []).map((c) => String(c.id)),
    };
  });
  return products.length ? { platform: "woocommerce", categories, products } : null;
}

/** The store's catalog from its platform's public feed, or null. */
/**
 * The store's catalog from its platform's public feed (up to `maxProducts`),
 * or null when it has none. Throws IncompleteCatalog when a feed exists but
 * couldn't be read in full.
 */
export async function platformCatalog(domain: string, budgetMs = 200_000, maxProducts = 20_000): Promise<PlatformCatalog | null> {
  const deadline = Date.now() + budgetMs;
  for (const host of [domain, `www.${domain.replace(/^www\./, "")}`]) {
    for (const read of [shopify, woocommerce, bigcommerce]) {
      const c = await read(host, deadline, maxProducts).catch((err) => {
        if (err instanceof IncompleteCatalog) throw err;
        return null;
      });
      if (c) return c;
    }
  }
  return null;
}
