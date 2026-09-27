import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_S, makeSessionToken, verifyLoginToken } from "@/lib/admin-auth";

// Turns a valid emailed sign-in link into a session cookie.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? undefined;
  if (!verifyLoginToken(token)) {
    return NextResponse.redirect(new URL("/admin/login?expired=1", url.origin));
  }
  const res = NextResponse.redirect(new URL("/admin", url.origin));
  res.cookies.set(SESSION_COOKIE, makeSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  return res;
}
