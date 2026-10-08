import { callClaude, parseJson } from "./ai";
import { politeFetch } from "./polite-fetch";
import { BROWSER_UA, isBlockedPage } from "./site-fetch";
import { crawlList } from "./site-crawl";
import type { SiteProduct } from "./site-types";

// A business without an online catalog (a plumber, a law firm, a clinic)
// gets a services site: its services are read from its own website (the
// links in its navigation and their pages), chosen by AI from what's there,
// never invented. They're carried as the site's products, so every template
// shows them; lib/site-render words and links them as services.

/** Links that are never a service: housekeeping, content, accounts. */
const NOT_SERVICE = /\/(?:blog|news|posts?|articles?|careers?|jobs?|privacy|terms|legal|cookie|login|account|cart|checkout|search|sitemap|reviews?|testimonials?|coupons?|specials?|offers?|financing|faq|contact|about|team|our-story|press|media|wp-|feed|tag|category|author)/i;

async function homepage(domain: string): Promise<{ html: string; base: string } | null> {
  for (const base of [`https://${domain}/`, `https://www.${domain.replace(/^www\./, "")}/`]) {
    for (const ua of [BROWSER_UA, "Mozilla/5.0"]) {
      const res = await politeFetch(base, { headers: { "User-Agent": ua, Accept: "text/html" }, timeoutMs: 15_000 });
      if (!res?.ok) continue;
      const html = await res.text();
      if (!isBlockedPage(html)) return { html, base: res.url || base };
    }
  }
  return null;
}

/** The site's own internal links with their text: the navigation first, as it appears. */
export function siteLinks(html: string, base: string): { path: string; text: string }[] {
  const host = new URL(base).hostname.replace(/^www\./, "");
  const seen = new Map<string, string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL;
    try {
      url = new URL(m[1], base);
    } catch {
      continue;
    }
    if (url.hostname.replace(/^www\./, "") !== host) continue;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (!text || text.length > 80 || path === "/" || NOT_SERVICE.test(path)) continue;
    if (!seen.has(path)) seen.set(path, text);
  }
  return [...seen].map(([path, text]) => ({ path, text }));
}

/** A page's content photos, in order: not logos, icons, badges or blog banners, and not small. */
export function pagePhotos(html: string, base: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = tag.match(/\s(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i)?.[1];
    if (!src || /^data:|\.svg(?:\?|$)|logo|icon|sprite|badge|seal|avatar|blog|teaser|banner|award|rating|flag|payment/i.test(`${src} ${tag.match(/class=["']([^"']*)/i)?.[1] ?? ""}`)) continue;
    const width = Number(tag.match(/\swidth=["']?(\d+)/i)?.[1] ?? 0);
    if (width && width < 400) continue;
    try {
      out.push(new URL(src, base).toString());
    } catch {
      /* skip */
    }
  }
  return out;
}

/** One photo per page: its first content photo that no other page uses (shared images are site furniture). */
export function pickPhotos(pages: string[][]): (string | null)[] {
  const uses = new Map<string, number>();
  for (const list of pages) for (const u of new Set(list)) uses.set(u, (uses.get(u) ?? 0) + 1);
  return pages.map((list) => list.find((u) => uses.get(u) === 1) ?? null);
}

async function pageHtml(url: string): Promise<string> {
  for (const ua of [BROWSER_UA, "Mozilla/5.0"]) {
    const res = await politeFetch(url, { headers: { "User-Agent": ua, Accept: "text/html" }, timeoutMs: 15_000 });
    if (res?.ok) return res.text();
  }
  return "";
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "service";

/**
 * The services a business offers, from its own site (about $0.01). Empty when
 * the site can't be read or shows none.
 */
export async function readServices(domain: string, clientId: string, offering: string): Promise<SiteProduct[]> {
  const home = await homepage(domain);
  if (!home) return [];
  const links = siteLinks(home.html, home.base).slice(0, 120);
  if (links.length < 2) return [];
  const homeImage = home.html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? null;

  const text = await callClaude({
    clientId,
    purpose: "site:services",
    maxTokens: 2500,
    prompt: `These are the links on ${domain}'s homepage${offering ? ` (a business offering: ${offering})` : ""}. Pick the pages that are the business's SERVICES: what a customer hires or books them for.

LINKS (path | link text):
${links.map((l) => `${l.path} | ${l.text}`).join("\n")}

Rules:
- Only services this business itself provides; never locations, areas, blog posts, offers, company pages or products for sale
- One entry per distinct service (if a service has several pages, the most general one)
- 3 to 12 services, the most important first
- "name": the service in plain words, 1 to 4 words, title case
- "summary": one sentence a customer would read, only what the link text and path say; no claims, prices or promises

Return ONLY JSON: [{ "path": "/exact/path/from/the/list", "name": "...", "summary": "..." }]`,
  });
  const picked = (parseJson<{ path?: string; name?: string; summary?: string }[]>(text) ?? []).filter(
    (s): s is { path: string; name: string; summary: string } => !!s.path && !!s.name && links.some((l) => l.path === s.path),
  );
  if (!picked.length) return [];

  // Each service's own page: its description and its own photo (the share image is usually the logo).
  const list = picked.slice(0, 12);
  const urls = list.map((s) => new URL(s.path, home.base).toString());
  const [pages, htmls] = await Promise.all([
    crawlList(urls.map((url) => ({ url, kind: "category" as const })), Date.now() + 60_000),
    Promise.all(urls.map((u) => pageHtml(u).catch(() => ""))),
  ]);
  const photos = pickPhotos(htmls.map((h, i) => pagePhotos(h, urls[i])));
  const used = new Set<string>();
  return list.map((s, i) => {
    const page = pages.find((p) => new URL(p.url).pathname.replace(/\/+$/, "") === s.path);
    let slug = slugify(s.name);
    while (used.has(slug)) slug = `${slug}-${i}`;
    used.add(slug);
    const og = page?.image && page.image !== homeImage && !/\.svg(?:\?|$)|logo/i.test(page.image) ? page.image : null;
    const image = photos[i] ?? og;
    return {
      slug,
      title: s.name.slice(0, 80),
      price: null,
      currency: null,
      image: image ? new URL(image, urls[i]).toString() : null,
      description: (s.summary || page?.metaDescription || `${s.name}.`).slice(0, 600),
      category: null,
      sourceUrl: new URL(s.path, home.base).toString(),
      featured: true,
    };
  });
}
