import { neon } from "@neondatabase/serverless";

// Connects a customer's own domain to their site: the domain is added to the
// Vercel project that serves customer sites (proxy.ts routes it), then the
// customer points their DNS at Vercel. Needs VERCEL_TOKEN (and
// VERCEL_PROJECT_ID / VERCEL_TEAM_ID); without them the domain is saved and
// marked 'needs_vercel_token' until the token is added.

export type DomainState = { status: "needs_vercel_token" | "pending_dns" | "live" | "error"; records?: { type: string; name: string; value: string }[]; error?: string };

const API = "https://api.vercel.com";
const project = () => process.env.VERCEL_PROJECT_ID ?? "prj_EWM35FPlnIHlTJtKMcGXy1Q995rW";
const team = () => process.env.VERCEL_TEAM_ID ?? "team_69ZNYzNGKofcZQFqZoIVtmZo";

async function vercel(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}${path.includes("?") ? "&" : "?"}teamId=${team()}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  return { ok: res.ok, status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

function dnsRecords(domain: string) {
  const apex = domain.split(".").length === 2;
  return apex
    ? [{ type: "A", name: "@", value: "76.76.21.21" }, { type: "CNAME", name: "www", value: "cname.vercel-dns.com" }]
    : [{ type: "CNAME", name: domain.split(".")[0], value: "cname.vercel-dns.com" }];
}

export async function connectDomain(siteId: string, domain: string): Promise<DomainState> {
  const d = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return { status: "error", error: "That doesn't look like a domain." };
  const sql = neon(process.env.DATABASE_URL!);
  let state: DomainState;
  if (!process.env.VERCEL_TOKEN) {
    state = { status: "needs_vercel_token", records: dnsRecords(d) };
  } else {
    const added = await vercel(`/v10/projects/${project()}/domains`, { method: "POST", body: JSON.stringify({ name: d }) });
    await vercel(`/v10/projects/${project()}/domains`, { method: "POST", body: JSON.stringify({ name: `www.${d}`, redirect: d, redirectStatusCode: 308 }) });
    const code = (added.json.error as { code?: string } | undefined)?.code;
    state = added.ok || code === "domain_already_in_use" ? await domainStatus(d) : { status: "error", error: String((added.json.error as { message?: string } | undefined)?.message ?? added.status) };
  }
  await sql`UPDATE sites SET custom_domain = ${d}, domain_status = ${state.status}, updated_at = now() WHERE id = ${siteId}`;
  return state;
}

export async function domainStatus(domain: string): Promise<DomainState> {
  if (!process.env.VERCEL_TOKEN) return { status: "needs_vercel_token", records: dnsRecords(domain) };
  const cfg = await vercel(`/v6/domains/${domain}/config`);
  if (!cfg.ok) return { status: "error", error: `Vercel ${cfg.status}` };
  return cfg.json.misconfigured ? { status: "pending_dns", records: dnsRecords(domain) } : { status: "live" };
}
