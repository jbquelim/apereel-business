import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProposalByToken } from "@/lib/proposals";
import { AcceptButton } from "./accept-button";

// A customer's web development proposal, reached by the private link John
// sends. Accepting notifies John; payment and scheduling follow by email.

export const metadata: Metadata = {
  title: "Your website proposal",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await getProposalByToken(token);
  if (!row) notFound();
  const p = row.data;
  const due = Math.max(0, p.price - p.credit);
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <main id="main" className="bg-navy pt-10">
      <article className="mx-auto w-full max-w-[880px] px-6 py-20 text-ink sm:px-8 sm:py-24">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Apereel · Website proposal</p>
        <h1 className="font-display mt-4 text-4xl tracking-[-0.02em] sm:text-5xl">{row.domain}</h1>
        <p className="mt-4 text-[15px] text-muted">
          {[row.name && `Prepared for ${row.name}`, "Built from your analysis", "John Lim"].filter(Boolean).join(" · ")}
        </p>

        <section className="mt-12 rounded-3xl border border-electric/40 bg-electric/5 p-6 sm:p-10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">
            {p.tierLabel} · {p.timeline}
          </p>
          <h2 className="font-display mt-3 text-3xl">{p.tierName}</h2>
          {p.reasons.length > 0 && (
            <ul className="mt-6 space-y-2">
              {p.reasons.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/85">
                  <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                  {r}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-14">
          <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">What we&apos;ll do</p>
          <ol className="mt-6 space-y-3">
            {p.items.map((it, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-navy-mid p-5">
                <span className="font-mono text-[15px] text-electric">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[16px] font-medium text-ink">{it.title}</p>
                  {it.detail && <p className="mt-1 text-[14px] leading-relaxed text-muted">{it.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {p.notes && (
          <section className="mt-10 rounded-2xl border border-white/10 p-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">A note from John</p>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/85">{p.notes}</p>
          </section>
        )}

        <section className="mt-14 border-t border-white/10 pt-10">
          <div className="space-y-2 font-mono text-[15px]">
            <p className="flex justify-between text-ink/80"><span>{p.tierLabel} package</span><span>{usd(p.price)}</span></p>
            {p.credit > 0 && (
              <p className="flex justify-between text-ink/80"><span>Your analysis, credited</span><span>−{usd(p.credit)}</span></p>
            )}
            <p className="flex justify-between border-t border-white/10 pt-3 text-xl text-ink"><span>Total</span><span>{usd(due)}</span></p>
          </div>
          <p className="mt-3 text-[13px] text-muted">
            USD, before any applicable tax. Half to start, half at launch. Timeline starts when we begin.
          </p>
          <AcceptButton token={token} accepted={row.status === "accepted"} />
        </section>
      </article>
    </main>
  );
}
