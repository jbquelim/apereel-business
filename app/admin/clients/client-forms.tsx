"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const field =
  "h-11 w-full rounded-xl border border-white/15 bg-navy-mid px-3 text-[14px] text-ink focus:border-electric focus:outline-none";

export function NewClientForm() {
  const router = useRouter();
  const [f, setF] = useState({ domain: "", name: "", email: "", service: "premium-creative", tier: "fix" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setBusy(false);
    if (!json?.ok) return setMsg(json?.error ?? "Something went wrong.");
    setF({ ...f, domain: "", name: "", email: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-12 grid gap-3 rounded-3xl border border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-6">
      <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase sm:col-span-2 lg:col-span-6">Add a client</p>
      <input className={`${field} lg:col-span-2`} placeholder="theirwebsite.com" value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} required />
      <input className={field} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={`${field} lg:col-span-3`} type="email" placeholder="email@business.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      <select className={`${field} lg:col-span-3`} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} aria-label="Service">
        <option value="premium-creative">Content</option>
        <option value="advertising">Ads</option>
        <option value="web-development">Website</option>
      </select>
      <select className={`${field} lg:col-span-2`} value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })} aria-label="Tier">
        <option value="fix">Tier 1</option>
        <option value="build">Tier 2</option>
        <option value="grow">Tier 3</option>
      </select>
      <button type="submit" disabled={busy} className="press-scale h-11 rounded-full bg-electric px-5 text-[13px] font-semibold text-navy disabled:opacity-50">
        {busy ? "Adding…" : "Add client"}
      </button>
      {msg && <p role="alert" className="text-[13px] text-signal sm:col-span-2 lg:col-span-6">{msg}</p>}
    </form>
  );
}

export function GenerateButton({ id, label }: { id: string; label: string }) {
  const [state, setState] = useState<"idle" | "busy" | "started" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function go() {
    setState("busy");
    const res = await fetch(`/api/admin/clients/${id}`, { method: "POST" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setState(json?.ok ? "started" : "error");
    setMsg(json?.error ?? "");
  }
  return (
    <span className="ml-4 inline-block">
      <button type="button" onClick={go} disabled={state === "busy" || state === "started"} className="text-electric underline underline-offset-4 disabled:text-muted disabled:no-underline">
        {state === "busy" ? "Starting…" : state === "started" ? "Started: refresh in a few minutes" : label}
      </button>
      {state === "error" && <span className="block text-[12px] text-signal">{msg || "Failed"}</span>}
    </span>
  );
}
