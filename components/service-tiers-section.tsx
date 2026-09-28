"use client";

import { useSyncExternalStore } from "react";
import { isPriced, priceLabel, type ServiceTiers } from "@/lib/service-tiers";

// Fix / Build / Grow for one service. Hidden on the public page until every
// tier has a price; "?tiers=preview" shows it for review in the meantime.

const subscribe = () => () => {};
const previewing = () => new URLSearchParams(window.location.search).get("tiers") === "preview";

export function ServiceTiersSection({ service }: { service: ServiceTiers }) {
  const preview = useSyncExternalStore(subscribe, previewing, () => false);
  if (!isPriced(service) && !preview) return null;

  return (
    <section id="packages" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Ways to work together</p>
        <h2 className="font-display mt-4 text-3xl font-normal tracking-[-0.02em] text-ink sm:text-4xl">
          Start where it makes the biggest difference.
        </h2>
        {!isPriced(service) && (
          <p className="mt-4 font-mono text-[12px] text-signal">Preview: prices not set yet.</p>
        )}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {service.tiers.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${t.id === "build" ? "border-electric/40 bg-electric/5" : "border-white/10 bg-navy-mid"}`}
            >
              <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                {t.id === "fix" ? "Fix" : t.id === "build" ? "Build" : "Grow"} · {t.cadence}
              </p>
              <h3 className="mt-3 text-xl font-medium text-ink">{t.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.summary}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {t.scope.map((s) => (
                  <li key={s} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                    <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[15px] text-ink">{priceLabel(t)}</p>
            </div>
          ))}
        </div>
        <a
          href="#contact"
          className="press-scale mt-8 inline-flex h-11 items-center rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.06em] text-navy uppercase transition-colors hover:bg-electric-deep"
        >
          Talk about which fits
        </a>
      </div>
    </section>
  );
}
