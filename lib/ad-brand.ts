import { neon } from "@neondatabase/serverless";
import sharp from "sharp";
import { extractBrand } from "./brand-extract";
import type { SiteDoc } from "./site-types";
import { TEMPLATE_FONTS } from "./templates/fonts";

/** Apereel brands are set in sans: a serif family is swapped for a sans one. */
const sans = (family: string | undefined) => (!family || /serif|playfair|garamond|lora|merriweather|baskerville|cormorant|fraunces|bodoni|caslon/i.test(family) ? "Plus Jakarta Sans" : family);

// A business's brand kit for its ad and post images (lib/ad-designs): its
// name, logo, colours and fonts, from the website we built for it when there
// is one, else read from its own site. Plus its product photos made ready to
// draw (any format to PNG, sized, and whether it's a cut-out on white or a scene).

export type BrandKit = {
  name: string;
  /** A data URL the renderer can draw, or null (the name is set in type instead). */
  logo: string | null;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  /** Text on the accent colour. */
  onAccent: string;
  heading: string;
  body: string;
  radius: number;
  upper: boolean;
};

export type AdPhoto = {
  src: string;
  width: number;
  height: number;
  /** A product shot on white: can sit on a coloured card. */
  cutout: boolean;
  /** A product shot on any one plain backdrop (white, grey, a sweep): nothing else in frame. */
  plain: boolean;
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const titleCase = (s: string) => s.replace(/[-_.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Black or white, whichever reads on a colour. */
export function onColor(hex: string): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#141414" : "#ffffff";
}

/** Any image (WebP, SVG, PNG, JPEG) as a PNG data URL the renderer can draw, at most `max` px wide. */
export async function drawable(url: string | null, max = 1400): Promise<AdPhoto | null> {
  if (!url) return null;
  try {
    let buf: Buffer;
    if (url.startsWith("data:")) buf = Buffer.from(url.split(",")[1] ?? "", url.includes(";base64") ? "base64" : "utf8");
    else {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) return null;
      buf = Buffer.from(await res.arrayBuffer());
    }
    if (buf.length > 12_000_000) return null;
    const img = sharp(buf, { density: 300 }).rotate();
    const meta = await img.metadata();
    if (!meta.width || !meta.height) return null;
    const out = await img.resize({ width: Math.min(max, meta.width), withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
    // A cut-out: the corners are one light colour (a product shot on white), so it can sit on a coloured card.
    const { data, info } = await sharp(out.data).resize(40, 40, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => [0, 1, 2].map((c) => data[(y * info.width + x) * info.channels + c]);
    const corners = [px(0, 0), px(39, 0), px(0, 39), px(39, 39)];
    const light = corners.every((p) => p.every((v) => v > 225));
    const even = corners.every((p) => p.every((v, i) => Math.abs(v - corners[0][i]) < 14));
    const plain = even && corners.every((p) => p.every((v) => v > 120));
    return { src: `data:image/png;base64,${out.data.toString("base64")}`, width: out.info.width, height: out.info.height, cutout: light && even, plain };
  } catch {
    return null;
  }
}

const kits = new Map<string, { at: number; kit: BrandKit }>();

/** The brand kit for a domain (cached for an hour in this instance). */
export async function brandKit(domain: string): Promise<BrandKit> {
  const hit = kits.get(domain);
  if (hit && Date.now() - hit.at < 3_600_000) return hit.kit;
  const site = ((await sql()`
    SELECT s.doc FROM sites s JOIN clients c ON c.id = s.client_id WHERE c.domain = ${domain} ORDER BY s.updated_at DESC LIMIT 1
  `.catch(() => [])) as { doc: SiteDoc }[])[0]?.doc;
  let kit: BrandKit;
  if (site) {
    const p = site.tokens.palette;
    kit = {
      name: site.brand.name,
      logo: (await drawable(site.brand.logo ?? null, 600))?.src ?? null,
      bg: p.bg,
      surface: p.surface,
      ink: p.text,
      muted: p.muted,
      accent: p.accent,
      onAccent: p.accentText || onColor(p.accent),
      // The fonts the client's site template sets (its stored tokens can be leftovers the template ignores).
      heading: sans(TEMPLATE_FONTS[site.design ?? ""]?.heading ?? site.tokens.fontHeading),
      body: sans(TEMPLATE_FONTS[site.design ?? ""]?.body ?? site.tokens.fontBody),
      radius: site.tokens.radius,
      upper: site.tokens.headingCase === "upper",
    };
  } else {
    // No website of ours: its own logo and colour, on a calm neutral base.
    const b = await extractBrand(domain).catch(() => null);
    const accent = b?.accent ?? "#1f2937";
    kit = {
      name: titleCase(domain.replace(/^www\./, "").replace(/\.[a-z.]+$/, "")),
      logo: (await drawable(b?.logo ?? null, 600))?.src ?? null,
      bg: "#ffffff",
      surface: "#f4f3f0",
      ink: "#141414",
      muted: "#5f6368",
      accent,
      onAccent: onColor(accent),
      heading: "Plus Jakarta Sans",
      body: "Inter",
      radius: 14,
      upper: false,
    };
  }
  kits.set(domain, { at: Date.now(), kit });
  return kit;
}

const fonts = new Map<string, ArrayBuffer | null>();

/** A Google font's TTF at a weight (cached), or null. Sans fonts only are used for Apereel brands. */
export async function googleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`;
  if (fonts.has(key)) return fonts.get(key)!;
  let buf: ArrayBuffer | null = null;
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${weight}`, { signal: AbortSignal.timeout(8000) })).text();
    const url = css.match(/src:\s*url\(([^)]+\.ttf)\)/)?.[1];
    if (url) buf = await (await fetch(url, { signal: AbortSignal.timeout(8000) })).arrayBuffer();
  } catch {
    buf = null;
  }
  fonts.set(key, buf);
  return buf;
}
