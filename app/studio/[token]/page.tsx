import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { allowance, getClientByToken, tierFor } from "@/lib/clients";
import { listContent } from "@/lib/content-engine";
import { jobsForItems } from "@/lib/media";
import { getSiteForClient } from "@/lib/site-builder";
import { StudioItems } from "./studio-items";
import { WebsiteStudio } from "./website-studio";
import { designChoices } from "@/lib/site-design";
import { isReleased } from "@/lib/site-release";
import { blockedByFirewall, ensureCrawlToken } from "@/lib/crawl-access";
import { CatalogAccess } from "./catalog-access";
import { BillingButton } from "./billing-button";
import { refreshPaymentsStatus } from "@/lib/connect";
import { MediaNudger } from "@/components/media-nudger";
import { pendingMediaJobs } from "@/lib/media";

// A client's studio: their content, ads or website, made by AI from their
// own products and what we know of their market. Every item takes changes
// in plain words; each change uses one request from the monthly allowance.

export const metadata: Metadata = { title: "Your studio", robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

const SERVICE_NAME: Record<string, string> = { "premium-creative": "Content", advertising: "Ads", "web-development": "Website" };

export default async function StudioPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getClientByToken(token);
  if (!client) notFound();
  const left = await allowance(client);
  const tier = tierFor(client);

  let body: React.ReactNode;
  if (client.service === "web-development") {
    // Until it passes its checks the client sees "being finished", never a half-built site (lib/site-release).
    const site = isReleased(client.build) ? await getSiteForClient(client.id) : null;
    // Back from Stripe onboarding (or still pending): re-check the account.
    if (site?.stripe_account_id && site.payments_status !== "active") {
      site.payments_status = await refreshPaymentsStatus(site.id, site.stripe_account_id);
    }
    const leads = site && process.env.DATABASE_URL
      ? ((await neon(process.env.DATABASE_URL)`
          SELECT name, email, phone, message, page, created_at FROM site_leads WHERE site_id = ${site.id} ORDER BY id DESC LIMIT 50
        `) as { name: string; email: string; phone: string; message: string; page: string; created_at: string }[])
      : [];
    const design = site ? await designChoices(site, client).catch(() => null) : null;
    body = site ? (
      <WebsiteStudio
        designs={(design?.choices ?? []).map((t) => ({ id: t.id, name: t.name, summary: t.summary }))}
        currentDesign={design?.current ?? null}
        token={token}
        slug={site.slug}
        published={site.published}
        domain={site.custom_domain}
        domainStatus={site.domain_status}
        pages={site.doc.pages.map((p) => ({ slug: p.slug, label: p.navLabel ?? "Home" }))}
        products={site.doc.products.length}
        paymentsStatus={site.payments_status}
        productAction={site.doc.productAction}
        left={left.left}
        leads={leads}
      />
    ) : (
      <div className="mt-12 max-w-[560px]">
        <p className="text-[17px] text-ink">Your website is being finished.</p>
        <p className="mt-3 text-[15px] text-muted">We build it from your own products and check every page before you see it. We&apos;ll email you at {client.email} as soon as it&apos;s ready, usually within the hour.</p>
      </div>
    );
  } else {
    // Only a released month is shown (lib/content-release); held items never are. A month still being
    // made or checked stays hidden, and last month's stays up meanwhile.
    const items = (await listContent(client.id)).filter((i) => i.status !== "held");
    const batches = [...new Set(items.map((i) => i.batch))];
    const preparing = !!client.build?.batch && client.build.batch === batches[0] && client.build.status !== "ready";
    const batch = (preparing ? batches[1] : batches[0]) ?? null;
    const current = items.filter((i) => i.batch === batch);
    const jobs = await jobsForItems(current.map((i) => i.id));
    body = current.length ? (
      <>
      {preparing && <p className="mt-10 text-[15px] text-muted">This month&apos;s batch is being made and checked. We&apos;ll email you when it&apos;s ready; last month&apos;s is below.</p>}
      <StudioItems
        token={token}
        items={current}
        left={left.left}
        media={Object.fromEntries([...jobs].map(([id, list]) => [id, list.map((j) => ({ status: j.status, url: j.output_url, aspect: j.brief.aspect }))]))}
      />
      </>
    ) : (
      <p className="mt-12 text-[15px] text-muted">This month&apos;s batch is being made and checked before you see it. We&apos;ll email you at {client.email} as soon as it&apos;s ready.</p>
    );
  }

  const blocked = client.status === "active" && blockedByFirewall(client.build);
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">
          Apereel studio · {SERVICE_NAME[client.service]} {tier?.label ?? ""}
        </p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">{client.domain}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          Made by AI from your own products and what we know of your market. Ask for any change in plain
          words; each change uses one request.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="inline-flex rounded-full border border-electric/40 bg-electric/5 px-4 py-2 font-mono text-[13px] text-ink">
            {client.status === "active"
              ? `${left.left} of ${left.limit} change requests left${tier?.cadence === "monthly" ? " this month" : ""}`
              : "Your plan has ended; your work stays here"}
          </p>
          {client.stripe_customer_id && <BillingButton token={token} />}
        </div>
        {/* Their site blocked our crawler: upload a product file or let our crawler through (lib/crawl-access). */}
        {blocked && <CatalogAccess token={token} crawlToken={await ensureCrawlToken(client)} domain={client.domain} />}
        {body}
        <MediaNudger pending={await pendingMediaJobs().catch(() => 0)} />
      </section>
    </main>
  );
}
