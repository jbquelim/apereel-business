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

export const GROWTH_PLAN = {
  name: "Apereel Growth Plan",
  description:
    "A deeper competitive analysis of your business, reviewed by John Lim before it's sent: catalog and pricing comparison, marketing tools your competitors use, page-by-page fixes, and a 90-day plan ranked by impact.",
  amountCents: 2000,
  currency: "usd",
} as const;
