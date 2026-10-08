import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";

// Getting a client's catalog when their own site's firewall blocks crawlers.
// Nothing technical is asked of the client: with their authorization
// (clients.authorized_at: a term of ordering, or their emailed "yes" that John
// records in /admin/clients) John sorts it on their behalf, with a product
// file (lib/catalog-upload) or by letting our crawler's private token through
// their firewall (lib/polite-fetch). Their permission, never a way around the block.

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
  // A services business (no products) on content or ads isn't blocked: the service needs products. John decides.
  const services = ((await sql()`SELECT 1 FROM sites s JOIN clients c ON c.id = s.client_id WHERE c.domain = ${client.domain} AND s.doc->>'kind' = 'services' LIMIT 1`) as unknown[]).length > 0;
  if (client.service !== "web-development" && services) {
    const { notifyJohn } = await import("./notify");
    await notifyJohn(`${client.domain} has no products for ${client.service === "advertising" ? "ads" : "content"}`, `${client.domain} is a services business (its website is a services site). Content and ads are built from products, so nothing was made. Talk to the client about what to feature.`);
    return;
  }
  await emailClient(
    client.email,
    `One quick yes and we'll finish your ${client.service === "web-development" ? "website" : client.service === "advertising" ? "ads" : "content"}`,
    [
      client.name ? `Hi ${client.name.split(/\s+/)[0]},` : "Hi,",
      "",
      `${client.domain}'s security settings turned away our automatic reader, so we couldn't pull your products in. That's common, and there's nothing for you to fix.`,
      "",
      "Just reply \"yes, go ahead\" and we'll take care of it ourselves. If you happen to know who hosts your site or which platform your store runs on (Shopify, WordPress, GoDaddy…), mention it; if not, we'll work it out.",
      "",
      `If you already have a product list (your store's export, or a spreadsheet), you can also drop it in your studio and we start straight away: ${base}/studio/${client.token}`,
      "",
      "John Lim",
      "Founder, Apereel",
    ].join("\n"),
  );
}
