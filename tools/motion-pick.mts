// Motion and scene template picks for every waiting render, scored from the
// product's photo and title (lib/motion-templates). Free: reads the photo,
// no AI, no render. Use it to see what each job would get before spending.
//
//   npx tsx --env-file=.env.local tools/motion-pick.mts            # score every waiting job
//   npx tsx --env-file=.env.local tools/motion-pick.mts 37 22=push-in   # rewrite those jobs' briefs from a template
//                                                                  # (the scorer's pick, or the one named) and queue them
//
// A job's photo that can't be read from this machine (a bot-checking site)
// is scored as unknown; name the template for it.

import { neon } from "@neondatabase/serverless";
import { drawable } from "../lib/ad-brand";
import { imageSize } from "../lib/image-size";
import { upgradeImages } from "../lib/image-upgrade";
import { templateRecord } from "../lib/media";
import type { MediaBrief, MediaKind } from "../lib/media";
import { motionBrief, motionById, pickMotion, pickScene, productFeatures, sceneById, scoreMotion, scoreScenes, type Features } from "../lib/motion-templates";

const sql = neon(process.env.DATABASE_URL!);
const args = process.argv.slice(2);
// id=template|a plain description of the product (what the model sees), e.g. 22=pull-back|a white 4-pin CFL socket
const apply = new Map<number, { template: string | null; product: string | null }>();
for (const a of args) {
  const [id, rest] = a.split(/=(.*)/s);
  if (!/^\d+$/.test(id)) continue;
  const [t, product] = (rest ?? "").split(/\|(.*)/s);
  apply.set(Number(id), { template: t || null, product: product?.trim() || null });
}

/** A product line the model can picture: the title without SKUs, specs and certification marks. */
function plainProduct(title: string): string {
  const t = title
    .replace(/\b[A-Z]{1,6}\d[\w./-]*\b|\b\d+[\w./-]*[A-Z]{2,}[\w./-]*\b/g, " ") // SKUs and part numbers
    .replace(/\b(c?ULus?|c?CSAus?|UL|CSA|CE|RoHS)\b( (listed|approved|certified))?/gi, " ")
    .replace(/\b\d+(\.\d+)?\s?(w|v|watts?|volts?|amps?|a|hz|k|awg|in|ips|mm|cm|lbs?)\b\.?/gi, " ")
    .replace(/\b\d+(-\d+)?(\/\d+)?\s?(in|inch|″)\b\.?/gi, " ")
    .replace(/[–—]|\s[-]\s/g, ", ")
    .replace(/\(.*?\)/g, " ")
    .replace(/[,\s]{2,}/g, ", ")
    .replace(/^[,\s]+|[,\s.]+$/g, "")
    .toLowerCase();
  return `a ${t}`;
}

type Job = { id: number; domain: string; tier: string; kind: MediaKind; status: string; brief: MediaBrief; title: string | null };
const jobs = (await sql`
  SELECT m.id::int AS id, c.domain, c.tier, m.kind, m.status, m.brief, i.data->>'productTitle' AS title
  FROM media_jobs m JOIN clients c ON c.id = m.client_id LEFT JOIN content_items i ON i.id = m.item_id
  WHERE m.status IN ('paused', 'queued', 'failed', 'waiting_provider') ${apply.size ? sql`AND m.id = ANY(${[...apply.keys()]})` : sql``}
  ORDER BY c.domain, m.kind, m.id
`) as Job[];
const record = await templateRecord();

for (const j of jobs) {
  // The store's full-size photo, as the renderer will use (lib/media).
  const images = (await upgradeImages(j.brief.images.filter(Boolean).map((image) => ({ image }))).catch(() => j.brief.images.map((image) => ({ image })))).map((i) => i.image!);
  const url = images[0] ?? null;
  const size = url ? await imageSize(url).catch(() => null) : null;
  const photo = url ? await drawable(url, 200).catch(() => null) : null;
  const meta = size && photo ? { width: size.width, height: size.height, cutout: photo.cutout || photo.plain } : size ? { ...size, cutout: null } : null;
  const title = j.title ?? j.brief.title;
  const f: Features = productFeatures(title, meta, j.kind, j.brief.aspect);
  const still = j.kind === "product-visual" || j.kind === "site-visual";
  const facts = `${f.material}, ${f.shape}${f.cutout == null ? ", photo unread" : f.cutout ? ", plain backdrop" : ", scene"}${f.sharp ? `, sharp (${size!.width}×${size!.height})` : size ? `, soft (${size.width}×${size.height})` : ""}${f.detail ? ", detail" : ""}${f.tiny ? ", tiny" : ""}${f.wired ? ", wired" : ""}`;
  console.log(`\n#${j.id} ${j.domain} · ${j.kind} ${j.brief.duration}s ${j.brief.aspect} · ${title}\n   facts: ${facts}`);
  if (still) {
    const ranked = scoreScenes(f, { record });
    console.log(`   scenes: ${ranked.slice(0, 4).map((r) => `${r.template.id} ${r.score}`).join(" · ")}`);
    const a = apply.get(j.id);
    const chosen = a ? (a.template ? sceneById(a.template) : pickScene(f, { record }).template) : null;
    if (chosen) {
      const brief: MediaBrief = { ...j.brief, images, template: chosen.id, prompt: chosen.prompt({ product: a?.product ?? plainProduct(title) }) };
      await sql`UPDATE media_jobs SET brief = ${JSON.stringify(brief)}::jsonb, status = 'queued', retries = 0, provider_request_id = NULL, error = NULL, updated_at = now() WHERE id = ${j.id}`;
      console.log(`   → queued with scene "${chosen.name}": ${brief.prompt}`);
    }
  } else {
    const ranked = scoreMotion(f, { record });
    console.log(`   motion: ${ranked.slice(0, 4).map((r) => `${r.template.id} ${r.score}`).join(" · ")}${ranked.length ? "" : " (none eligible)"}`);
    console.log(`   pick for tier ${j.tier}: ${pickMotion(f, j.tier, { record }).template.name}`);
    const a = apply.get(j.id);
    const chosen = a ? (a.template ? motionById(a.template) : pickMotion(f, j.tier, { record }).template) : null;
    if (chosen) {
      const brief = motionBrief(chosen, { product: a?.product ?? plainProduct(title) }, f, { title: j.brief.title, duration: j.brief.duration, aspect: j.brief.aspect, images, voiceover: j.brief.voiceover });
      await sql`UPDATE media_jobs SET brief = ${JSON.stringify(brief)}::jsonb, status = 'queued', retries = 0, provider_request_id = NULL, error = NULL, updated_at = now() WHERE id = ${j.id}`;
      console.log(`   → queued with "${chosen.name}": ${brief.prompt}`);
    }
  }
}
process.exit(0);
