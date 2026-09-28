import type { GrowthReport } from "./growth-report";
import type { ShowcaseProduct } from "./showcase";

// The $30 preview: ready-to-use drafts built from the business's own site —
// a reimagined homepage hero around their real products, rewritten product
// titles and descriptions, and Google / Meta ad copy. Claims are limited to
// facts in the evidence; platform character limits are enforced here.

export type PreviewAssets = {
  showcase: ShowcaseProduct[];
  homepage: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    proofPoints: string[];
    featuredHeading: string;
  };
  productRewrites: { url: string; currentTitle: string; newTitle: string; description: string }[];
  ads: {
    google: { headlines: string[]; descriptions: string[] }[];
    meta: { primaryText: string; headline: string }[];
  };
  reviewNotes: string;
};

const cut = (s: unknown, max: number) => (typeof s === "string" ? s.trim() : "").slice(0, max);

export async function writePreviewAssets(r: GrowthReport, showcase: ShowcaseProduct[]): Promise<PreviewAssets> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const a = r.audit;
  const home = r.pages.find((p) => p.type === "Homepage");
  const gaps = (a.demand?.rows ?? []).filter((x) => x.coverage === "none").map((x) => x.query);

  const evidence = [
    `BUSINESS: ${r.domain}${a.industry ? ` — ${a.industry.subIndustry}` : ""}`,
    a.industry?.offering && `WHAT IT SELLS: ${a.industry.offering}`,
    a.translateAdvantage?.strength && `IDENTIFIED ADVANTAGE: ${a.translateAdvantage.strength}`,
    r.plan && `PLAN SUMMARY: ${r.plan.summary}`,
    r.plan && `TOP PRIORITIES: ${r.plan.priorities.slice(0, 4).map((p) => p.title).join("; ")}`,
    home?.title && `CURRENT HOMEPAGE TITLE: ${home.title}`,
    gaps.length > 0 && `BUYER SEARCHES WITH NO PAGE: ${gaps.slice(0, 8).join("; ")}`,
    `THEIR PRODUCTS (real, from their site):\n${showcase.map((p) => `- ${p.title}${p.price ? ` (${p.price})` : ""} ${p.url}`).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are Apereel's senior copywriter. Draft preview assets for ${r.domain} that show the owner what a better version of their site and ads could say. John Lim reviews them before they are sent.

${evidence}

Return ONLY JSON:
{
  "homepage": {
    "eyebrow": "2-4 words",
    "headline": "max 70 characters, leads with the identified advantage",
    "subheadline": "max 160 characters",
    "primaryCta": "max 24 characters",
    "secondaryCta": "max 24 characters",
    "proofPoints": ["3 short proof points, max 40 characters each, ONLY facts present in the evidence"],
    "featuredHeading": "max 40 characters, heading above their featured products"
  },
  "productRewrites": [
    { "url": "one of the product URLs above", "currentTitle": "exactly as listed above", "newTitle": "max 70 characters, clear to a buyer and search-friendly", "description": "2-3 sentences, max 320 characters" }
  ],
  "ads": {
    "google": [ { "headlines": ["3 headlines, each max 30 characters"], "descriptions": ["2 descriptions, each max 90 characters"] } ],
    "meta": [ { "primaryText": "max 125 characters", "headline": "max 40 characters" } ]
  },
  "reviewNotes": "at most 3 short sentences (under 400 characters) for John: anything he must verify before sending (e.g. a claim or detail to confirm with the client)"
}

Rules:
- productRewrites: exactly 3, using products listed above; google: 2 ad variations; meta: 2 variations
- Use ONLY facts in the evidence. Never invent years in business, awards, certifications, shipping, returns, discounts, guarantees, reviews or statistics
- Keep product names, part numbers and prices exactly as given; don't add prices that aren't listed
- Where a buyer search has no page, it's fair to aim copy or an ad at it
- Plain, confident language; no hype words like "revolutionary" or "unparalleled"`;

  let lastError = "";
  for (const model of ["claude-opus-5-5", "claude-sonnet-5"]) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: model === "claude-opus-5-5" ? 12000 : 4000,
          ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(200_000),
      });
      if (!res.ok) {
        lastError = `${model} ${res.status}`;
        continue;
      }
      const data = await res.json();
      const text: string = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
      const raw = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "null");
      if (!raw?.homepage || !raw?.ads) {
        lastError = `${model} returned incomplete assets`;
        continue;
      }
      const known = new Map(showcase.map((p) => [p.url, p]));
      return {
        showcase,
        homepage: {
          eyebrow: cut(raw.homepage.eyebrow, 40),
          headline: cut(raw.homepage.headline, 90),
          subheadline: cut(raw.homepage.subheadline, 200),
          primaryCta: cut(raw.homepage.primaryCta, 30),
          secondaryCta: cut(raw.homepage.secondaryCta, 30),
          proofPoints: (Array.isArray(raw.homepage.proofPoints) ? raw.homepage.proofPoints : []).map((x: unknown) => cut(x, 50)).filter(Boolean).slice(0, 3),
          featuredHeading: cut(raw.homepage.featuredHeading, 50),
        },
        productRewrites: (Array.isArray(raw.productRewrites) ? raw.productRewrites : [])
          .filter((p: { url?: string }) => typeof p.url === "string" && known.has(p.url))
          .slice(0, 3)
          .map((p: { url: string; newTitle?: string; description?: string }) => ({
            url: p.url,
            currentTitle: known.get(p.url)!.title,
            newTitle: cut(p.newTitle, 90),
            description: cut(p.description, 400),
          })),
        ads: {
          // Google Responsive Search Ads: headlines ≤30, descriptions ≤90 characters.
          google: (Array.isArray(raw.ads.google) ? raw.ads.google : []).slice(0, 2).map((g: { headlines?: unknown[]; descriptions?: unknown[] }) => ({
            headlines: (g.headlines ?? []).map((h) => cut(h, 30)).filter(Boolean).slice(0, 3),
            descriptions: (g.descriptions ?? []).map((d) => cut(d, 90)).filter(Boolean).slice(0, 2),
          })),
          meta: (Array.isArray(raw.ads.meta) ? raw.ads.meta : []).slice(0, 2).map((m: { primaryText?: string; headline?: string }) => ({
            primaryText: cut(m.primaryText, 125),
            headline: cut(m.headline, 40),
          })),
        },
        reviewNotes: cut(raw.reviewNotes, 1200),
      };
    } catch (err) {
      lastError = `${model} ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new Error(`Preview assets failed: ${lastError}`);
}
