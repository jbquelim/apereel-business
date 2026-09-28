"use client";

import { useState } from "react";
import { ANALYSIS_TIERS, formatUsd, type AnalysisTierId } from "@/lib/analysis-tiers";

// Website + email → Stripe Checkout (via /api/checkout). The website can be
// pre-filled from the ?site= link in a lead's follow-up email.
export function GrowthPlanCheckoutForm({ site, initialTier = "growth" }: { site: string; initialTier?: AnalysisTierId }) {
  const [tier, setTier] = useState<AnalysisTierId>(initialTier);
  const [url, setUrl] = useState(site);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email, name, tier }),
      });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!json.ok || !json.url) throw new Error(json.error || "Checkout failed");
      window.location.assign(json.url);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    }
  }

  const field =
    "h-12 w-full rounded-full border border-white/15 bg-navy-mid px-5 text-ink placeholder:text-muted/60 focus:border-electric focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <fieldset className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
        <legend className="sr-only">Choose your analysis</legend>
        {ANALYSIS_TIERS.map((t) => (
          <label
            key={t.id}
            className={`cursor-pointer rounded-2xl border p-4 transition-colors ${tier === t.id ? "border-electric bg-electric/10" : "border-white/15 hover:border-white/30"}`}
          >
            <input type="radio" name="tier" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} className="sr-only" />
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[14px] font-medium text-ink">{t.name}</span>
              <span className="font-mono text-[15px] text-ink">{formatUsd(t.priceCents)}</span>
            </span>
            <span className="mt-1 block text-[12px] leading-snug text-muted">{t.tagline}</span>
          </label>
        ))}
      </fieldset>
      <label className="sm:col-span-2">
        <span className="sr-only">Your website</span>
        <input className={field} required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourwebsite.com" autoComplete="url" />
      </label>
      <label>
        <span className="sr-only">Your name</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
      </label>
      <label>
        <span className="sr-only">Your email</span>
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="press-scale h-12 rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.06em] text-navy uppercase transition-colors hover:bg-electric-deep disabled:opacity-60 sm:col-span-2"
      >
        {state === "loading"
          ? "Opening secure checkout…"
          : `Get my ${ANALYSIS_TIERS.find((t) => t.id === tier)!.name} · ${formatUsd(ANALYSIS_TIERS.find((t) => t.id === tier)!.priceCents)}`}
      </button>
      {state === "error" && (
        <p role="alert" className="text-[13px] text-signal sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
