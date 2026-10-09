import { neon } from "@neondatabase/serverless";
import type { PlatformCatalog, PlatformProduct } from "./platform-catalog";

// A product file a client uploads when their site can't be read (a firewall
// that blocks every crawler): Shopify's or WooCommerce's product export, or
// any spreadsheet with a name, price, image, link and category. It becomes
// their catalog for the website build, content and ads, ahead of crawling.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const slug = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** The products in an uploaded file (the export's own columns, whichever platform made it). */
export function productsFromCsv(text: string, domain: string): { products: PlatformProduct[]; categories: string[]; source: string } {
  const [head, ...rows] = parseCsv(text);
  if (!head) return { products: [], categories: [], source: "empty" };
  const cols = head.map((h) => h.trim().toLowerCase());
  // The first name found wins, in this order (WooCommerce has both "Type", always "simple", and "Categories").
  const col = (...names: string[]) => names.map((n) => cols.indexOf(n)).find((i) => i >= 0) ?? -1;
  const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const iHandle = col("handle");
  const iTitle = col("title", "name", "product name", "product_title", "product");
  const iPrice = col("variant price", "regular price", "price", "sale price", "unit price");
  const iImage = col("image src", "images", "image", "image url", "image_url", "photo");
  const iUrl = col("url", "permalink", "link", "product url", "product_url");
  const iCat = col("product category", "categories", "category", "collection", "product type", "type");
  const iTags = col("tags", "product tags");
  const source = iHandle >= 0 && cols.includes("variant price") ? "Shopify export" : cols.includes("regular price") ? "WooCommerce export" : "spreadsheet";
  const base = `https://${domain.replace(/^www\./, "")}`;
  const byKey = new Map<string, PlatformProduct & { category: string }>();
  for (const r of rows) {
    // A Shopify export has one row per variant or image; the title is on the first.
    const key = at(r, iHandle) || at(r, iTitle);
    if (!key) continue;
    const had = byKey.get(key);
    const title = at(r, iTitle) || had?.title || "";
    // The first row's price and photo are the product's (later rows are variants and extra photos).
    const price = had?.price || Number(at(r, iPrice).replace(/[^0-9.]/g, "")) || null;
    const image = had?.image || at(r, iImage).split(/,\s*(?=https?:)/)[0] || null;
    const category = (at(r, iCat).split(/,\s*/)[0] ?? "").split(/\s*>\s*/)[0] || had?.category || "";
    const url = at(r, iUrl) || had?.url || (at(r, iHandle) ? `${base}/products/${at(r, iHandle)}` : `${base}/`);
    const tags = (at(r, iTags) || (had?.tags ?? []).join(",")).split(/,\s*/).map((t) => t.trim()).filter(Boolean);
    byKey.set(key, { url, title, price, currency: null, image, categoryKeys: category ? [`u:${slug(category)}`] : [], category, ...(tags.length ? { tags } : {}) });
  }
  const products = [...byKey.values()].filter((p) => p.title);
  return {
    products: products.map(({ url, title, price, currency, image, categoryKeys, tags }) => ({ url, title, price, currency, image, categoryKeys, ...(tags ? { tags } : {}) })),
    categories: [...new Set(products.map((p) => p.category).filter(Boolean))],
    source,
  };
}

export async function saveUpload(domain: string, text: string): Promise<{ products: number; categories: number; source: string }> {
  const { products, categories, source } = productsFromCsv(text, domain);
  if (products.length) {
    await sql()`
      INSERT INTO catalog_uploads (domain, products, categories, source, uploaded_at) VALUES (${domain}, ${JSON.stringify(products)}::jsonb, ${JSON.stringify(categories)}::jsonb, ${source}, now())
      ON CONFLICT (domain) DO UPDATE SET products = EXCLUDED.products, categories = EXCLUDED.categories, source = EXCLUDED.source, uploaded_at = now()
    `;
  }
  return { products: products.length, categories: categories.length, source };
}

/** A client's uploaded catalog in the platform feeds' shape, or null. */
export async function uploadedCatalog(domain: string): Promise<PlatformCatalog | null> {
  const row = ((await sql()`SELECT products, categories FROM catalog_uploads WHERE domain = ${domain.replace(/^www\./, "")}`.catch(() => [])) as { products: PlatformProduct[]; categories: string[] }[])[0];
  if (!row?.products?.length) return null;
  return {
    platform: "upload",
    products: row.products,
    categories: row.categories.map((name) => ({ key: `u:${slug(name)}`, name, parentKey: null, url: null })),
  };
}
