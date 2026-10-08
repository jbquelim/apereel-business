"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Shown when a client's own site turned our reader away. Nothing technical is
// asked of them: we sort it ourselves (they've authorized that), and a product
// file is an optional shortcut if they happen to have one.

export function CatalogAccess({ token, domain }: { token: string; domain: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function upload(file: File) {
    setState("busy");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`/api/studio/${token}/catalog`, { method: "POST", body }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; products?: number; source?: string; error?: string } | null;
    if (json?.ok) {
      setState("done");
      setMsg(`${json.products?.toLocaleString("en-US")} products read from your ${json.source ?? "file"}. We're building with them now and will email you when it's ready.`);
      router.refresh();
    } else {
      setState("error");
      setMsg(json?.error ?? "The upload didn't go through. No problem: we'll sort it ourselves.");
    }
  }
  return (
    <section className="mt-10 max-w-[720px] rounded-3xl border border-white/10 bg-navy-mid p-6 sm:p-8">
      <h2 className="text-2xl font-medium text-ink">We&apos;re getting your products another way</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        {domain}&apos;s security settings turned away our automatic reader. That&apos;s common and nothing you need to fix: we&apos;ve emailed you, and once you reply &ldquo;yes, go ahead&rdquo; we take care of it ourselves and carry on. You&apos;ll get an email when your work is ready.
      </p>
      <p className="mt-6 text-[14px] text-muted">
        Optional shortcut: if you already have a product list (your store&apos;s product export, or a spreadsheet), drop it here and we start straight away.
      </p>
      <label className="press-scale mt-3 inline-flex h-11 cursor-pointer items-center rounded-full border border-white/20 px-5 text-[13px] font-semibold text-ink">
        {state === "busy" ? "Reading your file…" : "Choose product file (CSV)"}
        <input type="file" accept=".csv,text/csv" className="hidden" disabled={state === "busy"} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {msg && <p role="status" className={`mt-3 text-[14px] ${state === "error" ? "text-signal" : "text-ink/85"}`}>{msg}</p>}
    </section>
  );
}
