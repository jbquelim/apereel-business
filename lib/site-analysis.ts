import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import type { GrowthReport } from "./growth-report";
import { triggerStage } from "./growth-trigger";
import { scrubRanges } from "./site-qa";

// Every website build starts from the full $30 analysis (Growth Plan +
// Preview) of the business. It runs as an internal order: same pipeline,
// never emailed or shown to the customer. A recent analysis of the domain
// (theirs or ours, under 90 days old) is reused instead of paying again,
// unless John asked for a fresh one (clients.analysis_after): older
// analyses are then ignored and the free audit is re-run too.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const DONE = ["internal", "needs_review", "sent"];
/** Longest a build waits for the analysis before going ahead without it. */
const MAX_WAIT_MIN = 40;

export type AnalysisState = "ready" | "waiting" | "none";

/** When John asked for a fresh analysis of a domain, or null. */
async function freshSince(domain: string): Promise<string | null> {
  const rows = (await sql()`SELECT max(analysis_after) AS at FROM clients WHERE domain = ${domain}`) as { at: string | null }[];
  return rows[0]?.at ?? null;
}

/** Starts the analysis if there isn't one; says whether the build can go ahead. */
export async function ensureSiteAnalysis(client: Client, base: string): Promise<AnalysisState> {
  const since = await freshSince(client.domain);
  const rows = (await sql()`
    SELECT id, status, created_at > now() - make_interval(mins => ${MAX_WAIT_MIN}) AS fresh
    FROM growth_orders
    WHERE domain = ${client.domain} AND tier = 'preview' AND status NOT IN ('pending', 'requested', 'failed')
      AND created_at > now() - interval '90 days'
      AND (${since}::timestamptz IS NULL OR created_at > ${since}::timestamptz)
    ORDER BY (status = ANY(${DONE})) DESC, created_at DESC LIMIT 1
  `) as { id: string; status: string; fresh: boolean }[];
  const o = rows[0];
  if (o) {
    if (DONE.includes(o.status)) return "ready";
    if (o.status === "generation_failed" || !o.fresh) return "none";
    return "waiting";
  }
  const id = randomUUID();
  await sql()`
    INSERT INTO growth_orders (id, domain, url, email, name, amount_cents, currency, tier, status, paid_at, internal, fresh_audit)
    VALUES (${id}, ${client.domain}, ${`https://${client.domain}`}, 'john@apereel.com', 'Website build', 0, 'usd', 'preview', 'paid', now(), true, ${since != null})
  `;
  try {
    await triggerStage(base, id, "collect");
    return "waiting";
  } catch (err) {
    console.error(`Analysis for ${client.domain} did not start:`, err instanceof Error ? err.message : err);
    return "none";
  }
}

/** The latest finished analysis of a domain, for the build to follow. */
export async function siteAnalysis(domain: string): Promise<GrowthReport | null> {
  const since = await freshSince(domain);
  const rows = (await sql()`
    SELECT report FROM growth_orders
    WHERE domain = ${domain} AND status = ANY(${DONE}) AND report ? 'plan'
      AND (${since}::timestamptz IS NULL OR created_at > ${since}::timestamptz)
    ORDER BY (tier = 'preview') DESC, created_at DESC LIMIT 1
  `) as { report: GrowthReport }[];
  return rows[0]?.report ?? null;
}

/** The analysis as instructions for whoever writes the site. */
export function analysisBrief(r: GrowthReport | null): string {
  if (!r?.plan) return "";
  const p = r.preview;
  const lines = [
    `OUR ANALYSIS OF THIS BUSINESS (the site must act on it):`,
    `SUMMARY: ${r.plan.summary}`,
    `PRIORITIES:\n${r.plan.priorities.map((x, i) => `${i + 1}. ${x.title}: ${x.action}`).join("\n")}`,
    ...(r.audit.inventoryInsights?.length ? [`CATALOG INSIGHTS: ${r.audit.inventoryInsights.join(" ")}`] : []),
    ...(r.audit.translateAdvantage?.touchpoints?.length
      ? [`TOUCHPOINTS: ${r.audit.translateAdvantage.touchpoints.map((t) => `${t.name}: ${t.action}`).join("; ")}`]
      : []),
    ...(p?.homepage ? [`HOMEPAGE DRAFT FROM THE ANALYSIS: "${p.homepage.headline}" / ${p.homepage.subheadline} / proof: ${p.homepage.proofPoints.join("; ")}`] : []),
  ];
  return scrubRanges(lines.join("\n"));
}
