"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// The website studio: the live preview, a change box (plain words, one
// request each), undo, publish, the customer's own domain, and the enquiries
// their site has received.

type Lead = { name: string; email: string; phone: string; message: string; page: string; created_at: string };
type DomainInfo = { status: string; records?: { type: string; name: string; value: string }[]; error?: string };

export function WebsiteStudio({
  token,
  slug,
  published,
  domain,
  domainStatus,
  pages,
  products,
  left,
  leads,
  paymentsStatus,
  productAction,
}: {
  token: string;
  slug: string;
  published: boolean;
  domain: string | null;
  domainStatus: string | null;
  pages: { slug: string; label: string }[];
  products: number;
  left: number;
  leads: Lead[];
  paymentsStatus: string | null;
  productAction: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState("");
  const [frameKey, setFrameKey] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [domainInput, setDomainInput] = useState(domain ?? "");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(domain ? { status: domainStatus ?? "" } : null);
  const src = `/sites/${slug}${page ? `/${page}` : ""}`;

  async function act(action: string, extra: object = {}) {
    setBusy(action);
    setMsg(null);
    const res = await fetch(`/api/studio/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: DomainInfo; url?: string } | null;
    setBusy(null);
    if (!json?.ok) {
      setMsg({ ok: false, text: json?.error ?? "That didn't work. Please try again." });
      return null;
    }
    setFrameKey((k) => k + 1);
    router.refresh();
    return json;
  }

  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {[...pages, { slug: "products", label: `Products (${products})` }].map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPage(p.slug)}
              className={`rounded-full border px-4 py-1.5 text-[13px] ${page === p.slug ? "border-electric text-ink" : "border-white/15 text-muted"}`}
            >
              {p.label}
            </button>
          ))}
          <a href={src} target="_blank" rel="noopener" className="ml-auto text-[13px] text-electric underline underline-offset-4">Open in a new tab</a>
        </div>
        <iframe key={frameKey} src={src} title="Your site" className="mt-4 h-[78vh] w-full rounded-2xl border border-white/10 bg-white" />
      </div>

      <aside className="space-y-8">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await act("site-revise", { instruction })) {
              setInstruction("");
              setMsg({ ok: true, text: "Done. The preview shows the change." });
            }
          }}
          className="space-y-3"
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">Ask for a change</p>
          <textarea
            rows={5}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make the homepage headline about fast delivery, and use a darker blue"
            className="w-full rounded-xl border border-white/15 bg-navy-mid px-3 py-2 text-[14px] text-ink focus:border-electric focus:outline-none"
          />
          <button type="submit" disabled={!!busy || left <= 0 || instruction.trim().length < 3} className="press-scale h-11 w-full rounded-full bg-electric text-[13px] font-semibold text-navy disabled:opacity-50">
            {busy === "site-revise" ? "Changing your site… (about a minute)" : "Make the change (uses 1 request)"}
          </button>
          <button type="button" onClick={async () => (await act("site-undo")) && setMsg({ ok: true, text: "Undone." })} disabled={!!busy} className="text-[13px] text-muted underline underline-offset-4">
            Undo the last change (free)
          </button>
          {msg && <p role="status" className={`text-[13px] ${msg.ok ? "text-ink" : "text-signal"}`}>{msg.text}</p>}
        </form>

        <div className="space-y-3 rounded-2xl border border-white/10 p-5">
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">Your domain</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const json = await act("site-domain", { domain: domainInput });
              if (json?.domain) setDomainInfo(json.domain);
            }}
            className="flex gap-2"
          >
            <input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="yourbusiness.com" className="h-10 min-w-0 flex-1 rounded-xl border border-white/15 bg-navy-mid px-3 text-[14px] text-ink" />
            <button type="submit" disabled={!!busy} className="h-10 rounded-full border border-white/25 px-4 text-[13px] text-ink">Connect</button>
          </form>
          {domainInfo && (
            <div className="text-[13px] leading-relaxed text-muted">
              {domainInfo.status === "live" && <p className="text-ink">Live on {domain}.</p>}
              {domainInfo.status === "needs_vercel_token" && <p>Saved. We&apos;ll connect it for you shortly.</p>}
              {domainInfo.status === "error" && <p className="text-signal">{domainInfo.error}</p>}
              {domainInfo.records && domainInfo.status !== "live" && (
                <>
                  <p className="mt-2">At your domain provider, add:</p>
                  <ul className="mt-1 font-mono text-[12px] text-ink/85">
                    {domainInfo.records.map((r) => (
                      <li key={r.type + r.name}>{r.type} {r.name} → {r.value}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          <button type="button" onClick={() => act(published ? "site-unpublish" : "site-publish")} disabled={!!busy} className="press-scale h-10 w-full rounded-full bg-white/10 text-[13px] text-ink">
            {published ? "Unpublish" : "Publish on my domain"}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 p-5">
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">Payments on your site</p>
          {paymentsStatus === "active" ? (
            <>
              <p className="text-[13px] text-muted">Stripe is connected. Buyers pay you directly; money goes to your bank.</p>
              {([
                ["checkout", "Buy now with Stripe on my site"],
                ["link", "Send buyers to my current store"],
                ["enquire", "Enquiry form only"],
              ] as const).map(([mode, label]) => (
                <label key={mode} className="flex items-center gap-2 text-[13px] text-ink">
                  <input type="radio" name="mode" checked={productAction === mode} onChange={() => act("payments-mode", { mode })} />
                  {label}
                </label>
              ))}
            </>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-muted">
                {paymentsStatus === "onboarding"
                  ? "Stripe needs a few more details before you can take payments."
                  : "Sell straight from your site. Connect a Stripe account (free to set up; Stripe's card fees apply) and buyers pay you directly."}
              </p>
              <button
                type="button"
                disabled={!!busy}
                onClick={async () => {
                  const json = (await act("payments-connect")) as { url?: string } | null;
                  if (json?.url) window.location.assign(json.url);
                }}
                className="press-scale h-10 w-full rounded-full bg-electric text-[13px] font-semibold text-navy disabled:opacity-50"
              >
                {paymentsStatus === "onboarding" ? "Finish Stripe setup" : "Take payments with Stripe"}
              </button>
            </>
          )}
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-electric uppercase">Enquiries from your site</p>
          {leads.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted">None yet. They&apos;re also emailed to you.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {leads.map((l, i) => (
                <li key={i} className="rounded-xl border border-white/10 p-3 text-[13px]">
                  <p className="text-ink">{l.name} · <a href={`mailto:${l.email}`} className="text-electric">{l.email}</a></p>
                  <p className="mt-1 text-muted">{l.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted/70">{l.page} · {new Date(l.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
