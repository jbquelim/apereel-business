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
  company: string;
  website: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company || "(not provided)"}`,
    `Website: ${payload.website || "(not provided)"}`,
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
        from: process.env.CONTACT_FROM_EMAIL ?? "Apereel <onboarding@resend.dev>",
        to: [to],
        reply_to: payload.email,
        subject: `Apereel inquiry from ${payload.name}`,
        text,
      }),
    });
    if (!response.ok) {
      throw new Error("Unable to send email.");
    }
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
        company: payload.company,
        website: payload.website,
        message: payload.message,
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
    company?: string;
    website?: string;
    message?: string;
    honeypot?: string;
  };

  const result = validateContact({
    name: input.name ?? "",
    email: input.email ?? "",
    company: input.company ?? "",
    website: input.website ?? "",
    message: input.message ?? "",
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
      company: result.data.company,
      website: result.data.website,
      message: result.data.message,
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
