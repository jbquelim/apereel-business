import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listClients, tierFor } from "@/lib/clients";
import { NewClientForm, GenerateButton, DesignSelect, AdminCatalogUpload, AuthorizeButton } from "./client-forms";
import { blockedByFirewall } from "@/lib/crawl-access";
import { TEMPLATES } from "@/lib/templates";
import { MediaNudger } from "@/components/media-nudger";
import { pendingMediaJobs } from "@/lib/media";
import { failStaleBuilds } from "@/lib/site-release";

export const metadata: Metadata = { title: "AI service clients", robots: { index: false, follow: false } };

const SERVICE_NAME: Record<string, string> = {
  "premium-creative": "Content",
  advertising: "Ads",
  "web-development": "Website",
};

export default async function ClientsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  // Builds that stopped without reporting show as failed (and John is emailed once).
  await failStaleBuilds(process.env.NEXT_PUBLIC_SITE_URL || "https://www.apereel.com").catch(() => 0);
  const clients = await listClients();
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1120px] px-6 py-20 sm:px-8">
        <Link href="/admin" className="font-mono text-[12px] text-muted underline underline-offset-4">
          ← Orders
        </Link>
        <h1 className="font-display mt-6 text-4xl text-ink">AI service clients</h1>
        <p className="mt-3 max-w-2xl text-[14px] text-muted">
          Each client gets a private studio link where they see their content and ask for changes, up to
          their tier&apos;s monthly allowance. AI cost is logged on every call.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                <th className="py-2 pr-4 font-normal">Client</th>
                <th className="py-2 pr-4 font-normal">Service</th>
                <th className="py-2 pr-4 font-normal">Requests this month</th>
                <th className="py-2 pr-4 font-normal">Items / site</th>
                <th className="py-2 pr-4 font-normal">AI cost to date</th>
                <th className="py-2 font-normal" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const t = tierFor(c);
                return (
                  <tr key={c.id} className="border-b border-white/5 align-top">
                    <td className="py-3 pr-4">
                      <p className="text-ink">{c.domain}</p>
                      <p className="text-[12px] text-muted">{c.name ?? ""} {c.email}</p>
                      {c.status !== "active" && <p className="font-mono text-[11px] text-signal">{c.status === "requested" ? "Requested, not paid" : c.status}</p>}
                    </td>
                    <td className="py-3 pr-4 text-ink/85">
                      {SERVICE_NAME[c.service]} · {t?.label ?? c.tier}
                      {t?.price != null && <span className="block font-mono text-[12px] text-muted">${t.price}{t.cadence === "monthly" ? "/mo" : ""}</span>}
                    </td>
                    <td className="py-3 pr-4 font-mono text-ink/85">{c.used} / {t?.requests ?? 0}</td>
                    <td className="py-3 pr-4 font-mono text-ink/85">
                      {c.service === "web-development" ? (
                        c.site_slug ? (
                          <>
                            <a href={`/sites/${c.site_slug}`} className="text-electric underline underline-offset-4">View site</a>
                            {c.site_id && <DesignSelect siteId={c.site_id} current={c.site_design} options={TEMPLATES.map((t) => ({ id: t.id, name: t.name, tier: t.tier }))} />}
                            {c.site_qa && (
                              <details className="mt-1 text-[11px]">
                                <summary className={`cursor-pointer ${c.site_qa.length ? "text-signal" : "text-muted"}`}>{c.site_qa.length ? `${c.site_qa.length} to check` : "Checks passed"}</summary>
                                <ul className="mt-1 max-w-[340px] space-y-1 whitespace-normal font-sans text-ink/80">
                                  {c.site_qa.map((q, i) => <li key={i}><span className="font-mono text-muted">{q.page} · {q.check}</span> {q.detail}</li>)}
                                </ul>
                              </details>
                            )}
                          </>
                        ) : "Not built"
                      ) : (
                        <>
                          {c.items}
                          {c.build?.batch && (
                            <span className={`block text-[11px] ${c.build.status === "ready" && !c.held ? "text-muted" : "text-signal"}`}>
                              {c.build.status === "ready" ? `${c.build.batch} released${c.held ? `, ${c.held} held for you` : ""}` : c.build.status === "building" ? `${c.build.batch}: making ${c.build.stage}${c.build.attempts ? ` (try ${c.build.attempts + 1})` : ""}` : `${c.build.batch} failed at ${c.build.stage}: ${c.build.error ?? ""}`}
                            </span>
                          )}
                          {!!c.build?.issues?.length && (
                            <details className="mt-1 text-[11px]">
                              <summary className="cursor-pointer text-signal">What was held</summary>
                              <ul className="mt-1 max-w-[340px] space-y-1 whitespace-normal font-sans text-ink/80">
                                {c.build.issues.map((q, i) => <li key={i}><span className="font-mono text-muted">{q.page} · {q.check}</span> {q.detail}</li>)}
                              </ul>
                            </details>
                          )}
                        </>
                      )}
                      {c.service === "web-development" && c.build && (
                        <span className={`block text-[11px] ${c.build.status === "ready" ? "text-muted" : "text-signal"}`}>
                          {c.build.status === "ready" ? `Released to client${c.build.approved ? " (by you)" : ""}` : c.build.status === "building" ? `Building: ${c.build.stage}${c.build.attempts ? ` (try ${c.build.attempts + 1})` : ""}` : c.build.status === "held" ? "Held: not released to the client" : `Failed at ${c.build.stage}: ${c.build.error ?? ""}`}
                        </span>
                      )}
                      {c.running_since && <span className="block text-[11px] text-muted">Running since {new Date(c.running_since).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                    </td>
                    <td className="py-3 pr-4 font-mono text-ink/85">${c.cost.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <a href={`/studio/${c.token}`} className="text-electric underline underline-offset-4">Studio</a>
                      <GenerateButton id={c.id} label={c.status === "requested" ? "Activate (no charge) and run" : c.service === "web-development" ? "Build the site" : "Generate this month"} />
                      {c.service === "web-development" && c.status === "active" && (
                        <GenerateButton id={c.id} label="Fresh analysis + rebuild (~$0.50)" body={{ fresh: true }} />
                      )}
                      {c.service !== "web-development" && c.held > 0 && (
                        <GenerateButton id={c.id} label={`Release ${c.held} held item${c.held > 1 ? "s" : ""}`} body={{ releaseHeld: true }} />
                      )}
                      {c.service !== "web-development" && c.build?.batch && c.status === "active" && (
                        <GenerateButton id={c.id} label="Re-check this month (fixes; AI repair costs cents)" body={{ recheck: true }} />
                      )}
                      {c.failed_renders > 0 && (
                        <GenerateButton id={c.id} label={`Retry ${c.failed_renders} failed render${c.failed_renders > 1 ? "s" : ""} (Higgsfield credit, ~$1 each)`} body={{ retryRenders: true }} />
                      )}
                      {blockedByFirewall(c.build) && (
                        <>
                          <span className="mt-1 block text-[11px] text-signal">
                            Their site turned our reader away.{" "}
                            {c.authorized_at
                              ? `Authorized ${new Date(c.authorized_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: get their product export and upload it here, or allow our crawler in their firewall.`
                              : "They were emailed to reply “yes”; record it when it comes, then sort it on their behalf."}
                          </span>
                          {c.authorized_at ? <AdminCatalogUpload id={c.id} /> : <AuthorizeButton id={c.id} />}
                        </>
                      )}
                      {c.service === "web-development" && (c.build?.status === "held" || c.build?.status === "failed") && c.site_slug && (
                        <GenerateButton id={c.id} label="Release to client" body={{ approve: true }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {clients.length === 0 && <p className="mt-6 text-muted">No clients yet.</p>}
        </div>

        <NewClientForm />
        <MediaNudger pending={await pendingMediaJobs().catch(() => 0)} />
      </section>
    </main>
  );
}
