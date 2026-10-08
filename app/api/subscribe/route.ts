import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createServiceCheckout, findTier, SERVICE_NAME } from "@/lib/billing";
import { createClient, type AiService } from "@/lib/clients";
import { pricedServices } from "@/lib/service-prices";

// Starts a service subscription (Ads, Content) or website purchase with
// Stripe Checkout; the webhook creates the client once paid. Until live
// payments are on (NEXT_PUBLIC_GROWTH_PLAN=on), visitors' sign-ups are saved
// as requests for John to activate; signed-in admins get the sandbox.

const SERVICES: AiService[] = ["premium-creative", "advertising", "web-development"];
const hits = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  hits.set(ip, [...recent, now]);
  if (recent.length >= 10) return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const service = SERVICES.find((s) => s === b.service);
  const tierId = b.tier === "fix" || b.tier === "build" || b.tier === "grow" ? b.tier : null;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const name = typeof b.name === "string" && b.name.trim() ? b.name.trim().slice(0, 120) : null;
  let domain = "";
  try {
    const raw = typeof b.url === "string" ? b.url.trim() : "";
    domain = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    /* invalid */
  }
  if (!service || !tierId) return NextResponse.json({ ok: false, error: "Choose a service and tier." }, { status: 400 });
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) return NextResponse.json({ ok: false, error: "Enter your website." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  const tier = findTier(service, tierId, await pricedServices());
  if (!tier || tier.price == null) return NextResponse.json({ ok: false, error: "That tier isn't available." }, { status: 400 });

  if (process.env.NEXT_PUBLIC_GROWTH_PLAN !== "on" && !(await isAdmin())) {
    // Ordering authorizes us to access their site on their behalf (the form says so): recorded with the client.
    const client = await createClient({ domain, email, name, service, tier: tierId, authorized: true });
    const { neon } = await import("@neondatabase/serverless");
    await neon(process.env.DATABASE_URL!)`UPDATE clients SET status = 'requested' WHERE id = ${client.id}`;
    if (process.env.RESEND_API_KEY) {
      const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.apereel.com").replace(/\/$/, "");
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Apereel <noreply@apereel.com>",
          to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"],
          reply_to: email,
          subject: `${SERVICE_NAME[service]} ${tier.label} requested: ${domain}`,
          text: `${name ?? "Someone"} <${email}> asked for ${SERVICE_NAME[service]} ${tier.label} ($${tier.price}${tier.cadence === "monthly" ? "/month" : ""}) for ${domain}.\nNo payment taken (checkout isn't live yet).\n\nActivate it: ${base}/admin/clients`,
        }),
      }).catch(() => null);
    }
    return NextResponse.json({ ok: true, requested: true });
  }

  try {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    return NextResponse.json({ ok: true, url: await createServiceCheckout({ service, tier, domain, email, name, base }) });
  } catch (err) {
    console.error("Service checkout failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "We couldn't open checkout. Please try again in a moment." }, { status: 500 });
  }
}
