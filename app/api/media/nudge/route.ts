import { NextResponse } from "next/server";
import { nudgeMediaJobs } from "@/lib/media";

// Open studio and admin pages call this every minute while renders are
// pending. At most one collection round a minute runs, whoever asks.

export const maxDuration = 60;

export async function POST() {
  return NextResponse.json(await nudgeMediaJobs());
}
