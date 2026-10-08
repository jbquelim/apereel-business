import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import { NEXT_STAGE, generateMonth, type MonthStage } from "./content-engine";
import { generateAdsMonth } from "./ads-engine";
import { buildSite, getSiteForClient } from "./site-builder";
import { importCatalogStep } from "./catalog-import";
import { kickMediaWorker } from "./media";
import { ensureSiteAnalysis } from "./site-analysis";
import { groupCategories } from "./category-groups";
import { MAX_ATTEMPTS, getBuild, releaseGate, setBuild } from "./site-release";
import { notifyJohn } from "./notify";
import { releaseMonth } from "./content-release";
import { buildFacets } from "./facets";
import { expandGuides, writeAnalysisPages } from "./site-pages";

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
  // Content and ads: the month's items, then the release gate (lib/content-release): checked, repaired or held, then released.
  if (client.service === "premium-creative") {
    const step = stage ?? "posts";
    const summary = await generateMonth(client, step);
    const next = NEXT_STAGE[step];
    return next ? { summary, next } : { summary: `${summary}; ${await releaseMonth(client, base)}`, next: null };
  }
  if (client.service === "advertising") {
    const r = await generateAdsMonth(client);
    return { summary: `${r.statics} static ads, ${r.carousels} carousels, ${r.animated} animated, ${r.videos} video ads; ${await releaseMonth(client, base)}`, next: null };
  }
  // Website: the $30 analysis first (internal, never sent), then the build
  // that follows it, then catalog import steps until every product is on the
  // site, then the main categories.
  if (stage === "catalog") {
    // A services site has no catalog: importing would replace its services with nothing.
    const svc = await getSiteForClient(client.id);
    if (svc?.doc.kind === "services") return { summary: "services site: no catalog to import", next: "pages" };
    const site = await getSiteForClient(client.id);
    if (!site) return { summary: "no site to import into", next: null };
    const cap = client.tier === "fix" ? 300 : 20_000;
    const r = await importCatalogStep(site, client.domain, 240_000, cap);
    if (r.remaining > 0) return { summary: `catalog: ${r.products} products in ${r.categories} categories, ${r.remaining} still to read`, next: "catalog" };
    const fresh = await getSiteForClient(client.id);
    const groups = fresh ? await groupCategories(fresh, client.domain, client.id).catch((err) => (console.error("Category groups:", err instanceof Error ? err.message : err), 0)) : 0;
    return { summary: `catalog: ${r.products} products in ${r.categories} categories${groups ? `, ${groups} main categories` : ""}`, next: "pages" };
  }
  if (stage === "pages") {
    // Spec filters (no AI), the pages the analysis says are missing, then the quality checks.
    const site = await getSiteForClient(client.id);
    if (!site) return { summary: "no site", next: null };
    if (site.doc.catalogSize) await buildFacets(site).catch((err) => console.error("Facets:", err instanceof Error ? err.message : err));
    const withFacets = (await getSiteForClient(client.id)) ?? site;
    // A catalog repair keeps the analysis pages already written (a copy repair rebuilt them away).
    const kept = withFacets.doc.pages.some((p) => p.source === "analysis") && !!(await getBuild(client.id))?.repairs?.length;
    const pages = kept ? 0 : await writeAnalysisPages(withFacets, client).catch((err) => (console.error("Analysis pages:", err instanceof Error ? err.message : err), 0));
    // Guides that came out short get more depth (about $0.015 each).
    const written = await getSiteForClient(client.id);
    if (pages && written) await expandGuides(written, client.id).catch((err) => console.error("Expand guides:", err instanceof Error ? err.message : err));
    // The release gate: released to the client, repaired once, or held for John (lib/site-release).
    const gate = await releaseGate(client, base);
    return { summary: `${pages} pages from the analysis; ${gate.summary}`, next: gate.next };
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
  // Then the whole catalog, categorised the way the business does it; a services site has none to import.
  if (site.doc.kind === "services") return { summary: `services site built: /sites/${site.slug} (${site.doc.products.length} services)`, next: "pages" };
  return { summary: `site built: /sites/${site.slug}`, next: "catalog" };
}

/** Starts the next step in a fresh function call (internal, CRON_SECRET). */
export async function startStep(base: string, clientId: string, stage: MonthStage): Promise<boolean> {
  const res = await fetch(`${base}/api/ai-services/run`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-secret": process.env.CRON_SECRET ?? "" },
    body: JSON.stringify({ clientId, stage }),
    signal: AbortSignal.timeout(25_000),
  }).catch((err) => (console.error("Next step slow to start:", err instanceof Error ? err.message : err), "unknown" as const));
  // A slow start may still have started (Grand Brass's did): only a refusal counts as not started; the watchdog catches the rest.
  return res === "unknown" || res.ok;
}

/** Active monthly clients (content, ads) with nothing generated this month yet. */
export async function clientsDueThisMonth(limit: number): Promise<Client[]> {
  if (!process.env.DATABASE_URL) return [];
  const batch = new Date().toISOString().slice(0, 7);
  return (await neon(process.env.DATABASE_URL)`
    SELECT c.* FROM clients c
    WHERE c.status = 'active' AND c.service IN ('premium-creative', 'advertising')
      AND NOT EXISTS (SELECT 1 FROM content_items i WHERE i.client_id = c.id AND i.batch = ${batch})
      -- A month that failed and was reported to John is his to re-run, not the cron's.
      AND NOT (coalesce(c.build->>'batch', '') = ${batch} AND c.build->>'status' = 'failed')
    ORDER BY c.created_at LIMIT ${limit}
  `) as Client[];
}

/** Runs a step, then starts the next one or ends the run (lock released, renders started). */
export async function runAndContinue(client: Client, step: MonthStage | undefined, base: string) {
  // Every run records each step (lib/site-release); a new run starts afresh. Content and ads note the month too.
  const stageName: MonthStage = step ?? (client.service === "web-development" ? "analysis" : client.service === "advertising" ? "ads" : "posts");
  const batch = client.service === "web-development" ? {} : { batch: new Date().toISOString().slice(0, 7) };
  await setBuild(client.id, step ? { status: "building", stage: stageName, ...batch } : { status: "building", stage: stageName, attempts: 0, repairs: [], issues: [], error: null, ...batch }).catch(() => null);
  let next: MonthStage | null = null;
  try {
    const r = await runService(client, step, base);
    next = r.next;
    console.log(`AI service for ${client.domain}${step ? ` (${step})` : ""}: ${r.summary}`);
    await setBuild(client.id, { attempts: 0, error: null }).catch(() => null);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`AI service failed for ${client.domain}${step ? ` (${step})` : ""}:`, message);
    {
      // Retried (a fresh call), then reported: a run never stops silently.
      const build = await getBuild(client.id).catch(() => null);
      const attempts = (build?.stage === stageName ? build.attempts ?? 0 : 0) + 1;
      if (attempts < MAX_ATTEMPTS) {
        await setBuild(client.id, { stage: stageName, attempts, error: message });
        await new Promise((r) => setTimeout(r, 15_000));
        next = stageName;
      } else {
        await setBuild(client.id, { status: "failed", stage: stageName, attempts, error: message });
        await notifyJohn(`${client.service === "web-development" ? "Website build" : client.service === "advertising" ? "Ads month" : "Content month"} failed: ${client.domain}`, `The "${stageName}" step failed ${attempts} times. Last error: ${message}\n\nThe client sees "being finished". Fix the cause, then run it again on ${base}/admin/clients`);
      }
    }
  }
  if (next) {
    // Long builds outlast the 15-minute lock; each step renews it.
    if (process.env.DATABASE_URL) await neon(process.env.DATABASE_URL)`UPDATE clients SET running_since = now() WHERE id = ${client.id}`;
    if (await startStep(base, client.id, next)) return;
    {
      await setBuild(client.id, { status: "failed", stage: next, error: "the next step could not be started" }).catch(() => null);
      await notifyJohn(`Run stopped: ${client.domain}`, `The "${next}" step could not be started. Run it again on ${base}/admin/clients`);
    }
  }
  await releaseRun(client.id);
  await kickMediaWorker(base);
}
