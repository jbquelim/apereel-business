import { NextResponse } from "next/server";
import { adminEmails, makeLoginToken } from "@/lib/admin-auth";

// Emails a one-time sign-in link to the admin address. The response is the
// same whether or not the address matched, so it can't be used to probe.

const hits = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 15 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > 5) return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });

  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const address = (email ?? "").trim().toLowerCase();
  if (address && adminEmails().includes(address) && process.env.RESEND_API_KEY) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const link = `${base}/api/admin/verify?token=${encodeURIComponent(makeLoginToken())}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [address],
        subject: "Your Apereel admin sign-in link",
        text: `Sign in to review Growth Plans:\n\n${link}\n\nThis link works once in the next 15 minutes. If you didn't ask for it, ignore this email.`,
      }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
