import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { INDUSTRIES, taxonomyPromptBlock, normalizeClassification, isBlockedDomain } from "@/lib/taxonomy";

// One-time dataset hardening, run in batches: purge blocklisted domains,
// then reclassify every business onto the pinned taxonomy and clean junk
// names. CRON_SECRET-gated; call repeatedly until remaining=0.

export const maxDuration = 300;

const BATCH = 40;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!process.env.DATABASE_URL || !apiKey) {
    return NextResponse.json({ ok: false, error: "env missing" }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);

  // Purge blocklisted domains (idempotent; snapshots cascade).
  const all = (await sql`SELECT id, domain FROM businesses`) as { id: number; domain: string }[];
  const blockedIds = all.filter((b) => isBlockedDomain(b.domain)).map((b) => b.id);
  if (blockedIds.length > 0) {
    await sql`DELETE FROM businesses WHERE id = ANY(${blockedIds})`;
  }
  await sql`DELETE FROM crawl_queue WHERE domain = ANY(${all.filter((b) => isBlockedDomain(b.domain)).map((b) => b.domain)})`;

  // Claim a batch still carrying off-taxonomy labels.
  const batch = (await sql`
    SELECT id, domain, name, industry, sub_industry
    FROM businesses
    WHERE industry IS NULL OR NOT (industry = ANY(${[...INDUSTRIES]}))
    ORDER BY id
    LIMIT ${BATCH}
  `) as { id: number; domain: string; name: string | null; industry: string | null; sub_industry: string | null }[];

  const [{ remaining }] = (await sql`
    SELECT count(*)::int AS remaining FROM businesses
    WHERE industry IS NULL OR NOT (industry = ANY(${[...INDUSTRIES]}))
  `) as { remaining: number }[];

  if (batch.length === 0) {
    return NextResponse.json({ ok: true, purged: blockedIds.length, reclassified: 0, remaining: 0 });
  }

  const listing = batch
    .map(
      (b, i) =>
        `${i + 1}. domain: ${b.domain} | current name: ${b.name ?? "?"} | old labels: ${b.industry ?? "?"} / ${b.sub_industry ?? "?"}`,
    )
    .join("\n");

  const prompt = `Reclassify these businesses onto a fixed taxonomy, and clean their names.

TAXONOMY — "industry" MUST be one of the left-side values, "subIndustry" MUST be one of that industry's options:
${taxonomyPromptBlock()}

BUSINESSES:
${listing}

Rules:
- name: the brand name only ("Gotstyle", "Blue Nile") — never a page title, tagline, or SEO string. If the current name is already a clean brand name, keep it.
- Infer from the domain and old labels; when torn between two industries pick the closer fit, never invent labels.
- country: only if the domain or brand makes it clear (e.g. .ca => "Canada", .co.uk => "United Kingdom"); else null.

Respond with ONLY a JSON array, one object per business, same order:
[{ "domain": "...", "name": "...", "industry": "...", "subIndustry": "...", "country": "Canada" }]`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: `anthropic ${res.status}` }, { status: 502 });
  }
  const data = await res.json();
  const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return NextResponse.json({ ok: false, error: "no json" }, { status: 502 });

  let updated = 0;
  const rows = JSON.parse(match[0]) as {
    domain: string;
    name?: string;
    industry?: string;
    subIndustry?: string;
    country?: string | null;
  }[];
  for (const row of rows) {
    const target = batch.find((b) => b.domain === row.domain);
    if (!target) continue;
    const c = normalizeClassification(row.industry, row.subIndustry);
    const cleanName =
      typeof row.name === "string" && row.name.trim().length > 0 && row.name.length < 60
        ? row.name.trim()
        : target.name;
    const country =
      typeof row.country === "string" && row.country.trim() && row.country.length < 40
        ? row.country.trim()
        : null;
    await sql`
      UPDATE businesses
      SET industry = ${c.industry},
          sub_industry = ${c.subIndustry},
          name = ${cleanName},
          country = COALESCE(country, ${country})
      WHERE id = ${target.id}
    `;
    updated++;
  }

  return NextResponse.json({
    ok: true,
    purged: blockedIds.length,
    reclassified: updated,
    remaining: Math.max(0, remaining - updated),
  });
}
