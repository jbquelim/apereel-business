// DataForSEO: real Google rankings and search volumes. Optional — active only
// when DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are set, and used only in the
// paid Growth Plan (about $0.18 per report: ranked keywords for the client and
// three competitors, plus one search-volume request). Every call fails soft.
//
// NOTE: written against the public docs; verify on the first real run.

export type RankedKeyword = { keyword: string; volume: number | null; position: number | null; url: string | null };
export type Rankings = { domain: string; name: string; keywords: RankedKeyword[] };

// Google Ads geo-target codes.
const LOCATION: Record<string, number> = {
  "united states": 2840, usa: 2840, canada: 2124, "united kingdom": 2826, uk: 2826,
  australia: 2036, "new zealand": 2554, ireland: 2372,
};

export const dataForSeoConfigured = () => !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);

function location(country: string | null): number {
  return (country && LOCATION[country.toLowerCase()]) || 2840;
}

async function post<T>(path: string, task: Record<string, unknown>): Promise<T | null> {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  try {
    const res = await fetch(`https://api.dataforseo.com/v3/${path}`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify([task]),
      signal: AbortSignal.timeout(45_000),
    });
    const json = (await res.json()) as { status_code?: number; status_message?: string; tasks?: { status_code?: number; status_message?: string; result?: T[] }[] };
    const t = json.tasks?.[0];
    if (!res.ok || !t || (t.status_code && t.status_code >= 40000)) {
      console.error("DataForSEO", path, res.status, t?.status_code, t?.status_message ?? json.status_message);
      return null;
    }
    return t.result?.[0] ?? null;
  } catch (err) {
    console.error("DataForSEO", path, err instanceof Error ? err.message : err);
    return null;
  }
}

type RankedItem = {
  keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number | null } };
  ranked_serp_element?: { serp_item?: { rank_group?: number; rank_absolute?: number; url?: string } };
};

/** A domain's organic Google rankings, highest-volume first. */
export async function rankedKeywords(domain: string, name: string, country: string | null, limit = 100): Promise<Rankings | null> {
  if (!dataForSeoConfigured()) return null;
  const target = domain.replace(/^www\./, "");
  const task = {
    target,
    location_code: location(country),
    language_code: "en",
    limit,
    order_by: ["keyword_data.keyword_info.search_volume,desc"],
  };
  const result =
    (await post<{ items?: RankedItem[] }>("dataforseo_labs/google/ranked_keywords/live", task)) ??
    (await post<{ items?: RankedItem[] }>("dataforseo_labs/ranked_keywords/live", task));
  if (!result?.items) return null;
  const keywords = result.items
    .map((i) => ({
      keyword: i.keyword_data?.keyword ?? "",
      volume: i.keyword_data?.keyword_info?.search_volume ?? null,
      position: i.ranked_serp_element?.serp_item?.rank_group ?? i.ranked_serp_element?.serp_item?.rank_absolute ?? null,
      url: i.ranked_serp_element?.serp_item?.url ?? null,
    }))
    .filter((k) => k.keyword);
  return { domain: target, name, keywords };
}

/** Monthly Google search volume for up to 1,000 phrases (one request). */
export async function searchVolumes(phrases: string[], country: string | null): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!dataForSeoConfigured() || phrases.length === 0) return out;
  const clean = [...new Set(phrases.map((p) => p.toLowerCase().trim()).filter((p) => p.length <= 80 && p.split(" ").length <= 10))].slice(0, 1000);
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  try {
    const res = await fetch("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify([{ keywords: clean, location_code: location(country), language_code: "en" }]),
      signal: AbortSignal.timeout(60_000),
    });
    const json = (await res.json()) as { tasks?: { status_code?: number; status_message?: string; result?: { keyword?: string; search_volume?: number | null }[] }[] };
    const t = json.tasks?.[0];
    if (!res.ok || !t?.result) {
      console.error("DataForSEO search_volume", res.status, t?.status_code, t?.status_message);
      return out;
    }
    for (const r of t.result) if (r.keyword && typeof r.search_volume === "number") out.set(r.keyword.toLowerCase(), r.search_volume);
  } catch (err) {
    console.error("DataForSEO search_volume", err instanceof Error ? err.message : err);
  }
  return out;
}

/**
 * Searches competitors rank for (top 20) that the client doesn't rank for at
 * all, highest volume first — the clearest "what you're missing" list.
 */
export function rankingGaps(client: Rankings, competitors: Rankings[], max = 15) {
  const mine = new Set(client.keywords.map((k) => k.keyword.toLowerCase()));
  const gaps = new Map<string, { keyword: string; volume: number | null; competitors: { name: string; position: number | null }[] }>();
  for (const c of competitors) {
    for (const k of c.keywords) {
      const key = k.keyword.toLowerCase();
      if (mine.has(key) || k.position == null || k.position > 20) continue;
      const g = gaps.get(key) ?? { keyword: k.keyword, volume: k.volume, competitors: [] };
      g.competitors.push({ name: c.name, position: k.position });
      gaps.set(key, g);
    }
  }
  return [...gaps.values()].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, max);
}
