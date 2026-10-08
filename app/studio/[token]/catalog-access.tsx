"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Shown when a client's own site blocked our crawler: upload a product file,
// or let our crawler through their firewall with their private token.

export function CatalogAccess({ token, crawlToken, domain }: { token: string; crawlToken: string; domain: string }) {
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
      setMsg(json?.error ?? "The upload didn't go through. Please try again.");
    }
  }
  return (
    <section className="mt-10 max-w-[720px] rounded-3xl border border-white/10 bg-navy-mid p-6 sm:p-8">
      <h2 className="text-2xl font-medium text-ink">We couldn&apos;t read your products from {domain}</h2>
      <p className="mt-3 text-[15px] text-muted">
        Your site&apos;s firewall turns away automated visitors, including ours. Either of these gets us your full catalog, and we carry on from there.
      </p>

      <h3 className="mt-8 text-[17px] text-ink">1. Upload your product file (quickest)</h3>
      <p className="mt-2 text-[14px] text-muted">
        Shopify: Products → Export → CSV. WooCommerce: Products → Export. Any other store: a spreadsheet saved as CSV with a name, price, image link, product link and category column.
      </p>
      <label className="press-scale mt-4 inline-flex h-11 cursor-pointer items-center rounded-full bg-electric px-5 text-[13px] font-semibold text-navy">
        {state === "busy" ? "Reading your file…" : "Choose CSV file"}
        <input type="file" accept=".csv,text/csv" className="hidden" disabled={state === "busy"} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {msg && <p role="status" className={`mt-3 text-[14px] ${state === "error" ? "text-signal" : "text-ink/85"}`}>{msg}</p>}

      <h3 className="mt-8 text-[17px] text-ink">2. Or let our crawler through your firewall</h3>
      <p className="mt-2 text-[14px] text-muted">
        Our crawler sends this private header on every request to your site, and only to your site. Allow it and everyone else is still blocked.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] text-ink">X-Apereel-Verify: {crawlToken}</pre>
      <ul className="mt-3 space-y-2 text-[14px] text-muted">
        <li><span className="text-ink">Cloudflare:</span> Security → WAF → Custom rules → Create rule. When &ldquo;Request Header&rdquo; <code>X-Apereel-Verify</code> equals the token above, choose <em>Skip</em> and tick all remaining rules and bot protections.</li>
        <li><span className="text-ink">Another firewall or your host&apos;s:</span> send them this header and ask them to allow requests that carry it. Our crawler is described at apereel.com/bot.</li>
      </ul>
      <p className="mt-3 text-[14px] text-muted">Tell us when it&apos;s done (just reply to our email) and we&apos;ll run your build again.</p>
    </section>
  );
}
