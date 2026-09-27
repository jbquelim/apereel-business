"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(res?.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return (
      <p role="status" className="mt-8 rounded-2xl border border-electric/30 bg-electric/5 p-5 text-[15px] text-ink">
        If that&apos;s an admin address, a sign-in link is on its way. It works once, within 15 minutes.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
      <label htmlFor="admin-email" className="sr-only">
        Admin email
      </label>
      <input
        id="admin-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="h-12 flex-1 rounded-full border border-white/15 bg-navy-mid px-5 text-ink placeholder:text-muted/60 focus:border-electric focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="press-scale h-12 rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.06em] text-navy uppercase disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Email me a link"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-[13px] text-signal sm:basis-full">
          Something went wrong. Try again in a minute.
        </p>
      )}
    </form>
  );
}
