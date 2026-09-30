import { NextResponse } from "next/server";
import { processMediaJobs } from "@/lib/media";

// Every 5 minutes (vercel.json): submit queued renders to Higgsfield and
// collect finished ones. Renders take several minutes, so nothing waits.

export const maxDuration = 120;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await processMediaJobs(100_000)) });
}
