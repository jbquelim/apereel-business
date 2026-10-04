import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import { NEXT_STAGE, generateMonth, type MonthStage } from "./content-engine";
import { generateAdsMonth } from "./ads-engine";
import { buildSite, getSiteForClient } from "./site-builder";
import { importCatalogStep } from "./catalog-import";
import { kickMediaWorker } from "./media";
import { ensureSiteAnalysis } from "./site-analysis";
import { groupCategories } from "./category-groups";
import { runSiteQa } from "./site-qa-run";

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
export async function runService(client: Client, stage: MonthStage | undefined, base: string): Promise<{ summary: string; next: MonthStage | null }> {
  if (client.service === "premium-creative") {
    const step = stage ?? "posts";
    return { summary: await generateMonth(client, step), next: NEXT_STAGE[step] };
  }
  if (client.service === "advertising") {
    const r = await generateAdsMonth(client);
    return { summary: `${r.statics} static ads, ${r.carousels} carousels, ${r.animated} animated, ${r.videos} video ads`, next: null };
  }
  // Website: the $30 analysis first (internal, never sent), then the build
  // that follows it, then catalog import steps until every product is on the
  // site, then the main categories.
  if (stage === "catalog") {
    const site = await getSiteForClient(client.id);
    if (!site) return { summary: "no site to import into", next: null };
    const cap = client.tier === "fix" ? 300 : 20_000;
    const r = await importCatalogStep(site, client.domain, 240_000, cap);
    if (r.remaining > 0) return { summary: `catalog: ${r.products} products in ${r.categories} categories, ${r.remaining} still to read`, next: "catalog" };
    const fresh = await getSiteForClient(client.id);
    const groups = fresh ? await groupCategories(fresh, client.domain, client.id).catch((err) => (console.error("Category groups:", err instanceof Error ? err.message : err), 0)) : 0;
    // Last: the quality checks, so John sees what needs attention before the customer does.
    const qa = fresh ? await runSiteQa(fresh.id).catch((err) => (console.error("Site QA:", err instanceof Error ? err.message : err), null)) : null;
    return { summary: `catalog: ${r.products} products in ${r.categories} categories${groups ? `, ${groups} main categories` : ""}${qa ? `, ${qa.length} QA issues` : ""}`, next: null };
  }
  if (stage !== "build") {
    // Waits up to ~3.5 minutes per step for the analysis, then hands on to a fresh step.
    const until = Date.now() + (stage === "analysis" ? 210_000 : 0);
    let state = await ensureSiteAnalysis(client, base);
    while (state === "waiting" && Date.now() < until) {
      await new Promise((r) => setTimeout(r, 20_000));
      state = await ensureSiteAnalysis(client, base);
    }
    if (state === "waiting") return { summary: "waiting for the analysis", next: "analysis" };
    if (stage === "analysis") return { summary: `analysis ${state === "ready" ? "ready" : "unavailable, building without it"}`, next: "build" };
  }
  const site = await buildSite(client);
  // Then the whole catalog, categorised the way the business does it.
  return { summary: `site built: /sites/${site.slug}`, next: "catalog" };
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
    const r = await runService(client, step, base);
    next = r.next;
    console.log(`AI service for ${client.domain}${step ? ` (${step})` : ""}: ${r.summary}`);
  } catch (err) {
    console.error(`AI service failed for ${client.domain}${step ? ` (${step})` : ""}:`, err instanceof Error ? err.message : err);
  }
  if (next) {
    // Long builds outlast the 15-minute lock; each step renews it.
    if (process.env.DATABASE_URL) await neon(process.env.DATABASE_URL)`UPDATE clients SET running_since = now() WHERE id = ${client.id}`;
    return startStep(base, client.id, next);
  }
  await releaseRun(client.id);
  await kickMediaWorker(base);
}
