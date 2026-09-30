"use client";

import { useState } from "react";

// Opens the Stripe customer portal: cards, invoices, cancel.
export function BillingButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function open() {
    setBusy(true);
    const res = await fetch(`/api/studio/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "billing", itemId: 0 }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
    if (json?.ok && json.url) return window.location.assign(json.url);
    setBusy(false);
    setErr(json?.error ?? "Billing couldn't open.");
  }
  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={open} disabled={busy} className="rounded-full border border-white/20 px-4 py-2 text-[13px] text-ink hover:border-electric disabled:opacity-50">
        {busy ? "Opening…" : "Billing and invoices"}
      </button>
      {err && <span className="text-[12px] text-signal">{err}</span>}
    </span>
  );
}
