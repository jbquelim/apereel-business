// The three paid analyses offered after the free audit. One checkout, one
// pipeline; the tier decides depth, review and delivery.

export type AnalysisTierId = "teardown" | "growth" | "preview";

export type AnalysisTier = {
  id: AnalysisTierId;
  name: string;
  priceCents: number;
  /** John reviews before delivery (teardown is sent automatically). */
  reviewed: boolean;
  tagline: string;
  includes: string[];
  delivery: string;
};

export const ANALYSIS_TIERS: AnalysisTier[] = [
  {
    id: "teardown",
    name: "Competitor Teardown",
    priceCents: 1000,
    reviewed: false,
    tagline: "The measured evidence, delivered in minutes.",
    includes: [
      "Everything in the free scan",
      "Up to 1,200 of your pages opened and checked, every problem listed by URL",
      "Your product pages side by side with your competitors'",
      "Top priorities from what we measured, generated automatically",
    ],
    delivery: "By email in about 5 minutes. Automated, not reviewed.",
  },
  {
    id: "growth",
    name: "Growth Plan",
    priceCents: 2000,
    reviewed: true,
    tagline: "What to fix first, reviewed by John Lim.",
    includes: [
      "Everything in the Teardown",
      "Priorities ranked by impact, each with evidence and action",
      "A 30/60/90-day roadmap",
      "Reviewed and edited by John before it's sent",
    ],
    delivery: "By email within two business days.",
  },
  {
    id: "preview",
    name: "Growth Plan + Preview",
    priceCents: 3000,
    reviewed: true,
    tagline: "The plan, plus a better version of your site to see.",
    includes: [
      "Everything in the Growth Plan",
      "Your homepage reimagined with your own products",
      "Rewritten product titles and descriptions",
      "Ready-to-run Google and Meta ad copy",
    ],
    delivery: "By email within two business days.",
  },
];

export const tierById = (id: string | null | undefined): AnalysisTier =>
  ANALYSIS_TIERS.find((t) => t.id === id) ?? ANALYSIS_TIERS[1];

export const formatUsd = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
