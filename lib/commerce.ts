// Pricing, checkout, the paid-analysis upsell and the customer studio are
// switched off on the live site (apereel.com) and stay on for staging,
// previews and local dev. To bring them back on the live site, set
// HIDE_ON_LIVE to false.
const HIDE_ON_LIVE = true;

export const commerceOn = !HIDE_ON_LIVE || process.env.APEREEL_DEPLOY_ENV !== "production";

/** Pages that 404 on the live site while commerce is off (see proxy.ts). */
export const COMMERCE_PATHS = /^\/(pricing|plans|start|growth-plan|welcome|studio|sites)(\/|$)/;
