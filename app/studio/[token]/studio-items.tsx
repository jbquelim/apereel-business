"use client";

import { useState } from "react";
import type { ContentItem, GuideData, NewsletterData, PostData } from "@/lib/content-engine";
import type { CarouselAd, StaticAd } from "@/lib/ads-engine";
import type { MediaBrief } from "@/lib/media";

// Content and ad cards: rendered creatives with downloads, copy for each
// platform, approve, and "ask for a change". Videos show their script and
// shot list until rendered, then the video itself.

type Render = { status: string; url: string | null; aspect: string };
type Media = Record<string, Render[]>;
type VideoData = MediaBrief & { productTitle?: string; caption?: string };

const SECTIONS: { kinds: string[]; title: string; cols: string }[] = [
  { kinds: ["ad"], title: "Static ads", cols: "sm:grid-cols-2 lg:grid-cols-3" },
  { kinds: ["carousel"], title: "Carousel ads", cols: "lg:grid-cols-2" },
  { kinds: ["animated-ad", "video-ad"], title: "Animated and video ads", cols: "sm:grid-cols-2 lg:grid-cols-3" },
  { kinds: ["post"], title: "Social posts", cols: "sm:grid-cols-2 lg:grid-cols-3" },
  { kinds: ["video"], title: "Short videos", cols: "sm:grid-cols-2 lg:grid-cols-3" },
  { kinds: ["visual"], title: "Premium product visuals", cols: "sm:grid-cols-2 lg:grid-cols-3" },
  { kinds: ["note"], title: "Your competitors this month", cols: "lg:grid-cols-2" },
  { kinds: ["guide"], title: "Buying guides", cols: "lg:grid-cols-2" },
  { kinds: ["newsletter"], title: "Newsletters", cols: "lg:grid-cols-2" },
];

const tag = (h: string) => `#${h.replace(/^#/, "")}`;

function textOf(item: ContentItem): string {
  const d = item.data as unknown as Record<string, unknown>;
  switch (item.kind as string) {
    case "post": {
      const p = d as unknown as PostData;
      return `${p.hook}\n\n${p.caption}\n\n${p.cta}\n\n${p.hashtags.map(tag).join(" ")}`;
    }
    case "guide":
      return `# ${(d as unknown as GuideData).title}\n\n${(d as unknown as GuideData).body}`;
    case "newsletter": {
      const n = d as unknown as NewsletterData;
      return `Subject: ${n.subject}\nPreview: ${n.preview}\n\n${n.body}`;
    }
    case "ad": {
      const a = d as unknown as StaticAd;
      return [
        "GOOGLE",
        ...a.google.headlines.map((h, i) => `Headline ${i + 1}: ${h}`),
        ...a.google.descriptions.map((x, i) => `Description ${i + 1}: ${x}`),
        "",
        "META",
        `Primary text: ${a.meta.primaryText}`,
        `Headline: ${a.meta.headline}`,
        "",
        "TIKTOK",
        a.tiktok.text,
      ].join("\n");
    }
    case "carousel": {
      const c = d as unknown as CarouselAd;
      return [`Primary text: ${c.meta.primaryText}`, `Headline: ${c.meta.headline}`, "", ...c.frames.map((f, i) => `Card ${i + 1}: ${f.headline} — ${f.sub}`)].join("\n");
    }
    default: {
      const v = d as unknown as VideoData;
      return [v.caption ?? "", "", ...(v.shots ?? []).map((s) => `${s.seconds}s: ${s.visual}${s.onScreenText ? ` [${s.onScreenText}]` : ""}`), v.voiceover ? `\nVoiceover: ${v.voiceover}` : ""].join("\n");
    }
  }
}

function Downloads({ token, id, frames }: { token: string; id: number; frames?: number }) {
  const href = (size: string, frame?: number) => `/api/creative/${id}?t=${token}&size=${size}${frame != null ? `&frame=${frame}` : ""}`;
  return (
    <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px]">
      {frames
        ? Array.from({ length: frames }, (_, i) => (
            <a key={i} href={href("square", i)} download className="text-electric underline underline-offset-4">Card {i + 1}</a>
          ))
        : (["square", "story", "landscape"] as const).map((s) => (
            <a key={s} href={href(s)} download className="text-electric underline underline-offset-4">
              {s === "square" ? "Feed 1:1" : s === "story" ? "Story 9:16" : "Display 1.91:1"}
            </a>
          ))}
    </p>
  );
}

function Body({ item, token, media }: { item: ContentItem; token: string; media?: Render[] }) {
  const d = item.data as unknown as Record<string, unknown>;
  const kind = item.kind as string;
  if (kind === "post") {
    const p = d as unknown as PostData;
    return (
      <>
        <p className="mt-2 text-[16px] font-medium text-ink">{p.hook}</p>
        <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{p.caption}</p>
        <p className="mt-2 text-[14px] text-electric">{p.cta}</p>
        <p className="mt-2 text-[13px] text-muted">{p.hashtags.map(tag).join(" ")}</p>
        {p.suggestedDate && <p className="mt-2 font-mono text-[11px] text-muted">Suggested for {new Date(p.suggestedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>}
      </>
    );
  }
  if (kind === "ad") {
    const a = d as unknown as StaticAd;
    return (
      <>
        <p className="mt-2 text-[16px] font-medium text-ink">{a.angle}</p>
        <Downloads token={token} id={item.id} />
        <div className="mt-4 space-y-3 text-[13px] leading-relaxed">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Google</p>
            <p className="text-ink/85">{a.google.headlines.join(" · ")}</p>
            <p className="text-muted">{a.google.descriptions.join(" ")}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Meta</p>
            <p className="text-ink/85">{a.meta.primaryText}</p>
            <p className="text-muted">{a.meta.headline}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">TikTok</p>
            <p className="text-ink/85">{a.tiktok.text}</p>
          </div>
        </div>
      </>
    );
  }
  if (kind === "carousel") {
    const c = d as unknown as CarouselAd;
    return (
      <>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {c.frames.map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={`/api/creative/${item.id}?t=${token}&size=square&frame=${i}`} alt={`Card ${i + 1}`} className="h-40 w-40 shrink-0 rounded-lg bg-white object-cover" loading="lazy" />
          ))}
        </div>
        <Downloads token={token} id={item.id} frames={c.frames.length} />
        <p className="mt-3 text-[14px] text-ink/85">{c.meta.primaryText}</p>
        <p className="text-[13px] text-muted">{c.meta.headline}</p>
      </>
    );
  }
  if (kind === "guide" || kind === "newsletter") {
    const title = kind === "guide" ? (d as unknown as GuideData).title : (d as unknown as NewsletterData).subject;
    const sub = kind === "guide" ? `For searches like “${(d as unknown as GuideData).targetSearch}”` : (d as unknown as NewsletterData).preview;
    const body = kind === "guide" ? (d as unknown as GuideData).body : (d as unknown as NewsletterData).body;
    return (
      <>
        <p className="mt-2 text-[17px] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[13px] text-muted">{sub}</p>
        <details className="mt-3">
          <summary className="cursor-pointer text-[13px] text-electric">Read it</summary>
          <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{body}</p>
        </details>
      </>
    );
  }
  if (kind === "note") {
    const n = d as unknown as { title: string; points: string[]; suggestion: string };
    return (
      <>
        <p className="mt-2 text-[17px] font-medium text-ink">{n.title}</p>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/85">
          {n.points.map((p, i) => (
            <li key={i} className="flex gap-2"><span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />{p}</li>
          ))}
        </ul>
        {n.suggestion && <p className="mt-3 text-[14px] text-electric">{n.suggestion}</p>}
      </>
    );
  }
  // Videos and visuals: the finished files, or the brief while they render.
  const v = d as unknown as VideoData;
  const done = (media ?? []).filter((m) => m.url);
  const pending = (media ?? []).filter((m) => !m.url);
  return (
    <>
      {done.map((m, i) =>
        kind === "visual" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a key={i} href={m.url!} target="_blank" rel="noopener"><img src={m.url!} alt={v.title} className="mt-3 w-full rounded-lg" /></a>
        ) : (
          <div key={i} className="mt-3">
            <video src={m.url!} controls playsInline className="w-full rounded-lg bg-black" />
            <a href={m.url!} download className="font-mono text-[12px] text-electric underline underline-offset-4">Download {m.aspect}</a>
          </div>
        ),
      )}
      {pending.length > 0 && (
        <p className="mt-2 inline-flex rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-muted">
          {pending.some((m) => m.status === "failed") && done.length === 0
            ? "Rendering failed; we'll look into it"
            : `${kind === "visual" ? "Visual" : "Video"} rendering${pending.length > 1 ? ` (${pending.map((m) => m.aspect).join(", ")})` : ""}: usually ready within the hour`}
        </p>
      )}
      <p className="mt-3 text-[15px] font-medium text-ink">{v.title}</p>
      {v.caption && <p className="mt-1 text-[14px] text-ink/85">{v.caption}</p>}
      <details className="mt-3">
        <summary className="cursor-pointer text-[13px] text-electric">Shot list</summary>
        <ol className="mt-2 space-y-1 text-[13px] text-ink/80">
          {(v.shots ?? []).map((s, i) => (
            <li key={i}>
              <span className="font-mono text-muted">{s.seconds}s</span> {s.visual}
              {s.onScreenText && <span className="text-electric"> “{s.onScreenText}”</span>}
            </li>
          ))}
        </ol>
        {v.voiceover && <p className="mt-2 text-[13px] text-muted">Voiceover: {v.voiceover}</p>}
      </details>
    </>
  );
}

function Card({ token, initial, canRevise, onUsed, media }: { token: string; initial: ContentItem; canRevise: boolean; onUsed: () => void; media?: Render[] }) {
  const [item, setItem] = useState(initial);
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [version, setVersion] = useState(0);

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
    setVersion((v) => v + 1);
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

  const kind = item.kind as string;
  const rendered = (media ?? []).some((m) => m.url);
  const hero = kind === "ad" ? `/api/creative/${item.id}?t=${token}&size=square&v=${version}` : kind === "post" || kind === "video" || kind === "visual" || kind.endsWith("-ad") ? item.image : null;
  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-navy-mid ${item.status === "approved" ? "border-electric/50" : "border-white/10"}`}>
      {hero && !rendered && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero} alt="" className="aspect-square w-full bg-white object-contain" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          {item.platform ?? kind}
          {item.status === "approved" && <span className="ml-2 text-electric">· Approved</span>}
        </p>
        <Body item={item} token={token} media={media} />
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-5 text-[13px]">
          <button type="button" onClick={copy} className="text-electric underline underline-offset-4">{copied ? "Copied" : "Copy text"}</button>
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
              placeholder="e.g. Shorter headline, and mention free local pickup"
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

export function StudioItems({ token, items, left, media }: { token: string; items: ContentItem[]; left: number; media: Media }) {
  const [remaining, setRemaining] = useState(left);
  return (
    <div className="mt-12 space-y-14">
      {SECTIONS.map(({ kinds, title, cols }) => {
        const list = items.filter((i) => kinds.includes(i.kind as string));
        if (list.length === 0) return null;
        return (
          <section key={title}>
            <h2 className="font-display text-2xl text-ink">
              {title} <span className="font-mono text-[14px] text-muted">{list.length}</span>
            </h2>
            <div className={`mt-6 grid gap-5 ${cols}`}>
              {list.map((i) => (
                <Card key={i.id} token={token} initial={i} canRevise={remaining > 0} media={media[i.id]} onUsed={() => setRemaining((n) => Math.max(0, n - 1))} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
