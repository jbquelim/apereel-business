import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Passwordless admin sign-in for John: an emailed one-time link (15 min)
// becomes a signed session cookie (7 days). Tokens are HMAC-signed with a key
// derived from CRON_SECRET, so nothing is stored and nothing can be forged.

export const SESSION_COOKIE = "apereel_admin";
const LOGIN_TTL_S = 15 * 60;
export const SESSION_TTL_S = 7 * 24 * 60 * 60;

function key(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET not set");
  return `apereel-admin-v1:${secret}`;
}

export function adminEmails(): string[] {
  return [process.env.CONTACT_TO_EMAIL, "john@apereel.com"]
    .filter((e): e is string => !!e)
    .map((e) => e.trim().toLowerCase());
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

function makeToken(kind: "login" | "session", ttl: number): string {
  const payload = `${kind}.${Math.floor(Date.now() / 1000) + ttl}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined, kind: "login" | "session"): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== kind) return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const makeLoginToken = () => makeToken("login", LOGIN_TTL_S);
export const makeSessionToken = () => makeToken("session", SESSION_TTL_S);
export const verifyLoginToken = (t: string | undefined) => verifyToken(t, "login");

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value, "session");
}

/** Same-origin check for admin POSTs (defence in depth on top of SameSite). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
