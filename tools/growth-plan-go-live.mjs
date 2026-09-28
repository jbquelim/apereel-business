// Switches the Growth Plan from Stripe test mode to LIVE payments.
//
// Before running:
//   1. Claim the Stripe sandbox (or use your live Stripe account) and create a
//      RESTRICTED key (Developers → API keys → Create restricted key) with:
//        Checkout Sessions: Write     (to take payments)
//        Webhook Endpoints: Write     (so this script can register the webhook)
//   2. Add it to .env.local (git-ignored; never paste it into chat):
//        STRIPE_LIVE_SECRET_KEY=rk_live_...
//
// Run:  node tools/growth-plan-go-live.mjs            (does it)
//       node tools/growth-plan-go-live.mjs --dry-run  (checks only)
//
// What it does: verifies the key is LIVE, registers the live webhook at
// https://www.apereel.com/api/stripe/webhook, stores the key and webhook
// secret in Vercel production as sensitive variables, sets
// NEXT_PUBLIC_GROWTH_PLAN=on, and redeploys production. Secrets are never
// printed.
//
// Undo: vercel env rm NEXT_PUBLIC_GROWTH_PLAN production -y &&
//       vercel env rm STRIPE_LIVE_SECRET_KEY production -y, then redeploy
//       (the site falls back to the sandbox and hides the offer).

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import Stripe from "stripe";

const DRY = process.argv.includes("--dry-run");
const WEBHOOK_URL = "https://www.apereel.com/api/stripe/webhook";
const EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"];

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const key = env.STRIPE_LIVE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_LIVE_SECRET_KEY is not in .env.local. See the instructions at the top of this file.");
  process.exit(1);
}
if (!/^(rk|sk)_live_/.test(key)) {
  console.error("That key is not a LIVE key (it should start with rk_live_). Nothing changed.");
  process.exit(1);
}
if (key.startsWith("sk_live_")) console.warn("Warning: this is a full secret key. A restricted key (rk_live_) is safer.");

const stripe = new Stripe(key);
const account = await stripe.accounts.retrieve().catch(() => null);
console.log(`Live key OK${account?.settings?.dashboard?.display_name ? ` for "${account.settings.dashboard.display_name}"` : ""}.`);
if (account && !account.charges_enabled) {
  console.error("This Stripe account can't take charges yet (finish activation in the Stripe dashboard). Nothing changed.");
  process.exit(1);
}
if (DRY) {
  console.log("Dry run: key checks passed. Run again without --dry-run to go live.");
  process.exit(0);
}

const existing = (await stripe.webhookEndpoints.list({ limit: 100 })).data.filter((e) => e.url === WEBHOOK_URL);
for (const e of existing) await stripe.webhookEndpoints.del(e.id);
const endpoint = await stripe.webhookEndpoints.create({
  url: WEBHOOK_URL,
  description: "Apereel Growth Plan fulfillment",
  enabled_events: EVENTS,
});
if (!endpoint.livemode) {
  console.error("Stripe created a TEST webhook, so the key isn't live. Stopping.");
  process.exit(1);
}
console.log(`Live webhook registered (${endpoint.id}).`);

const setEnv = (name, value, sensitive) =>
  execFileSync("vercel", ["env", "add", name, "production", ...(sensitive ? ["--sensitive"] : []), "--force"], {
    input: value,
    stdio: ["pipe", "ignore", "inherit"],
  });
setEnv("STRIPE_LIVE_SECRET_KEY", key, true);
setEnv("STRIPE_WEBHOOK_SECRET", endpoint.secret, true);
setEnv("NEXT_PUBLIC_GROWTH_PLAN", "on", false);
console.log("Vercel production variables set: STRIPE_LIVE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_GROWTH_PLAN=on.");

const current = execFileSync("vercel", ["ls", "--prod"], { encoding: "utf8" }).match(/https:\/\/\S+\.vercel\.app/)?.[0];
if (!current) {
  console.error("Couldn't find the production deployment to redeploy. Run: vercel --prod");
  process.exit(1);
}
execFileSync("vercel", ["redeploy", current, "--target", "production"], { stdio: "inherit" });
console.log("\nDone. The Growth Plan offer is live on apereel.com with real payments.");
