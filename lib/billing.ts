import "server-only";
import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { SERVICE_TIERS, type Tier, type TierId } from "./service-tiers";
import type { AiService } from "./clients";

// Billing for the AI services with Stripe:
//   Ads and Content: monthly subscriptions.
//   Website: a one-time payment that saves the card, then a $10/month
//   hosting subscription that starts after the 12 included months.
// Prices live in Stripe under lookup keys that include the amount, so a
// price change in lib/service-tiers (or /admin/pricing) makes a new Price.
// Tax is added on top (tax_behavior exclusive) and collected by Stripe Tax
// only once the account has an active registration: see taxReady().

export const HOSTING_MONTHLY_CENTS = 1000;
export const HOSTING_INCLUDED_DAYS = 365;
const CURRENCY = "usd";

export const SERVICE_NAME: Record<AiService, string> = {
  "premium-creative": "Content",
  advertising: "Ads",
  "web-development": "Website",
};

let taxCache: { ready: boolean; at: number } | null = null;

/**
 * True only when Stripe Tax can actually collect: head office set (settings
 * active) and at least one active registration. Without both, automatic tax
 * silently collects nothing, so it stays off rather than pretending.
 */
export async function taxReady(stripeAccount?: string): Promise<boolean> {
  if (!stripeAccount && taxCache && Date.now() - taxCache.at < 10 * 60_000) return taxCache.ready;
  const opts = stripeAccount ? { stripeAccount } : undefined;
  let ready = false;
  try {
    const stripe = getStripe();
    const settings = await stripe.tax.settings.retrieve(undefined, opts);
    if (settings.status === "active") {
      const regs = await stripe.tax.registrations.list({ status: "active", limit: 1 }, opts);
      ready = regs.data.length > 0;
    }
  } catch (err) {
    console.error("Tax readiness check failed:", err instanceof Error ? err.message : err);
  }
  if (!stripeAccount) taxCache = { ready, at: Date.now() };
  return ready;
}

/** The Stripe Price for a lookup key, created (with its product) the first time. */
async function priceFor(key: string, name: string, unitAmount: number, recurring: boolean): Promise<Stripe.Price> {
  const stripe = getStripe();
  const found = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  if (found.data[0]) return found.data[0];
  return stripe.prices.create({
    lookup_key: key,
    currency: CURRENCY,
    unit_amount: unitAmount,
    tax_behavior: "exclusive",
    ...(recurring ? { recurring: { interval: "month" } } : {}),
    product_data: { name },
  });
}

export function tierPriceKey(service: AiService, tier: Tier) {
  return `apereel_${service}_${tier.id}_${tier.cadence === "monthly" ? "monthly" : "once"}_${(tier.price ?? 0) * 100}`;
}

export const hostingPrice = () => priceFor(`apereel_hosting_monthly_${HOSTING_MONTHLY_CENTS}`, "Apereel website hosting", HOSTING_MONTHLY_CENTS, true);

export function findTier(service: AiService, tierId: TierId, services = SERVICE_TIERS): Tier | null {
  return services.find((s) => s.slug === service)?.tiers.find((t) => t.id === tierId) ?? null;
}

/** Hosted Checkout for a service tier. The webhook creates the client once paid. */
export async function createServiceCheckout(o: {
  service: AiService;
  tier: Tier;
  domain: string;
  email: string;
  name: string | null;
  base: string;
}): Promise<string> {
  if (o.tier.price == null) throw new Error("This tier has no price yet");
  const stripe = getStripe();
  const label = `Apereel ${SERVICE_NAME[o.service]} · ${o.tier.label ?? o.tier.id}`;
  const price = await priceFor(tierPriceKey(o.service, o.tier), label, o.tier.price * 100, o.tier.cadence === "monthly");
  const tax = await taxReady();
  const metadata = { kind: "service", service: o.service, tier: o.tier.id, domain: o.domain, name: o.name ?? "" };
  const common = {
    customer_email: o.email,
    line_items: [{ price: price.id, quantity: 1 }],
    automatic_tax: { enabled: tax },
    metadata,
    success_url: `${o.base}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${o.base}/pricing`,
  };
  const session =
    o.tier.cadence === "monthly"
      ? await stripe.checkout.sessions.create({ ...common, mode: "subscription", subscription_data: { metadata } })
      : await stripe.checkout.sessions.create({
          ...common,
          mode: "payment",
          customer_creation: "always",
          // The card is kept for hosting, which starts after the included year.
          payment_intent_data: { setup_future_usage: "off_session", metadata },
        });
  if (!session.url) throw new Error("Checkout session has no URL");
  return session.url;
}

/** After a website payment: hosting at $10/month, first charge after the included year. */
export async function startHosting(session: Stripe.Checkout.Session, clientId: string): Promise<string | null> {
  const stripe = getStripe();
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!customer || !piId) return null;
  const pi = await stripe.paymentIntents.retrieve(piId);
  const pm = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id;
  const price = await hostingPrice();
  const sub = await stripe.subscriptions.create(
    {
      customer,
      items: [{ price: price.id }],
      ...(pm ? { default_payment_method: pm } : {}),
      trial_end: Math.floor(Date.now() / 1000) + HOSTING_INCLUDED_DAYS * 86400,
      automatic_tax: { enabled: await taxReady() },
      metadata: { kind: "hosting", client_id: clientId },
    },
    { idempotencyKey: `hosting-${session.id}` },
  );
  return sub.id;
}

/** The Stripe customer portal: cards, invoices, cancel. */
export async function portalUrl(customer: string, returnUrl: string): Promise<string> {
  const s = await getStripe().billingPortal.sessions.create({ customer, return_url: returnUrl });
  return s.url;
}
