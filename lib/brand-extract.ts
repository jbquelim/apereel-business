import { BROWSER_UA, isBlockedPage } from "./site-fetch";

// Reads a business's own brand from its current site so the new site looks
// like theirs, not like a template: logo, accent colour, phone, email,
// address, and whether shipping/returns pages exist. All read from their
// HTML and CSS; nothing is guessed. Fails soft (bot-protected sites).

export type Brand = {
  logo: string | null;
  accent: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  shippingUrl: string | null;
  returnsUrl: string | null;
};

async function get(url: string, ms = 10_000): Promise<string | null> {
  for (const ua of [BROWSER_UA, "Mozilla/5.0"]) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": ua }, redirect: "follow", signal: AbortSignal.timeout(ms) });
      if (res.ok) {
        const text = await res.text();
        return isBlockedPage(text) && !url.endsWith(".css") ? null : text;
      }
      if (![401, 403, 406, 429].includes(res.status)) return null;
    } catch {
      return null;
    }
  }
  return null;
}

const abs = (u: string, base: string) => {
  try {
    const clean = u.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/").replace(/([^:])\/\/+/g, "$1/");
    return new URL(clean, base).toString();
  } catch {
    return null;
  }
};

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Saturation and lightness (0-1) of a colour. */
function sl([r, g, b]: [number, number, number]): [number, number] {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  return [s, l];
}

/** WCAG relative luminance, for picking readable text on the accent. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The brand's most-used saturated colour across the homepage and its main stylesheet. */
function accentFrom(css: string): string | null {
  const counts = new Map<string, number>();
  const found: [number, number, number][] = [];
  for (const m of css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    const rgb = hexToRgb(m[0]);
    if (rgb) found.push(rgb);
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/gi)) found.push([+m[1], +m[2], +m[3]]);
  for (const rgb of found) {
    const [s, l] = sl(rgb);
    if (s < 0.25 || l < 0.12 || l > 0.85) continue; // greys, near-black, near-white
    const key = `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top && top[1] >= 2 ? top[0] : null;
}

/** An <img>'s real address: lazy-loading attributes first (src is often a placeholder then). */
function imgSrc(tag: string): string | null {
  for (const attr of ["data-src", "data-lazy-src", "nitro-lazy-src", "lazy-src", "src"]) {
    const v = tag.match(new RegExp(`\\s${attr}=["']([^"']+)["']`, "i"))?.[1];
    if (v && !/^data:/.test(v)) return v;
  }
  return null;
}

/**
 * A logo drawn inline (an <svg> in the header's logo or home link), as a data
 * URL. Only a self-contained drawing with visible colour: no scripts or
 * outside references, and not white-only (it would vanish on a light header).
 */
function inlineSvgLogo(header: string): string | null {
  const link = header.match(/<a\b[^>]*(?:class=["'][^"']*logo[^"']*["']|href=["']\/["'])[^>]*>([\s\S]*?)<\/a>/i)?.[1];
  const svg = link?.match(/<svg\b[\s\S]*?<\/svg>/i)?.[0];
  if (!svg || svg.length > 60_000 || /<script|<foreignObject|(?:xlink:)?href=["']https?:/i.test(svg)) return null;
  const paints = [...svg.matchAll(/(?:fill|stroke)=["']([^"']+)["']/gi)].map((m) => m[1].toLowerCase());
  const visible = paints.filter((c) => !/^(none|transparent|#fff(?:fff)?|white|url\()/.test(c));
  if (!visible.length && !/currentColor/i.test(svg)) return null;
  const withNs = /xmlns=/.test(svg) ? svg : svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return `data:image/svg+xml;base64,${Buffer.from(withNs).toString("base64")}`;
}

function logoFrom(html: string, base: string): string | null {
  // The header first: logos further down are often press or partner logos.
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? "";
  for (const m of header.matchAll(/<img\b[^>]*>/gi)) {
    if (!/logo/i.test(m[0])) continue;
    const src = imgSrc(m[0]);
    if (src) return abs(src, base);
  }
  const drawn = inlineSvgLogo(header);
  if (drawn) return drawn;
  const head = html.slice(0, 60_000);
  for (const m of head.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/logo/i.test(tag)) continue;
    const src = imgSrc(tag);
    if (src) return abs(src, base);
  }
  const ld = html.match(/"logo"\s*:\s*(?:\{[^}]*"url"\s*:\s*)?"([^"]+)"/i)?.[1];
  // Only an image address: "logo":"on" is a theme setting, not a logo.
  return ld && /^(?:https?:)?\/\/|^\/|\.(?:png|jpe?g|svg|webp|gif|avif)(?:\?|$)/i.test(ld) ? abs(ld, base) : null;
}

function addressFrom(html: string): string | null {
  const m = html.match(/"streetAddress"\s*:\s*"([^"]+)"[\s\S]{0,300}?"addressLocality"\s*:\s*"([^"]+)"(?:[\s\S]{0,200}?"addressRegion"\s*:\s*"([^"]+)")?/i);
  return m ? [m[1], m[2], m[3]].filter(Boolean).join(", ") : null;
}

export async function extractBrand(domain: string): Promise<Brand> {
  const empty: Brand = { logo: null, accent: null, phone: null, email: null, address: null, shippingUrl: null, returnsUrl: null };
  let base = `https://${domain}/`;
  let html = await get(base);
  if (!html) {
    base = `https://www.${domain.replace(/^www\./, "")}/`;
    html = await get(base);
  }
  if (!html) return empty;

  // The site's own stylesheet carries its colours (first couple of them).
  const sheets = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
    .map((m) => abs(m[1], base))
    // Their own stylesheets (often on a platform CDN), not third-party widgets.
    .filter((u): u is string => !!u && !/fonts\.googleapis|cdnjs|jsdelivr|unpkg|bootstrap|fontawesome|typekit/i.test(u))
    .slice(0, 3);
  const css = (await Promise.all(sheets.map((u) => get(u, 8000)))).filter(Boolean).join("\n");
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n") + [...html.matchAll(/style=["']([^"']+)["']/gi)].map((m) => m[1]).join(";");
  const themeColor = html.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["'](#[0-9a-f]{3,6})["']/i)?.[1] ?? null;

  const phone = html.match(/href=["']tel:([+\d][\d\s().-]{6,})["']/i)?.[1]?.trim() ?? html.match(/"telephone"\s*:\s*"([^"]+)"/i)?.[1] ?? null;
  const email = html.match(/href=["']mailto:([^"'?]+@[^"'?]+)["']/i)?.[1] ?? null;
  const link = (re: RegExp) => {
    for (const m of html!.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      if (re.test(m[1]) || re.test(m[2].replace(/<[^>]+>/g, ""))) return abs(m[1], base);
    }
    return null;
  };

  const accentCandidate = (themeColor && hexToRgb(themeColor) && sl(hexToRgb(themeColor)!)[0] >= 0.25 ? themeColor : null) ?? accentFrom(`${inline}\n${css}`);
  return {
    logo: logoFrom(html, base),
    accent: accentCandidate,
    phone,
    email: email && !/example|domain|sentry|wixpress/i.test(email) ? email : null,
    address: addressFrom(html),
    shippingUrl: link(/shipping|delivery/i),
    returnsUrl: link(/return|refund/i),
  };
}
