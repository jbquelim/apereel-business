import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Snowball discovery: drain the crawl queue by running the audit pipeline in
// ingest mode (classification + inventory + competitor discovery only) on
// queued domains. Processes waves of parallel audits until the per-run cap or
// time budget is reached; every processed domain enqueues its own competitors.

export const maxDuration = 300;

const WAVE_SIZE = 6;
const MAX_PER_RUN = 18;
// Stop claiming new waves late enough to matter, early enough that a slow
// wave (audit timeout 120s) still finishes inside maxDuration.
const TIME_BUDGET_MS = 150_000;
const MAX_ATTEMPTS = 3;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  // Cron invocations arrive on the raw *.vercel.app deployment URL, which
  // sits behind deployment protection — self-calls through it get an auth
  // page, not the API. Route those through the public domain instead.
  const host = request.headers.get("host") ?? "";
  const base =
    !host || host.endsWith(".vercel.app")
      ? "https://www.apereel.com"
      : `https://${host}`;

  const startedAt = Date.now();
  const processed: { domain: string; ok: boolean; detail?: string }[] = [];

  while (
    processed.length < MAX_PER_RUN &&
    Date.now() - startedAt < TIME_BUDGET_MS
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
  return NextResponse.json({ ok: true, count: processed.length, processed });
}
