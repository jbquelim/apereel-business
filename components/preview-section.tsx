/* eslint-disable @next/next/no-img-element -- product images come from the client's own site */
import type { PreviewAssets } from "@/lib/preview-assets";

// The $30 preview as the customer sees it: their homepage reimagined around
// their real products, product copy before/after, and ad drafts.

export function PreviewSection({ preview, domain }: { preview: PreviewAssets; domain: string }) {
  const h = preview.homepage;
  return (
    <div className="space-y-8">
      {/* Homepage concept in a browser frame */}
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#f7f5f0] text-[#141a26] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-black/10 bg-[#ebe8e1] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="ml-3 truncate rounded-md bg-white/70 px-3 py-1 font-mono text-[11px] text-black/50">{domain}</span>
        </div>
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#1a5fb8] uppercase">{h.eyebrow}</p>
          <p className="mt-3 max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl">{h.headline}</p>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-black/65">{h.subheadline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#141a26] px-5 py-2.5 text-[13px] font-semibold text-white">{h.primaryCta}</span>
            <span className="rounded-full border border-black/20 px-5 py-2.5 text-[13px] font-semibold">{h.secondaryCta}</span>
          </div>
          {h.proofPoints.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-black/60">
              {h.proofPoints.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#1a5fb8]" />
                  {p}
                </li>
              ))}
            </ul>
          )}
          {preview.showcase.length > 0 && (
            <>
              <p className="mt-12 text-lg font-semibold">{h.featuredHeading}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {preview.showcase.slice(0, 6).map((p) => (
                  <div key={p.url}>
                    <div className="aspect-square overflow-hidden rounded-xl bg-white">
                      {p.image && <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-contain" />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug">{p.title}</p>
                    <p className="mt-0.5 text-[13px] text-black/55">{p.price ?? "Price on request"}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-[12px] text-muted/70">
        A concept using your own products and photos from {domain}, not a finished design.
      </p>

      {preview.productRewrites.length > 0 && (
        <div className="space-y-4">
          <p className="text-[15px] font-medium text-ink">Product copy, rewritten</p>
          {preview.productRewrites.map((p) => (
            <div key={p.url} className="grid gap-4 rounded-2xl border border-white/10 bg-navy-mid p-6 md:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">Now</p>
                <p className="mt-2 text-[15px] text-ink/70">{p.currentTitle}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-electric uppercase">Suggested</p>
                <p className="mt-2 text-[15px] font-medium text-ink">{p.newTitle}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {preview.ads.google.map((g, i) => (
          <div key={`g${i}`} className="rounded-2xl border border-white/10 bg-white p-5 text-[#202124]">
            <p className="text-[11px] text-[#5f6368]">Sponsored · {domain}</p>
            <p className="mt-1 text-[18px] leading-snug text-[#1a0dab]">{g.headlines.join(" | ")}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#4d5156]">{g.descriptions.join(" ")}</p>
            <p className="mt-3 font-mono text-[10px] text-[#5f6368] uppercase">Google search ad draft</p>
          </div>
        ))}
        {preview.ads.meta.map((m, i) => (
          <div key={`m${i}`} className="rounded-2xl border border-white/10 bg-white p-5 text-[#1c1e21]">
            <p className="text-[13px] leading-relaxed">{m.primaryText}</p>
            <div className="mt-3 aspect-[1.91/1] overflow-hidden rounded-lg bg-[#f0f2f5]">
              {preview.showcase[i]?.image && <img src={preview.showcase[i].image!} alt="" loading="lazy" className="h-full w-full object-contain" />}
            </div>
            <p className="mt-2 text-[14px] font-semibold">{m.headline}</p>
            <p className="mt-3 font-mono text-[10px] text-[#65676b] uppercase">Facebook / Instagram ad draft</p>
          </div>
        ))}
      </div>
    </div>
  );
}
