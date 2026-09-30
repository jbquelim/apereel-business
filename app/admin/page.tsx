import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { formatUsd, tierById } from "@/lib/analysis-tiers";

export const metadata: Metadata = { title: "Growth Plan orders", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested, not paid",
  paid: "Paid, waiting to generate",
  generating: "Generating",
  needs_review: "Needs your review",
  sent: "Sent",
  failed: "Payment failed",
  generation_failed: "Generation failed",
};

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const orders = await listOrders();
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1120px] px-6 py-20 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Apereel admin</p>
        <h1 className="font-display mt-4 text-4xl text-ink">Growth Plan orders</h1>
        <p className="mt-3 text-[14px]">
          <Link href="/admin/pricing" className="text-electric underline underline-offset-4">
            Set service prices
          </Link>
          {" · "}
          <Link href="/admin/clients" className="text-electric underline underline-offset-4">
            AI service clients
          </Link>
        </p>
        {orders.length === 0 ? (
          <p className="mt-8 text-muted">No orders yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                  <th className="py-2 pr-4 font-normal">Website</th>
                  <th className="py-2 pr-4 font-normal">Customer</th>
                  <th className="py-2 pr-4 font-normal">Status</th>
                  <th className="py-2 pr-4 font-normal">Paid / requested</th>
                  <th className="py-2 font-normal" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/10">
                    <td className="py-3 pr-4 text-ink">
                      {o.domain}
                      <span className="ml-2 font-mono text-[11px] text-muted">{tierById(o.tier).name} · {formatUsd(tierById(o.tier).priceCents)}</span>
                      {o.livemode === false && (
                        <span className="ml-2 rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] text-muted">TEST</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ink/80">{o.name ? `${o.name} · ` : ""}{o.email}</td>
                    <td className={`py-3 pr-4 ${o.status === "needs_review" || o.status === "requested" ? "text-electric" : o.status.includes("failed") ? "text-signal" : "text-ink/80"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </td>
                    <td className="py-3 pr-4 text-muted">{fmt(o.paid_at ?? o.created_at)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="text-electric underline underline-offset-4">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
