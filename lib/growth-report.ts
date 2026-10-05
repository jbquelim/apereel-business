import { checkPage, pageSpeed, samplePages, type PageCheck, type PageSpeedResult } from "./page-checks";
import { callClaude } from "./ai";
import { fetchAuditResult, fetchCompetitorSet } from "./marketdb";
import { historyForMany, type HistoryFacts } from "./market-history";
import { dataForSeoConfigured, rankedKeywords, rankingGaps, searchVolumes, type Rankings } from "./dataforseo";

// The paid Growth Plan report, built in stages so each fits one function run:
//   collect — the customer's free audit (reused, or re-run) plus page-type
//             audits and PageSpeed for the client's pages and competitors'.
//   crawl   — every page from the sitemap (lib/site-crawl) and the client's
//             product pages side by side with competitors'. Measured, not guessed.
//   plan    — Claude turns that evidence into priorities and a 30/60/90-day
//             roadmap, citing only numbers present in the evidence.

export const REPORT_VERSION = 1;

type Audit = {
  url: string;
  scores?: Record<string, number | null>;
  vitals?: Record<string, string | null>;
  headline?: string;
  inventoryInsights?: string[];
  translateAdvantage?: { strength: string; touchpoints: { name: string; action: string }[]; services: { tag: string; reason: string }[] };
  techStack?: {
    client: { name: string; domain: string; technologies: { name: string; category: string }[] };
    competitors: { name: string; domain: string; technologies: { name: string; category: string }[] }[];
    gaps: { category: string; examples: string[]; competitorCount: number }[];
  };
  competitorInventories?: { name: string; domain: string; categories: { category: string; productCount: number | null; avgPrice: string | null }[] }[];
  experience?: { findings: { label: string; status: string; detail?: string }[] } | null;
  demand?: { rows: { query: string; coverage: "category" | "products" | "none" | null }[]; coverageChecked: boolean };
  industry?: {
    industry: string;
    subIndustry: string;
    detectedCountry?: string | null;
    offering?: string;
    businessModel: string | null;
    competitors: { name: string; domain: string; strength: string }[];
    insight: string;
    inventoryCategories: { category: string; productCount: number | null; avgPrice: string | null; priceRange: string | null }[];
  } | null;
};

export type ClientPage = PageCheck & { speed: PageSpeedResult | null };

export type GrowthReport = {
  version: number;
  domain: string;
  url: string;
  collectedAt: string;
  audit: Audit;
  pages: ClientPage[];
  competitorSpeed: { name: string; domain: string; speed: PageSpeedResult | null }[];
  history?: HistoryFacts[];
  /** Real Google rankings (DataForSEO) when configured. */
  rankings?: {
    client: Rankings;
    competitors: Rankings[];
    gaps: { keyword: string; volume: number | null; competitors: { name: string; position: number | null }[] }[];
  };
  /** Every-page crawl of the client's site (paid tiers). */
  crawl?: import("./site-crawl").SiteCrawl;
  /** Client product pages against competitors' product pages. */
  productCompare?: import("./site-crawl").CompetitorCompare;
  /** Monthly search volume per buyer search, when DataForSEO is configured. */
  demandVolumes?: Record<string, number>;
  plan?: GrowthPlan;
  /** $30 tier: drafts built from the business's own products. */
  preview?: import("./preview-assets").PreviewAssets;
  plannedAt?: string;
  planModel?: string;
};

export type GrowthPlan = {
  summary: string;
  priorities: {
    title: string;
    evidence: string;
    action: string;
    impact: "high" | "medium" | "low";
    effort: "low" | "medium" | "high";
    service: string;
  }[];
  roadmap: { days30: string[]; days60: string[]; days90: string[] };
  notMeasured: string[];
};

async function runAudit(url: string, base: string): Promise<Audit> {
  // One retry: a platform error page (non-JSON 5xx) is usually transient.
  // Only when it failed fast, so a retry still fits the stage's time limit.
  let lastError = "";
  const started = Date.now();
  for (let attempt = 0; attempt < 2 && (attempt === 0 || Date.now() - started < 60_000); attempt++) {
    const res = await fetch(`${base}/api/audit`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ingest-secret": process.env.CRON_SECRET ?? "" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(240_000),
    }).catch((err: unknown) => err instanceof Error ? err : new Error(String(err)));
    if (res instanceof Error) {
      lastError = res.message;
      continue;
    }
    const text = await res.text();
    let json: { ok?: boolean; data?: Audit; error?: string } | null = null;
    try {
      json = JSON.parse(text);
    } catch {
      lastError = `audit returned ${res.status}: ${text.slice(0, 80)}`;
      continue;
    }
    if (json?.ok && json.data) return json.data;
    lastError = json?.error ?? String(res.status);
    if (res.status < 500) break;
  }
  throw new Error(`Audit failed: ${lastError}`);
}

export async function collectEvidence(url: string, domain: string, base: string): Promise<GrowthReport> {
  // Page audits run alongside the (slower) full audit.
  const pagesPromise = samplePages(url).then((pages) =>
    Promise.all(
      pages.map(async (p) => ({ ...checkPage(p.type, p.url, p.html), speed: await pageSpeed(p.url) })),
    ),
  );
  const speedOf = (list: { name: string; domain: string }[]) =>
    Promise.all(list.slice(0, 3).map(async (c) => ({ name: c.name, domain: c.domain, speed: await pageSpeed(`https://${c.domain}/`) })));
  // The buyer ran the free audit first, so its competitor set is usually
  // saved: start their speed tests now instead of after the full audit.
  const saved = await fetchCompetitorSet(domain);
  const earlySpeed = saved ? speedOf(saved) : null;

  const audit = (await fetchAuditResult<Audit>(domain)) ?? (await runAudit(url, base));
  const auditCompetitors = audit.industry?.competitors ?? [];
  const sameSet =
    saved && saved.slice(0, 3).map((c) => c.domain).join() === auditCompetitors.slice(0, 3).map((c) => c.domain).join();
  const [pages, competitorSpeed, history] = await Promise.all([
    pagesPromise,
    earlySpeed && sameSet ? earlySpeed : speedOf(auditCompetitors),
    historyForMany([{ domain, name: "You" }, ...auditCompetitors.map((c) => ({ domain: c.domain, name: c.name }))]),
  ]);
  // Real rankings and volumes (paid data) — only when configured.
  let rankings: GrowthReport["rankings"];
  let demandVolumes: GrowthReport["demandVolumes"];
  if (dataForSeoConfigured()) {
    const country = audit.industry?.detectedCountry ?? null;
    const [client, ...comps] = await Promise.all([
      rankedKeywords(domain, "You", country, 100),
      ...auditCompetitors.slice(0, 3).map((c) => rankedKeywords(c.domain, c.name, country, 100)),
    ]);
    const competitorsRanked = comps.filter((c): c is Rankings => c !== null);
    if (client) rankings = { client, competitors: competitorsRanked, gaps: rankingGaps(client, competitorsRanked) };
    const phrases = audit.demand?.rows.map((r) => r.query) ?? [];
    if (phrases.length > 0) {
      const vols = await searchVolumes(phrases, country);
      if (vols.size > 0) demandVolumes = Object.fromEntries(vols);
    }
  }

  return {
    version: REPORT_VERSION,
    domain,
    url,
    collectedAt: new Date().toISOString(),
    audit,
    pages,
    competitorSpeed,
    history,
    rankings,
    demandVolumes,
  };
}

const SERVICES = [
  "Research & Competitive Analysis",
  "SEO",
  "Advertising",
  "Web Development",
  "Conversion Optimization",
  "Premium Creative",
];

function evidenceBlock(r: GrowthReport): string {
  const a = r.audit;
  const ind = a.industry;
  const lines: string[] = [];
  lines.push(`BUSINESS: ${r.domain}${ind ? ` — ${ind.subIndustry} (${ind.businessModel ?? "model unknown"})` : ""}`);
  if (ind?.offering) lines.push(`WHAT IT SELLS: ${ind.offering}`);
  if (ind?.competitors?.length) lines.push(`COMPETITORS: ${ind.competitors.map((c) => `${c.name} (${c.domain}) — ${c.strength}`).join("; ")}`);
  if (a.headline) lines.push(`FREE-AUDIT HEADLINE: ${a.headline}`);
  if (a.translateAdvantage?.strength) lines.push(`IDENTIFIED ADVANTAGE: ${a.translateAdvantage.strength}`);
  if (ind?.inventoryCategories?.length) {
    lines.push(`CLIENT CATEGORIES: ${ind.inventoryCategories.map((c) => `${c.category}${c.productCount != null ? ` ${c.productCount} products` : ""}${c.avgPrice ? ` avg ${c.avgPrice}` : ""}`).join("; ")}`);
  }
  for (const c of a.competitorInventories ?? []) {
    lines.push(`COMPETITOR CATEGORIES ${c.name}: ${c.categories.map((x) => `${x.category}${x.productCount != null ? ` ${x.productCount}` : ""}${x.avgPrice ? ` avg ${x.avgPrice}` : ""}`).join("; ")}`);
  }
  if (a.inventoryInsights?.length) lines.push(`INVENTORY FINDINGS:\n${a.inventoryInsights.map((s) => `- ${s}`).join("\n")}`);
  if (a.scores) lines.push(`HOMEPAGE LIGHTHOUSE SCORES (mobile): ${Object.entries(a.scores).map(([k, v]) => `${k} ${v ?? "n/a"}`).join(", ")}`);
  if (a.techStack) {
    const fmt = (s: { technologies: { name: string }[] }) => s.technologies.map((t) => t.name).join(", ") || "nothing detected";
    lines.push(`MARKETING TOOLS ON CLIENT HOMEPAGE: ${fmt(a.techStack.client)}`);
    for (const c of a.techStack.competitors) lines.push(`MARKETING TOOLS ON ${c.name}: ${fmt(c)}`);
    for (const g of a.techStack.gaps) lines.push(`TOOL GAP: ${g.category} — ${g.competitorCount} of ${a.techStack.competitors.length} competitors (${g.examples.join(", ")}), not seen on client`);
  }
  const failed = (a.experience?.findings ?? []).filter((f) => f.status !== "pass");
  if (failed.length) lines.push(`BUYER EXPERIENCE CHECKS FAILING: ${failed.map((f) => `${f.label}${f.detail ? ` (${f.detail})` : ""}`).join("; ")}`);
  const read = new Set(r.pages.map((p) => p.type));
  for (const t of ["Homepage", "Category page", "Product page"] as const) {
    if (!read.has(t)) {
      lines.push(`PAGE ${t}: NOT READ — our crawler could not load it (often the host's bot protection). Make no claims about this page's title, headings, tags or structured data; list it under notMeasured.`);
    }
  }
  for (const p of r.pages) {
    const speed = p.speed ? `mobile performance ${p.speed.performance ?? "n/a"}, LCP ${p.speed.lcp ?? "n/a"}, CLS ${p.speed.cls ?? "n/a"}` : "speed not measured";
    lines.push(`PAGE ${p.type} ${p.url}: ${speed}; issues: ${p.issues.length ? p.issues.map((i) => `[${i.severity}] ${i.text}`).join(" ") : "none found"}`);
  }
  if (a.demand?.rows.length) {
    const tag = (c: string | null) => (c === "category" ? "category page" : c === "products" ? "product pages only" : c === "none" ? "NO PAGE" : "not checked");
    lines.push(`REAL BUYER SEARCHES (Google autocomplete; no volumes) and site coverage from the sitemap: ${a.demand.rows.map((x) => `"${x.query}" → ${tag(x.coverage)}`).join("; ")}`);
  }
  if (r.rankings) {
    const top = r.rankings.client.keywords
      .filter((k) => k.position != null && k.position <= 20)
      .slice(0, 15)
      .map((k) => `"${k.keyword}" #${k.position}${k.volume != null ? ` (${k.volume}/mo)` : ""}`);
    lines.push(`REAL GOOGLE RANKINGS (DataForSEO) for the client, top by search volume: ${top.join("; ") || "no top-20 rankings found"}`);
    lines.push(`RANKING GAPS — searches competitors rank top-20 for and the client doesn't rank for at all: ${r.rankings.gaps.map((g) => `"${g.keyword}"${g.volume != null ? ` (${g.volume}/mo)` : ""} — ${g.competitors.map((c) => `${c.name} #${c.position}`).join(", ")}`).join("; ") || "none found"}`);
  }
  if (r.demandVolumes) {
    lines.push(`SEARCH VOLUMES (Google Ads data, monthly) for buyer searches: ${Object.entries(r.demandVolumes).map(([k, v]) => `"${k}" ${v}`).join("; ")}`);
  }
  for (const h of r.history ?? []) {
    lines.push(`TRACKED CHANGES ${h.name === "You" ? "(the client)" : h.name} since ${h.since}: ${h.facts.join(" ")}`);
  }
  if (r.crawl) {
    const c = r.crawl;
    lines.push(
      `SITE CRAWL (every page read by us): sitemap lists ${c.sitemapProducts} product pages and ${c.sitemapCategories} category pages; we read ${c.crawled.product} product pages, ${c.crawled.category} category pages and the homepage${c.blocked ? `; ${c.blocked} requests were refused by the site's firewall` : ""}. Counts below are out of the pages we read, so say "X of the Y product pages we checked", never extrapolate to the whole catalog.`,
    );
    if (c.mostlyBlocked) lines.push(`SITE CRAWL MOSTLY BLOCKED: the site's firewall refused most requests; treat crawl counts as partial and list the rest under notMeasured.`);
    for (const f of c.findings) {
      lines.push(`CRAWL FINDING [${f.severity}] ${f.label}: ${f.count} of ${f.of}. Examples: ${f.urls.slice(0, 3).join(", ")}`);
    }
  }
  if (r.productCompare) {
    const fmt = (p: import("./site-crawl").ProductPageProfile) =>
      `${p.name} (${p.pages} product pages read): price in Google product data ${p.priceInSchemaPct ?? "n/a"}%, ratings/reviews shown ${p.ratingsPct ?? "n/a"}%, spec table ${p.specTablePct ?? "n/a"}%, avg ${p.avgImages ?? "n/a"} images, avg ${p.avgWords ?? "n/a"} words, server response ${p.avgResponseMs ?? "n/a"} ms`;
    lines.push(`PRODUCT PAGES SIDE BY SIDE — ${fmt(r.productCompare.client)}`);
    for (const c of r.productCompare.competitors) lines.push(`PRODUCT PAGES SIDE BY SIDE — ${fmt(c)}`);
    if (r.productCompare.unreadable?.length) lines.push(`PRODUCT PAGES NOT READABLE for: ${r.productCompare.unreadable.join(", ")} (make no claims about their product pages)`);
  }
  for (const c of r.competitorSpeed) {
    lines.push(`COMPETITOR HOMEPAGE SPEED ${c.name}: ${c.speed ? `mobile performance ${c.speed.performance ?? "n/a"}, LCP ${c.speed.lcp ?? "n/a"}` : "not measured"}`);
  }
  return lines.join("\n");
}

export async function writePlan(r: GrowthReport): Promise<{ plan: GrowthPlan; model: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = `You are John Lim's senior strategist at Apereel, writing a paid Growth Plan for the owner of ${r.domain}. John reviews it before it is sent. Below is the evidence we measured directly from their site and their competitors' sites.

${evidenceBlock(r)}

Write the plan as JSON:
{
  "summary": "3-4 sentences for a busy owner: where they stand, the biggest opportunity, what to do first",
  "priorities": [
    { "title": "short imperative", "evidence": "the specific measured fact(s) behind it, with the numbers from the evidence", "action": "what to do, concretely", "impact": "high|medium|low", "effort": "low|medium|high", "service": "one of: ${SERVICES.join(", ")}" }
  ],
  "roadmap": { "days30": ["..."], "days60": ["..."], "days90": ["..."] },
  "notMeasured": ["things this report could not measure and would need access or data to judge, e.g. conversion rates, revenue by channel"]
}

Rules:
- 5 to 8 priorities, ordered by impact on revenue relative to effort; quick high-impact fixes first
- CRAWL FINDINGS and PRODUCT PAGES SIDE BY SIDE are the strongest evidence in this report (we read those pages ourselves): base the top priorities on them where they apply, quoting the counts as "X of the Y pages we checked" and naming competitors from the side-by-side
- Every priority's "evidence" must quote facts and numbers that appear in the evidence above. Never invent numbers, rankings, traffic, conversion rates or revenue figures
- Prefer specific, verifiable fixes (e.g. "add Product structured data with price and availability to product pages") over generic advice
- A category's highest price is often a bulk, wholesale or equipment item filed under it: never describe the top of a price range as a kind of product ("rare lots", "luxury pieces") unless a named product at that price shows it
- Missing or unmeasured data is a limitation of our crawler, never a claim about the client's site; a tool "not seen" on a homepage may still be in use
- Never promise outcomes ("will double traffic"); describe what each fix enables
- Roadmap: 2-4 items per period, each a concrete deliverable, building on the priorities
- Plain language for a business owner; no jargon without a short explanation. Write evidence as normal sentences; never copy the bracketed severity labels like [high] from the evidence
- Respond with ONLY the JSON object`;

  let lastError = "";
  for (const model of ["claude-opus-5-5", "claude-sonnet-5"]) {
    try {
      // Through lib/ai so the cost is logged (ai_requests), like every other call.
      const text = await callClaude({ model: model as "claude-opus-5-5" | "claude-sonnet-5", maxTokens: model === "claude-opus-5-5" ? 16000 : 6000, prompt, purpose: "analysis:plan", clientId: null });
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        lastError = `${model} returned no JSON`;
        continue;
      }
      const plan = JSON.parse(match[0]) as GrowthPlan;
      if (!plan.summary || !Array.isArray(plan.priorities) || plan.priorities.length === 0 || !plan.roadmap) {
        lastError = `${model} returned an incomplete plan`;
        continue;
      }
      plan.priorities = plan.priorities.slice(0, 8);
      plan.notMeasured = Array.isArray(plan.notMeasured) ? plan.notMeasured : [];
      return { plan, model };
    } catch (err) {
      lastError = `${model} ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new Error(`Plan generation failed: ${lastError}`);
}
