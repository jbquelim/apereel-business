"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GrowthPlan } from "@/lib/growth-report";

// John's controls for one report: edit the plan, save, regenerate, and
// approve & send. Sending needs a second click to confirm (no browser dialog).

type Priority = GrowthPlan["priorities"][number];

const field =
  "w-full rounded-xl border border-white/15 bg-navy-mid px-3 py-2 text-[14px] leading-relaxed text-ink focus:border-electric focus:outline-none";
const label = "font-mono text-[10px] tracking-[0.16em] text-muted uppercase";
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function ReviewPanel({
  orderId,
  status,
  plan,
  notes,
}: {
  orderId: string;
  status: string;
  plan: GrowthPlan | null;
  notes: string | null;
}) {
  const router = useRouter();
  const editable = status === "needs_review" && !!plan;
  const [summary, setSummary] = useState(plan?.summary ?? "");
  const [priorities, setPriorities] = useState<Priority[]>(plan?.priorities ?? []);
  const [d30, setD30] = useState((plan?.roadmap.days30 ?? []).join("\n"));
  const [d60, setD60] = useState((plan?.roadmap.days60 ?? []).join("\n"));
  const [d90, setD90] = useState((plan?.roadmap.days90 ?? []).join("\n"));
  const [notMeasured, setNotMeasured] = useState((plan?.notMeasured ?? []).join("\n"));
  const [reviewNotes, setReviewNotes] = useState(notes ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [dirty, setDirty] = useState(false);

  const setP = (i: number, patch: Partial<Priority>) => {
    setDirty(true);
    setPriorities((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  };

  async function act(action: "save" | "regenerate" | "send") {
    setBusy(action);
    setMessage(null);
    const body =
      action === "save"
        ? {
            action,
            notes: reviewNotes,
            plan: {
              summary,
              priorities,
              roadmap: { days30: lines(d30), days60: lines(d60), days90: lines(d90) },
              notMeasured: lines(notMeasured),
            },
          }
        : { action };
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; emailed?: boolean } | null;
    setBusy(null);
    setConfirmSend(false);
    if (!json?.ok) {
      setMessage({ tone: "error", text: json?.error ?? "Something went wrong." });
      return;
    }
    if (action === "save") setDirty(false);
    setMessage({
      tone: "ok",
      text:
        action === "save"
          ? "Saved. The preview now shows your edits."
          : action === "regenerate"
            ? "Regenerating. This takes about 3 minutes; you'll get an email when it's ready."
            : json.emailed
              ? "Sent. The customer has been emailed their private link."
              : "Marked as sent, but the email didn't go out. Copy the link from the top of the page and send it yourself.",
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-2">
      {message && (
        <p role="status" className={`rounded-xl border p-3 text-[14px] ${message.tone === "ok" ? "border-electric/30 text-ink" : "border-signal/40 text-signal"}`}>
          {message.text}
        </p>
      )}

      {editable ? (
        <>
          <div>
            <p className={label}>Summary</p>
            <textarea rows={6} className={`${field} mt-2`} value={summary} onChange={(e) => { setSummary(e.target.value); setDirty(true); }} />
          </div>

          <div className="space-y-4">
            <p className={label}>Priorities (in order)</p>
            {priorities.map((p, i) => (
              <div key={i} className="space-y-2 rounded-2xl border border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <input className={field} value={p.title} onChange={(e) => setP(i, { title: e.target.value })} aria-label={`Priority ${i + 1} title`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select className={`${field} w-auto`} value={p.impact} onChange={(e) => setP(i, { impact: e.target.value as Priority["impact"] })} aria-label="Impact">
                    <option value="high">High impact</option>
                    <option value="medium">Medium impact</option>
                    <option value="low">Low impact</option>
                  </select>
                  <select className={`${field} w-auto`} value={p.effort} onChange={(e) => setP(i, { effort: e.target.value as Priority["effort"] })} aria-label="Effort">
                    <option value="low">Low effort</option>
                    <option value="medium">Medium effort</option>
                    <option value="high">High effort</option>
                  </select>
                </div>
                <textarea rows={3} className={field} value={p.evidence} onChange={(e) => setP(i, { evidence: e.target.value })} aria-label="What we found" />
                <textarea rows={4} className={field} value={p.action} onChange={(e) => setP(i, { action: e.target.value })} aria-label="What to do" />
                <div className="flex gap-3 text-[12px]">
                  <button type="button" className="text-muted underline" disabled={i === 0}
                    onClick={() => { setDirty(true); setPriorities((ps) => { const c = [...ps]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; }); }}>
                    Move up
                  </button>
                  <button type="button" className="text-signal underline"
                    onClick={() => { setDirty(true); setPriorities((ps) => ps.filter((_, j) => j !== i)); }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {([["First 30 days (one per line)", d30, setD30], ["Days 31 to 60", d60, setD60], ["Days 61 to 90", d90, setD90], ["What we couldn't measure", notMeasured, setNotMeasured]] as const).map(([name, value, set]) => (
            <div key={name}>
              <p className={label}>{name}</p>
              <textarea rows={4} className={`${field} mt-2`} value={value} onChange={(e) => { set(e.target.value); setDirty(true); }} />
            </div>
          ))}

          <div>
            <p className={label}>Private notes (never shown to the customer)</p>
            <textarea rows={3} className={`${field} mt-2`} value={reviewNotes} onChange={(e) => { setReviewNotes(e.target.value); setDirty(true); }} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => act("save")} disabled={!!busy}
              className="press-scale h-11 rounded-full border border-white/25 px-5 text-[13px] text-ink disabled:opacity-50">
              {busy === "save" ? "Saving…" : "Save edits"}
            </button>
            <button type="button" disabled={!!busy || dirty}
              onClick={() => (confirmSend ? act("send") : setConfirmSend(true))}
              className="press-scale h-11 rounded-full bg-electric px-5 text-[13px] font-semibold text-navy disabled:opacity-50">
              {busy === "send" ? "Sending…" : confirmSend ? "Click again to confirm" : "Approve & send"}
            </button>
          </div>
          {dirty && <p className="text-[12px] text-muted">Save your edits before sending.</p>}
        </>
      ) : (
        <p className="text-[14px] text-muted">
          {status === "sent"
            ? "This report has been sent and can no longer be edited."
            : status === "generating"
              ? "The report is being generated. Refresh in a few minutes."
              : "There's no report to edit yet."}
        </p>
      )}

      {["needs_review", "generation_failed", "paid"].includes(status) && (
        <button type="button" onClick={() => act("regenerate")} disabled={!!busy}
          className="text-[13px] text-muted underline underline-offset-4 disabled:opacity-50">
          {busy === "regenerate" ? "Starting…" : "Regenerate from fresh data"}
        </button>
      )}
    </div>
  );
}
