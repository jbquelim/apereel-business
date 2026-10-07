import { INTERNAL, PLACEHOLDER } from "./site-qa";

const RANGE = /\$\s?\d[\d,.]*\s*(?:to|-|–|—)\s*\$\s?\d/i;

// Checks every content and ads item before a client sees it (lib/content-release):
// copy cut off at a platform limit, prices that aren't the product's, catalog
// counts, claims the business's facts don't support, competitor names, hype,
// internal wording, missing parts. Pure: the caller supplies what's known.

export type ItemIssue = { check: string; field: string; detail: string };

export type QaContext = {
  /** Every product the business sells that the item may name, with its price. */
  products: { title: string; url: string | null; price: number | null }[];
  /** Everything known to be true about the business (audit, advantage, analysis), as text. */
  facts: string;
  /** Competitor names and domains: never in client-facing copy. */
  competitors: string[];
  /** Products in the whole catalog, when known. */
  catalogTotal: number | null;
};

export type QaItem = { kind: string; data: Record<string, unknown>; product_url: string | null; image: string | null };

/** Platform limits by field: copy that stops exactly at one was cut off. */
const LIMITS: Record<string, number> = { primaryText: 125, headline: 40, headlines: 30, descriptions: 90, text: 100, sub: 48, badge: 18 };
const HYPE = /\b(revolutionary|game[- ]changing|unparalleled|world[- ]class|best[- ]in[- ]class|cutting[- ]edge|second to none|unbeatable)\b/i;
/** Claims that need the business's facts behind them. */
const CLAIMS: RegExp[] = [
  /\bin stock\b/i,
  /\bfree (?:shipping|delivery|returns?)\b/i,
  /\bguarantee[ds]?\b/i,
  /\baward[- ]winning\b|\bawards?\b/i,
  /\b\d+\+? years?\b/i,
  /\bsince (?:1[6-9]\d\d|20\d\d)\b/i,
  /\b\d+(?:\.\d+)?%/,
  /\b(?:#1|number one|best[- ]selling|bestselling)\b/i,
  /\bships? (?:today|same[- ]day|next[- ]day|within)\b/i,
];

/** Every string in an item with its field path ("meta.primaryText", "google.headlines.2"). */
function strings(v: unknown, path = ""): { path: string; key: string; text: string }[] {
  if (typeof v === "string") return [{ path, key: path.split(".").filter((p) => !/^\d+$/.test(p)).pop() ?? "", text: v }];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${path}.${i}`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => (k === "images" || k === "image" || k === "prompt" || k === "visual" ? [] : strings(x, path ? `${path}.${k}` : k)));
  return [];
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const money = (n: number) => [`$${n}`, `$${n.toFixed(2)}`, `$${n.toLocaleString("en-US")}`, `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`];

export function checkItem(item: QaItem, ctx: QaContext): ItemIssue[] {
  const out: ItemIssue[] = [];
  const add = (check: string, field: string, detail: string) => out.push({ check, field, detail });
  const fields = strings(item.data);
  const all = fields.map((f) => f.text).join(" \n ");
  const facts = ctx.facts.toLowerCase();
  // The product the item is about, and its price.
  const product = ctx.products.find((p) => p.url && p.url === item.product_url) ?? ctx.products.find((p) => all.includes(p.title));
  const allowed = new Set(ctx.products.filter((p) => p.price != null && all.includes(p.title)).concat(product ? [product] : []).flatMap((p) => (p.price != null ? money(p.price) : [])));

  for (const f of fields) {
    const t = f.text.trim();
    const limit = LIMITS[f.key];
    // Over the platform's limit (copy is now shortened at a word boundary, lib/content-qa fit()).
    if (limit && t.length > limit) add("too-long", f.path, `${t.length} characters (limit ${limit})`);
    // Ends on a dangling joiner: shortened mid-thought.
    if (limit && /\b(?:and|or|the|a|an|of|to|for|with|by|in|on)$/i.test(t)) add("cut-off", f.path, `"…${t.slice(-40)}" ends mid-thought`);
    if (PLACEHOLDER.test(t)) add("placeholder", f.path, `"${t.slice(0, 80)}"`);
  }
  if (item.kind !== "note") {
    const internal = all.match(new RegExp(INTERNAL.source, "i"));
    if (internal) add("internal-wording", "", `"${internal[0]}"`);
    for (const c of ctx.competitors) {
      if (c.length > 3 && all.toLowerCase().includes(c.toLowerCase())) add("competitor", "", `names a competitor: ${c}`);
    }
  }
  const hype = all.match(HYPE);
  if (hype) add("hype", "", `"${hype[0]}"`);

  if (RANGE.test(all)) add("price-range", "", `"${all.match(RANGE)![0]}…": a range's extreme is often a bulk or wholesale item`);
  // Prices: a real price of the item's product, or of another product the business sells, written as prices are.
  const anyPrice = new Set(ctx.products.flatMap((p) => (p.price != null ? money(p.price) : [])));
  for (const m of all.matchAll(/\$\d[\d,]*(?:\.\d+)?/g)) {
    if (!allowed.has(m[0]) && !allowed.has(m[0].replace(/,/g, "")) && (anyPrice.has(m[0]) || anyPrice.has(m[0].replace(/,/g, "")))) continue;
    if (!allowed.has(m[0]) && !allowed.has(m[0].replace(/,/g, ""))) add("price", "", `${m[0]} isn't the price of a product in this item`);
    else if (/\.\d$/.test(m[0])) add("price-format", "", `${m[0]} should read ${m[0]}0`);
  }
  // Catalog counts.
  for (const m of all.matchAll(/\b(\d{1,3}(?:,\d{3})+|\d{3,})\+?\s+(?:products|parts|items|SKUs)\b/gi)) {
    const n = Number(m[1].replace(/,/g, ""));
    if (ctx.catalogTotal == null) add("count", "", `"${m[0]}" can't be checked against the store`);
    else if (Math.abs(n - ctx.catalogTotal) / ctx.catalogTotal > 0.1) add("count", "", `"${m[0]}", the store has ${ctx.catalogTotal.toLocaleString("en-US")}`);
  }
  // Claims the facts don't contain.
  for (const re of CLAIMS) {
    for (const m of all.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`))) {
      const phrase = m[0].toLowerCase();
      if (facts.includes(phrase)) continue;
      // "75 years" needs "75 years" (or "75+ years") in the facts; "since 1913" needs 1913; "40%" needs 40%.
      const number = phrase.match(/\d[\d.]*/)?.[0];
      if (number && /years?/.test(phrase) && new RegExp(`\\b${number}\\+?\\s*years?`).test(facts)) continue;
      if (number && /since/.test(phrase) && facts.includes(number)) continue;
      add("claim", "", `"${m[0]}" isn't in the business's facts`);
    }
  }

  // What each kind must have.
  const d = item.data as Record<string, unknown>;
  const need = (field: string, v: unknown) => (typeof v === "string" ? v.trim() : v) || add("missing", field, `no ${field}`);
  if (item.kind === "post") {
    need("hook", d.hook);
    need("caption", d.caption);
    if (!item.image) add("missing", "image", "no product photo");
  }
  if (item.kind === "ad") {
    need("meta.primaryText", (d.meta as Record<string, unknown> | undefined)?.primaryText);
    need("overlay.headline", (d.overlay as Record<string, unknown> | undefined)?.headline);
    if (!item.image) add("missing", "image", "no product photo");
  }
  if (item.kind === "guide" && words(String(d.body ?? "")) < 450) add("short", "body", `${words(String(d.body ?? ""))} words (a guide needs 450+)`);
  if (item.kind === "newsletter") {
    need("subject", d.subject);
    const n = words(String(d.body ?? ""));
    if (n < 150) add("short", "body", `${n} words (a newsletter needs 150+)`);
  }
  return out;
}

/** Fixes that need no judgement: prices written to the cent ("$3.5" → "$3.50"). */
export function fixItem<T>(data: T): T {
  return JSON.parse(JSON.stringify(data).replace(/(\$\d[\d,]*\.\d)(?!\d)/g, "$10")) as T;
}

/** Shortens text to fit a limit at a word boundary, ending cleanly (never mid-word). */
export function fit(v: unknown, n: number): string {
  if (typeof v !== "string") return "";
  const t = v.trim().replace(/\s+/g, " ");
  if (t.length <= n) return t;
  const head = t.slice(0, n + 1);
  // The last full sentence or clause that fits, else the last whole word.
  const sentence = head.match(/^[\s\S]*[.!?](?=\s|$)/)?.[0];
  if (sentence && sentence.length >= n * 0.5) return sentence.trim();
  const clause = head.match(/^[\s\S]*[,;:—–](?=\s)/)?.[0];
  if (clause && clause.length >= n * 0.6) return clause.replace(/[,;:—–]$/, "").trim();
  return head.replace(/\s+\S*$/, "").replace(/[,;:—–-]$/, "").trim();
}
