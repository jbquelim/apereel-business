import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import type { MonthStage } from "./content-engine";
import { getSiteForClient } from "./site-builder";
import { runSiteQa } from "./site-qa-run";
import type { QaIssue } from "./site-qa";
import { emailClient, notifyJohn } from "./notify";

// The release gate for website builds. A build records where it is
// (clients.build); a failed step is retried, then reported to John. When the
// build is done the site is checked: a site that passes is released to the
// client (they're emailed and can publish it); one that doesn't gets one
// automatic repair (the step that fixes it is run again) and is otherwise
// held for John. Until a site is released the client sees "being finished",
// never a half-built site.

export type BuildStatus = "building" | "ready" | "held" | "failed";
export type BuildState = {
  status: BuildStatus;
  /** The step running or last run. */
  stage?: string;
  /** Failed tries of the current step. */
  attempts?: number;
  error?: string | null;
  /** Steps the gate has already re-run to repair the site (each once per build). */
  repairs?: string[];
  /** Blocking issues the last check found. */
  issues?: QaIssue[];
  /** The client was emailed that their site is ready (once). */
  notified?: boolean;
  /** John released a held site by hand. */
  approved?: boolean;
  at?: string;
};

/** Tries per step before the build is reported as failed. */
export const MAX_ATTEMPTS = 3;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** Merges into a client's build state. */
export async function setBuild(clientId: string, patch: Partial<BuildState>): Promise<BuildState> {
  const rows = (await sql()`
    UPDATE clients SET build = coalesce(build, '{}'::jsonb) || ${JSON.stringify({ ...patch, at: new Date().toISOString() })}::jsonb
    WHERE id = ${clientId} RETURNING build
  `) as { build: BuildState }[];
  return rows[0]?.build;
}

export async function getBuild(clientId: string): Promise<BuildState | null> {
  const rows = (await sql()`SELECT build FROM clients WHERE id = ${clientId}`) as { build: BuildState | null }[];
  return rows[0]?.build ?? null;
}

/** Whether the client may see and publish their site. Sites built before the gate existed have no state: released. */
export function isReleased(build: BuildState | null | undefined): boolean {
  return !build || build.status === "ready";
}

// Which step repairs which problem.
const COPY_CHECKS = new Set(["services", "internal-wording", "placeholder", "count-mismatch", "price-claim", "headings", "meta", "hero-length", "hero"]);
const CATALOG_CHECKS = new Set(["catalog-incomplete"]);

/** Checks a finished build: catalog completeness plus the site checks (lib/site-qa). */
export async function checkRelease(client: Client): Promise<QaIssue[]> {
  const site = await getSiteForClient(client.id);
  if (!site) return [{ page: "site", check: "missing", detail: "no site was built" }];
  const issues = await runSiteQa(site.id);
  const doc = site.doc;
  const [{ n, uncategorised }] = (await sql()`
    SELECT count(*)::int AS n, count(*) FILTER (WHERE category IS NULL)::int AS uncategorised FROM site_products WHERE site_id = ${site.id}
  `) as { n: number; uncategorised: number }[];
  // The store's sitemap is counted independently of the import (a reader bug can't hide in both).
  const cap = client.tier === "fix" ? 300 : 20_000;
  const expected = Math.min(doc.catalogExpected ?? 0, cap);
  // A services site (no online catalog) is checked on its services instead (lib/site-services).
  if (doc.kind === "services") {
    if (doc.products.length < 3) issues.push({ page: "site", check: "services", detail: `only ${doc.products.length} services were found on the business's own site` });
  } else if (expected >= 20 && n < expected * 0.9) {
    issues.push({ page: "site", check: "catalog-incomplete", detail: `${n.toLocaleString("en-US")} products imported; the store's sitemap lists ${expected.toLocaleString("en-US")}` });
  }
  // Products were found while building (the featured ones) but the shop came out empty.
  if (doc.kind !== "services" && n === 0 && doc.products.length > 0) {
    issues.push({ page: "site", check: "catalog-incomplete", detail: `the shop is empty: no products were imported (${doc.products.length} were found while building)` });
  }
  if (n > 50 && uncategorised / n > 0.15) {
    issues.push({ page: "site", check: "uncategorised", detail: `${uncategorised} of ${n} products are in no category (only in "Shop all")`, level: "note" });
  }
  const hero = doc.pages.find((p) => p.slug === "")?.sections.find((s) => s.type === "hero");
  if (hero && !hero.image && !hero.video) issues.push({ page: "/", check: "hero", detail: "the hero has no photo" });
  await sql()`UPDATE sites SET qa = ${JSON.stringify(issues)}::jsonb, qa_at = now() WHERE id = ${site.id}`;
  return issues;
}

/**
 * Runs the gate at the end of a build. Returns the step to run next (a
 * repair) or null when the site was released or held.
 */
export async function releaseGate(client: Client, base: string): Promise<{ next: MonthStage | null; summary: string }> {
  const build = await getBuild(client.id);
  const issues = await checkRelease(client);
  const blocking = issues.filter((i) => i.level !== "note");
  const repairs = build?.repairs ?? [];
  const studio = `${base}/studio/${client.token}`;

  if (!blocking.length) {
    await setBuild(client.id, { status: "ready", stage: "released", issues: [], error: null, notified: true });
    if (!build?.notified) {
      await emailClient(
        client.email,
        `Your new website for ${client.domain} is ready`,
        [
          client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,",
          "",
          `Your new website for ${client.domain} is built and checked. See it, choose your design and ask for any change in your studio (keep this link private):`,
          studio,
          "",
          "When you're happy with it, publish it on your own domain from the same page.",
          "",
          "John Lim",
          "Founder, Apereel",
        ].join("\n"),
      );
    }
    return { next: null, summary: `released${issues.length ? ` (${issues.length} notes)` : ""}` };
  }

  // One automatic repair per kind: re-import the catalog, or rewrite the copy (the rest of the build follows).
  const repair = blocking.some((i) => CATALOG_CHECKS.has(i.check)) && !repairs.includes("catalog")
    ? "catalog"
    : blocking.some((i) => COPY_CHECKS.has(i.check)) && !repairs.includes("build")
      ? "build"
      : null;
  if (repair) {
    await setBuild(client.id, { status: "building", stage: repair, attempts: 0, repairs: [...repairs, repair], issues: blocking });
    return { next: repair, summary: `repairing (${repair}): ${blocking.map((i) => i.check).join(", ")}` };
  }

  await setBuild(client.id, { status: "held", stage: "held", issues: blocking });
  await notifyJohn(
    `Website held for review: ${client.domain}`,
    [
      `The build for ${client.domain} finished but didn't pass its checks${repairs.length ? ` after repairing (${repairs.join(", ")})` : ""}. The client sees "being finished" until you release it.`,
      "",
      ...blocking.map((i) => `- ${i.page} · ${i.check}: ${i.detail}`),
      "",
      `Review and release it on ${base}/admin/clients`,
    ].join("\n"),
  );
  return { next: null, summary: `held: ${blocking.map((i) => i.check).join(", ")}` };
}

/** John releases a held site by hand: the client is emailed as for a passing site. */
export async function approveRelease(client: Client, base: string) {
  const build = await getBuild(client.id);
  await setBuild(client.id, { status: "ready", stage: "released", approved: true, notified: true });
  if (!build?.notified) {
    await emailClient(
      client.email,
      `Your new website for ${client.domain} is ready`,
      [client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,", "", `Your new website for ${client.domain} is ready. See it and ask for any change in your studio (keep this link private):`, `${base}/studio/${client.token}`, "", "John Lim", "Founder, Apereel"].join("\n"),
    );
  }
}

/**
 * Builds with no progress for 25 minutes stopped without reporting (a step
 * timed out or crashed): marked failed and reported to John. Run by the
 * discover cron and whenever John opens the clients page.
 */
export async function failStaleBuilds(base: string): Promise<number> {
  const stale = (await sql()`
    UPDATE clients SET build = build || jsonb_build_object('status', 'failed', 'error', 'no progress for 25 minutes (a step stopped without reporting)', 'at', now())
    WHERE service = 'web-development' AND build->>'status' = 'building' AND (build->>'at')::timestamptz < now() - interval '25 minutes'
    RETURNING domain, build->>'stage' AS stage
  `) as { domain: string; stage: string }[];
  for (const s of stale) {
    await notifyJohn(`Website build stopped: ${s.domain}`, `The build for ${s.domain} made no progress for 25 minutes (last step: ${s.stage}). The client sees "being finished". Run "Build the site" again on ${base}/admin/clients`);
  }
  return stale.length;
}
