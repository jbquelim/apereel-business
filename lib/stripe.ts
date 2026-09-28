import "server-only";
import Stripe from "stripe";

// One Stripe client for the server; the key never reaches the browser.
// STRIPE_LIVE_SECRET_KEY (a restricted live key, set by
// tools/growth-plan-go-live.mjs) wins over the Marketplace integration's
// STRIPE_SECRET_KEY (the sandbox). Uses the SDK's pinned API version.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  client ??= new Stripe(key);
  return client;
}

// Checkout details per analysis tier (lib/analysis-tiers.ts holds prices).
export const CHECKOUT_CURRENCY = "usd";
