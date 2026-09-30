import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";
import { CHECKOUT_CURRENCY, getStripe } from "@/lib/stripe";
import { tierById } from "@/lib/analysis-tiers";
import { attachSession, createOrder } from "@/lib/orders";
import { isAdmin } from "@/lib/admin-auth";

// Starts a paid analysis: records a pending order, then hands the visitor to
// Stripe's hosted Checkout. Nothing is fulfilled here — the signed webhook
// (app/api/stripe/webhook) is the only place an order becomes paid.
//
// Until live payments are switched on (NEXT_PUBLIC_GROWTH_PLAN=on) visitors
// can't pay: their click is saved as a request for John to run from /admin.
// Signed-in admins still get the Stripe sandbox checkout, for testing.

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function siteUrl(request: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return new URL(request.url).origin;
}

function parseSite(raw: unknown): { url: string; domain: string } | null {
  if (typeof raw !== "string" || !raw.trim() || raw.length > 300) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return null;
    return { url: `https://${u.hostname}`, domain: u.hostname.replace(/^www\./, "").toLowerCase() };
  } catch {
    return null;
  }
}

// Dashboard label for this checkout flow: a fixed name plus 8 random letters.
const INTEGRATION_ID = `growth_plan_${randomBytes(8)
  .toString("base64")
  .replace(/[^a-z]/gi, "")
  .toLowerCase()
  .padEnd(8, "x")
  .slice(0, 8)}`;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: { url?: unknown; email?: unknown; name?: unknown; tier?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const site = parseSite(body.url);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  if (!site) return NextResponse.json({ ok: false, error: "Please enter a valid website." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  const tier = tierById(typeof body.tier === "string" ? body.tier : "growth");
  const orderId = randomUUID();

  if (process.env.NEXT_PUBLIC_GROWTH_PLAN !== "on" && !(await isAdmin())) {
    try {
      await createOrder({
        id: orderId,
        domain: site.domain,
        url: site.url,
        email,
        name: name || null,
        amountCents: tier.priceCents,
        currency: CHECKOUT_CURRENCY,
        tier: tier.id,
        status: "requested",
      });
      await notifyRequest({ id: orderId, domain: site.domain, email, name, tier: tier.name });
      return NextResponse.json({ ok: true, requested: true });
    } catch (err) {
      console.error("Analysis request failed:", err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: "We couldn't save your request. Please try again in a moment." }, { status: 500 });
    }
  }

  try {
    await createOrder({
      id: orderId,
      domain: site.domain,
      url: site.url,
      email,
      name: name || null,
      amountCents: tier.priceCents,
      currency: CHECKOUT_CURRENCY,
      tier: tier.id,
    });

    const base = siteUrl(request);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CHECKOUT_CURRENCY,
            unit_amount: tier.priceCents,
            product_data: {
              name: `Apereel ${tier.name}: ${site.domain}`,
              description: `${tier.tagline} ${tier.delivery}`,
            },
          },
        },
      ],
      customer_email: email,
      client_reference_id: orderId,
      metadata: { order_id: orderId, domain: site.domain, tier: tier.id },
      payment_intent_data: { metadata: { order_id: orderId, domain: site.domain, tier: tier.id } },
      integration_identifier: INTEGRATION_ID,
      success_url: `${base}/growth-plan/thanks?tier=${tier.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?growthplan=cancelled#audit`,
    });

    await attachSession(orderId, session.id);
    if (!session.url) throw new Error("Checkout session has no URL");
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Checkout creation failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "We couldn't start the checkout. Please try again in a moment." },
      { status: 500 },
    );
  }
}

async function notifyRequest(r: { id: string; domain: string; email: string; name: string; tier: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.apereel.com").replace(/\/$/, "");
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"],
        reply_to: r.email,
        subject: `${r.tier} requested: ${r.domain}`,
        text: [
          `${r.name || "Someone"} <${r.email}> asked for the ${r.tier} for ${r.domain}.`,
          `No payment was taken (checkout isn't live yet).`,
          ``,
          `Run it from admin: ${base}/admin/orders/${r.id}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("Request notification failed:", err instanceof Error ? err.message : err);
  }
}
