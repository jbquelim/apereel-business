import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markFailed, markPaid } from "@/lib/orders";
import { triggerStage } from "@/lib/growth-trigger";

function siteBase(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
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
