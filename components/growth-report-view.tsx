import type { GrowthReport } from "@/lib/growth-report";
import { priceLabel, recommendTiers, type ServiceTiers } from "@/lib/service-tiers";
import { BuyerDemandSection } from "@/components/buyer-demand-section";
import { PreviewSection } from "@/components/preview-section";
import { tierById } from "@/lib/analysis-tiers";
import { CrawlSection, ProductCompareSection } from "@/components/crawl-sections";
import { FreeAuditResults } from "@/components/site-audit";

// The Growth Plan as the customer reads it. Also rendered in John's review
// page, so what he approves is exactly what is sent.

const IMPACT_STYLE: Record<string, string> = {
  high: "border-electric/50 bg-electric/10 text-electric",
  medium: "border-white/20 text-ink/80",
  low: "border-white/10 text-muted",
};

function Badge({ children, tone = "medium" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${IMPACT_STYLE[tone] ?? IMPACT_STYLE.medium}`}>
      {children}
    </span>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">{eyebrow}</p>
      {title && <h2 className="font-display mt-3 text-2xl text-ink sm:text-3xl">{title}</h2>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function GrowthReportView({
  report,
  preparedFor,
  date,
  services,
  tier,
}: {
  report: GrowthReport;
  preparedFor: string | null;
  date: string | null;
  /** Services with current prices (from the database). */
  services?: ServiceTiers[];
  /** Analysis tier purchased: teardown | growth | preview */
  tier?: string;
}) {
  const analysis = tierById(tier);
  const plan = report.plan;
  const when = date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <article className="text-ink">
      <header>
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Apereel {analysis.name}</p>
        <h1 className="font-display mt-4 text-4xl tracking-[-0.02em] sm:text-5xl">{report.domain}</h1>
        <p className="mt-4 text-[15px] text-muted">
          {[preparedFor && `Prepared for ${preparedFor}`, when, analysis.reviewed ? "Reviewed by John Lim" : "Generated automatically from live data"]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {plan ? (
        <>
          <p className="mt-10 max-w-3xl text-xl leading-relaxed text-ink/90 sm:text-[22px]">{plan.summary}</p>

          <Section eyebrow="What to do first" title="Priorities, in order of impact">
            <ol className="space-y-5">
              {plan.priorities.map((p, i) => (
                <li key={i} className="rounded-2xl border border-white/10 bg-navy-mid p-6 sm:p-7">
                  <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                    <span className="font-mono text-2xl leading-none text-electric">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-ink sm:text-xl">{p.title}</h3>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Badge tone={p.impact}>{p.impact} impact</Badge>
                        <Badge tone={p.effort === "low" ? "high" : "medium"}>{p.effort} effort</Badge>
                        {p.service && <Badge tone="low">{p.service}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">What we found</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{p.evidence}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">What to do</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{p.action}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {analysis.reviewed && (
          <Section eyebrow="The next 90 days" title="Your roadmap">
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["First 30 days", plan.roadmap.days30],
                ["Days 31 to 60", plan.roadmap.days60],
                ["Days 61 to 90", plan.roadmap.days90],
              ] as const).map(([label, items]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-navy-mid p-6">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-electric uppercase">{label}</p>
                  <ul className="mt-4 space-y-3">
                    {items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
          )}

          {report.preview && (
            <Section eyebrow="Your preview" title="A better version of your site, drafted">
              <PreviewSection preview={report.preview} domain={report.domain} />
            </Section>
          )}

          {!analysis.reviewed && (
            <section className="mt-14 rounded-2xl border border-white/15 bg-navy-mid p-6 sm:p-8">
              <p className="font-display text-xl text-ink">Want it reviewed, with a 90-day roadmap?</p>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                This Teardown is generated automatically. The Growth Plan adds a 30/60/90-day roadmap and
                John Lim&apos;s review before it reaches you. Reply to the email this came with and we&apos;ll
                upgrade it.
              </p>
            </section>
          )}
        </>
      ) : (
        <p className="mt-10 text-muted">The plan hasn&apos;t been written yet.</p>
      )}

      {report.crawl && (
        <Section eyebrow="Every page checked" title="What we found across your site">
          <CrawlSection crawl={report.crawl} />
        </Section>
      )}

      {report.productCompare && report.productCompare.competitors.length > 0 && (
        <Section eyebrow="Side by side" title="Your product pages against your competitors'">
          <ProductCompareSection compare={report.productCompare} />
        </Section>
      )}

      {report.history && report.history.length > 0 && (
        <Section eyebrow="Tracked over time" title="What we've seen change">
          <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
            Apereel re-reads these stores on a schedule. Each figure compares the same products or
            categories on two dates.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {report.history.map((h) => (
              <div key={h.domain} className="rounded-2xl border border-white/10 bg-navy-mid p-6">
                <p className="text-[15px] font-medium text-ink">
                  {h.name}
                  <span className="ml-2 font-mono text-[11px] text-muted">tracked since {h.since}</span>
                </p>
                <ul className="mt-3 space-y-2">
                  {h.facts.map((f, i) => (
                    <li key={i} className="text-[14px] leading-relaxed text-ink/85">{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Without volumes this repeats the included scan, so show it only with them. */}
      {report.demandVolumes && report.audit.demand && report.audit.demand.rows.length > 0 && (
        <Section eyebrow="Demand" title="What your buyers search for">
          <BuyerDemandSection demand={report.audit.demand} volumes={report.demandVolumes} />
        </Section>
      )}

      {report.rankings && (
        <Section eyebrow="Search visibility" title="Where you rank on Google">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-navy-mid p-6">
              <p className="text-[15px] font-medium text-ink">Your top rankings</p>
              <p className="mt-1 text-[13px] text-muted">
                {report.rankings.client.keywords.length} searches found; highest-volume shown.
              </p>
              <ul className="mt-4 divide-y divide-white/5 font-mono text-[13px]">
                {report.rankings.client.keywords.slice(0, 12).map((k) => (
                  <li key={k.keyword} className="flex justify-between gap-4 py-2 text-ink/85">
                    <span className="truncate font-sans text-[14px]">{k.keyword}</span>
                    <span className="shrink-0 text-muted">
                      #{k.position ?? "—"}
                      {k.volume != null ? ` · ${k.volume.toLocaleString("en-US")}/mo` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-electric/30 bg-electric/5 p-6">
              <p className="text-[15px] font-medium text-ink">Searches your competitors win</p>
              <p className="mt-1 text-[13px] text-muted">
                They rank in the top 20; you don&apos;t rank at all.
              </p>
              {report.rankings.gaps.length > 0 ? (
                <ul className="mt-4 divide-y divide-white/5">
                  {report.rankings.gaps.map((g) => (
                    <li key={g.keyword} className="py-2">
                      <p className="flex justify-between gap-4 text-[14px] text-ink">
                        <span>{g.keyword}</span>
                        {g.volume != null && (
                          <span className="shrink-0 font-mono text-[12px] text-muted">{g.volume.toLocaleString("en-US")}/mo</span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">
                        {g.competitors.map((c) => `${c.name} #${c.position}`).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-muted">No clear gaps among the searches we checked.</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-muted/70">Rankings and volumes from DataForSEO (Google, your country).</p>
        </Section>
      )}

      <Section eyebrow="The evidence" title="What we measured on your site">
        <div className="space-y-4">
          {report.pages.map((p) => (
            <div key={p.url} className="rounded-2xl border border-white/10 bg-navy-mid p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[15px] font-medium text-ink">{p.type}</p>
                <p className="font-mono text-[12px] text-muted">
                  {p.speed
                    ? `Mobile speed ${p.speed.performance ?? "n/a"}/100 · main content in ${p.speed.lcp ?? "n/a"}`
                    : "Speed not measured"}
                </p>
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-muted/70">{p.url}</p>
              {p.issues.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {p.issues.map((issue, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink/85">
                      <Badge tone={issue.severity}>{issue.severity}</Badge>
                      <span>{issue.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-muted">No issues found in the checks we ran.</p>
              )}
            </div>
          ))}
          {report.pages.length < 3 && (
            <p className="text-[13px] text-muted">
              Some page types couldn&apos;t be read automatically (sites often block automated
              visitors), so they aren&apos;t covered above.
            </p>
          )}
        </div>

        {report.competitorSpeed.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-navy-mid p-6">
            <p className="text-[15px] font-medium text-ink">Homepage speed against competitors (mobile)</p>
            <ul className="mt-4 space-y-2 font-mono text-[13px]">
              {[
                { name: "You", speed: report.pages.find((p) => p.type === "Homepage")?.speed ?? null },
                ...report.competitorSpeed,
              ].map((c) => (
                <li key={c.name} className="flex justify-between gap-4 border-b border-white/5 pb-2 text-ink/85">
                  <span className={c.name === "You" ? "text-electric" : ""}>{c.name}</span>
                  <span>{c.speed ? `${c.speed.performance ?? "n/a"}/100 · ${c.speed.lcp ?? "n/a"}` : "not measured"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </Section>

      <Section eyebrow="Included" title="Your market scan, in full">
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
          Everything from the free scan, kept here so this report stands on its own: competitors,
          their catalogs, buyer searches, marketing tools and site performance.
        </p>
        <FreeAuditResults data={report.audit} />
      </Section>

      {plan && plan.notMeasured.length > 0 && (
        <Section eyebrow="Honest limits" title="What this plan couldn't measure">
          <ul className="space-y-2">
            {plan.notMeasured.map((n, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-muted" />
                {n}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {plan && <HowWeCanHelp priorities={plan.priorities} services={services} />}

      <section className="mt-14 rounded-2xl border border-electric/30 bg-electric/5 p-6 sm:p-8">
        <p className="font-display text-2xl text-ink">Want help putting this into action?</p>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Reply to the email this came with, or tell us about your business and we&apos;ll show you how
          we&apos;d approach it.
        </p>
        <a
          href="/contact"
          className="press-scale mt-5 inline-flex h-11 items-center rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.06em] text-navy uppercase transition-colors hover:bg-electric-deep"
        >
          Talk to Apereel
        </a>
      </section>
    </article>
  );
}

function HowWeCanHelp({
  priorities,
  services,
}: {
  priorities: { service: string; effort: string }[];
  services?: ServiceTiers[];
}) {
  const { recs, suggestGrow } = recommendTiers(priorities, services);
  if (recs.length === 0) return null;
  const grow = suggestGrow;
  return (
    <Section eyebrow="How Apereel can help" title="Where we'd start">
      <div className="grid gap-4 md:grid-cols-2">
        {recs.map(({ service, tier, covers }) => (
          <div key={`${service.slug}-${tier.id}`} className="flex flex-col rounded-2xl border border-white/10 bg-navy-mid p-6">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
              {service.tag} · {tier.id === "fix" ? "Fix" : "Build"}
            </p>
            <p className="mt-2 text-lg font-medium text-ink">{tier.name}</p>
            <p className="mt-1 text-[14px] text-muted">
              Covers priorit{covers.length > 1 ? "ies" : "y"} {covers.join(", ")}
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {tier.scope.map((s) => (
                <li key={s} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                  <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-mono text-[13px] text-ink">{priceLabel(tier)}</p>
          </div>
        ))}
      </div>
      {grow && (
        <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-muted">
          This plan spans several areas. If you&apos;d rather hand it over than run separate projects,
          our monthly Grow engagements cover the ongoing work across them.
        </p>
      )}
    </Section>
  );
}
