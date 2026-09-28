"use client";

import { useState } from "react";

// Website + email → Stripe Checkout (via /api/checkout). The website can be
// pre-filled from the ?site= link in a lead's follow-up email.
export function GrowthPlanCheckoutForm({ site }: { site: string }) {
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
        body: JSON.stringify({ url, email, name }),
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
        {state === "loading" ? "Opening secure checkout…" : "Get my Growth Plan · $20"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-[13px] text-signal sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
