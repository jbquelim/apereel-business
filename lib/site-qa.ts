import type { SiteDoc } from "./site-types";

// Quality checks on a generated site's rendered pages, run before John sees
// it. Content only (no browser): internal wording leaking into customer copy,
// numbers that contradict the catalog, placeholders, missing photos, weak
// accent contrast, broken meta. Layout at phone width is checked by
// tools/site-qa.mts in a real browser when a template changes.

/** "fix": wrong on the page; "note": worth knowing (missing logo), not an error. */
export type QaIssue = { page: string; check: string; detail: string; level?: "fix" | "note" };

/** Words from our analysis that must never reach a shopper. */
const INTERNAL = /\b(average price|highest[- ]value|revenue|margins?|our analysis|the analysis|growth plan|priorit(?:y|ies|ised|ized)|competitors?|lever|SEO|conversion rate|search volume|crawl(?:er|ed)?|apereel)\b/i;
const PLACEHOLDER = /\b(lorem ipsum|TODO|TBD|undefined|null|NaN|\[object Object\])\b|\{\{|\}\}|\.\.\.\s*$/;
const COUNT = /\b(\d{1,3}(?:,\d{3})+|\d{3,})\+?\s+(?:products|parts|items|pieces|SKUs|lamp and chandelier parts|[a-z]+ parts)\b/gi;

/** Visible text of an HTML page (no scripts, styles, tags or the preview bar). */
export function visibleText(html: string): string {
  return html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<div class="note">[\s\S]*?<\/div>/gi, " ")
    .replace(/<div[^>]*>\s*Preview[^<]{0,60}built by Apereel\s*<\/div>/gi, " ")
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

  const internal = text.match(new RegExp(INTERNAL.source, "gi"));
  if (internal) {
    for (const w of [...new Set(internal.map((x) => x.toLowerCase()))]) {
      const at = text.toLowerCase().indexOf(w);
      add("internal-wording", `"${text.slice(Math.max(0, at - 50), at + w.length + 40).trim()}"`);
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
  if (!doc.brand.logo) out.push({ page: "site", check: "logo", detail: "no logo found; the business name is shown as text", level: "note" });
  const photos = doc.products.filter((p) => p.image).length;
  if (doc.products.length && photos / doc.products.length < 0.75) out.push({ page: "site", check: "photos", detail: `${photos} of ${doc.products.length} featured products have photos` });
  return out;
}

/**
 * Rewrites a catalog size in the copy when the import found a different
 * number than the build was told ("9,455 parts" → "20,000 parts").
 */
export function syncCount<T>(value: T, oldCount: number | undefined, newCount: number): T {
  if (!oldCount || oldCount < 100 || Math.abs(newCount - oldCount) / oldCount <= 0.1) return value;
  // Only a count in prose ("9,455 parts"), never digits inside a URL or a longer number.
  const from = new RegExp(`(?<![\\w/.,-])${oldCount.toLocaleString("en-US").replace(/,/g, ",?")}(?=\\+?\\s)`, "g");
  return JSON.parse(JSON.stringify(value).replace(from, newCount.toLocaleString("en-US"))) as T;
}
