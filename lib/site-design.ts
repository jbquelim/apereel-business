import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import type { SiteRow } from "./site-builder";
import { fetchAuditResult } from "./marketdb";
import { TEMPLATES, rankTemplates, templateById, type TemplateMeta } from "./templates";

// Choosing a site's design: the customer sees their three best matches (from
// their tier) previewed with their own content and picks one; John can set
// any template from admin. Switching design keeps every page, product and
// setting; only the layout changes.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

type AuditLike = { industry?: { industry?: string; subIndustry?: string; offering?: string } };

/** The customer's three best-matching designs, the current one always among them. */
export async function designChoices(site: SiteRow, client: Client): Promise<{ current: string | null; choices: TemplateMeta[] }> {
  const audit = await fetchAuditResult<AuditLike>(client.domain).catch(() => null);
  const industry = [audit?.industry?.subIndustry, audit?.industry?.industry, audit?.industry?.offering, client.domain].filter(Boolean).join(" ");
  const used = new Map(((await sql()`SELECT doc->>'design' AS d, count(*)::int AS n FROM sites WHERE id <> ${site.id} GROUP BY 1`) as { d: string | null; n: number }[]).map((r) => [r.d, r.n]));
  const ranked = rankTemplates(client.tier, industry, site.doc.catalogSize ?? site.doc.catalogTotal ?? site.doc.products.length, used).map((r) => r.template);
  const current = site.doc.design ?? null;
  const top = ranked.slice(0, 3);
  const cur = current ? templateById(current) : null;
  const choices = cur && !top.some((t) => t.id === cur.id) ? [cur, ...top.slice(0, 2)] : top;
  return { current, choices };
}

/**
 * Sets a site's design. Customers may choose within their own tier; John
 * (admin) may set any template.
 */
export async function setDesign(siteId: string, design: string, opts: { tier?: TemplateMeta["tier"] } = {}): Promise<{ ok: boolean; error?: string }> {
  const t = TEMPLATES.find((x) => x.id === design);
  if (!t) return { ok: false, error: "Unknown design" };
  if (opts.tier && t.tier !== opts.tier) return { ok: false, error: "That design isn't part of your plan" };
  // A deliberate choice: it's no longer an unmatched default.
  await sql()`UPDATE sites SET doc = jsonb_set(jsonb_set(doc, '{design}', ${JSON.stringify(t.id)}::jsonb), '{designMatched}', 'true'::jsonb), updated_at = now() WHERE id = ${siteId}`;
  return { ok: true };
}
