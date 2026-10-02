import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { isAdmin } from "@/lib/admin-auth";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = { title: "Template library", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TIER: Record<string, string> = { fix: "Template · $100", build: "Custom · $300", grow: "Signature · $500" };

// Every template, filled with every built site's real data, side by side.
export default async function TemplatesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const sites = process.env.DATABASE_URL
    ? ((await neon(process.env.DATABASE_URL)`
        SELECT s.slug, c.domain, s.doc->'products'->0->>'slug' AS product FROM sites s JOIN clients c ON c.id = s.client_id ORDER BY s.updated_at DESC
      `) as { slug: string; domain: string; product: string | null }[])
    : [];
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1120px] px-6 py-20 sm:px-8">
        <Link href="/admin/clients" className="font-mono text-[12px] text-muted underline underline-offset-4">← Clients</Link>
        <h1 className="font-display mt-6 text-4xl text-ink">Template library</h1>
        <p className="mt-3 max-w-2xl text-[14px] text-muted">
          Hand-designed templates, each previewed with real client data. A template owns the layout; the
          client&apos;s logo, colour, products and copy drop into it.
        </p>
        <div className="mt-10 space-y-6">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="rounded-3xl border border-white/10 bg-navy-mid p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-2xl font-medium text-ink">{tpl.name}</h2>
                <p className="font-mono text-[12px] text-electric">{TIER[tpl.tier]} · reference {tpl.reference}</p>
              </div>
              <p className="mt-2 text-[14px] text-muted">{tpl.summary}</p>
              <ul className="mt-5 space-y-2 text-[14px]">
                {sites.map((s) => (
                  <li key={s.slug} className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="w-48 text-ink">{s.domain}</span>
                    {[
                      ["Home", ""],
                      ["Collection", "/products"],
                      ["Product", s.product ? `/products/${s.product}` : null],
                      ["About", "/about"],
                      ["Contact", "/contact"],
                    ]
                      .filter(([, p]) => p !== null)
                      .map(([label, p]) => (
                        <a key={label} href={`/template-preview/${tpl.id}/${s.slug}${p}`} target="_blank" rel="noopener" className="text-electric underline underline-offset-4">
                          {label}
                        </a>
                      ))}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
