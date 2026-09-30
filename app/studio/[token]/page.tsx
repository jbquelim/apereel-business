import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { allowance, getClientByToken, tierFor } from "@/lib/clients";
import { listContent } from "@/lib/content-engine";
import { jobsForItems } from "@/lib/media";
import { getSiteForClient } from "@/lib/site-builder";
import { StudioItems } from "./studio-items";
import { WebsiteStudio } from "./website-studio";
import { BillingButton } from "./billing-button";
import { refreshPaymentsStatus } from "@/lib/connect";

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
    const site = await getSiteForClient(client.id);
    // Back from Stripe onboarding (or still pending): re-check the account.
    if (site?.stripe_account_id && site.payments_status !== "active") {
      site.payments_status = await refreshPaymentsStatus(site.id, site.stripe_account_id);
    }
    const leads = site && process.env.DATABASE_URL
      ? ((await neon(process.env.DATABASE_URL)`
          SELECT name, email, phone, message, page, created_at FROM site_leads WHERE site_id = ${site.id} ORDER BY id DESC LIMIT 50
        `) as { name: string; email: string; phone: string; message: string; page: string; created_at: string }[])
      : [];
    body = site ? (
      <WebsiteStudio
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
      <p className="mt-12 text-[15px] text-muted">Your site is being built. Check back in a few minutes.</p>
    );
  } else {
    const items = await listContent(client.id);
    const batch = items[0]?.batch ?? null;
    const current = items.filter((i) => i.batch === batch);
    const jobs = await jobsForItems(current.map((i) => i.id));
    body = current.length ? (
      <StudioItems
        token={token}
        items={current}
        left={left.left}
        media={Object.fromEntries([...jobs].map(([id, j]) => [id, { status: j.status, url: j.output_url }]))}
      />
    ) : (
      <p className="mt-12 text-[15px] text-muted">This month&apos;s batch is being prepared. Check back in a few minutes.</p>
    );
  }

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
        {body}
      </section>
    </main>
  );
}
