import { fetchSitemapCatalog } from "./site-fetch";

// Real buyer searches (Google autocomplete) around what a business sells, and
// whether the site has a page aimed at each one (from its own sitemap).
// Autocomplete shows what people actually type; it carries no volumes, and we
// never invent any.

export type DemandRow = {
  query: string;
  seed: string;
  /** category = a category page targets it; products = only product pages; none = no page found; null = not checked */
  coverage: "category" | "products" | "none" | null;
  matchUrl?: string;
};

export type BuyerDemand = { country: string | null; rows: DemandRow[]; coverageChecked: boolean };

const GL: Record<string, string> = {
  canada: "ca", "united states": "us", usa: "us", "united kingdom": "uk", uk: "uk",
  australia: "au", "new zealand": "nz", ireland: "ie",
};

// Searches aimed at another retailer or marketplace tell us nothing about this site.
const RETAILER_RE =
  /\b(amazon|home depot|canadian tire|walmart|ikea|lowe'?s|costco|ebay|etsy|wayfair|best buy|target|temu|shein|aliexpress|rona|princess auto|kmart|argos|b&q)\b/i;
// Words that locate or qualify a search but don't need their own page —
// "lamp parts supplier" is served by a lamp-parts page.
const NON_TOPIC = new Set([
  "near", "me", "canada", "usa", "uk", "online", "best", "cheap", "sale", "buy", "store", "shop",
  "for", "the", "and", "with", "women", "men", "kids", "toronto", "ontario", "montreal", "vancouver",
  "supplier", "supply", "supplie", "manufacturer", "maker", "distributor", "company", "companie",
  "wholesale", "wholesaler", "factory", "custom",
]);
// Research, jobs and education searches aren't buyers.
const NOT_BUYER_RE =
  /^(what|how|why|who|when|is|are|can|does)\b|\b(examples?|meaning|definition|jobs?|salary|salaries|engineers?|engineering|course|degree|diagram|pdf|wiki|reddit)\b/i;
const COUNTRY_RE = /\b(usa|united states|uk|united kingdom|australia|canada|india|china|germany|mexico)\b/i;

const singular = (t: string) => (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t);
const topicTokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length >= 3)
    .map(singular)
    .filter((t) => !NON_TOPIC.has(t));

async function suggest(q: string, gl: string | null): Promise<string[]> {
  const params = new URLSearchParams({ client: "firefox", hl: "en", q });
  if (gl) params.set("gl", gl);
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?${params}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = JSON.parse(await res.text()) as [string, string[]];
    return Array.isArray(data[1]) ? data[1] : [];
  } catch {
    return [];
  }
}

/** Short, generic seeds: category names and buyer queries without place names. */
export function demandSeeds(categories: string[], buyerQueries: string[], country: string | null): string[] {
  const geo = country ? new RegExp(`\\b${country}\\b`, "i") : null;
  const clean = (s: string) =>
    s
      .replace(geo ?? /$^/, "")
      .replace(/\b(for|in|near|from)\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const seeds = [...categories.slice(0, 4), ...buyerQueries.slice(0, 3)]
    .map(clean)
    // One-word seeds ("hoop", "chain") autocomplete into unrelated searches.
    .filter((s) => s.split(" ").length >= 2 && s.split(" ").length <= 5);
  return [...new Set(seeds)].slice(0, 6);
}

export async function buyerDemand(opts: {
  domain: string;
  seeds: string[];
  country: string | null;
  /** product page URLs already known (e.g. from a live product feed) */
  knownProductUrls?: string[];
}): Promise<BuyerDemand | null> {
  if (opts.seeds.length === 0) return null;
  const gl = opts.country ? GL[opts.country.toLowerCase()] ?? null : null;

  const [lists, catalog] = await Promise.all([
    Promise.all(opts.seeds.map((s) => suggest(s, gl))),
    fetchSitemapCatalog(opts.domain.replace(/^www\./, "")).catch(() => null),
  ]);

  const seen = new Set<string>();
  const rows: DemandRow[] = [];
  lists.forEach((list, i) => {
    for (const q of list.slice(0, 6)) {
      const key = q.toLowerCase().trim();
      if (seen.has(key) || RETAILER_RE.test(key) || NOT_BUYER_RE.test(key) || topicTokens(key).length === 0) continue;
      // A search naming a different country belongs to another market.
      const named = key.match(COUNTRY_RE)?.[0];
      if (named && (!opts.country || !new RegExp(`\\b${opts.country}\\b`, "i").test(named))) continue;
      seen.add(key);
      rows.push({ query: q, seed: opts.seeds[i], coverage: null });
    }
  });
  if (rows.length === 0) return null;

  const categoryUrls = catalog?.categoryUrls ?? [];
  const productUrls = [...(catalog?.productUrls ?? []), ...(opts.knownProductUrls ?? [])];
  const coverageChecked = categoryUrls.length + productUrls.length > 0;
  if (coverageChecked) {
    const slugTokens = (u: string) => {
      try {
        return new Set(topicTokens(decodeURIComponent(new URL(u).pathname).replace(/\//g, " ")));
      } catch {
        return new Set<string>();
      }
    };
    const cats = categoryUrls.map((u) => ({ u, t: slugTokens(u) }));
    const prods = productUrls.map((u) => ({ u, t: slugTokens(u) }));
    for (const row of rows) {
      const need = topicTokens(row.query);
      // Most general matching page (shortest path) represents the topic best.
      const hit = (list: { u: string; t: Set<string> }[]) =>
        list.filter((x) => need.every((w) => x.t.has(w))).sort((a, b) => a.u.length - b.u.length)[0];
      const cat = hit(cats);
      if (cat) {
        row.coverage = "category";
        row.matchUrl = cat.u;
        continue;
      }
      const prod = hit(prods);
      row.coverage = prod ? "products" : "none";
      if (prod) row.matchUrl = prod.u;
    }
  }
  return { country: opts.country, rows: rows.slice(0, 24), coverageChecked };
}
