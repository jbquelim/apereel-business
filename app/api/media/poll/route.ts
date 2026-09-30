import { NextResponse, after } from "next/server";
import { pendingMediaJobs, processMediaJobs } from "@/lib/media";

// Renders take several minutes, so this works in rounds: submit queued jobs
// to Higgsfield and collect finished ones, then, while anything is still
// pending, call itself again a few minutes later. Started whenever a
// service queues renders, plus once a day by cron as a backstop (the Hobby
// plan allows only daily crons). GET = cron, POST = internal.

export const maxDuration = 300;
const ROUND_GAP_MS = 150_000;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return !!secret && (request.headers.get("authorization") === `Bearer ${secret}` || request.headers.get("x-internal-secret") === secret);
}

async function round(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const result = await processMediaJobs(100_000);
  const pending = await pendingMediaJobs();
  if (pending > 0) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    after(async () => {
      await new Promise((r) => setTimeout(r, ROUND_GAP_MS));
      await fetch(`${base}/api/media/poll`, { method: "POST", headers: { "x-internal-secret": process.env.CRON_SECRET ?? "" } }).catch(() => null);
    });
  }
  return NextResponse.json({ ok: true, ...result, pending });
}

export const GET = round;
export const POST = round;
