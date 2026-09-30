"use client";

import { useState } from "react";
import type { ContentItem, GuideData, NewsletterData, PostData } from "@/lib/content-engine";

// Content cards with copy, approve and "ask for a change". Markdown bodies
// are shown as plain text with line breaks; they paste cleanly anywhere.

const KIND_TITLE: Record<string, string> = { post: "Social posts", guide: "Buying guides", newsletter: "Newsletters" };

function textOf(item: ContentItem): string {
  if (item.kind === "post") {
    const p = item.data as PostData;
    return `${p.hook}\n\n${p.caption}\n\n${p.cta}\n\n${p.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}`;
  }
  if (item.kind === "guide") {
    const g = item.data as GuideData;
    return `# ${g.title}\n\n${g.body}`;
  }
  const n = item.data as NewsletterData;
  return `Subject: ${n.subject}\nPreview: ${n.preview}\n\n${n.body}`;
}

function Card({ token, initial, canRevise, onUsed }: { token: string; initial: ContentItem; canRevise: boolean; onUsed: () => void }) {
  const [item, setItem] = useState(initial);
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  async function post(body: object) {
    const res = await fetch(`/api/studio/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    return (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; item?: ContentItem } | null;
  }
  async function revise(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const json = await post({ action: "revise", itemId: item.id, instruction });
    setBusy(false);
    if (!json?.ok || !json.item) return setMsg(json?.error ?? "That didn't work. Please try again.");
    setItem(json.item);
    setInstruction("");
    setOpen(false);
    onUsed();
  }
  async function toggleApprove() {
    const next = item.status === "approved" ? "unapprove" : "approve";
    const json = await post({ action: next, itemId: item.id });
    if (json?.ok) setItem({ ...item, status: next === "approve" ? "approved" : "draft" });
  }
  async function copy() {
    await navigator.clipboard.writeText(textOf(item)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const post_ = item.kind === "post" ? (item.data as PostData) : null;
  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-navy-mid ${item.status === "approved" ? "border-electric/50" : "border-white/10"}`}>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={post_?.productTitle ?? ""} className="aspect-square w-full bg-white object-contain" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          {item.platform ?? item.kind}
          {item.status === "approved" && <span className="ml-2 text-electric">· Approved</span>}
        </p>
        {post_ ? (
          <>
            <p className="mt-2 text-[16px] font-medium text-ink">{post_.hook}</p>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{post_.caption}</p>
            <p className="mt-2 text-[14px] text-electric">{post_.cta}</p>
            <p className="mt-2 text-[13px] text-muted">{post_.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>
          </>
        ) : item.kind === "guide" ? (
          <>
            <p className="mt-2 text-[17px] font-medium text-ink">{(item.data as GuideData).title}</p>
            <p className="mt-1 text-[13px] text-muted">For searches like &ldquo;{(item.data as GuideData).targetSearch}&rdquo;</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-[13px] text-electric">Read the guide</summary>
              <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{(item.data as GuideData).body}</p>
            </details>
          </>
        ) : (
          <>
            <p className="mt-2 text-[17px] font-medium text-ink">{(item.data as NewsletterData).subject}</p>
            <p className="mt-1 text-[13px] text-muted">{(item.data as NewsletterData).preview}</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-[13px] text-electric">Read the newsletter</summary>
              <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{(item.data as NewsletterData).body}</p>
            </details>
          </>
        )}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-5 text-[13px]">
          <button type="button" onClick={copy} className="text-electric underline underline-offset-4">{copied ? "Copied" : "Copy"}</button>
          <button type="button" onClick={toggleApprove} className="text-electric underline underline-offset-4">
            {item.status === "approved" ? "Unapprove" : "Approve"}
          </button>
          <button type="button" onClick={() => setOpen(!open)} disabled={!canRevise} className="text-electric underline underline-offset-4 disabled:text-muted disabled:no-underline">
            Ask for a change
          </button>
        </div>
        {open && (
          <form onSubmit={revise} className="mt-3 space-y-2">
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Make it shorter and mention it's in stock"
              className="w-full rounded-xl border border-white/15 bg-navy px-3 py-2 text-[14px] text-ink focus:border-electric focus:outline-none"
            />
            <button type="submit" disabled={busy || instruction.trim().length < 3} className="press-scale h-10 rounded-full bg-electric px-4 text-[12px] font-semibold text-navy disabled:opacity-50">
              {busy ? "Changing…" : "Make the change (uses 1 request)"}
            </button>
          </form>
        )}
        {msg && <p role="alert" className="mt-2 text-[13px] text-signal">{msg}</p>}
      </div>
    </article>
  );
}

export function StudioItems({ token, items, left }: { token: string; items: ContentItem[]; left: number }) {
  const [remaining, setRemaining] = useState(left);
  return (
    <div className="mt-12 space-y-14">
      {(["post", "guide", "newsletter"] as const).map((kind) => {
        const list = items.filter((i) => i.kind === kind);
        if (list.length === 0) return null;
        return (
          <section key={kind}>
            <h2 className="font-display text-2xl text-ink">
              {KIND_TITLE[kind]} <span className="font-mono text-[14px] text-muted">{list.length}</span>
            </h2>
            <div className={`mt-6 grid gap-5 ${kind === "post" ? "sm:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-2"}`}>
              {list.map((i) => (
                <Card key={i.id} token={token} initial={i} canRevise={remaining > 0} onUsed={() => setRemaining((n) => Math.max(0, n - 1))} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
