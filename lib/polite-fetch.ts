import { neon } from "@neondatabase/serverless";

// Every request our crawlers make to a business's site goes through here, so
// we read sites the way they ask to be read:
//  - at most two requests at a time per site, spaced out, slower after a warning;
//  - "too many requests" (429) and "busy" (503) are waited out (Retry-After), then retried;
//  - our contact is on every request (From), so a site owner can reach us;
//  - a client who let our crawler through their firewall gets their private
//    token on every request to their site (X-Apereel-Verify; lib/crawl-access).
// It never disguises who we are or works around a block: a site that still
// refuses is left alone, and the build is held for John with the reason.

type Host = { active: number; last: number; gap: number };
const hosts = new Map<string, Host>();
const MAX_PER_HOST = 2;
const BASE_GAP_MS = 250;
const MAX_GAP_MS = 4000;
const CONTACT = "crawler@apereel.com";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const bare = (host: string) => host.replace(/^www\./, "").toLowerCase();

let tokens: { at: number; map: Map<string, string> } | null = null;

/** The crawler token a client gave their firewall, for this host (cached five minutes). */
async function tokenFor(host: string): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;
  if (!tokens || Date.now() - tokens.at > 300_000) {
    const rows = (await neon(process.env.DATABASE_URL)`SELECT domain, crawl_token FROM clients WHERE crawl_token IS NOT NULL`.catch(() => [])) as { domain: string; crawl_token: string }[];
    tokens = { at: Date.now(), map: new Map(rows.map((r) => [bare(r.domain), r.crawl_token])) };
  }
  const h = bare(host);
  for (const [domain, token] of tokens.map) if (h === domain || h.endsWith(`.${domain}`)) return token;
  return null;
}

async function turn(host: string): Promise<Host> {
  const s = hosts.get(host) ?? { active: 0, last: 0, gap: BASE_GAP_MS };
  hosts.set(host, s);
  while (s.active >= MAX_PER_HOST || Date.now() - s.last < s.gap) await sleep(Math.max(50, s.gap - (Date.now() - s.last)));
  s.active++;
  s.last = Date.now();
  return s;
}

/** Seconds (or an HTTP date) from Retry-After, as milliseconds, capped. */
function retryAfter(res: Response, fallback: number): number {
  const v = res.headers.get("retry-after");
  if (!v) return fallback;
  const n = Number(v);
  const ms = Number.isFinite(n) ? n * 1000 : new Date(v).getTime() - Date.now();
  return Math.min(Math.max(ms, 500), 20_000);
}

/**
 * fetch(), politely. Returns the response (any status) or null when the site
 * couldn't be reached. Throttling is waited out and retried twice.
 */
export async function politeFetch(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response | null> {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  const token = await tokenFor(host);
  const headers = { From: CONTACT, ...(token ? { "X-Apereel-Verify": token } : {}), ...((init.headers as Record<string, string>) ?? {}) };
  for (let attempt = 0; attempt < 3; attempt++) {
    const s = await turn(host);
    let res: Response | null = null;
    try {
      res = await fetch(url, { redirect: "follow", ...init, headers, signal: AbortSignal.timeout(init.timeoutMs ?? 15_000) });
    } catch {
      res = null;
    } finally {
      s.active--;
    }
    if (!res || (res.status !== 429 && res.status !== 503)) {
      if (res?.ok) s.gap = Math.max(BASE_GAP_MS, s.gap * 0.9);
      return res;
    }
    // Asked to slow down: this site gets a longer gap from now on, and we wait as long as it says.
    s.gap = Math.min(MAX_GAP_MS, s.gap * 2);
    await res.body?.cancel().catch(() => null);
    await sleep(retryAfter(res, 1500 * (attempt + 1)));
  }
  return null;
}
