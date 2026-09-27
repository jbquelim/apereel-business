import { NextResponse } from "next/server";
import { SESSION_COOKIE, sameOrigin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
