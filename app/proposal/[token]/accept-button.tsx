"use client";

import { useState } from "react";

export function AcceptButton({ token, accepted }: { token: string; accepted: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(accepted ? "done" : "idle");

  async function accept() {
    setState("busy");
    const res = await fetch(`/api/proposal/${token}`, { method: "POST" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean } | null;
    setState(json?.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-8 rounded-2xl border border-electric/40 bg-electric/5 p-5 text-[15px] leading-relaxed text-ink">
        Accepted. John will email you within one business day to confirm the start date and send the first invoice.
      </p>
    );
  }
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={accept}
        disabled={state === "busy"}
        className="press-scale h-12 rounded-full bg-electric px-7 text-[13px] font-semibold tracking-[0.06em] text-navy uppercase transition-colors hover:bg-electric-deep disabled:opacity-60"
      >
        {state === "busy" ? "Accepting…" : "Accept this proposal"}
      </button>
      <a href="mailto:john@apereel.com" className="text-[14px] text-electric underline underline-offset-4">
        Ask a question first
      </a>
      {state === "error" && <p role="alert" className="w-full text-[13px] text-signal">That didn&apos;t go through. Please try again, or reply to John&apos;s email.</p>}
    </div>
  );
}
