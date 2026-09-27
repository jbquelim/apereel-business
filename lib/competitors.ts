import { isBlockedDomain } from "./taxonomy";

// Competitor selection helpers for the audit. The AI proposes and refines
// competitors; these deterministic checks decide which ones may be shown.

export type CompetitorCandidate = { name: string; domain: string; strength: string };

/** "https://www.Example.com/path" → "example.com"; null if it isn't a hostname. */
export function cleanDomain(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.trim().toLowerCase();
  d = d.replace(/^[a-z]+:\/\//, "").replace(/^www\./, "");
  d = d.split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return null;
  return d;
}

/**
 * Search queries used to find alternatives. Prefer the model's buyer-style
 * queries (built from what the business actually makes); fall back to the
 * taxonomy label, worded for how this kind of business is found.
 */
export function competitorQueries(opts: {
  suggested: unknown;
  subIndustry: string;
  businessModel: string | null;
  country: string | null;
}): string[] {
  const suggested = Array.isArray(opts.suggested)
    ? opts.suggested
        .filter((q): q is string => typeof q === "string")
        .map((q) => q.trim())
        .filter((q) => q.length >= 6 && q.length <= 120)
    : [];
  if (suggested.length > 0) return suggested.slice(0, 3);

  const geo = opts.country ?? "";
  const noun = opts.businessModel === "b2b" ? "manufacturers suppliers" : "stores";
  return [`best ${opts.subIndustry} ${noun} ${geo}`.trim(), `top ${opts.subIndustry} ${geo}`.trim()];
}

/**
 * De-duplicate, drop the client itself and blocked giants, and keep only
 * well-formed domains. Order is preserved (the first mention wins).
 */
export function screenCompetitors(
  candidates: CompetitorCandidate[],
  clientDomain: string,
): CompetitorCandidate[] {
  const client = cleanDomain(clientDomain);
  const clientStem = client?.split(".")[0];
  const seen = new Set<string>();
  const out: CompetitorCandidate[] = [];
  for (const c of candidates) {
    const domain = cleanDomain(c?.domain);
    if (!domain || !c.name?.trim()) continue;
    if (domain === client || domain.split(".")[0] === clientStem) continue;
    if (isBlockedDomain(domain) || seen.has(domain)) continue;
    seen.add(domain);
    out.push({ name: c.name.trim(), domain, strength: (c.strength ?? "").trim() });
  }
  return out;
}

/** True if the domain answers over HTTP(S) at all — drops invented domains. */
export async function domainResolves(domain: string, timeoutMs = 6000): Promise<boolean> {
  for (const proto of ["https", "http"]) {
    try {
      const res = await fetch(`${proto}://${domain}/`, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "Mozilla/5.0 (compatible; ApereelAudit/1.0)" },
      });
      // Any HTTP answer (even 403 from bot protection) proves the site exists.
      res.body?.cancel().catch(() => {});
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Final list: refined picks first, topped up from the original picks, each
 * verified to exist. Returns at most `limit`.
 */
export async function finalizeCompetitors(
  refined: CompetitorCandidate[],
  original: CompetitorCandidate[],
  clientDomain: string,
  limit = 5,
): Promise<CompetitorCandidate[]> {
  const pool = screenCompetitors([...refined, ...original], clientDomain).slice(0, limit + 4);
  const alive = await Promise.all(pool.map((c) => domainResolves(c.domain)));
  return pool.filter((_, i) => alive[i]).slice(0, limit);
}

/**
 * Exa company search (optional — active only when EXA_API_KEY is set, e.g.
 * via the Vercel Marketplace integration). One request per uncached audit:
 * businesses that sell what the client sells, as a plain-text block for the
 * refinement step. Returns null on any failure so the audit never depends on it.
 */
export async function fetchExaCompanies(opts: {
  offering: string;
  country: string | null;
  clientDomain: string;
}): Promise<string | null> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey || !opts.offering) return null;
  const client = cleanDomain(opts.clientDomain);
  const query = `Companies that sell ${opts.offering}${opts.country ? ` in ${opts.country}` : ""}`;
  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: { "x-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        query,
        type: "auto",
        category: "company",
        numResults: 10,
        ...(client ? { excludeDomains: [client, `www.${client}`] } : {}),
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      console.error("Exa search failed:", res.status);
      return null;
    }
    const data = (await res.json()) as { results?: { url?: string; title?: string }[] };
    const lines = (data.results ?? [])
      .map((r) => {
        const domain = cleanDomain(r.url);
        if (!domain || domain === client || isBlockedDomain(domain)) return null;
        return `- ${(r.title ?? "").trim() || domain} (${domain})`;
      })
      .filter(Boolean);
    if (lines.length === 0) return null;
    return `Company search (Exa) for "${query}":\n${lines.join("\n")}`;
  } catch (err) {
    console.error("Exa search error:", err);
    return null;
  }
}
