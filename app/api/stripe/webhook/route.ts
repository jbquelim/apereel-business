import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markFailed, markPaid } from "@/lib/orders";
import { triggerStage } from "@/lib/growth-trigger";
import { createPaidClient, endSubscription, setSubscription, type AiService } from "@/lib/clients";
import { startHosting, SERVICE_NAME } from "@/lib/billing";

function siteBase(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

// Stripe webhook: the ONLY place a Growth Plan order becomes paid. Every event
// is signature-verified against STRIPE_WEBHOOK_SECRET using the raw body, and
// order updates are conditional on status, so retries and duplicates are safe.

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Delayed payment methods complete while still unpaid; they're fulfilled
    // on async_payment_succeeded instead.
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status === "unpaid") break;
      if (session.metadata?.kind === "service") {
        await servicePaid(session, siteBase(request), event.livemode);
        break;
      }
      const orderId = session.client_reference_id ?? session.metadata?.order_id;
      if (!orderId) break;
      const order = await markPaid({
        id: orderId,
        sessionId: session.id,
        paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        amountCents: session.amount_total ?? null,
        livemode: event.livemode,
      });
      if (order) {
        after(async () => {
          await notifyNewOrder(order);
          try {
            await triggerStage(siteBase(request), order.id, "collect");
          } catch (err) {
            console.error("Growth Plan generation did not start:", err instanceof Error ? err.message : err);
          }
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const c = await endSubscription(event.data.object.id);
      if (c) await notifyJohn(`${SERVICE_NAME[c.service]} ended: ${c.domain}`, `${c.email}'s ${c.service === "web-development" ? "hosting" : "subscription"} ended.${c.service === "web-development" ? " Their site has been taken offline." : ""}`);
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      await notifyJohn(`Payment failed: ${inv.customer_email ?? "a client"}`, `Invoice ${inv.id} for ${(inv.amount_due / 100).toFixed(2)} ${inv.currency.toUpperCase()} failed. Stripe retries automatically.`);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const orderId = session.client_reference_id ?? session.metadata?.order_id;
      if (orderId) await markFailed(orderId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function notifyNewOrder(order: {
  id: string;
  domain: string;
  email: string;
  name: string | null;
  amount_cents: number;
  currency: string;
  livemode: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = process.env.CONTACT_TO_EMAIL || "john@apereel.com";
  const amount = `${(order.amount_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [to],
        subject: `${order.livemode ? "" : "[TEST] "}Growth Plan order: ${order.domain}`,
        text: [
          `New Growth Plan order${order.livemode ? "" : " (Stripe test mode, no real money)"}`,
          ``,
          `Website: ${order.domain}`,
          `Customer: ${order.name ?? "(no name)"} <${order.email}>`,
          `Paid: ${amount}`,
          `Order ID: ${order.id}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("Order notification failed:", err instanceof Error ? err.message : err);
  }
}

/** A paid service: the client, hosting for websites, the first run, and the studio link. */
async function servicePaid(session: Stripe.Checkout.Session, base: string, livemode: boolean) {
  const m = session.metadata ?? {};
  const client = await createPaidClient({
    domain: m.domain ?? "",
    name: m.name || null,
    email: session.customer_details?.email ?? session.customer_email ?? "",
    service: m.service as AiService,
    tier: m.tier as "fix" | "build" | "grow",
    checkoutSession: session.id,
    customer: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
    subscription: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
  });
  if (!client) return; // already handled (Stripe retries)
  after(async () => {
    if (client.service === "web-development") {
      try {
        const sub = await startHosting(session, client.id);
        if (sub) await setSubscription(client.id, sub);
      } catch (err) {
        console.error("Hosting subscription failed:", err instanceof Error ? err.message : err);
        await notifyJohn(`Hosting not set up: ${client.domain}`, `Create the $10/month hosting subscription by hand. ${err instanceof Error ? err.message : ""}`);
      }
    }
    await fetch(`${base}/api/ai-services/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-secret": process.env.CRON_SECRET ?? "" },
      body: JSON.stringify({ clientId: client.id }),
      signal: AbortSignal.timeout(20_000),
    }).catch((err) => console.error("First run did not start:", err instanceof Error ? err.message : err));
    const studio = `${base}/studio/${client.token}`;
    if (process.env.RESEND_API_KEY && client.email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "John Lim at Apereel <noreply@apereel.com>",
          reply_to: "john@apereel.com",
          to: [client.email],
          subject: `${livemode ? "" : "[TEST] "}Your Apereel ${SERVICE_NAME[client.service]} studio`,
          text: [
            client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,",
            "",
            client.service === "web-development"
              ? `Thank you. We're building your new website for ${client.domain} now from your own products, and we check every page before you see it. We'll email you as soon as it's ready, usually within the hour.`
              : `Thank you. We're building your ${SERVICE_NAME[client.service].toLowerCase()} for ${client.domain} now from your own products; the first batch is ready in a few minutes.`,
            "",
            `Your studio (keep this link private): ${studio}`,
            "",
            "Ask for any change there in plain words.",
            "",
            "John Lim",
            "Founder, Apereel",
          ].join("\n"),
        }),
      }).catch(() => null);
    }
    await notifyJohn(`New ${SERVICE_NAME[client.service]} client: ${client.domain}${livemode ? "" : " [TEST]"}`, `${client.email}, tier ${client.tier}. Studio: ${studio}`);
  });
}

async function notifyJohn(subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Apereel <noreply@apereel.com>", to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"], subject, text }),
  }).catch(() => null);
}
