import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Snowball discovery: drain the crawl queue by running the full audit pipeline
// on domains competitors were discovered from. Each run processes a small
// nightly batch — politeness and AI cost stay bounded, and every processed
// domain enqueues its own competitors, so the dataset grows without visitors.

export const maxDuration = 300;

const BATCH_SIZE = 4;
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

  const batch = (await sql`
    UPDATE crawl_queue SET status = 'running', attempts = attempts + 1
    WHERE id IN (
      SELECT id FROM crawl_queue
      WHERE status IN ('pending', 'running') AND attempts < ${MAX_ATTEMPTS}
      ORDER BY enqueued_at
      LIMIT ${BATCH_SIZE}
    )
    RETURNING id, domain
  `) as { id: number; domain: string }[];

  if (batch.length === 0) {
    return NextResponse.json({ ok: true, processed: [], message: "queue empty" });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.apereel.com";

  const processed = await Promise.all(
    batch.map(async (row) => {
      let ok = false;
      try {
        const res = await fetch(`${base}/api/audit`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: `https://${row.domain}` }),
          signal: AbortSignal.timeout(170_000),
        });
        ok = res.ok && (await res.json()).ok === true;
      } catch (err) {
        console.error("Discovery audit failed for", row.domain, err);
      }
      await sql`
        UPDATE crawl_queue
        SET status = ${ok ? "done" : "pending"} , processed_at = now()
        WHERE id = ${row.id}
      `;
      if (!ok) {
        await sql`
          UPDATE crawl_queue SET status = 'failed'
          WHERE id = ${row.id} AND attempts >= ${MAX_ATTEMPTS}
        `;
      }
      return { domain: row.domain, ok };
    }),
  );

  console.log(
    "Discovery run:",
    processed.map((p) => `${p.domain}=${p.ok ? "ok" : "retry"}`).join(", "),
  );
  return NextResponse.json({ ok: true, processed });
}
