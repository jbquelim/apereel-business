import "server-only";
import Stripe from "stripe";

// One Stripe client for the server. The key comes from the Vercel Marketplace
// integration (sandbox until the account is claimed); it never reaches the
// browser. Uses the SDK's pinned API version.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
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
