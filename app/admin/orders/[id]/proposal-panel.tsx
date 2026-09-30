"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BuildProposal, ProposalItem } from "@/lib/build-proposal";
import type { ServiceTiers } from "@/lib/service-tiers";

// The web development proposal for one analysis: drafted from the report,
// edited by John, then sent to the customer as a private link.

const field =
  "w-full rounded-xl border border-white/15 bg-navy-mid px-3 py-2 text-[14px] leading-relaxed text-ink focus:border-electric focus:outline-none";
const label = "font-mono text-[10px] tracking-[0.16em] text-muted uppercase";

export function ProposalPanel({
  orderId,
  initial,
  status,
  link,
  web,
}: {
  orderId: string;
  initial: BuildProposal;
  status: "new" | "draft" | "sent" | "accepted";
  link: string | null;
  web: ServiceTiers;
}) {
  const router = useRouter();
  const [p, setP] = useState<BuildProposal>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const locked = status === "sent" || status === "accepted";
  const set = (patch: Partial<BuildProposal>) => setP((x) => ({ ...x, ...patch }));
  const setItem = (i: number, patch: Partial<ProposalItem>) =>
    setP((x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));

  function chooseTier(id: BuildProposal["tier"]) {
    const t = web.tiers.find((x) => x.id === id)!;
    set({ tier: id, tierLabel: t.label ?? id, tierName: t.name, timeline: t.timeline ?? p.timeline, price: t.price ?? p.price });
  }

  async function act(action: "save" | "send" | "redraft") {
    if (action === "send" && !confirmSend) {
      setConfirmSend(true);
      return;
    }
    setBusy(action);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${orderId}/proposal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, proposal: p }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; emailed?: boolean; proposal?: BuildProposal } | null;
    setBusy(null);
    setConfirmSend(false);
    if (!json?.ok) {
      setMessage({ tone: "error", text: json?.error ?? "Something went wrong." });
      return;
    }
    if (action === "redraft" && json.proposal) {
      setP(json.proposal);
      setMessage({ tone: "ok", text: "Redrafted from the report. Save to keep it." });
      return;
    }
    setMessage({
      tone: "ok",
      text:
        action === "save"
          ? "Saved."
          : json.emailed
            ? "Sent. The customer has been emailed their proposal link."
            : "Marked as sent, but the email didn't go out. Copy the link below and send it yourself.",
    });
    router.refresh();
  }

  return (
    <section className="mt-16 rounded-3xl border border-electric/30 p-6 sm:p-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">Next step · Web development proposal</p>
          <p className="mt-2 text-[14px] text-muted">
            Drafted from this report. Every line comes from a finding; edit anything before sending.
          </p>
        </div>
        <p className="font-mono text-[12px] text-muted">
          {status === "new" ? "Not saved yet" : status === "draft" ? "Draft" : status === "sent" ? "Sent, awaiting reply" : "Accepted"}
        </p>
      </div>
      {link && (
        <p className="mt-3 text-[14px] text-ink/80">
          Customer link:{" "}
          <a href={link} className="text-electric underline underline-offset-4">
            {link.replace(/^https?:\/\/[^/]+/, "")}
          </a>
        </p>
      )}
      {message && (
        <p role="status" className={`mt-4 rounded-xl border p-3 text-[14px] ${message.tone === "ok" ? "border-electric/30 text-ink" : "border-signal/40 text-signal"}`}>
          {message.text}
        </p>
      )}

      <fieldset disabled={locked} className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <p className={label}>Package</p>
            <div className="mt-2 grid gap-2">
              {web.tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => chooseTier(t.id)}
                  className={`rounded-xl border p-3 text-left text-[14px] ${p.tier === t.id ? "border-electric bg-electric/10 text-ink" : "border-white/15 text-muted"}`}
                >
                  <span className="font-medium">{t.label}</span> · {t.name}
                  <span className="block font-mono text-[12px]">${t.price?.toLocaleString("en-US") ?? "?"}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className={label}>Price (USD, before credit)</span>
            <input type="number" min={0} step={50} className={`${field} mt-2`} value={p.price} onChange={(e) => set({ price: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className={label}>Analysis credit (USD)</span>
            <input type="number" min={0} className={`${field} mt-2`} value={p.credit} onChange={(e) => set({ credit: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className={label}>Timeline</span>
            <input className={`${field} mt-2`} value={p.timeline} onChange={(e) => set({ timeline: e.target.value })} />
          </label>
          <p className="font-mono text-[14px] text-ink">
            Customer pays ${Math.max(0, p.price - p.credit).toLocaleString("en-US")}
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className={label}>Why this package (one per line)</span>
            <textarea rows={4} className={`${field} mt-2`} value={p.reasons.join("\n")} onChange={(e) => set({ reasons: e.target.value.split("\n") })} />
          </label>
          <div>
            <p className={label}>What&apos;s included</p>
            <div className="mt-2 space-y-2">
              {p.items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <input className={field} value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} aria-label="Item" />
                    <input className={`${field} text-[13px] text-muted`} value={it.detail} onChange={(e) => setItem(i, { detail: e.target.value })} aria-label="Detail" />
                  </div>
                  <button type="button" onClick={() => set({ items: p.items.filter((_, j) => j !== i) })} className="self-start px-2 py-2 text-[13px] text-muted hover:text-signal" aria-label="Remove item">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set({ items: [...p.items, { title: "", detail: "" }] })} className="text-[13px] text-electric underline underline-offset-4">
                Add an item
              </button>
            </div>
          </div>
          <label className="block">
            <span className={label}>Note to the customer (optional)</span>
            <textarea rows={3} className={`${field} mt-2`} value={p.notes} onChange={(e) => set({ notes: e.target.value })} />
          </label>
        </div>
      </fieldset>

      {!locked && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => act("save")} disabled={!!busy} className="press-scale h-11 rounded-full border border-white/25 px-5 text-[13px] text-ink disabled:opacity-50">
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button type="button" onClick={() => act("send")} disabled={!!busy} className="press-scale h-11 rounded-full bg-electric px-5 text-[13px] font-semibold text-navy disabled:opacity-50">
            {busy === "send" ? "Sending…" : confirmSend ? "Click again to send to the customer" : "Send proposal"}
          </button>
          <button type="button" onClick={() => act("redraft")} disabled={!!busy} className="text-[13px] text-muted underline underline-offset-4 disabled:opacity-50">
            Redraft from the report
          </button>
        </div>
      )}
    </section>
  );
}
