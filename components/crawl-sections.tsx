import type { CompetitorCompare, ProductPageProfile, SiteCrawl } from "@/lib/site-crawl";

// Paid-report sections built from the every-page crawl: each problem with its
// count and the exact URLs, and the client's product pages beside competitors'.

const SEVERITY_STYLE: Record<string, string> = {
  high: "border-signal/50 text-signal",
  medium: "border-electric/40 text-electric",
  low: "border-white/15 text-muted",
};

export function CrawlSection({ crawl }: { crawl: SiteCrawl }) {
  const read = crawl.crawled.home + crawl.crawled.category + crawl.crawled.product;
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Pages read", read.toLocaleString("en-US")],
          ["Product pages", `${crawl.crawled.product} of ${crawl.sitemapProducts.toLocaleString("en-US")}`],
          ["Category pages", `${crawl.crawled.category} of ${crawl.sitemapCategories.toLocaleString("en-US")}`],
          ["Avg server response", crawl.avgResponseMs != null ? `${(crawl.avgResponseMs / 1000).toFixed(1)} s` : "n/a"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-navy-mid p-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">{label}</p>
            <p className="mt-2 text-xl text-ink">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Pages are sampled evenly across your whole sitemap, so the counts below reflect the catalog as a
        whole. Every page listed is one we opened ourselves.
        {crawl.blocked > 0 &&
          ` Your site's firewall refused ${crawl.blocked} of our requests${crawl.mostlyBlocked ? ", so this is a partial picture" : ""}.`}
      </p>

      {crawl.findings.length === 0 ? (
        <p className="mt-6 text-[15px] text-ink/85">No problems found on the pages we read.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {crawl.findings.map((f) => {
            const pct = f.of ? Math.round((f.count / f.of) * 100) : null;
            return (
              <li key={f.key} className="rounded-2xl border border-white/10 bg-navy-mid p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <p className="flex items-baseline gap-3 text-[16px] font-medium text-ink">
                    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${SEVERITY_STYLE[f.severity]}`}>
                      {f.severity}
                    </span>
                    {f.label}
                  </p>
                  <p className="font-mono text-[14px] text-ink">
                    {f.count.toLocaleString("en-US")} <span className="text-muted">of {f.of.toLocaleString("en-US")}{pct != null ? ` · ${pct}%` : ""}</span>
                  </p>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.why}</p>
                <details className="mt-3">
                  <summary className="cursor-pointer font-mono text-[12px] text-electric">
                    Show the {f.urls.length === f.count ? "" : `first ${f.urls.length} `}pages
                  </summary>
                  <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-2">
                    {f.urls.map((u) => (
                      <li key={u} className="truncate font-mono text-[12px] text-ink/75">
                        <a href={u} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-electric">
                          {u.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const ROWS: { label: string; get: (p: ProductPageProfile) => number | null; unit: string; higherIsBetter: boolean }[] = [
  { label: "Price in Google product data", get: (p) => p.priceInSchemaPct, unit: "%", higherIsBetter: true },
  { label: "Reviews or ratings shown", get: (p) => p.ratingsPct, unit: "%", higherIsBetter: true },
  { label: "Specification table", get: (p) => p.specTablePct, unit: "%", higherIsBetter: true },
  { label: "Photos per product", get: (p) => p.avgImages, unit: "", higherIsBetter: true },
  { label: "Words of description", get: (p) => p.avgWords, unit: "", higherIsBetter: true },
  { label: "Server response", get: (p) => p.avgResponseMs, unit: " ms", higherIsBetter: false },
];

export function ProductCompareSection({ compare }: { compare: CompetitorCompare }) {
  const cols = [compare.client, ...compare.competitors];
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-mid">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
              <th className="p-4 font-normal">Product pages</th>
              {cols.map((c) => (
                <th key={c.domain} className={`p-4 font-normal ${c === compare.client ? "text-electric" : ""}`}>
                  {c.name}
                  <span className="block normal-case tracking-normal text-muted/70">{c.pages} read</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const values = cols.map((c) => r.get(c));
              const known = values.filter((v): v is number => v != null);
              const best = known.length ? (r.higherIsBetter ? Math.max(...known) : Math.min(...known)) : null;
              return (
                <tr key={r.label} className="border-b border-white/5 last:border-0">
                  <td className="p-4 text-ink/85">{r.label}</td>
                  {values.map((v, i) => (
                    <td key={i} className={`p-4 font-mono ${v != null && v === best && known.length > 1 ? "text-electric" : "text-ink/80"}`}>
                      {v == null ? "n/a" : `${v.toLocaleString("en-US")}${r.unit}`}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        Read directly from product pages on each site today. The best figure in each row is highlighted.
        Reviews count as shown when the page carries ratings data or a known reviews tool.
        {compare.unreadable && compare.unreadable.length > 0 &&
          ` We couldn't read product pages from ${compare.unreadable.join(", ")} (their sites refuse automated visitors or hide products behind search).`}
      </p>
    </div>
  );
}
