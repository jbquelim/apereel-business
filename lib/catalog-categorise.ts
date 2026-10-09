import type { PlatformCatalog, PlatformCategory } from "./platform-catalog";

// Gives every product in a platform catalog one category, the store's own
// where it has one. Pure (no network, no database), so the importer
// (lib/catalog-import) and the store bench (tools/site-bench.mts) share it.
//
// In order, a product gets:
//   1. its most specific real category (deepest, then smallest); catch-alls
//      ("Shop all", or anything listing over a third of the catalog) don't count;
//   2. its product type (Shopify's product_type, a CSV's Type column), merged
//      into the store's category of the same name when there is one;
//   3. the first of its tags that names a category;
//   4. a category named in its title.
// Onyx Coffee Lab: 316 archived coffees sat only in "Coffee archive" (393 of
// 780 products, a catch-all by size) and came out with no category, though
// every one is typed "Coffee".

/** Category names that are listings, not categories. */
export const CATCH_ALL = /\b(shop all|all products|all items|catalog|new arrivals?|sale|clearance|featured|best ?sellers?|specials?|gift ?cards?)\b/i;

export type Categorised = {
  /** The store's categories plus any made from product types (keys `t:`). */
  categories: PlatformCategory[];
  /** Each product's category key, in the catalog's product order; null when nothing fits. */
  keys: (string | null)[];
  /** Whether a category is a real one (not a catch-all) that products can be filed under. */
  usable: (key: string) => boolean;
  /** How the keys were found, for reports. */
  by: { category: number; type: number; tag: number; title: number; none: number };
};

/** Below this many products, a category's size never makes it a catch-all. */
const SMALL_CATALOG = 100;

/** "Coffee Subscriptions" → "coffee subscription": the same name in any spelling. */
const nameKey = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/(?<=[a-z]{3})s$/, "");
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function categorise(cat: PlatformCatalog, maxProducts = Infinity): Categorised {
  const products = cat.products.slice(0, maxProducts);
  const categories = [...cat.categories];
  const byKey = new Map(categories.map((c) => [c.key, c]));
  const depth = (k: string) => {
    let d = 0;
    for (let c = byKey.get(k); c?.parentKey && d < 10; c = byKey.get(c.parentKey)) d++;
    return d;
  };
  // Sizes are what the store lists, so a category that grows through fallbacks stays usable.
  const size = new Map<string, number>();
  for (const p of products) for (const k of p.categoryKeys) size.set(k, (size.get(k) ?? 0) + 1);
  // In a small shop one real category can hold a third of everything (eatgrub.co.uk: Snacks, 14 of 31).
  const usable = (k: string) => {
    const c = byKey.get(k);
    return !!c && !CATCH_ALL.test(c.name) && (products.length < SMALL_CATALOG || (size.get(k) ?? 0) <= products.length / 3);
  };
  const pick = (keys: string[]) =>
    keys.filter(usable).sort((a, b) => depth(b) - depth(a) || (size.get(a) ?? 0) - (size.get(b) ?? 0))[0] ?? null;

  // Usable categories by name; the one listing most products wins a shared name.
  const byName = new Map<string, string>();
  for (const c of [...categories].sort((a, b) => (size.get(b.key) ?? 0) - (size.get(a.key) ?? 0))) {
    const n = nameKey(c.name);
    if (n && usable(c.key) && !byName.has(n)) byName.set(n, c.key);
  }

  const by = { category: 0, type: 0, tag: 0, title: 0, none: 0 };
  const keys: (string | null)[] = products.map((p) => {
    const key = pick(p.categoryKeys);
    if (key) {
      by.category++;
      return key;
    }
    const type = p.type?.trim();
    if (!type || CATCH_ALL.test(type)) return null;
    const n = nameKey(type);
    if (!n) return null;
    let k = byName.get(n);
    if (!k) {
      k = `t:${n}`;
      const c = { key: k, name: type, parentKey: null, url: null };
      categories.push(c);
      byKey.set(k, c);
      byName.set(n, k);
    }
    by.type++;
    return k;
  });
  // Tags and titles can only name categories, so they run once every category exists.
  const named = [...byName].map(([n, k]) => ({ k, re: new RegExp(`(?<![a-z0-9])${esc(n)}(?:s|es)?(?![a-z0-9])`, "i"), n })).filter((x) => x.n.length >= 4).sort((a, b) => b.n.length - a.n.length);
  products.forEach((p, i) => {
    if (keys[i]) return;
    for (const t of p.tags ?? []) {
      const k = byName.get(nameKey(t));
      if (k) {
        keys[i] = k;
        by.tag++;
        return;
      }
    }
    const title = nameKey(p.title);
    const hit = named.find((x) => x.re.test(title));
    if (hit) {
      keys[i] = hit.k;
      by.title++;
      return;
    }
    by.none++;
  });
  return { categories, keys, usable, by };
}
