import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pricedServices } from "@/lib/service-prices";
import { priceLabel, tierLabel } from "@/lib/service-tiers";
import { SERVICE_NAME } from "@/lib/billing";
import type { AiService } from "@/lib/clients";
import { StartForm } from "./start-form";

// Sign-up for one service tier: the business's website and email, then
// Stripe Checkout. Linked from /pricing.

export const metadata: Metadata = { title: "Get started", robots: { index: false, follow: true } };

const SERVICES: AiService[] = ["premium-creative", "advertising", "web-development"];

export default async function StartPage({ searchParams }: { searchParams: Promise<{ service?: string; tier?: string; site?: string }> }) {
  const q = await searchParams;
  const service = SERVICES.find((s) => s === q.service);
  const tier = (await pricedServices()).find((s) => s.slug === service)?.tiers.find((t) => t.id === q.tier);
  if (!service || !tier) notFound();
  const live = process.env.NEXT_PUBLIC_GROWTH_PLAN === "on";
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto grid w-full max-w-[1040px] gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">{SERVICE_NAME[service]} · {tierLabel(tier)}</p>
          <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">{tier.name}</h1>
          <p className="font-display mt-6 text-3xl text-ink">{priceLabel(tier)}</p>
          <p className="mt-2 text-[14px] text-muted">
            {service === "web-development"
              ? "One-time, plus tax where it applies. Hosting is included for 12 months, then $10 a month plus tax; cancel anytime."
              : "Billed monthly, plus tax where it applies. Cancel anytime."}
          </p>
          <ul className="mt-8 space-y-2.5">
            {tier.scope.map((s) => (
              <li key={s} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/85">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-navy-mid p-6 sm:p-8">
          <StartForm service={service} tier={tier.id} site={typeof q.site === "string" ? q.site.slice(0, 200) : ""} live={live} />
        </div>
      </section>
    </main>
  );
}
