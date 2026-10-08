"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const field =
  "h-11 w-full rounded-xl border border-white/15 bg-navy-mid px-3 text-[14px] text-ink focus:border-electric focus:outline-none";

export function NewClientForm() {
  const router = useRouter();
  const [f, setF] = useState({ domain: "", name: "", email: "", service: "premium-creative", tier: "fix", authorized: false });
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
    setF({ ...f, domain: "", name: "", email: "", authorized: false });
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
      <label className="flex items-center gap-2 text-[13px] text-muted sm:col-span-2 lg:col-span-5">
        <input type="checkbox" checked={f.authorized} onChange={(e) => setF({ ...f, authorized: e.target.checked })} className="h-4 w-4 accent-electric" />
        They&apos;ve authorized us to access their website, hosting and store on their behalf (by email or in person)
      </label>
      <button type="submit" disabled={busy} className="press-scale h-11 rounded-full bg-electric px-5 text-[13px] font-semibold text-navy disabled:opacity-50">
        {busy ? "Adding…" : "Add client"}
      </button>
      {msg && <p role="alert" className="text-[13px] text-signal sm:col-span-2 lg:col-span-6">{msg}</p>}
    </form>
  );
}

export function GenerateButton({ id, label, body }: { id: string; label: string; body?: object }) {
  const [state, setState] = useState<"idle" | "busy" | "started" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function go() {
    setState("busy");
    const res = await fetch(`/api/admin/clients/${id}`, { method: "POST", ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) }).catch(() => null);
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

/** John's design override for a site: any of the templates, grouped by tier. */
export function DesignSelect({ siteId, current, options }: { siteId: string; current: string | null; options: { id: string; name: string; tier: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const tiers: [string, string][] = [["grow", "Signature"], ["build", "Custom"], ["fix", "Template"]];
  return (
    <select
      aria-label="Site design"
      disabled={busy}
      value={current ?? ""}
      onChange={async (e) => {
        setBusy(true);
        await fetch("/api/admin/sites/design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId, design: e.target.value }) }).catch(() => null);
        setBusy(false);
        router.refresh();
      }}
      className="mt-1 block max-w-[180px] rounded-md border border-white/15 bg-navy-mid px-2 py-1 font-sans text-[12px] text-ink"
    >
      {!current && <option value="">Old layout</option>}
      {tiers.map(([tier, label]) => (
        <optgroup key={tier} label={label}>
          {options.filter((o) => o.tier === tier).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

/** John records a client's "yes" (their reply to our email) to us accessing their site on their behalf. */
export function AuthorizeButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  async function go() {
    setState("busy");
    const res = await fetch(`/api/admin/clients/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ authorize: true }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean } | null;
    if (json?.ok) return router.refresh();
    setState("error");
  }
  return (
    <button type="button" onClick={go} disabled={state === "busy"} className="ml-4 text-electric underline underline-offset-4 disabled:text-muted disabled:no-underline">
      {state === "busy" ? "Recording…" : state === "error" ? "Failed, try again" : "Record their yes"}
    </button>
  );
}

/** John uploads a client's product file on their behalf (their site blocked our reader). */
export function AdminCatalogUpload({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function upload(file: File) {
    setState("busy");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`/api/admin/clients/${id}/catalog`, { method: "POST", body }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; products?: number; source?: string; error?: string } | null;
    setState(json?.ok ? "done" : "error");
    setMsg(json?.ok ? `${json.products} products (${json.source}); running again` : json?.error ?? "Failed");
    if (json?.ok) router.refresh();
  }
  return (
    <span className="ml-4 inline-block">
      <label className="cursor-pointer text-electric underline underline-offset-4">
        {state === "busy" ? "Reading…" : "Upload their product CSV"}
        <input type="file" accept=".csv,text/csv" className="hidden" disabled={state === "busy"} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {msg && <span className={`block text-[12px] ${state === "error" ? "text-signal" : "text-muted"}`}>{msg}</span>}
    </span>
  );
}
