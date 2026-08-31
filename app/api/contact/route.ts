import { NextResponse } from "next/server";
import { validateContact } from "@/lib/contact";
import { site } from "@/lib/site";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

async function deliver(payload: {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  message: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;
}) {
  const to = (process.env.CONTACT_TO_EMAIL || site.email).trim();
  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "(not provided)"}`,
    `Company: ${payload.company || "(not provided)"}`,
    `Website: ${payload.website || "(not provided)"}`,
    `Marketing opt-in: ${payload.marketingOptIn ? "Yes" : "No"}`,
    "",
    payload.message,
  ].join("\n");

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [to],
        reply_to: payload.email,
        subject: `Apereel inquiry from ${payload.name}`,
        text,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Resend error:", response.status, errorBody);
      throw new Error("Unable to send email.");
    }

    // Auto-reply to the person who submitted
    const firstName = payload.name.split(" ")[0];
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [payload.email.trim()],
        reply_to: site.email,
        subject: `Thanks for reaching out, ${firstName}`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a; max-width: 560px;">
<p>Hi ${firstName},</p>
<p>Thank you for getting in touch with Apereel. We've received your message and will get back to you within one business day.</p>
<p>In the meantime, if anything is time-sensitive, feel free to reply directly to this email.</p>
<p>
John Lim<br>
Founder, Apereel<br>
<a href="https://apereel.com" style="color: #3d9eff;">apereel.com</a>
</p>
</div>`,
      }),
    }).catch((err) => console.error("Auto-reply failed:", err));

    return;
  }

  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        website: payload.website,
        message: payload.message,
        marketing_opt_in: payload.marketingOptIn ? "Yes" : "No",
        _subject: `Apereel inquiry from ${payload.name}`,
        _template: "table",
        _captcha: "false",
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Unable to send email.");
  }
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Please wait a few minutes before sending again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const input = body as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    message?: string;
    acceptTerms?: boolean;
    marketingOptIn?: boolean;
    honeypot?: string;
  };

  const result = validateContact({
    name: input.name ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    company: input.company ?? "",
    website: input.website ?? "",
    message: input.message ?? "",
    acceptTerms: input.acceptTerms ?? false,
    marketingOptIn: input.marketingOptIn ?? false,
    honeypot: input.honeypot ?? "",
  });

  if (result.data.honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Please check the form and try again.", errors: result.errors },
      { status: 400 },
    );
  }

  try {
    await deliver({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      company: result.data.company,
      website: result.data.website,
      message: result.data.message,
      acceptTerms: result.data.acceptTerms,
      marketingOptIn: result.data.marketingOptIn,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: `Unable to send right now. Please email ${site.email} directly.`,
      },
      { status: 502 },
    );
  }
}
