// Ad design QA: renders every ad design at every size for real brands (our
// sites' brand kits, and a brand with no site), with short and long copy, into
// one contact sheet per brand for review. No AI, free:
//
//   npx tsx --env-file=.env.local tools/ad-qa.mts [design]
//
// Sheets land in /tmp/ad-qa/<brand>.png.

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import sharp from "sharp";
import { neon } from "@neondatabase/serverless";
import { brandKit, drawable, type BrandKit } from "../lib/ad-brand";
import { adFonts } from "../lib/ad-render";
import { AD_DESIGNS, type AdSlots } from "../lib/ad-designs";
import type { SiteDoc } from "../lib/site-types";

const { ImageResponse } = createRequire(import.meta.url)("next/dist/compiled/@vercel/og/index.node.js");
const OUT = "/tmp/ad-qa";
mkdirSync(OUT, { recursive: true });
const sql = neon(process.env.DATABASE_URL!);
const only = process.argv[2];
const SIZES = [{ width: 1080, height: 1080 }, { width: 1080, height: 1920 }, { width: 1200, height: 628 }];
const money = (n: number | null) => (n == null ? "" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

/** A brand and two products: one short headline, one long, from its site. */
async function fixture(domain: string): Promise<{ kit: BrandKit; slots: AdSlots[] }> {
  const kit = await brandKit(domain);
  const doc = ((await sql`SELECT s.doc FROM sites s JOIN clients c ON c.id = s.client_id WHERE c.domain = ${domain} LIMIT 1`) as { doc: SiteDoc }[])[0]?.doc;
  const products = (doc?.products ?? []).filter((p) => p.image).slice(0, 2);
  const slots: AdSlots[] = [];
  for (const [i, p] of products.entries()) {
    slots.push({
      photo: await drawable(p.image),
      headline: i === 0 ? p.title.split(/\s[–—-]\s/)[0].slice(0, 32) : `${p.title} for restorers, makers and everyday repairs`.slice(0, 90),
      sub: (p.description ?? "").split(/(?<=\.)\s/)[0].slice(0, 48),
      badge: money(p.price),
      cta: doc?.kind === "services" ? "Get a quote" : "Shop now",
    });
  }
  return { kit, slots };
}

const fixtures: Record<string, string> = { grandbrass: "grandbrass.com", onyx: "onyxcoffeelab.com", rooter: "mrrooter.com", etlin: "etlin-daniels.com" };
for (const [name, domain] of Object.entries(fixtures)) {
  const { kit, slots } = await fixture(domain);
  const fonts = await adFonts(kit);
  const tiles: { input: Buffer; top: number; left: number }[] = [];
  let y = 0;
  const W = 300; // each tile's width on the sheet
  for (const d of AD_DESIGNS.filter((x) => !only || x.id === only)) {
    for (const s of slots) {
      let x = 0;
      let rowH = 0;
      for (const z of SIZES) {
        const ok = d.suits(s);
        const png = ok ? Buffer.from(await new ImageResponse(createElement(() => d.render(s, kit, z)), { ...z, fonts }).arrayBuffer()) : null;
        const tile = png
          ? await sharp(png).resize({ width: W }).png().toBuffer()
          : await sharp({ create: { width: W, height: Math.round((W * z.height) / z.width), channels: 3, background: "#dddddd" } }).png().toBuffer();
        const h = (await sharp(tile).metadata()).height!;
        tiles.push({ input: tile, top: y, left: x });
        x += W + 12;
        rowH = Math.max(rowH, h);
        if (png && s === slots[0]) {
          mkdirSync(`${OUT}/${name}`, { recursive: true });
          writeFileSync(`${OUT}/${name}/${d.id}-${z.width}x${z.height}.png`, png);
        }
        if (png && png.length < 8000) console.log(`${name} · ${d.id} · ${z.width}x${z.height}: image looks empty (${png.length} bytes)`);
      }
      y += rowH + 24;
    }
  }
  await sharp({ create: { width: (W + 12) * 3, height: y, channels: 3, background: "#ffffff" } }).composite(tiles).png().toFile(`${OUT}/${name}.png`);
  console.log(`${name}: ${kit.name}, logo ${kit.logo ? "yes" : "no"}, fonts ${fonts.length}, ${slots.length} products → ${OUT}/${name}.png`);
}
process.exit(0);
