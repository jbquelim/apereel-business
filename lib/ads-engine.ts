import { fit } from "./content-qa";
import { catalogTotalFor } from "./content-context";
import { neon } from "@neondatabase/serverless";
import { callClaude, parseJson } from "./ai";
import type { Client } from "./clients";
import { fetchAuditResult } from "./marketdb";
import {
  RULES,
  catalogWithPhotos,
  marketBrief,
  pickProducts,
  saveItem,
  writeVideoBriefs,
  type AuditLike,
  type Product,
} from "./content-engine";

// The ads service, automated. From the client's real products and what we
// know of their market, Claude writes each ad's angle and copy for Google,
// Meta and TikTok (platform limits enforced here). Creative images are
// rendered from the product photo by /api/creative (no image model needed);
// animated and cinematic ads are briefed and queued in lib/media.
//
//   Static:    10 static ads
//   Motion:    + 3 carousels (4 frames each) and 2 animated ads
//   Cinematic: + 2 cinematic video ads

export type StaticAd = {
  productTitle: string;
  price: string | null;
  angle: string;
  overlay: { headline: string; sub: string; badge: string };
  google: { headlines: string[]; descriptions: string[] };
  meta: { primaryText: string; headline: string };
  tiktok: { text: string };
};

export type CarouselAd = {
  title: string;
  frames: { productTitle: string; image: string | null; headline: string; sub: string }[];
  meta: { primaryText: string; headline: string };
};

const VOLUME: Record<string, { statics: number; carousels: number; animated: number; videos: number }> = {
  fix: { statics: 10, carousels: 0, animated: 0, videos: 0 },
  build: { statics: 10, carousels: 3, animated: 2, videos: 0 },
  grow: { statics: 10, carousels: 3, animated: 2, videos: 2 },
};

// Platform limits: shortened at a word or sentence boundary, never mid-word (lib/content-qa fit).
const cut = fit;
const cuts = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v.map((x) => cut(x, n)).filter(Boolean).slice(0, max) : []);
/** A price as shoppers read it: to the cent ("$3.50", not "$3.5"). */
const priceOf = (p: Product) =>
  p.price != null ? `${p.currency && p.currency !== "USD" ? `${p.currency} ` : "$"}${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

const AD_RULES = `${RULES}
- Platform limits are strict: Google headlines max 30 characters, descriptions max 90; Meta primary text max 125, headline max 40; TikTok text max 100.
- Each ad takes a distinct angle: the problem it solves, who it's for, a detail that matters, the business's advantage, the price.`;

async function writeStatics(client: Client, brief: string, products: Product[], competitors: string): Promise<StaticAd[]> {
  const text = await callClaude({
    clientId: client.id,
    purpose: "ads:static",
    maxTokens: 8000,
    prompt: `You are a performance ad copywriter. Write one ad per product for the business below.

${brief}
${competitors}

PRODUCTS:
${products.map((p, i) => `${i + 1}. ${p.title}${priceOf(p) ? ` — ${priceOf(p)}` : ""}`).join("\n")}

Return ONLY a JSON array, one object per product in order:
[{ "productTitle": "exactly as given", "angle": "the angle in 3-6 words", "overlay": { "headline": "on-image headline, max 32 characters", "sub": "on-image line, max 48 characters", "badge": "max 18 characters, e.g. the price or a fact; empty if none" }, "google": { "headlines": ["5 headlines, each max 30 characters"], "descriptions": ["2 descriptions, each max 90 characters"] }, "meta": { "primaryText": "max 125 characters", "headline": "max 40 characters" }, "tiktok": { "text": "max 100 characters" } }]

${AD_RULES}
- Say what competitors don't: lean on the business's advantage, never name a competitor.`,
  });
  const raw = parseJson<StaticAd[]>(text) ?? [];
  return raw.slice(0, products.length).map((a, i) => {
    const p = products.find((x) => x.title === a.productTitle) ?? products[i];
    return {
      productTitle: p.title,
      price: priceOf(p),
      angle: cut(a.angle, 60),
      overlay: { headline: cut(a.overlay?.headline, 32), sub: cut(a.overlay?.sub, 48), badge: cut(a.overlay?.badge, 18) },
      google: { headlines: cuts(a.google?.headlines, 30, 5), descriptions: cuts(a.google?.descriptions, 90, 2) },
      meta: { primaryText: cut(a.meta?.primaryText, 125), headline: cut(a.meta?.headline, 40) },
      tiktok: { text: cut(a.tiktok?.text, 100) },
    };
  });
}

async function writeCarousels(client: Client, brief: string, groups: Product[][]): Promise<CarouselAd[]> {
  if (groups.length === 0) return [];
  const text = await callClaude({
    clientId: client.id,
    purpose: "ads:carousel",
    maxTokens: 4000,
    prompt: `Write ${groups.length} carousel ad(s) for Meta and TikTok for the business below. Each carousel has one frame per product listed for it and tells a small story across the frames (e.g. a range, a set that works together, good-better-best).

${brief}

${groups.map((g, i) => `CAROUSEL ${i + 1}: ${g.map((p) => `${p.title}${priceOf(p) ? ` (${priceOf(p)})` : ""}`).join("; ")}`).join("\n")}

Return ONLY a JSON array, one object per carousel:
[{ "title": "internal name", "frames": [{ "productTitle": "exactly as given", "headline": "max 32 characters", "sub": "max 48 characters" }], "meta": { "primaryText": "max 125 characters", "headline": "max 40 characters" } }]

${AD_RULES}`,
  });
  const raw = parseJson<CarouselAd[]>(text) ?? [];
  return raw.slice(0, groups.length).map((c, i) => ({
    title: cut(c.title, 80),
    frames: groups[i].map((p, j) => {
      const f = c.frames?.find((x) => x.productTitle === p.title) ?? c.frames?.[j];
      return { productTitle: p.title, image: p.image, headline: cut(f?.headline, 32), sub: cut(f?.sub, 48) };
    }),
    meta: { primaryText: cut(c.meta?.primaryText, 125), headline: cut(c.meta?.headline, 40) },
  }));
}

async function countBatch(clientId: string, batch: string): Promise<Record<string, number>> {
  if (!process.env.DATABASE_URL) return {};
  const rows = (await neon(process.env.DATABASE_URL)`SELECT kind, count(*)::int AS n FROM content_items WHERE client_id = ${clientId} AND batch = ${batch} GROUP BY kind`) as { kind: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
}

export async function generateAdsMonth(client: Client): Promise<{ batch: string; statics: number; carousels: number; animated: number; videos: number }> {
  const volume = VOLUME[client.tier] ?? VOLUME.fix;
  const batch = new Date().toISOString().slice(0, 7);
  // Only what this month's batch is missing (a re-run must not pay twice).
  const have = await countBatch(client.id, batch);
  const catalog = await catalogWithPhotos(client.domain);
  const audit = await fetchAuditResult<AuditLike>(client.domain);
  const brief = marketBrief(client.domain, audit, await catalogTotalFor(client.domain).catch(() => null));
  const competitors = audit?.industry?.competitors?.length
    ? `WHAT COMPETITORS LEAD WITH (for contrast only): ${audit.industry.competitors.map((c) => c.strength).join("; ")}`
    : "";
  const withPhotos = catalog.filter((p) => p.image);
  const pool = withPhotos.length >= volume.statics ? withPhotos : catalog;

  const featured = pickProducts(pool, volume.statics).slice(have.ad ?? 0);
  const statics = featured.length ? await writeStatics(client, brief, featured, competitors) : [];
  for (const ad of statics) {
    const product = featured.find((p) => p.title === ad.productTitle) ?? null;
    await saveItem(client.id, batch, "ad", ad, product, "google · meta · tiktok");
  }

  // Carousels: consecutive products in the catalog tend to be one range.
  const groups: Product[][] = [];
  for (let i = have.carousel ?? 0; i < volume.carousels; i++) {
    const start = Math.floor(((i + 0.5) * withPhotos.length) / Math.max(volume.carousels, 1));
    const g = withPhotos.slice(start, start + 4);
    if (g.length >= 2) groups.push(g);
  }
  const carousels = await writeCarousels(client, brief, groups);
  for (const c of carousels) await saveItem(client.id, batch, "carousel", c, null, "meta · tiktok");

  const animated = await writeVideoBriefs(client, brief, pickProducts(withPhotos.slice(1), Math.max(0, volume.animated - (have["animated-ad"] ?? 0))), {
    batch,
    itemKind: "animated-ad",
    mediaKind: "animated-ad",
    style: "a punchy animated product ad: the photo comes alive with one bold camera move",
    duration: 6,
    aspect: "1:1",
  });
  const videos = await writeVideoBriefs(client, brief, pickProducts(withPhotos.slice(2), Math.max(0, volume.videos - (have["video-ad"] ?? 0))), {
    batch,
    itemKind: "video-ad",
    mediaKind: "video-ad",
    style: "a cinematic hero product film, premium lighting and slow deliberate camera work, like a big-brand launch ad",
    duration: 15,
    aspect: "9:16",
    alsoAspects: ["16:9"],
  });
  return { batch, statics: statics.length, carousels: carousels.length, animated, videos };
}
