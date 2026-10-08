"use client";

import { useState } from "react";

export function StartForm({ service, tier, site, live }: { service: string; tier: string; site: string; live: boolean }) {
  const [url, setUrl] = useState(site);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "requested" | "error">("idle");
  const [msg, setMsg] = useState("");
  const field = "h-12 w-full rounded-full border border-white/15 bg-navy px-5 text-ink placeholder:text-muted/60 focus:border-electric focus:outline-none";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service, tier, url, name, email }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; url?: string; requested?: boolean; error?: string } | null;
    if (json?.ok && json.url) return window.location.assign(json.url);
    if (json?.ok && json.requested) return setState("requested");
    setState("error");
    setMsg(json?.error ?? "Something went wrong. Please try again.");
  }

  if (state === "requested") {
    return <p role="status" className="text-[15px] leading-relaxed text-ink">Thanks. Your request is in, and we&apos;ll email you at {email} within one business day to get you started.</p>;
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-[15px] font-medium text-ink">Your business</p>
      <input className={field} required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourwebsite.com" aria-label="Your website" autoComplete="url" />
      <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" autoComplete="name" />
      <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Your email" autoComplete="email" />
      <button type="submit" disabled={state === "busy"} className="press-scale h-12 w-full rounded-full bg-electric text-[13px] font-semibold tracking-[0.06em] text-navy uppercase disabled:opacity-60">
        {state === "busy" ? "One moment…" : live ? "Continue to secure payment" : "Get started"}
      </button>
      {state === "error" && <p role="alert" className="text-[13px] text-signal">{msg}</p>}
      <p className="text-[12px] leading-relaxed text-muted">
        {live ? "Payment by Stripe. " : ""}We build everything from your own products. By continuing, you authorize Apereel to access your website, hosting and store on your behalf to do this work, and nothing else.
      </p>
    </form>
  );
}
