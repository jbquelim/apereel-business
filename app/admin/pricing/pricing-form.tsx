"use client";

import { useState } from "react";

type TierRow = { id: "fix" | "build" | "grow"; name: string; cadence: string; price: number | null; from: boolean };
type ServiceRow = { slug: string; tag: string; tiers: TierRow[] };

export function PricingForm({ services }: { services: ServiceRow[] }) {
  const [rows, setRows] = useState(services);
  const [state, setState] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (slug: string, id: TierRow["id"], patch: Partial<TierRow>) =>
    setRows((rs) => rs.map((s) => (s.slug !== slug ? s : { ...s, tiers: s.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) })));

  async function save() {
    setBusy(true);
    setState(null);
    const prices = rows.flatMap((s) =>
      s.tiers.map((t) => ({ slug: s.slug, tier: t.id, price: t.price, pricePrefix: t.from ? "from" : null })),
    );
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setBusy(false);
    setState(json?.ok ? { tone: "ok", text: "Saved. Fully priced services now show their tiers." } : { tone: "error", text: json?.error ?? "Save failed." });
  }

  return (
    <div className="mt-10 space-y-6">
      {rows.map((s) => {
        const complete = s.tiers.every((t) => t.price != null);
        return (
          <div key={s.slug} className="rounded-2xl border border-white/10 bg-navy-mid p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-lg font-medium text-ink">{s.tag}</p>
              <p className={`font-mono text-[11px] uppercase ${complete ? "text-electric" : "text-muted"}`}>
                {complete ? "Live on service page" : "Hidden until all three are priced"}
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {s.tiers.map((t) => (
                <label key={t.id} className="block rounded-xl border border-white/10 p-4">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                    {t.id} · {t.cadence}
                  </span>
                  <span className="mt-1 block text-[14px] text-ink">{t.name}</span>
                  <span className="mt-3 flex items-center gap-2">
                    <span className="text-muted">$</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={t.price ?? ""}
                      onChange={(e) => update(s.slug, t.id, { price: e.target.value ? Math.round(Number(e.target.value)) : null })}
                      placeholder="Not set"
                      aria-label={`${s.tag} ${t.name} price`}
                      className="h-10 w-full rounded-lg border border-white/15 bg-navy px-3 text-ink focus:border-electric focus:outline-none"
                    />
                    {t.cadence === "monthly" && <span className="text-[12px] text-muted">/mo</span>}
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-[13px] text-muted">
                    <input type="checkbox" checked={t.from} onChange={(e) => update(s.slug, t.id, { from: e.target.checked })} />
                    Show as &ldquo;from&rdquo;
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="press-scale h-11 rounded-full bg-electric px-6 text-[13px] font-semibold text-navy disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save prices"}
        </button>
        {state && (
          <p role="status" className={`text-[14px] ${state.tone === "ok" ? "text-ink" : "text-signal"}`}>
            {state.text}
          </p>
        )}
      </div>
    </div>
  );
}
