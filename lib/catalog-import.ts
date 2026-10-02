import { neon } from "@neondatabase/serverless";
import { BROWSER_UA, fetchSitemapCatalog, isBlockedPage } from "./site-fetch";
import { crawlProductUrls } from "./site-crawl";
import { upgradeImages } from "./image-upgrade";
import { platformCatalog, type PlatformCatalog } from "./platform-catalog";
import type { SiteDoc } from "./site-types";
import { applyGroups } from "./category-groups";

// Imports a business's whole catalog into a generated site, categorised the
// way the business itself categorises it. Category pages list their products,
// so we read every category page (following its "next page" links), record
// which products each lists, and give every product its most specific
// category (catch-alls like "Shop all" are ignored). Runs in steps that each
// fit one function call and resume where the last stopped. No AI involved.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const norm = (u: string) => {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, "")}${x.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return u.toLowerCase();
  }
};
const lastSegment = (u: string) => decodeURIComponent(new URL(u).pathname.split("/").filter(Boolean).pop() ?? "item");
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
const CATCH_ALL = /\b(shop all|all products|all items|catalog|new arrivals?|sale|clearance|featured|best ?sellers?|specials?|gift ?cards?)\b/i;

async function get(url: string): Promise<string | null> {
  for (const ua of [BROWSER_UA, "Mozilla/5.0"]) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": ua }, redirect: "follow", signal: AbortSignal.timeout(12_000) });
      if (res.ok) {
        const html = await res.text();
        return isBlockedPage(html) ? null : html;
      }
      if (![401, 403, 406, 429].includes(res.status)) return null;
    } catch {
      return null;
    }
  }
  return null;
}

function cleanName(title: string | null, url: string, brandWord: string): string {
  const parts = (title ?? "").split(/\s+[|–—-]\s+/).map((p) => p.trim()).filter(Boolean);
  const name = parts.find((p) => !p.replace(/[^a-z0-9]/gi, "").toLowerCase().includes(brandWord)) ?? "";
  return name || lastSegment(url).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** 1. Category list from the sitemap, with parents worked out from their addresses. */
async function seedCategories(domain: string, categoryUrls: string[]) {
  const urls = [...new Set(categoryUrls)];
  const byPath = new Map(urls.map((u) => [new URL(u).pathname.replace(/\/+$/, ""), u]));
  const rows = urls.map((u) => {
    const segs = new URL(u).pathname.split("/").filter(Boolean);
    let parent: string | null = null;
    for (let i = segs.length - 1; i > 0 && !parent; i--) parent = byPath.get(`/${segs.slice(0, i).join("/")}`) ?? null;
    return { domain, url: u, parent_url: parent, depth: segs.length };
  });
  for (let i = 0; i < rows.length; i += 200) {
    await sql()`
      INSERT INTO catalog_categories (domain, url, parent_url, depth)
      SELECT domain, url, parent_url, depth FROM jsonb_to_recordset(${JSON.stringify(rows.slice(i, i + 200))}::jsonb)
        AS r(domain text, url text, parent_url text, depth int)
      ON CONFLICT (domain, url) DO NOTHING
    `;
  }
}

/** 2. Reads category pages (all their pages) and records which products each lists. */
async function crawlCategories(domain: string, productSet: Set<string>, deadline: number): Promise<number> {
  const brandWord = domain.split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  const todo = (await sql()`SELECT url FROM catalog_categories WHERE domain = ${domain} AND crawled_at IS NULL ORDER BY depth, url`) as { url: string }[];
  let next = 0;
  const worker = async () => {
    while (next < todo.length && Date.now() < deadline) {
      const { url } = todo[next++];
      let pageUrl: string | null = url;
      let title: string | null = null;
      let pages = 0;
      const found = new Set<string>();
      while (pageUrl && pages < 25 && Date.now() < deadline) {
        const html = await get(pageUrl);
        if (!html) break;
        pages++;
        title ??= html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || null;
        const before = found.size;
        for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
          try {
            const abs = new URL(m[1].replace(/&amp;/g, "&"), pageUrl).toString();
            if (productSet.has(norm(abs))) found.add(norm(abs));
          } catch {
            /* skip */
          }
        }
        if (found.size === before && pages > 1) break;
        // Follow the page's own "next" link; otherwise try the common ?page=N pattern.
        const rel = html.match(/<link[^>]+rel=["']next["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? html.match(/<a[^>]+rel=["']next["'][^>]*href=["']([^"']+)["']/i)?.[1];
        pageUrl = rel ? new URL(rel.replace(/&amp;/g, "&"), pageUrl).toString() : found.size > before && found.size - before >= 12 ? `${url}${url.includes("?") ? "&" : "?"}page=${pages + 1}` : null;
      }
      const links = [...found].map((p) => ({ domain, category_url: url, product_url: p }));
      for (let i = 0; i < links.length; i += 500) {
        await sql()`
          INSERT INTO catalog_links (domain, category_url, product_url)
          SELECT domain, category_url, product_url FROM jsonb_to_recordset(${JSON.stringify(links.slice(i, i + 500))}::jsonb) AS r(domain text, category_url text, product_url text)
          ON CONFLICT DO NOTHING
        `;
      }
      await sql()`UPDATE catalog_categories SET name = ${cleanName(title, url, brandWord)}, pages_read = ${pages}, crawled_at = now() WHERE domain = ${domain} AND url = ${url}`;
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return Math.max(0, todo.length - next);
}

type Snap = { url: string; title: string; price: number | null; currency: string | null; image: string | null };

/** 4. Puts every crawled product on the site, each in its most specific category. */
async function assemble(site: { id: string; doc: SiteDoc }, domain: string): Promise<{ products: number; categories: number }> {
  const brandWord = domain.split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  const snaps = (await sql()`
    SELECT DISTINCT ON (url) url, title, price::float AS price, currency, image FROM page_snapshots
    WHERE domain = ${domain} AND role = 'client' AND kind = 'product' AND NOT blocked AND status < 400 AND title IS NOT NULL
    ORDER BY url, crawled_at DESC
  `) as Snap[];
  const cats = (await sql()`SELECT url, name, parent_url, depth FROM catalog_categories WHERE domain = ${domain} AND crawled_at IS NOT NULL`) as { url: string; name: string; parent_url: string | null; depth: number }[];
  const links = (await sql()`SELECT category_url, product_url FROM catalog_links WHERE domain = ${domain}`) as { category_url: string; product_url: string }[];

  // Category sizes; catch-alls (by name, or listing over a third of everything) don't count.
  const size = new Map<string, number>();
  for (const l of links) size.set(l.category_url, (size.get(l.category_url) ?? 0) + 1);
  const linked = new Set(links.map((l) => l.product_url)).size || 1;
  const catByUrl = new Map(cats.map((c) => [c.url, c]));
  const usable = (u: string) => {
    const c = catByUrl.get(u);
    return !!c && !CATCH_ALL.test(c.name) && (size.get(u) ?? 0) <= linked / 3;
  };
  const best = new Map<string, string>();
  for (const l of links) {
    if (!usable(l.category_url)) continue;
    const cur = best.get(l.product_url);
    const a = catByUrl.get(l.category_url)!;
    if (!cur) best.set(l.product_url, l.category_url);
    else {
      const b = catByUrl.get(cur)!;
      if ((size.get(l.category_url)! < size.get(cur)!) || (size.get(l.category_url) === size.get(cur) && a.depth > b.depth)) best.set(l.product_url, l.category_url);
    }
  }

  const catSlug = new Map<string, string>();
  const usedSlugs = new Set<string>();
  for (const c of cats) {
    let s = slugify(lastSegment(c.url));
    while (usedSlugs.has(s)) s = `${s}-${usedSlugs.size}`;
    usedSlugs.add(s);
    catSlug.set(c.url, s);
  }
  // Keep the copy and specs the AI already wrote for products on the site.
  const existing = new Map(site.doc.products.map((p) => [norm(p.sourceUrl), p]));
  const used = new Set<string>();
  const rows = (
    await upgradeImages(
      snaps.map((s) => ({ ...s, image: s.image })),
    )
  ).map((s, i) => {
    const prev = existing.get(norm(s.url));
    let slug = prev?.slug ?? slugify(lastSegment(s.url));
    while (used.has(slug)) slug = `${slug}-${i}`;
    used.add(slug);
    const title = cleanName(s.title, s.url, brandWord) === s.title ? s.title : s.title.split(/\s+[|]\s+/)[0].trim();
    const cat = best.get(norm(s.url));
    return {
      site_id: site.id,
      slug,
      title,
      price: s.price ? s.price : null,
      currency: s.currency,
      image: s.image,
      description: prev?.description ?? `${title}.`,
      category: cat ? catSlug.get(cat) ?? null : null,
      specs: prev?.specs ?? null,
      featured: !!prev?.featured,
      source_url: s.url,
      position: prev?.featured ? 0 : i + 1,
    };
  });
  for (let i = 0; i < rows.length; i += 300) {
    await sql()`
      INSERT INTO site_products (site_id, slug, title, price, currency, image, description, category, specs, featured, source_url, position)
      SELECT site_id, slug, title, price, currency, image, description, category, specs, featured, source_url, position
      FROM jsonb_to_recordset(${JSON.stringify(rows.slice(i, i + 300))}::jsonb) AS r(site_id text, slug text, title text, price numeric, currency text, image text,
        description text, category text, specs jsonb, featured boolean, source_url text, position int)
      ON CONFLICT (site_id, slug) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, image = EXCLUDED.image, category = EXCLUDED.category, position = EXCLUDED.position
    `;
  }

  // Categories that hold products (directly or through children), with their parents.
  const direct = new Map<string, number>();
  for (const r of rows) if (r.category) direct.set(r.category, (direct.get(r.category) ?? 0) + 1);
  const total = new Map<string, number>();
  for (const c of cats) {
    let u: string | null = c.url;
    const n = direct.get(catSlug.get(c.url)!) ?? 0;
    const seen = new Set<string>();
    while (u && n && !seen.has(u)) {
      seen.add(u);
      total.set(u, (total.get(u) ?? 0) + n);
      u = catByUrl.get(u)?.parent_url ?? null;
    }
  }
  const prevCats = new Map(site.doc.categories.map((c) => [c.slug, c]));
  const categories = cats
    .filter((c) => (total.get(c.url) ?? 0) > 0 && usable(c.url))
    .map((c) => {
      const slug = catSlug.get(c.url)!;
      const parent = c.parent_url && usable(c.parent_url) && (total.get(c.parent_url) ?? 0) > 0 ? catSlug.get(c.parent_url) ?? null : null;
      // A photo for the category: its first product with one, here or in a subcategory.
      const subtree = new Set([slug, ...cats.filter((k) => { for (let u = k.parent_url; u; u = catByUrl.get(u)?.parent_url ?? null) if (u === c.url) return true; return false; }).map((k) => catSlug.get(k.url)!)]);
      const image = rows.find((r) => r.image && r.category && subtree.has(r.category))?.image ?? null;
      return { slug, name: c.name, description: prevCats.get(slug)?.description ?? "", parent, count: total.get(c.url) ?? 0, image };
    })
    .sort((a, b) => (a.parent ? 1 : 0) - (b.parent ? 1 : 0) || b.count - a.count);

  const featured = rows.filter((r) => r.featured);
  const doc: SiteDoc = {
    ...site.doc,
    categories: applyGroups(categories, site.doc.categoryGroups),
    // The document keeps only what the home page needs; the catalog lives in site_products.
    products: (featured.length ? featured : rows.filter((r) => r.image).slice(0, 24)).map((r) => ({
      slug: r.slug, title: r.title, price: r.price, currency: r.currency, image: r.image, description: r.description,
      category: r.category, sourceUrl: r.source_url, featured: true, ...(r.specs ? { specs: r.specs } : {}),
    })),
    catalogSize: rows.length,
  };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return { products: rows.length, categories: categories.length };
}

/** Writes a platform catalog onto the site: each product in its deepest real category. */
async function assemblePlatform(site: { id: string; doc: SiteDoc }, cat: PlatformCatalog, maxProducts: number): Promise<{ products: number; categories: number }> {
  const byKey = new Map(cat.categories.map((c) => [c.key, c]));
  const depth = (k: string) => {
    let d = 0;
    for (let c = byKey.get(k); c?.parentKey && d < 10; c = byKey.get(c.parentKey)) d++;
    return d;
  };
  const size = new Map<string, number>();
  for (const p of cat.products) for (const k of p.categoryKeys) size.set(k, (size.get(k) ?? 0) + 1);
  const usable = (k: string) => {
    const c = byKey.get(k);
    return !!c && !CATCH_ALL.test(c.name) && (size.get(k) ?? 0) <= cat.products.length / 3;
  };
  const pick = (keys: string[]) =>
    keys.filter(usable).sort((a, b) => depth(b) - depth(a) || (size.get(a) ?? 0) - (size.get(b) ?? 0))[0] ?? null;

  const slugOf = new Map<string, string>();
  const usedCat = new Set<string>();
  for (const c of cat.categories) {
    let s = slugify(c.url ? lastSegment(c.url) : c.name);
    while (usedCat.has(s)) s = `${s}-${usedCat.size}`;
    usedCat.add(s);
    slugOf.set(c.key, s);
  }
  const existing = new Map(site.doc.products.map((p) => [norm(p.sourceUrl), p]));
  const used = new Set<string>();
  const list = (await upgradeImages(cat.products.slice(0, maxProducts))).map((p, i) => {
    const prev = existing.get(norm(p.url));
    let slug = prev?.slug ?? slugify(lastSegment(p.url));
    while (used.has(slug)) slug = `${slug}-${i}`;
    used.add(slug);
    const key = pick(p.categoryKeys);
    return {
      site_id: site.id,
      slug,
      title: p.title,
      price: p.price,
      currency: p.currency,
      image: p.image,
      description: prev?.description ?? `${p.title}.`,
      category: key ? slugOf.get(key)! : null,
      specs: prev?.specs ?? null,
      featured: !!prev?.featured,
      source_url: p.url,
      position: prev?.featured ? 0 : i + 1,
      key,
    };
  });
  await sql()`DELETE FROM site_products WHERE site_id = ${site.id}`;
  for (let i = 0; i < list.length; i += 400) {
    await sql()`
      INSERT INTO site_products (site_id, slug, title, price, currency, image, description, category, specs, featured, source_url, position)
      SELECT site_id, slug, title, price, currency, image, description, category, specs, featured, source_url, position
      FROM jsonb_to_recordset(${JSON.stringify(list.slice(i, i + 400).map(({ key: _k, ...r }) => r))}::jsonb) AS r(site_id text, slug text, title text, price numeric, currency text, image text,
        description text, category text, specs jsonb, featured boolean, source_url text, position int)
      ON CONFLICT (site_id, slug) DO NOTHING
    `;
  }
  // Counts include subcategories; a category's photo is its first product's.
  const total = new Map<string, number>();
  const photo = new Map<string, string>();
  for (const p of list) {
    for (let k: string | null = p.key; k; k = byKey.get(k)?.parentKey ?? null) {
      total.set(k, (total.get(k) ?? 0) + 1);
      if (p.image && !photo.has(k)) photo.set(k, p.image);
    }
  }
  const prevCats = new Map(site.doc.categories.map((c) => [c.slug, c]));
  const categories = cat.categories
    .filter((c) => (total.get(c.key) ?? 0) > 0 && usable(c.key))
    .map((c) => {
      const slug = slugOf.get(c.key)!;
      const parent = c.parentKey && usable(c.parentKey) && (total.get(c.parentKey) ?? 0) > 0 ? slugOf.get(c.parentKey) ?? null : null;
      return { slug, name: c.name, description: prevCats.get(slug)?.description ?? "", parent, count: total.get(c.key) ?? 0, image: photo.get(c.key) ?? null };
    });
  const featured = list.filter((r) => r.featured);
  const doc: SiteDoc = {
    ...site.doc,
    categories: applyGroups(categories, site.doc.categoryGroups),
    products: (featured.length ? featured : list.filter((r) => r.image).slice(0, 24)).map((r) => ({
      slug: r.slug, title: r.title, price: r.price, currency: r.currency, image: r.image, description: r.description,
      category: r.category, sourceUrl: r.source_url, featured: true, ...(r.specs ? { specs: r.specs } : {}),
    })),
    catalogSize: list.length,
    catalogTotal: Math.max(site.doc.catalogTotal ?? 0, cat.products.length),
  };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return { products: list.length, categories: categories.length };
}

/** One import step within the budget. Returns what's still to read. */
export async function importCatalogStep(site: { id: string; doc: SiteDoc }, domain: string, budgetMs = 210_000, maxProducts = 20_000): Promise<{ remaining: number; products: number; categories: number }> {
  const deadline = Date.now() + budgetMs;
  // Stores on Shopify, WooCommerce or BigCommerce: their own catalog feed, in one go.
  const platform = await platformCatalog(domain, budgetMs - 40_000).catch(() => null);
  if (platform) return { remaining: 0, ...(await assemblePlatform(site, platform, maxProducts)) };
  const { productUrls, categoryUrls } = await fetchSitemapCatalog(domain);
  const productSet = new Set(productUrls.map(norm));
  const known = ((await sql()`SELECT count(*)::int AS n FROM catalog_categories WHERE domain = ${domain}`) as { n: number }[])[0].n;
  if (known === 0 && categoryUrls.length) await seedCategories(domain, categoryUrls);

  const catsLeft = await crawlCategories(domain, productSet, deadline - 60_000);
  let productsLeft = 0;
  if (Date.now() < deadline - 40_000) {
    const seen = new Set(((await sql()`SELECT DISTINCT url FROM page_snapshots WHERE domain = ${domain} AND role = 'client' AND kind = 'product' AND crawled_at > now() - interval '60 days'`) as { url: string }[]).map((r) => norm(r.url)));
    const todo = productUrls.filter((u) => !seen.has(norm(u))).slice(0, Math.max(0, maxProducts - seen.size));
    const batch = todo.slice(0, 700);
    if (batch.length) await crawlProductUrls(domain, batch, Math.max(10_000, deadline - Date.now() - 30_000));
    productsLeft = Math.max(0, todo.length - batch.length);
  } else {
    productsLeft = 1;
  }
  const done = await assemble(site, domain);
  return { remaining: catsLeft + productsLeft, ...done };
}
