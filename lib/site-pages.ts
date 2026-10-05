import { neon } from "@neondatabase/serverless";
import type { Section, SiteDoc, SitePage } from "./site-types";
import type { Client } from "./clients";
import { callClaude, parseJson } from "./ai";
import { analysisBrief, siteAnalysis } from "./site-analysis";

// The pages the analysis says the site is missing: buying guides aimed at the
// searches buyers make with no page to land on, a hub that links them, and a
// trade / wholesale page for businesses that sell to the trade. Written once
// per build from the analysis (one Sonnet call, about $0.10), linked into the
// shop's real categories and filters. Links are checked; nothing invented.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const GUIDES = { fix: 1, build: 3, grow: 5 } as const;
const TYPES = new Set(["hero", "story", "steps", "features", "links", "faq", "cta", "contact"]);
const cut = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

type Raw = { slug?: string; navLabel?: string; title?: string; metaTitle?: string; metaDescription?: string; sections?: Record<string, unknown>[] };

export async function writeAnalysisPages(site: { id: string; doc: SiteDoc }, client: Client): Promise<number> {
  const doc = site.doc;
  const analysis = await siteAnalysis(client.domain).catch(() => null);
  const gaps = (analysis?.audit.demand?.rows ?? []).filter((r) => r.coverage === "none").map((r) => r.query);
  const trade = doc.productAction === "enquire" || /wholesale|trade|b2b|distribut|bulk/i.test(JSON.stringify(analysis?.plan ?? "") + gaps.join(" "));
  const guides = GUIDES[client.tier];

  // What links may point at: categories, their filters, the shop, the new pages.
  const cats = doc.categories.filter((c) => (c.count ?? 0) > 0);
  const top = cats.filter((c) => !c.parent);
  const values = doc.facets?.length && doc.catalogSize
    ? ((await sql()`
        SELECT k, v, count(*)::int AS n FROM site_products, jsonb_each_text(facets) AS e(k, v)
        WHERE site_id = ${site.id} GROUP BY 1, 2 HAVING count(*) >= 5 ORDER BY 1, 3 DESC
      `) as { k: string; v: string; n: number }[])
    : [];
  const facetLines = (doc.facets ?? []).map((f) => `${f.key} (${f.label}): ${values.filter((x) => x.k === f.key).slice(0, 16).map((x) => `${x.v} [${x.n}]`).join(", ")}`);
  const catLines = top.map((g) => `${g.slug} | ${g.name} | ${g.count}${cats.some((c) => c.parent === g.slug) ? ` | contains: ${cats.filter((c) => c.parent === g.slug).slice(0, 14).map((c) => `${c.slug} (${c.name})`).join(", ")}` : ""}`);

  const text = await callClaude({
    clientId: client.id,
    purpose: "site:analysis-pages",
    maxTokens: 14000,
    prompt: `You are writing new pages for ${doc.brand.name}'s website (${client.domain}). The analysis below found searches buyers make that the site has no page for. Write pages that answer them and lead buyers into the right part of the shop.

${analysisBrief(analysis) || "No analysis available."}
${gaps.length ? `BUYER SEARCHES WITH NO PAGE: ${gaps.join("; ")}` : ""}

BUSINESS FACTS YOU MAY STATE (nothing else about the business): ${doc.brand.name}; ${doc.brand.tagline}${doc.catalogSize ? `; ${doc.catalogSize.toLocaleString("en-US")} products online` : ""}${doc.brand.email ? `; email ${doc.brand.email}` : ""}${doc.brand.phone ? `; phone ${doc.brand.phone}` : ""}${doc.brand.address ? `; ${doc.brand.address}` : ""}

SHOP CATEGORIES (slug | name | products | subcategories):
${catLines.join("\n")}
${facetLines.length ? `\nSHOP FILTERS (key: values [products]) — link as /collections/<category-slug>?<key>=<value> or /products?<key>=<value>:\n${facetLines.join("\n")}` : ""}

WRITE:
- ${guides} buying guide${guides > 1 ? "s" : ""}, each aimed at one or more of the searches above (most valuable first). Slug "guides/<short-slug>".
${guides > 1 ? `- A hub page, slug "guides", navLabel "Guides", linking every guide.\n` : ""}${trade ? `- A trade / wholesale page, slug "trade", navLabel "Trade accounts": who it's for, how to order in quantity, how to apply, with a "contact" section (quoteForm true) as the application form.\n` : ""}
Each page: { "slug", "navLabel" (top-level pages only), "title", "metaTitle" (max 60 chars), "metaDescription" (max 155 chars), "sections": [...] }
Section shapes:
{ "type":"hero", "eyebrow":"short", "heading":"the page's H1", "subheading":"1-2 sentences" }   (first section of every page)
{ "type":"story", "heading":"...", "body":"paragraphs separated by blank lines" }
{ "type":"steps", "heading":"...", "items":[{ "title":"...", "body":"..." }] }
{ "type":"features", "heading":"...", "items":[{ "title":"...", "body":"..." }] }
{ "type":"links", "heading":"...", "items":[{ "label":"...", "href":"/collections/<slug> or a filter link or /guides/<slug> or /trade or /products", "note":"optional short" }] }
{ "type":"faq", "heading":"...", "items":[{ "q":"...", "a":"..." }] }
{ "type":"cta", "heading":"...", "body":"...", "ctaLabel":"...", "ctaHref":"/products or /contact or /trade or a category" }
{ "type":"contact", "heading":"...", "body":"...", "quoteForm": true }

RULES:
- Guides are genuinely useful: explain the parts, sizes and steps a buyer needs, in plain language, 600-1000 words each. Only widely accepted technical facts; where a step involves electricity, say to unplug first and to use a qualified electrician for wiring in walls or ceilings
- Every guide links into the shop at least 4 times with "links" sections, using ONLY the category slugs and filter values listed above
- State nothing about the business beyond the facts given: no prices, discounts, trade pricing, delivery times, minimum orders, years, awards or guarantees that aren't listed
- Never answer a question about the business's own policies (accounts, ordering, returns, pricing, shipping) unless the facts above answer it; leave such questions out
- Step titles are short phrases without numbers (the page numbers them)
- Never mention the analysis, competitors, search volumes, SEO or "searches"; write for the buyer
- No hype words. Plain, confident, helpful

Return ONLY JSON: { "pages": [ ... ] }`,
  });
  const out = parseJson<{ pages?: Raw[] }>(text);
  if (!out?.pages?.length) throw new Error("Analysis pages: no JSON");

  const slugs = new Set(cats.map((c) => c.slug));
  const facetKeys = new Set((doc.facets ?? []).map((f) => f.key));
  const facetVals = new Set(values.map((x) => `${x.k}=${x.v}`));
  const pageSlugs = new Set(out.pages.map((p) => cut(p.slug, 80).toLowerCase()).filter((s) => /^(guides(\/[a-z0-9-]+)?|trade)$/.test(s)));
  /** Only links that land on a real page of this site. */
  const okHref = (h: string) => {
    const [path, qs] = h.split("?");
    if (qs) {
      const p = new URLSearchParams(qs);
      if ([...p.keys()].some((k) => !facetKeys.has(k) || !facetVals.has(`${k}=${p.get(k)}`))) return false;
    }
    if (path === "/products" || path === "/contact" || path === "/about") return true;
    const m = path.match(/^\/collections\/([a-z0-9-]+)$/);
    if (m) return slugs.has(m[1]);
    return pageSlugs.has(path.slice(1));
  };

  const pages: SitePage[] = [];
  for (const r of out.pages) {
    const slug = cut(r.slug, 80).toLowerCase();
    if (!pageSlugs.has(slug)) continue;
    const sections = (r.sections ?? []).filter((x) => TYPES.has(String(x.type))).map((x) => {
      const s = x as Record<string, unknown>;
      if (s.type === "links") return { ...s, items: ((s.items as { href: string }[]) ?? []).filter((i) => typeof i?.href === "string" && okHref(i.href)) };
      if (s.type === "cta" && !okHref(String(s.ctaHref ?? ""))) return { ...s, ctaHref: "/products" };
      // The page numbers steps itself; "1. Unplug" would read "1  1. Unplug".
      if (s.type === "steps" || s.type === "features") return { ...s, items: ((s.items as { title: string }[]) ?? []).map((i) => ({ ...i, title: String(i.title ?? "").replace(/^\s*(step\s*)?\d+[.):]\s*/i, "") })) };
      return s;
    }).filter((s) => s.type !== "links" || (s.items as unknown[]).length) as unknown as Section[];
    if (sections.length < 2) continue;
    pages.push({
      slug,
      ...(slug.includes("/") ? {} : { navLabel: cut(r.navLabel, 30) || (slug === "trade" ? "Trade accounts" : "Guides") }),
      title: cut(r.title, 100) || slug,
      metaTitle: cut(r.metaTitle, 70),
      metaDescription: cut(r.metaDescription, 160),
      sections,
      source: "analysis",
    });
  }
  const next: SiteDoc = { ...doc, pages: [...doc.pages.filter((p) => p.source !== "analysis"), ...pages] };
  await sql()`UPDATE sites SET doc = ${JSON.stringify(next)}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return pages.length;
}

const words = (v: unknown) => JSON.stringify(v ?? "").split(/\s+/).length;

/**
 * Deepens short guides (under ~600 words) by adding two or three new
 * sections each: more steps, troubleshooting, buyer questions. The existing
 * sections and shop links stay as they are. One Sonnet call per short guide,
 * about $0.015 each.
 */
export async function expandGuides(site: { id: string; doc: SiteDoc }, clientId: string | null): Promise<number> {
  const doc = site.doc;
  let expanded = 0;
  const pages = [...doc.pages];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    if (p.source !== "analysis" || !p.slug.startsWith("guides/") || words(p.sections) >= 600) continue;
    const current = p.sections
      .map((s) => {
        const x = s as unknown as Record<string, unknown>;
        if (s.type === "hero") return `# ${x.heading}\n${x.subheading ?? ""}`;
        if (s.type === "story") return `## ${x.heading}\n${x.body}`;
        if (s.type === "steps" || s.type === "features") return `## ${x.heading}\n${((x.items as { title: string; body: string }[]) ?? []).map((it) => `- ${it.title}: ${it.body}`).join("\n")}`;
        if (s.type === "faq") return `## ${x.heading}\n${((x.items as { q: string; a: string }[]) ?? []).map((it) => `Q ${it.q}\nA ${it.a}`).join("\n")}`;
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
    const text = await callClaude({
      clientId,
      purpose: "site:expand-guide",
      maxTokens: 2500,
      prompt: `This buying guide on ${doc.brand.name}'s website is too short to be useful. Write 2 or 3 NEW sections that add what a buyer still needs, 400-550 words in total. Do not repeat what is already there.

THE GUIDE AS IT IS NOW:
${current}

Good additions: how to identify or measure the right size/type, common mistakes and how to avoid them, troubleshooting, choosing between options, care and maintenance, more buyer questions.

RULES:
- Only widely accepted technical facts. Where electricity is involved, say to unplug first and use a qualified electrician for wiring in walls or ceilings
- Nothing about ${doc.brand.name} itself (no prices, policies, stock, delivery, guarantees)
- Never mention searches, SEO or competitors. Plain, helpful, no hype
- Step titles are short phrases without numbers

Return ONLY JSON: { "sections": [ { "type":"story", "heading":"...", "body":"paragraphs separated by blank lines" } | { "type":"steps", "heading":"...", "items":[{ "title":"...", "body":"..." }] } | { "type":"faq", "heading":"...", "items":[{ "q":"...", "a":"..." }] } ] }`,
    });
    const add = (parseJson<{ sections?: Record<string, unknown>[] }>(text)?.sections ?? [])
      .filter((s) => ["story", "steps", "faq"].includes(String(s.type)))
      .map((s) => (s.type === "steps" ? { ...s, items: ((s.items as { title: string }[]) ?? []).map((it) => ({ ...it, title: String(it.title ?? "").replace(/^\s*(step\s*)?\d+[.):]\s*/i, "") })) } : s)) as unknown as Section[];
    if (!add.length) continue;
    // New sections go before the shop links and the closing call to action.
    const at = p.sections.findIndex((s) => s.type === "links" || s.type === "cta");
    const sections = at < 0 ? [...p.sections, ...add] : [...p.sections.slice(0, at), ...add, ...p.sections.slice(at)];
    pages[i] = { ...p, sections };
    expanded++;
  }
  if (expanded) await sql()`UPDATE sites SET doc = ${JSON.stringify({ ...doc, pages })}::jsonb, updated_at = now() WHERE id = ${site.id}`;
  return expanded;
}
