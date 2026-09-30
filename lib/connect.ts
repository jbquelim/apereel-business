import "server-only";
import { neon } from "@neondatabase/serverless";
import { getStripe } from "./stripe";
import { taxReady } from "./billing";
import type { SiteProduct } from "./site-types";

// Payments on customer websites with Stripe Connect. Each business is the
// merchant of record on its own Stripe account (Accounts v2, full Dashboard,
// Stripe fees and losses on the account: the "store builder" setup), and buyers
// pay it directly through Checkout (direct charges). Apereel takes no cut
// unless PLATFORM_FEE_BPS is set (basis points, e.g. 100 = 1%).

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** The site's connected account, created the first time. */
export async function ensureAccount(site: { id: string; stripe_account_id: string | null }, o: { name: string; email: string }): Promise<string> {
  if (site.stripe_account_id) return site.stripe_account_id;
  const account = await getStripe().v2.core.accounts.create({
    display_name: o.name.slice(0, 100),
    contact_email: o.email,
    dashboard: "full",
    configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
    defaults: { responsibilities: { fees_collector: "stripe", losses_collector: "stripe" } },
    include: ["configuration.merchant"],
    metadata: { site_id: site.id },
  });
  await sql()`UPDATE sites SET stripe_account_id = ${account.id}, payments_status = 'onboarding' WHERE id = ${site.id}`;
  return account.id;
}

/** Stripe-hosted onboarding for the business (identity, bank account). */
export async function onboardingUrl(account: string, returnUrl: string): Promise<string> {
  const link = await getStripe().v2.core.accountLinks.create({
    account,
    use_case: { type: "account_onboarding", account_onboarding: { configurations: ["merchant"], refresh_url: returnUrl, return_url: returnUrl } },
  });
  return link.url;
}

/** Card payments are live on the account (the v2 capability, not legacy charges_enabled). */
export async function paymentsActive(account: string): Promise<boolean> {
  try {
    const a = await getStripe().v2.core.accounts.retrieve(account, { include: ["configuration.merchant"] });
    return a.configuration?.merchant?.capabilities?.card_payments?.status === "active";
  } catch (err) {
    console.error("Account check failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

/** Refreshes and stores the site's payments status. */
export async function refreshPaymentsStatus(siteId: string, account: string | null): Promise<string | null> {
  if (!account) return null;
  const status = (await paymentsActive(account)) ? "active" : "onboarding";
  await sql()`UPDATE sites SET payments_status = ${status} WHERE id = ${siteId}`;
  return status;
}

/** A buyer's Checkout for one product, on the business's own account. */
export async function productCheckout(o: { account: string; product: SiteProduct; productUrl: string }): Promise<string> {
  const { product } = o;
  if (product.price == null || product.price <= 0) throw new Error("This product has no price");
  const amount = Math.round(product.price * 100);
  const feeBps = Number(process.env.PLATFORM_FEE_BPS ?? 0);
  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
          price_data: {
            currency: (product.currency || "usd").toLowerCase(),
            unit_amount: amount,
            product_data: { name: product.title.slice(0, 250), ...(product.image ? { images: [product.image] } : {}) },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ["CA", "US"] },
      // The business's own tax settings apply; only on when they can collect.
      automatic_tax: { enabled: await taxReady(o.account) },
      ...(feeBps > 0 ? { payment_intent_data: { application_fee_amount: Math.floor((amount * feeBps) / 10_000) } } : {}),
      success_url: `${o.productUrl}?paid=1`,
      cancel_url: o.productUrl,
    },
    { stripeAccount: o.account },
  );
  if (!session.url) throw new Error("Checkout session has no URL");
  return session.url;
}
