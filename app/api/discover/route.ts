import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { triggerStage } from "@/lib/growth-trigger";
import { refreshTrackedStores } from "@/lib/tracked-refresh";
import { clientsDueThisMonth } from "@/lib/ai-services";
import { failStaleBuilds } from "@/lib/site-release";
import { processMediaJobs } from "@/lib/media";

// Snowball discovery: drain the crawl queue by running the audit pipeline in
// ingest mode (classification + inventory + competitor discovery only) on
// queued domains. Processes waves of parallel audits until the per-run cap or
// time budget is reached; every processed domain enqueues its own competitors.

export const maxDuration = 300;

const WAVE_SIZE = 6;
const MAX_PER_RUN = 30;
// Stop claiming new waves late enough to matter, early enough that a slow
// wave (audit timeout 120s) still finishes inside maxDuration.
const TIME_BUDGET_MS = 170_000;
const MAX_ATTEMPTS = 3;
// The tracked-store refresh runs first and its time comes out of the budget.
const REFRESH_BUDGET_MS = 60_000;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  // Freshness policy: live-feed businesses with stale data re-enter the
  // rotation, so price history accrues on a guaranteed cadence instead of
  // whenever a domain happens to be re-audited.
  await sql`
    UPDATE crawl_queue SET status = 'pending', attempts = 0
    WHERE status = 'done'
      AND domain IN (
        SELECT domain FROM businesses
        WHERE platform = 'live'
          AND last_crawled < now() - interval '14 days'
      )
  `;

  // Cron invocations arrive on the raw *.vercel.app deployment URL, which
  // sits behind deployment protection — self-calls through it get an auth
  // page, not the API. Route those through the public domain instead.
  const host = request.headers.get("host") ?? "";
  const base =
    !host || host.endsWith(".vercel.app")
      ? "https://www.apereel.com"
      : `https://${host}`;

  // Safety net for paid Growth Plans: restart any order whose report
  // generation never began (e.g. the webhook's trigger failed).
  const stuck = (await sql`
    SELECT id FROM growth_orders
    WHERE status = 'paid' AND paid_at < now() - interval '10 minutes'
    LIMIT 5
  `) as { id: string }[];
  for (const o of stuck) {
    await triggerStage(base, o.id, "collect").catch((err) =>
      console.error("Growth Plan restart failed:", o.id, err instanceof Error ? err.message : err),
    );
  }

  // Website builds that stopped without reporting are flagged to John (lib/site-release).
  await failStaleBuilds(base).catch((err) => console.error("Stale builds:", err instanceof Error ? err.message : err));

  // AI services: start this month's content and ads for clients who don't
  // have them yet (each in its own function), and render queued video.
  for (const c of await clientsDueThisMonth(5).catch(() => [])) {
    await fetch(`${base}/api/ai-services/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-secret": process.env.CRON_SECRET ?? "" },
      body: JSON.stringify({ clientId: c.id }),
      signal: AbortSignal.timeout(20_000),
    }).catch((err) => console.error("AI service start failed:", c.domain, err instanceof Error ? err.message : err));
  }
  await processMediaJobs(20_000).catch((err) => console.error("Media jobs failed:", err instanceof Error ? err.message : err));

  // Cheap, AI-free refresh of tracked stores (competitors of audited
  // businesses) so price and catalog history accrues on a steady cadence.
  const refreshStarted = Date.now();
  const refreshed = await refreshTrackedStores(REFRESH_BUDGET_MS).catch((err) => {
    console.error("Tracked refresh failed:", err instanceof Error ? err.message : err);
    return [];
  });
  // Discovery gets whatever time the refresh didn't use.
  const discoveryBudget = TIME_BUDGET_MS - (Date.now() - refreshStarted);

  const startedAt = Date.now();
  const processed: { domain: string; ok: boolean; detail?: string }[] = [];

  while (
    processed.length < MAX_PER_RUN &&
    Date.now() - startedAt < discoveryBudget
  ) {
    const batch = (await sql`
      UPDATE crawl_queue SET status = 'running', attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM crawl_queue
        WHERE status IN ('pending', 'running') AND attempts < ${MAX_ATTEMPTS}
        ORDER BY enqueued_at
        LIMIT ${Math.min(WAVE_SIZE, MAX_PER_RUN - processed.length)}
      )
      RETURNING id, domain
    `) as { id: number; domain: string }[];

    if (batch.length === 0) break;

    const wave = await Promise.all(
      batch.map(async (row) => {
        let ok = false;
        let detail = "";
        try {
          const res = await fetch(`${base}/api/audit`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-ingest-secret": process.env.CRON_SECRET as string,
            },
            body: JSON.stringify({ url: `https://${row.domain}`, mode: "ingest" }),
            signal: AbortSignal.timeout(120_000),
          });
          const resBody = await res.text();
          detail = `${res.status} ${resBody.slice(0, 120)}`;
          ok = res.ok && JSON.parse(resBody).ok === true;
        } catch (err) {
          detail = String(err).slice(0, 200);
          console.error("Discovery audit failed for", row.domain, detail);
        }
        await sql`
          UPDATE crawl_queue
          SET status = ${ok ? "done" : "pending"}, processed_at = now()
          WHERE id = ${row.id}
        `;
        if (!ok) {
          await sql`
            UPDATE crawl_queue SET status = 'failed'
            WHERE id = ${row.id} AND attempts >= ${MAX_ATTEMPTS}
          `;
        }
        return { domain: row.domain, ok, detail: ok ? undefined : detail };
      }),
    );
    processed.push(...wave);
  }

  console.log(
    `Discovery run: ${processed.filter((p) => p.ok).length}/${processed.length} ok in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );
  return NextResponse.json({ ok: true, count: processed.length, processed, refreshed: refreshed.length });
}
