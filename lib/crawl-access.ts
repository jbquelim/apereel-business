import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";

// Getting a client's catalog when their own site's firewall blocks crawlers:
// a private token they let through their firewall (our crawler sends it to
// their site, lib/polite-fetch), or a product file they upload
// (lib/catalog-upload). Their permission, never a way around the block.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/** The client's crawler token, made the first time it's needed. Clients of one domain share it. */
export async function ensureCrawlToken(client: Client): Promise<string> {
  const have = ((await sql()`SELECT crawl_token FROM clients WHERE domain = ${client.domain} AND crawl_token IS NOT NULL LIMIT 1`) as { crawl_token: string }[])[0]?.crawl_token;
  const token = have ?? `apv_${randomBytes(18).toString("base64url")}`;
  await sql()`UPDATE clients SET crawl_token = ${token} WHERE domain = ${client.domain} AND crawl_token IS NULL`;
  return token;
}

/** Whether a build or month stopped because the client's products couldn't be read from their site. */
export function blockedByFirewall(build: { status?: string; error?: string | null; issues?: { check: string }[] } | null | undefined): boolean {
  if (!build || build.status === "ready" || build.status === "building") return false;
  return (
    (build.issues ?? []).some((i) => i.check === "catalog-incomplete") ||
    /no products could be read|neither products nor services|could only be read in part|catalog page \d+ failed|running out of time/i.test(build.error ?? "")
  );
}

/** Emails the client once (per run) that their site blocked us, with what to do: their studio has both options. */
export async function askForCatalog(client: Client, base: string): Promise<void> {
  const { getBuild, setBuild } = await import("./site-release");
  const { emailClient } = await import("./notify");
  const build = await getBuild(client.id);
  if (!blockedByFirewall(build) || build?.askedForCatalog) return;
  await setBuild(client.id, { askedForCatalog: true });
  await emailClient(
    client.email,
    `We need your product list for ${client.domain}`,
    [
      client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,",
      "",
      `Your site's firewall turns away automated visitors, ours included, so we couldn't read your products from ${client.domain}.`,
      "",
      "Two ways to fix it, both in your studio (keep this link private):",
      `${base}/studio/${client.token}`,
      "",
      "1. Upload your product export (Shopify or WooCommerce: Products → Export), or any spreadsheet of your products.",
      "2. Or let our crawler through your firewall with the private header shown there.",
      "",
      "We carry on as soon as we have it.",
      "",
      "John Lim",
      "Founder, Apereel",
    ].join("\n"),
  );
}
