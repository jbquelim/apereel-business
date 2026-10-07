import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import { callClaude, parseJson } from "./ai";
import { RULES } from "./content-engine";
import { checkItem, fixItem, type ItemIssue, type QaItem } from "./content-qa";
import { qaContext } from "./content-context";
import { setBuild, getBuild } from "./site-release";
import { emailClient, notifyJohn } from "./notify";
import { drawable } from "./ad-brand";

// The release gate for a month of content or ads (the website gate's twin,
// lib/site-release). When the month's items are made: fixes that need no
// judgement are applied (prices to the cent, catalog counts), every item is
// checked (lib/content-qa), items that still fail get one AI repair, and any
// that fail after that are held for John (hidden from the client). Then the
// month is released: the client sees it and is emailed.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const SERVICE: Record<string, string> = { "premium-creative": "content", advertising: "ads" };
const MONTH = (batch: string) => new Date(`${batch}-01T12:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric" });

/** Catalog counts in the copy set to the store's real total (as the website does). */
export function syncCounts<T>(data: T, total: number | null): T {
  if (!total) return data;
  return JSON.parse(
    JSON.stringify(data).replace(/\b(\d{1,3}(?:,\d{3})+|\d{3,})(\+?)(-?\s*(?:products|parts|items|SKUs)\b)/gi, (m, num: string, plus: string, rest: string) => {
      const n = Number(num.replace(/,/g, ""));
      return Math.abs(n - total) / total > 0.1 ? `${total.toLocaleString("en-US")}${plus}${rest}` : m;
    }),
  ) as T;
}

type Row = QaItem & { id: number; status: string };

/** One AI call that rewrites the failing items to fix exactly what was found (about $0.01-0.03). */
async function repair(client: Client, failing: { item: Row; issues: ItemIssue[] }[], facts: string): Promise<Map<number, Record<string, unknown>>> {
  const out = new Map<number, Record<string, unknown>>();
  for (let i = 0; i < failing.length; i += 12) {
    const chunk = failing.slice(i, i + 12);
    const text = await callClaude({
      clientId: client.id,
      purpose: "content:repair",
      maxTokens: 8000,
      prompt: `These ${client.service === "advertising" ? "ads" : "content items"} for ${client.domain} failed their checks. Rewrite each one to fix exactly the problems listed, changing nothing else. Keep every field and its meaning; keep within each field's length.

WHAT IS KNOWN TO BE TRUE ABOUT THE BUSINESS (state nothing beyond this and the products named):
${facts.slice(0, 6000)}

ITEMS:
${chunk.map(({ item, issues }) => `ID ${item.id} (${item.kind})\nPROBLEMS: ${issues.map((x) => `${x.check}${x.field ? ` in ${x.field}` : ""}: ${x.detail}`).join("; ")}\nJSON: ${JSON.stringify(item.data)}`).join("\n\n")}

Remove a claim you can't support rather than rewording it. Return ONLY JSON: [{ "id": <id>, "data": { ...the full fixed item... } }]

${RULES}`,
    }).catch(() => "");
    for (const r of parseJson<{ id?: number; data?: Record<string, unknown> }[]>(text) ?? []) {
      const was = chunk.find((c) => c.item.id === r.id)?.item;
      // Same fields back, or it isn't used.
      if (was && r.data && Object.keys(was.data).every((k) => k in r.data!)) out.set(was.id, r.data);
    }
  }
  return out;
}

/**
 * Runs the gate on this month's items. Returns a summary; the client's build
 * state becomes ready (released) with any failing items held.
 */
export async function releaseMonth(client: Client, base: string): Promise<string> {
  const batch = new Date().toISOString().slice(0, 7);
  const ctx = await qaContext(client.domain);
  const items = (await sql()`SELECT id, kind, data, product_url, image, status FROM content_items WHERE client_id = ${client.id} AND batch = ${batch} ORDER BY id`) as Row[];
  if (!items.length) {
    await setBuild(client.id, { status: "failed", stage: "release", batch, error: "nothing was made this month" });
    await notifyJohn(`${SERVICE[client.service]} month empty: ${client.domain}`, `Nothing was made for ${client.domain} (${batch}). Run it again on ${base}/admin/clients`);
    return "nothing to release";
  }
  // 1. Fixes that need no judgement.
  for (const it of items) {
    const fixed = syncCounts(fixItem(it.data), ctx.catalogTotal);
    if (JSON.stringify(fixed) !== JSON.stringify(it.data)) {
      it.data = fixed;
      await sql()`UPDATE content_items SET data = ${JSON.stringify(fixed)}::jsonb, updated_at = now() WHERE id = ${it.id}`;
    }
  }
  // Every image item's photo must load and draw (an ad without its photo is broken; a repair can't fix that).
  const photos = new Map<number, boolean>();
  for (const it of items) {
    const frames = it.kind === "carousel" ? ((it.data as { frames?: { image?: string | null }[] }).frames ?? []).map((f) => f.image ?? null) : [it.image];
    if (!["ad", "post", "carousel"].includes(it.kind)) continue;
    photos.set(it.id, (await Promise.all(frames.map((u) => drawable(u, 400)))).every(Boolean) && frames.length > 0);
  }
  const check = (item: Row) => [...checkItem(item, ctx), ...(photos.get(item.id) === false ? [{ check: "photo", field: "image", detail: "the product photo can't be loaded" }] : [])];
  // 2. Checks; one repair for what fails (photos aside).
  let failing = items.map((item) => ({ item, issues: check(item) })).filter((x) => x.issues.length);
  if (failing.length) {
    const fixed = await repair(client, failing.filter((f) => f.issues.some((x) => x.check !== "photo")), ctx.facts);
    for (const [id, data] of fixed) {
      const it = items.find((x) => x.id === id)!;
      it.data = syncCounts(fixItem(data), ctx.catalogTotal);
      await sql()`UPDATE content_items SET data = ${JSON.stringify(it.data)}::jsonb, updated_at = now() WHERE id = ${id}`;
    }
    failing = items.map((item) => ({ item, issues: check(item) })).filter((x) => x.issues.length);
  }
  // 3. What still fails is held for John; the rest is released.
  for (const { item } of failing) await sql()`UPDATE content_items SET status = 'held', updated_at = now() WHERE id = ${item.id}`;
  const build = await getBuild(client.id);
  const already = (build as { batch?: string; notified?: boolean } | null)?.batch === batch && build?.notified;
  await setBuild(client.id, { status: "ready", stage: "released", batch, notified: true, issues: failing.flatMap(({ item, issues }) => issues.map((x) => ({ page: `#${item.id} ${item.kind}`, check: x.check, detail: x.detail }))) });
  if (failing.length) {
    await notifyJohn(
      `${failing.length} ${SERVICE[client.service]} item(s) held: ${client.domain}`,
      [`${failing.length} of ${items.length} items for ${client.domain} (${MONTH(batch)}) still failed their checks after a repair and are hidden from the client:`, "", ...failing.flatMap(({ item, issues }) => issues.map((x) => `- #${item.id} ${item.kind} · ${x.check}: ${x.detail}`)), "", `Release or fix them on ${base}/admin/clients`].join("\n"),
    );
  }
  if (!already) {
    await emailClient(
      client.email,
      `Your ${SERVICE[client.service]} for ${MONTH(batch)} is ready`,
      [client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,", "", `This month's ${SERVICE[client.service]} for ${client.domain} is ready to review in your studio (keep this link private):`, `${base}/studio/${client.token}`, "", "Approve what you like and ask for any change in plain words.", "", "John Lim", "Founder, Apereel"].join("\n"),
    );
  }
  return `released ${items.length - failing.length} of ${items.length}${failing.length ? `, ${failing.length} held` : ""}`;
}
