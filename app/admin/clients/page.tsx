import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listClients, tierFor } from "@/lib/clients";
import { NewClientForm, GenerateButton } from "./client-forms";
import { MediaNudger } from "@/components/media-nudger";
import { pendingMediaJobs } from "@/lib/media";

export const metadata: Metadata = { title: "AI service clients", robots: { index: false, follow: false } };

const SERVICE_NAME: Record<string, string> = {
  "premium-creative": "Content",
  advertising: "Ads",
  "web-development": "Website",
};

export default async function ClientsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
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
                        c.site_slug ? <a href={`/sites/${c.site_slug}`} className="text-electric underline underline-offset-4">View site</a> : "Not built"
                      ) : (
                        c.items
                      )}
                      {c.running_since && <span className="block text-[11px] text-muted">Running since {new Date(c.running_since).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                    </td>
                    <td className="py-3 pr-4 font-mono text-ink/85">${c.cost.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <a href={`/studio/${c.token}`} className="text-electric underline underline-offset-4">Studio</a>
                      <GenerateButton id={c.id} label={c.status === "requested" ? "Activate (no charge) and run" : c.service === "web-development" ? "Build the site" : "Generate this month"} />
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
