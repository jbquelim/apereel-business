import { NextResponse } from "next/server";
import { pendingMediaJobs, processMediaJobs } from "@/lib/media";

// Collects renders inside the request itself: submit and collect, wait 30
// seconds, repeat, for up to about 4 minutes (a sleeping background task
// was dropped by the platform). If renders are still pending, it starts a
// fresh call before returning. Also run by the daily cron, by services when
// they queue renders, and nudged by open studio and admin pages.
// GET = cron, POST = internal. CRON_SECRET-gated.

export const maxDuration = 300;
const WINDOW_MS = 240_000;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return !!secret && (request.headers.get("authorization") === `Bearer ${secret}` || request.headers.get("x-internal-secret") === secret);
}

async function round(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const started = Date.now();
  let submitted = 0;
  let finished = 0;
  let pending = 0;
  while (Date.now() - started < WINDOW_MS) {
    const r = await processMediaJobs(60_000);
    submitted += r.submitted;
    finished += r.finished;
    pending = await pendingMediaJobs();
    if (pending === 0) break;
    await new Promise((res) => setTimeout(res, 30_000));
  }
  if (pending > 0) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    // Start the next window; it runs on its own, we only wait for it to begin.
    await fetch(`${base}/api/media/poll`, { method: "POST", headers: { "x-internal-secret": process.env.CRON_SECRET ?? "" }, signal: AbortSignal.timeout(4_000) }).catch(() => null);
  }
  return NextResponse.json({ ok: true, submitted, finished, pending });
}

export const GET = round;
export const POST = round;
