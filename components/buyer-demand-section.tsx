// Real buyer searches (Google autocomplete) and whether the site has a page
// aimed at each. Shared by the free audit and the Growth Plan.

type Row = { query: string; coverage: "category" | "products" | "none" | null; matchUrl?: string };
export type DemandData = { rows: Row[]; coverageChecked: boolean };

const LABEL = {
  category: { text: "Category page", cls: "border-electric/40 text-electric" },
  products: { text: "Product pages only", cls: "border-white/20 text-ink/80" },
  none: { text: "No page", cls: "border-signal/40 text-signal" },
} as const;

export function BuyerDemandSection({ demand, compact = false }: { demand: DemandData; compact?: boolean }) {
  const rows = compact ? demand.rows.slice(0, 12) : demand.rows;
  if (rows.length === 0) return null;
  const gaps = demand.rows.filter((r) => r.coverage === "none").length;
  const weak = demand.rows.filter((r) => r.coverage === "products").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">What Buyers Search For</p>
        <span className="rounded-full border border-electric/20 bg-electric/5 px-2.5 py-0.5 text-[10px] tracking-wide text-electric/60 uppercase">
          Google Autocomplete
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Real searches people type into Google around what you sell
        {demand.coverageChecked ? ", matched against the pages on your site" : ""}. Autocomplete
        shows what&apos;s searched, not how often.
      </p>
      {demand.coverageChecked && gaps + weak > 0 && (
        <p className="mt-4 text-[15px] leading-relaxed text-ink">
          {gaps > 0 && (
            <>
              <span className="font-semibold">{gaps}</span> of these searches have no page aimed at them
            </>
          )}
          {gaps > 0 && weak > 0 && "; "}
          {weak > 0 && (
            <>
              <span className="font-semibold">{weak}</span> only reach individual product pages
            </>
          )}
          .
        </p>
      )}
      <ul className="mt-5 divide-y divide-white/5">
        {rows.map((r) => (
          <li key={r.query} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
            <span className="text-[14px] text-ink/90">{r.query}</span>
            {r.coverage && (
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${LABEL[r.coverage].cls}`}>
                {LABEL[r.coverage].text}
              </span>
            )}
          </li>
        ))}
      </ul>
      {demand.coverageChecked && (
        <p className="mt-4 text-[12px] leading-relaxed text-muted/70">
          Matched against the page addresses in your sitemap. A page may cover a search without
          naming it in its address.
        </p>
      )}
    </div>
  );
}
