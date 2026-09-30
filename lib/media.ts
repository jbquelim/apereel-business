import { neon } from "@neondatabase/serverless";

// Video and animation for every service (content short videos, animated and
// cinematic ads, website hero films). Claude writes the brief now; rendering
// needs a media provider. Until one is connected, jobs wait in media_jobs
// with status 'waiting_provider' and the client sees the script and shot
// list. Connecting a provider = implementing `render` below and setting its
// key; processMediaJobs() (run from the discover cron) then works the queue.

export type MediaKind = "short-video" | "animated-ad" | "video-ad" | "hero-film";

export type MediaBrief = {
  title: string;
  /** Seconds. */
  duration: number;
  aspect: "9:16" | "1:1" | "16:9";
  /** The product photos the film is built from. */
  images: string[];
  shots: { seconds: number; visual: string; onScreenText?: string }[];
  voiceover?: string;
  /** One prompt for a text-to-video / image-to-video model. */
  prompt: string;
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
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** The provider configured for rendering, or null. */
export function mediaProvider(): string | null {
  return process.env.MEDIA_PROVIDER && process.env.MEDIA_API_KEY ? process.env.MEDIA_PROVIDER : null;
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

export async function jobsForItems(itemIds: number[]): Promise<Map<number, MediaJob>> {
  if (itemIds.length === 0) return new Map();
  const rows = (await sql()`
    SELECT DISTINCT ON (item_id) id, client_id, item_id, site_id, kind, brief, status, output_url, error
    FROM media_jobs WHERE item_id = ANY(${itemIds}) ORDER BY item_id, id DESC
  `) as MediaJob[];
  return new Map(rows.map((r) => [r.item_id!, r]));
}

/**
 * Renders one job with the connected provider and returns the video URL.
 * Not connected yet: see the list of sign-ups. Implement per provider.
 */
async function render(job: MediaJob): Promise<{ url: string; costUsd: number | null }> {
  throw new Error(`No renderer for provider "${mediaProvider()}" yet (job ${job.id}, ${job.kind})`);
}

/** Works through queued jobs within a time budget. No-op without a provider. */
export async function processMediaJobs(budgetMs: number): Promise<number> {
  if (!mediaProvider()) return 0;
  const started = Date.now();
  await sql()`UPDATE media_jobs SET status = 'queued', provider = ${mediaProvider()} WHERE status = 'waiting_provider'`;
  let done = 0;
  while (Date.now() - started < budgetMs) {
    const job = ((await sql()`
      UPDATE media_jobs SET status = 'running', updated_at = now()
      WHERE id = (SELECT id FROM media_jobs WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED)
      RETURNING id, client_id, item_id, site_id, kind, brief, status, output_url, error
    `) as MediaJob[])[0];
    if (!job) break;
    try {
      const out = await render(job);
      await sql()`UPDATE media_jobs SET status = 'done', output_url = ${out.url}, cost_usd = ${out.costUsd}, updated_at = now() WHERE id = ${job.id}`;
      if (job.kind === "hero-film" && job.site_id) await attachHeroFilm(job.site_id, out.url);
      done++;
    } catch (err) {
      await sql()`UPDATE media_jobs SET status = 'failed', error = ${err instanceof Error ? err.message.slice(0, 500) : "failed"}, updated_at = now() WHERE id = ${job.id}`;
    }
  }
  return done;
}

/** Puts a finished hero film on the site's homepage hero. */
async function attachHeroFilm(siteId: string, url: string) {
  const rows = (await sql()`SELECT doc FROM sites WHERE id = ${siteId}`) as { doc: { pages: { slug: string; sections: { type: string; video?: string | null }[] }[] } }[];
  const doc = rows[0]?.doc;
  if (!doc) return;
  const home = doc.pages.find((p) => p.slug === "");
  const hero = home?.sections.find((s) => s.type === "hero");
  if (!hero) return;
  hero.video = url;
  await sql()`UPDATE sites SET doc = ${JSON.stringify(doc)}::jsonb, updated_at = now() WHERE id = ${siteId}`;
}
