import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import { NEXT_STAGE, generateMonth, type MonthStage } from "./content-engine";
import { generateAdsMonth } from "./ads-engine";
import { buildSite } from "./site-builder";
import { kickMediaWorker } from "./media";

// One entry point for every AI service: this month's content, this month's
// ads, or the website build. Used by John's button and the monthly cron.

/**
 * Marks a run as started; false when one started in the last 15 minutes
 * (a double click or a cron overlap must not pay for the same work twice).
 */
export async function claimRun(clientId: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const rows = await neon(process.env.DATABASE_URL)`
    UPDATE clients SET running_since = now()
    WHERE id = ${clientId} AND (running_since IS NULL OR running_since < now() - interval '15 minutes')
    RETURNING id
  `;
  return rows.length > 0;
}

export async function releaseRun(clientId: string) {
  if (process.env.DATABASE_URL) await neon(process.env.DATABASE_URL)`UPDATE clients SET running_since = NULL WHERE id = ${clientId}`;
}

/**
 * Runs one step of a client's service. Content runs in three steps (see
 * generateMonth); `next` names the step still to run, each in its own
 * function call so every step gets the full time limit.
 */
export async function runService(client: Client, stage?: MonthStage): Promise<{ summary: string; next: MonthStage | null }> {
  if (client.service === "premium-creative") {
    const step = stage ?? "posts";
    return { summary: await generateMonth(client, step), next: NEXT_STAGE[step] };
  }
  if (client.service === "advertising") {
    const r = await generateAdsMonth(client);
    return { summary: `${r.statics} static ads, ${r.carousels} carousels, ${r.animated} animated, ${r.videos} video ads`, next: null };
  }
  const site = await buildSite(client);
  return { summary: `site built: /sites/${site.slug}`, next: null };
}

/** Starts the next step in a fresh function call (internal, CRON_SECRET). */
export async function startStep(base: string, clientId: string, stage: MonthStage) {
  await fetch(`${base}/api/ai-services/run`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-secret": process.env.CRON_SECRET ?? "" },
    body: JSON.stringify({ clientId, stage }),
    signal: AbortSignal.timeout(10_000),
  }).catch((err) => console.error("Next step did not start:", err instanceof Error ? err.message : err));
}

/** Active monthly clients (content, ads) with nothing generated this month yet. */
export async function clientsDueThisMonth(limit: number): Promise<Client[]> {
  if (!process.env.DATABASE_URL) return [];
  const batch = new Date().toISOString().slice(0, 7);
  return (await neon(process.env.DATABASE_URL)`
    SELECT c.* FROM clients c
    WHERE c.status = 'active' AND c.service IN ('premium-creative', 'advertising')
      AND NOT EXISTS (SELECT 1 FROM content_items i WHERE i.client_id = c.id AND i.batch = ${batch})
    ORDER BY c.created_at LIMIT ${limit}
  `) as Client[];
}

/** Runs a step, then starts the next one or ends the run (lock released, renders started). */
export async function runAndContinue(client: Client, step: MonthStage | undefined, base: string) {
  let next: MonthStage | null = null;
  try {
    const r = await runService(client, step);
    next = r.next;
    console.log(`AI service for ${client.domain}${step ? ` (${step})` : ""}: ${r.summary}`);
  } catch (err) {
    console.error(`AI service failed for ${client.domain}${step ? ` (${step})` : ""}:`, err instanceof Error ? err.message : err);
  }
  if (next) return startStep(base, client.id, next);
  await releaseRun(client.id);
  await kickMediaWorker(base);
}
