import { notifyJohn } from "./notify";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { imageSize } from "./image-size";
import { storeImages, storedUrls } from "./image-store";
import { upgradeImages } from "./image-upgrade";

// Video and visuals for every service, rendered with Higgsfield (the same
// platform as Apereel's Higgsfield studio): Seedance 2.5 for video (content
// short videos, animated and cinematic ads, website hero films) and Flux 2
// for premium product visuals, both built from the product's REAL photo as
// the reference, never an invented product. Claude writes each brief; jobs
// queue in media_jobs. Renders take minutes, so work is asynchronous:
// processMediaJobs() submits queued jobs and polls running ones (every few
// minutes from /api/media/poll), copies finished files to our Blob storage
// and attaches them where they belong. Needs HIGGSFIELD_API_KEY (id:secret).

export type MediaKind = "short-video" | "animated-ad" | "video-ad" | "hero-film" | "product-visual" | "site-visual";

export type MediaBrief = {
  title: string;
  /** Seconds (videos). */
  duration: number;
  aspect: "9:16" | "1:1" | "16:9" | "4:3" | "3:4";
  /** The real product photos the render is built from. */
  images: string[];
  shots: { seconds: number; visual: string; onScreenText?: string }[];
  voiceover?: string;
  /** The generation prompt (no text in the render). */
  prompt: string;
  /** The motion or scene template the brief was built from (lib/motion-templates), when one was. */
  template?: string;
};

export type MediaJob = {
  id: number;
  client_id: string;
  item_id: number | null;
  site_id: string | null;
  kind: MediaKind;
  brief: MediaBrief;
  status: "waiting_provider" | "queued" | "running" | "done" | "failed";
  output_url: string | null;
  error: string | null;
  provider_request_id?: string | null;
};

const HF_BASE = () => (process.env.HF_API_BASE_URL || "https://platform.higgsfield.ai").replace(/\/$/, "");
const MAX_RUNNING = 4;
const VIDEO_MODEL = "bytedance/seedance-2.5";
const IMAGE_MODEL = "flux-2-pro";
const isImage = (k: MediaKind) => k === "product-visual" || k === "site-visual";

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** The connected renderer, or null (jobs then wait as 'waiting_provider'). */
export function mediaProvider(): string | null {
  return process.env.HIGGSFIELD_API_KEY?.includes(":") ? "higgsfield" : null;
}

export async function queueMediaJob(j: { clientId: string; itemId?: number | null; siteId?: string | null; kind: MediaKind; brief: MediaBrief }): Promise<number> {
  const rows = (await sql()`
    INSERT INTO media_jobs (client_id, item_id, site_id, kind, brief, status)
    VALUES (${j.clientId}, ${j.itemId ?? null}, ${j.siteId ?? null}, ${j.kind}, ${JSON.stringify(j.brief)}::jsonb,
            ${mediaProvider() ? "queued" : "waiting_provider"})
    RETURNING id
  `) as { id: number }[];
  return rows[0].id;
}

/** Every render for each item (an ad can have several sizes), oldest first. */
export async function jobsForItems(itemIds: number[]): Promise<Map<number, MediaJob[]>> {
  if (itemIds.length === 0) return new Map();
  const rows = (await sql()`
    SELECT id, client_id, item_id, site_id, kind, brief, status, output_url, error
    FROM media_jobs WHERE item_id = ANY(${itemIds}) ORDER BY item_id, id
  `) as MediaJob[];
  const map = new Map<number, MediaJob[]>();
  for (const r of rows) map.set(r.item_id!, [...(map.get(r.item_id!) ?? []), r]);
  return map;
}

async function hf(method: "GET" | "POST", path: string, body?: object): Promise<Record<string, unknown>> {
  const res = await fetch(`${HF_BASE()}${path}`, {
    method,
    headers: { Authorization: `Key ${process.env.HIGGSFIELD_API_KEY}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`Higgsfield ${res.status}: ${typeof json.detail === "string" ? json.detail : JSON.stringify(json).slice(0, 200)}`);
  return json;
}

/** Submits one job: Seedance video from the product photo, or a Flux 2 visual with it as reference. */
async function submit(job: MediaJob): Promise<string> {
  const b = job.brief;
  const ref = b.images.filter(Boolean).slice(0, 4);
  const prompt = `${b.prompt} Keep the product exactly as it appears in the reference photo: same shape, colour, finish and details. No text, logos or watermarks.`;
  const payload = isImage(job.kind)
    ? { path: `/${IMAGE_MODEL}`, body: { prompt, aspect_ratio: b.aspect, resolution: "2k", ...(ref.length ? { image_urls: ref } : {}) } }
    : ref.length
      ? {
          path: `/${VIDEO_MODEL}/reference-to-video`,
          body: { prompt, aspect_ratio: b.aspect, resolution: "720p", duration: Math.min(30, Math.max(4, Math.round(b.duration))), generate_audio: false, image_urls: ref },
        }
      : { path: `/${VIDEO_MODEL}/text-to-video`, body: { prompt, aspect_ratio: b.aspect, resolution: "720p", duration: Math.min(30, Math.max(4, Math.round(b.duration))), generate_audio: false } };
  const out = await hf("POST", payload.path, payload.body);
  const id = typeof out.request_id === "string" ? out.request_id : null;
  if (!id) throw new Error("Higgsfield returned no request id");
  return id;
}

/** Copies a finished render to our Blob storage (provider links can expire). */
async function keep(url: string, job: MediaJob): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return url;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) return url;
    const type = res.headers.get("content-type") ?? (isImage(job.kind) ? "image/png" : "video/mp4");
    const ext = type.includes("png") ? "png" : type.includes("jpeg") ? "jpg" : type.includes("webp") ? "webp" : "mp4";
    const blob = await put(`media/${job.client_id}/${job.id}.${ext}`, Buffer.from(await res.arrayBuffer()), { access: "public", contentType: type, allowOverwrite: true });
    return blob.url;
  } catch {
    return url;
  }
}

/** Renders still to submit or collect (0 without a provider: nothing to wait for). */
export async function pendingMediaJobs(): Promise<number> {
  if (!mediaProvider()) return 0;
  return ((await sql()`SELECT count(*)::int AS n FROM media_jobs WHERE status IN ('queued', 'running', 'waiting_provider')`) as { n: number }[])[0].n;
}

/** Starts the render rounds (fire and forget). */
export async function kickMediaWorker(base: string) {
  if (!mediaProvider()) return;
  await fetch(`${base}/api/media/poll`, { method: "POST", headers: { "x-internal-secret": process.env.CRON_SECRET ?? "" }, signal: AbortSignal.timeout(5_000) }).catch(() => null);
}

const CREDIT_RE = /credit|balance|top up/i;

/** True while renders are paused because Higgsfield credit ran out (re-tried every 30 minutes). */
async function creditPaused(): Promise<boolean> {
  const rows = (await sql()`
    SELECT 1 FROM media_jobs WHERE status = 'queued' AND error ILIKE '%credit%' AND updated_at > now() - interval '30 minutes' LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

/** Takes a named lock for a while; false if someone holds it. */
export async function takeLock(name: string, seconds: number): Promise<boolean> {
  const rows = (await sql()`
    INSERT INTO app_locks (name, until) VALUES (${name}, now() + make_interval(secs => ${seconds}))
    ON CONFLICT (name) DO UPDATE SET until = EXCLUDED.until WHERE app_locks.until < now()
    RETURNING name
  `) as unknown[];
  return rows.length > 0;
}

async function notifyOnce(subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Apereel <noreply@apereel.com>", to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"], subject, text }),
  }).catch(() => null);
}

/** Submits queued jobs and collects finished ones, within a time budget. */
export async function processMediaJobs(budgetMs: number): Promise<{ submitted: number; finished: number }> {
  if (!mediaProvider()) return { submitted: 0, finished: 0 };
  const started = Date.now();
  await sql()`UPDATE media_jobs SET status = 'queued', provider = 'higgsfield' WHERE status = 'waiting_provider'`;
  let finished = 0;
  let submitted = 0;

  // 1. Collect running renders (asking Higgsfield, never assuming).
  const running = (await sql()`
    SELECT id, client_id, item_id, site_id, kind, brief, status, output_url, error, provider_request_id, submitted_at
    FROM media_jobs WHERE status = 'running' AND provider_request_id IS NOT NULL ORDER BY submitted_at LIMIT 20
  `) as (MediaJob & { submitted_at: string })[];
  for (const job of running) {
    if (Date.now() - started > budgetMs) break;
    try {
      const s = await hf("GET", `/requests/${encodeURIComponent(job.provider_request_id!)}/status`);
      const status = String(s.status ?? "").toLowerCase();
      const video = (s.video as { url?: string } | undefined)?.url;
      const image = (s.images as { url?: string }[] | undefined)?.[0]?.url;
      const reason = typeof s.error === "string" ? s.error : s.error ? JSON.stringify(s.error) : status;
      if (status === "completed" && (video || image)) {
        const url = await keep((video ?? image)!, job);
        await sql()`UPDATE media_jobs SET status = 'done', output_url = ${url}, error = NULL, updated_at = now() WHERE id = ${job.id}`;
        await attach(job, url);
        finished++;
      } else if (["failed", "nsfw", "canceled", "cancelled", "error"].includes(status)) {
        if (CREDIT_RE.test(reason)) {
          // Not the job's fault: back in the queue, paused until credit is topped up.
          await sql()`UPDATE media_jobs SET status = 'queued', provider_request_id = NULL, error = ${`Waiting for Higgsfield credit: ${reason}`.slice(0, 500)}, updated_at = now() WHERE id = ${job.id}`;
        } else {
          await failOrRetry(job, `Higgsfield: ${reason}`);
        }
      } else if (Date.now() - new Date(job.submitted_at).getTime() > 6 * 3_600_000) {
        await failOrRetry(job, `Higgsfield still "${status}" after 6 hours`);
      }
    } catch (err) {
      console.error("Media status check failed:", job.id, err instanceof Error ? err.message : err);
    }
  }

  // 2. Submit queued jobs, a few at a time (not while credit is out).
  if (await creditPaused()) {
    // One email per 12 hours while paused.
    if (await takeLock("higgsfield-credit-email", 12 * 3600)) {
      await notifyOnce("Higgsfield credit is out", "Video and visual renders are paused. Top up at cloud.higgsfield.ai; they resume by themselves within 30 minutes.");
    }
    return { submitted, finished };
  }
  const inFlight = ((await sql()`SELECT count(*)::int AS n FROM media_jobs WHERE status = 'running'`) as { n: number }[])[0].n;
  const queued = (await sql()`
    SELECT id, client_id, item_id, site_id, kind, brief, status, output_url, error
    FROM media_jobs WHERE status = 'queued' ORDER BY id LIMIT ${Math.max(0, MAX_RUNNING - inFlight)}
  `) as MediaJob[];
  for (const job of queued) {
    if (Date.now() - started > budgetMs) break;
    // Higgsfield gets our own copy of each photo (lib/image-store): a business's server
    // often answers Higgsfield's fetch with a bot check, which fails the render.
    // The store's full-size photo, not its thumbnail (lib/image-upgrade): a 386px photo renders soft.
    const originals = (await upgradeImages(job.brief.images.filter(Boolean).map((image) => ({ image }))).catch(() => job.brief.images.map((image) => ({ image })))).map((i) => i.image!).filter(Boolean);
    if (originals.length) {
      await storeImages(originals, 30_000).catch(() => 0);
      const copies = await storedUrls(originals).catch(() => new Map<string, string>());
      const images = originals.map((u) => copies.get(u) ?? u);
      if (images.some((u, i) => u !== originals[i])) {
        job.brief = { ...job.brief, images };
        await sql()`UPDATE media_jobs SET brief = ${JSON.stringify(job.brief)}::jsonb, updated_at = now() WHERE id = ${job.id}`;
      }
    }
    // A photo Higgsfield can't load fails here, before any credit is spent.
    const readable = (await Promise.all(job.brief.images.slice(0, 1).map((u) => imageSize(u)))).every(Boolean);
    if (!readable) {
      await sql()`UPDATE media_jobs SET status = 'failed', error = 'The product photo can''t be read (the site blocks it); needs our photo storage', updated_at = now() WHERE id = ${job.id}`;
      continue;
    }
    try {
      const requestId = await submit(job);
      await sql()`UPDATE media_jobs SET status = 'running', provider_request_id = ${requestId}, submitted_at = now(), error = NULL, updated_at = now() WHERE id = ${job.id}`;
      submitted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed";
      if (CREDIT_RE.test(msg)) {
        await sql()`UPDATE media_jobs SET error = ${`Waiting for Higgsfield credit: ${msg}`.slice(0, 500)}, updated_at = now() WHERE id = ${job.id}`;
        break;
      }
      await sql()`UPDATE media_jobs SET status = 'failed', error = ${msg.slice(0, 500)}, updated_at = now() WHERE id = ${job.id}`;
    }
  }
  return { submitted, finished };
}

/**
 * Each template's track record across every render made from it: +1 for an
 * item the client approved, -2 for one they asked to change, -3 for a render
 * that failed (lib/motion-templates scoring).
 */
export async function templateRecord(): Promise<Record<string, number>> {
  const rows = (await sql()`
    SELECT m.brief->>'template' AS template,
      sum(CASE WHEN i.status = 'approved' THEN 1 ELSE 0 END)::int AS approved,
      sum(CASE WHEN i.status = 'changed' THEN 1 ELSE 0 END)::int AS changed,
      sum(CASE WHEN m.status = 'failed' THEN 1 ELSE 0 END)::int AS failed
    FROM media_jobs m LEFT JOIN content_items i ON i.id = m.item_id
    WHERE m.brief->>'template' IS NOT NULL GROUP BY 1
  `) as { template: string; approved: number; changed: number; failed: number }[];
  return Object.fromEntries(rows.map((r) => [r.template, r.approved - 2 * r.changed - 3 * r.failed]));
}

/** Templates already used for a client's items this month, for variety. */
export async function usedTemplates(clientId: string, batch: string): Promise<string[]> {
  const rows = (await sql()`
    SELECT m.brief->>'template' AS template FROM media_jobs m JOIN content_items i ON i.id = m.item_id
    WHERE m.client_id = ${clientId} AND i.batch = ${batch} AND m.brief->>'template' IS NOT NULL
  `) as { template: string }[];
  return rows.map((r) => r.template);
}

/** John re-queues a client's failed renders (after fixing the cause); each costs Higgsfield credit again. Returns how many. */
export async function retryFailedRenders(clientId: string): Promise<number> {
  const rows = (await sql()`
    UPDATE media_jobs SET status = ${mediaProvider() ? "queued" : "waiting_provider"}, retries = 0, provider_request_id = NULL, error = NULL, updated_at = now()
    WHERE client_id = ${clientId} AND status = 'failed' AND coalesce(error, '') NOT LIKE 'Duplicate run%' RETURNING id
  `) as { id: number }[];
  return rows.length;
}

/** One collection round, at most once a minute across everyone asking (studio and admin pages). */
export async function nudgeMediaJobs(): Promise<{ ran: boolean; pending: number }> {
  if (!mediaProvider()) return { ran: false, pending: 0 };
  if (!(await takeLock("media-nudge", 60))) return { ran: false, pending: await pendingMediaJobs() };
  await processMediaJobs(20_000);
  return { ran: true, pending: await pendingMediaJobs() };
}

/** Puts a finished render where it belongs: the site's hero film or its story visual. */
async function attach(job: MediaJob, url: string) {
  if (!job.site_id || (job.kind !== "hero-film" && job.kind !== "site-visual")) return;
  const rows = (await sql()`SELECT doc FROM sites WHERE id = ${job.site_id}`) as { doc: { pages: { slug: string; sections: { type: string; video?: string | null; image?: string | null }[] }[] } }[];
  const doc = rows[0]?.doc;
  if (!doc) return;
  if (job.kind === "hero-film") {
    const hero = doc.pages.find((p) => p.slug === "")?.sections.find((s) => s.type === "hero");
    if (hero) hero.video = url;
  } else {
    // Premium visuals replace the plain product photos on story sections, one per section.
    const rendered = new Set(((await sql()`SELECT output_url FROM media_jobs WHERE site_id = ${job.site_id} AND status = 'done' AND id <> ${job.id}`) as { output_url: string }[]).map((r) => r.output_url));
    const story = doc.pages.flatMap((p) => p.sections).find((s) => s.type === "story" && !rendered.has(s.image ?? ""));
    if (story) story.image = url;
  }
  await sql()`UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, updated_at = now() WHERE id = ${job.site_id}`;
}

/** A render that failed is tried once more; a second failure is reported to John (the client sees "we'll look into it"). */
async function failOrRetry(job: { id: number; client_id: string | null; kind: string }, reason: string) {
  const rows = (await sql()`
    UPDATE media_jobs SET status = CASE WHEN retries < 1 THEN 'queued' ELSE 'failed' END, retries = retries + 1,
      provider_request_id = NULL, error = ${reason.slice(0, 500)}, updated_at = now()
    WHERE id = ${job.id} RETURNING status
  `) as { status: string }[];
  if (rows[0]?.status !== "failed") return;
  const who = job.client_id ? ((await sql()`SELECT domain FROM clients WHERE id = ${job.client_id}`) as { domain: string }[])[0]?.domain : null;
  await notifyJohn(`Render failed twice: ${who ?? "a site"}`, `Media job ${job.id} (${job.kind}${who ? ` for ${who}` : ""}) failed twice. Last error: ${reason}`);
}
