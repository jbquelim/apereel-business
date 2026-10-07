import type { SiteDoc, SitePage } from "./site-types";

// Quality checks on a generated site's rendered pages, run before John sees
// it. Content only (no browser): internal wording leaking into customer copy,
// numbers that contradict the catalog, placeholders, missing photos, weak
// accent contrast, broken meta. Layout at phone width is checked by
// tools/site-qa.mts in a real browser when a template changes.

/** "fix": wrong on the page; "note": worth knowing (missing logo), not an error. */
export type QaIssue = { page: string; check: string; detail: string; level?: "fix" | "note" };

/** Words from our analysis that must never reach a shopper. */
// Includes the AI repeating its own instructions ("a plain guide, no price claims").
const INTERNAL = /\b(no price claims?|price claims?|no claims|as instructed|the brief|average price|highest[- ]value|revenue|margins?|our analysis|the analysis|growth plan|priorit(?:y|ies|ised|ized)|competitors?|lever|SEO|conversion rate|search volume|crawl(?:er|ed)?|apereel)\b/i;
const PLACEHOLDER = /\b(lorem ipsum|TODO|TBD|undefined|null|NaN|\[object Object\])\b|\{\{|\}\}|\.\.\.\s*$/;
const COUNT = /\b(\d{1,3}(?:,\d{3})+|\d{3,})\+?\s+(?:products|parts|items|pieces|SKUs|lamp and chandelier parts|[a-z]+ parts)\b/gi;

/** Visible text of an HTML page (no scripts, styles, tags or the preview bar). */
export function visibleText(html: string): string {
  return html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<div class="note">[\s\S]*?<\/div>/gi, " ")
    .replace(/<div[^>]*>\s*Preview[^<]{0,60}built by Apereel\s*<\/div>/gi, " ")
    // Separate elements stay separate ("since 1913" + "Products" is not "1913 Products").
    .replace(/<\/(p|h[1-6]|div|li|a|span|td|th|section|header|footer|nav|button|label|summary|b)>/gi, " ¶ ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function luminance(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return 1;
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Checks one rendered page. `catalogCount` is what the shop actually lists. */
export function checkPage(page: string, html: string, catalogCount: number, categoryCounts: number[] = []): QaIssue[] {
  const out: QaIssue[] = [];
  const text = visibleText(html);
  const add = (check: string, detail: string) => out.push({ page, check, detail });

  // The title and meta description too: they're what search results show.
  const head = [html.match(/<title>([^<]*)<\/title>/)?.[1], html.match(/<meta name="description" content="([^"]*)"/)?.[1]].filter(Boolean).join(" ¶ ");
  for (const source of [text, head]) {
    const internal = source.match(new RegExp(INTERNAL.source, "gi"));
    if (!internal) continue;
    for (const w of [...new Set(internal.map((x) => x.toLowerCase()))]) {
      const at = source.toLowerCase().indexOf(w);
      add("internal-wording", `${source === head ? "in the title or description: " : ""}"${source.slice(Math.max(0, at - 50), at + w.length + 40).trim()}"`);
    }
  }
  const ph = text.match(PLACEHOLDER);
  if (ph) add("placeholder", `"${ph[0]}"`);
  if (catalogCount > 100) {
    for (const m of text.matchAll(COUNT)) {
      const n = Number(m[1].replace(/,/g, ""));
      // A category's own count ("1,693 products" on its card) is right where it is.
      if (n > 100 && Math.abs(n - catalogCount) / catalogCount > 0.1 && !categoryCounts.includes(n)) add("count-mismatch", `copy says "${m[0]}", the shop lists ${catalogCount.toLocaleString("en-US")}`);
    }
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  if (!title) add("meta", "no <title>");
  else if (title.length > 75) add("meta", `title is ${title.length} characters`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) add("meta", "missing or short meta description");
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) add("headings", `${h1} H1 headings`);
  // Product cards without a photo look broken.
  const cards = html.match(/<a class="(?:card|tile|pc)"[\s\S]*?<\/a>/g) ?? [];
  const bare = cards.filter((c) => !/<img /.test(c)).length;
  if (cards.length && bare / cards.length > 0.25) add("photos", `${bare} of ${cards.length} product cards have no photo`);
  return out;
}

/** Site-wide checks on the document itself. */
export function checkDoc(doc: SiteDoc): QaIssue[] {
  const out: QaIssue[] = [];
  const accent = doc.tokens.palette.accent;
  if (contrast(accent, "#ffffff") < 3) out.push({ page: "site", check: "accent-contrast", detail: `${accent} on white is ${contrast(accent, "#ffffff").toFixed(1)}:1 (needs 3:1 for text and icons)` });
  const hero = doc.pages.find((p) => p.slug === "")?.sections.find((s) => s.type === "hero") as { heading?: string } | undefined;
  if ((hero?.heading?.length ?? 0) > 70) out.push({ page: "/", check: "hero-length", detail: `hero headline is ${hero!.heading!.length} characters` });
  if (doc.designMatched === false) out.push({ page: "site", check: "design", detail: "no template matched this business's industry; the design was picked by usage only, so check it suits them", level: "note" });
  if (!doc.brand.logo) out.push({ page: "site", check: "logo", detail: "no logo found; the business name is shown as text", level: "note" });
  const names = [...(doc.categoryGroups ?? []), ...doc.categories].map((c) => c.name.toLowerCase());
  // Prices in the copy (not on product cards) are usually a range's extreme, often a bulk or wholesale item.
  const total = doc.catalogTotal ?? doc.catalogSize ?? doc.products.length;
  const known = new Set(doc.products.map((p) => p.price).filter((n): n is number => n != null).map(Number));
  for (const page of doc.pages) {
    const where = page.slug === "" ? "/" : `/${page.slug}`;
    // A featured product's own price is fine ("Kenya AA, $7"); anything else needs a look.
    const prices = new Set((JSON.stringify(page.sections.filter((s) => !/product/i.test(s.type))).match(/\$\d{1,3}(?:,\d{3})+(?:\.\d\d)?|\$\d+(?:\.\d\d)?/g) ?? []).filter((m) => !known.has(Number(m.replace(/[$,]/g, "")))));
    if (prices.size) out.push({ page: where, check: "price-claim", detail: `copy quotes ${[...prices].slice(0, 4).join(", ")}; check each is a real product's price, not a bulk or wholesale outlier` });
    // A stat's number and label render apart, so the page text check can't pair them.
    for (const s of page.sections) {
      if (s.type !== "stats") continue;
      for (const it of s.items) {
        const n = Number(it.value.replace(/[^\d]/g, ""));
        if (total > 100 && n > 100 && isTotal(it.label, names) && Math.abs(n - total) / total > 0.1)
          out.push({ page: where, check: "count-mismatch", detail: `stat says "${it.value} ${it.label}", the shop lists ${total.toLocaleString("en-US")}` });
      }
    }
  }
  const photos = doc.products.filter((p) => p.image).length;
  if (doc.products.length && photos / doc.products.length < 0.75) out.push({ page: "site", check: "photos", detail: `${photos} of ${doc.products.length} featured products have photos` });
  return out;
}

/** A stat counting the whole catalog ("1,614 products across…"), not one category ("532 coffee products"). */
function isTotal(label: string, categoryNames: string[]): boolean {
  const l = label.toLowerCase();
  if (!/\b(products?|items?)\b/.test(l)) return false;
  return /\b(across|total|all|in (?:the|our) (?:shop|store))\b/.test(l) || !categoryNames.some((n) => n.length > 2 && l.includes(n));
}

const RANGE = /\$\s?\d[\d,.]*\s*(?:to|-|–|—)\s*\$\s?\d/i;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Category names with their shop counts (the larger when two share a name), longest first. */
function categoryCounts(categories: { name: string; count?: number; parent?: string | null }[]): [string, number][] {
  const best = new Map<string, number>();
  for (const c of categories) {
    const n = c.name.toLowerCase().replace(/s$/, "");
    if (n.length > 2 && (c.count ?? 0) > (best.get(n) ?? 0)) best.set(n, c.count ?? 0);
  }
  return [...best].sort((a, b) => b[0].length - a[0].length);
}

/**
 * Sets a category's count in the copy to what the shop lists ("532 coffees" →
 * "196 coffees" when the Coffee category holds 196): the writer only had the
 * audit's estimate.
 */
export function syncCategoryCounts(pages: SitePage[], categories: { name: string; count?: number; parent?: string | null }[]): SitePage[] {
  let json = JSON.stringify(pages);
  for (const [name, count] of categoryCounts(categories)) {
    if (count < 1) continue;
    const re = new RegExp(`(?<![\\w$.,])(\\d{1,3}(?:,\\d{3})+|\\d+)(\\+?)((?:-product)?\\s+${esc(name)}(?:s|es)?\\b)`, "gi");
    json = json.replace(re, (all, num: string, plus: string, rest: string) => {
      const n = Number(num.replace(/,/g, ""));
      return n > 10 && Math.abs(n - count) / count > 0.1 ? `${count.toLocaleString("en-US")}${rest}` : all;
    });
    // A stat counting one category: "532" / "coffee products".
    json = json.replace(new RegExp(`\\{"label":"([^"]*\\b${esc(name)}(?:s|es)?\\b[^"]*)","value":"(\\d{1,3}(?:,\\d{3})+|\\d+)\\+?"\\}`, "gi"), (all, label: string, value: string) => {
      const n = Number(value.replace(/,/g, ""));
      return /\b(across|total|all)\b/i.test(label) || n <= 10 || Math.abs(n - count) / count <= 0.1 ? all : `{"label":"${label}","value":"${count.toLocaleString("en-US")}"}`;
    });
  }
  return JSON.parse(json) as SitePage[];
}

/** Takes price ranges out of what the writer is given, so they never reach the copy. */
export function scrubRanges(text: string): string {
  return text.replace(new RegExp(`(?:from |spans? |ranging from |priced )?${RANGE.source}[\\d,.]*`, "gi"), "across a wide price range");
}

/** Drops stats that are price ranges ("$3 to $5,738"): a range's top is often a bulk or wholesale item. */
export function dropRangeStats(pages: SitePage[]): SitePage[] {
  return pages.map((p) => ({
    ...p,
    sections: p.sections
      .map((s) => (s.type === "stats" ? { ...s, items: s.items.filter((i) => !RANGE.test(i.value) && !/price range|top price|priced (?:up )?to/i.test(i.label)) } : s))
      .filter((s) => s.type !== "stats" || s.items.length > 0),
  }));
}

/**
 * Rewrites a catalog size in the copy when the import found a different
 * number than the build was told ("9,455 parts" → "20,000 parts").
 */
export function syncCount<T>(value: T, oldCount: number | undefined, newCount: number): T {
  if (!oldCount || oldCount < 100 || Math.abs(newCount - oldCount) / oldCount <= 0.1) return value;
  // Only a count in prose ("9,455 parts"), never digits inside a URL or a longer number.
  const from = new RegExp(`(?<![\\w/.,-])${oldCount.toLocaleString("en-US").replace(/,/g, ",?")}(?=\\+?(?:\\s|"))`, "g");
  return JSON.parse(JSON.stringify(value).replace(from, newCount.toLocaleString("en-US"))) as T;
}
