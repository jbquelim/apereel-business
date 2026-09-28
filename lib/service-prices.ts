import { neon } from "@neondatabase/serverless";
import { SERVICE_TIERS, type ServiceTiers, type TierId } from "./service-tiers";

// Prices live in the database (edited at /admin/pricing) and are laid over
// the tier definitions in lib/service-tiers.ts. A price set in code is only a
// fallback; the database wins.

type PriceRow = { slug: string; tier: TierId; price: number | null; price_prefix: string | null };

export async function loadPrices(): Promise<PriceRow[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return (await neon(process.env.DATABASE_URL)`
      SELECT slug, tier, price, price_prefix FROM service_prices
    `) as PriceRow[];
  } catch (err) {
    console.error("loadPrices failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

export function applyPrices(services: ServiceTiers[], rows: PriceRow[]): ServiceTiers[] {
  return services.map((s) => ({
    ...s,
    tiers: s.tiers.map((t) => {
      const row = rows.find((r) => r.slug === s.slug && r.tier === t.id);
      if (!row) return t;
      return { ...t, price: row.price, pricePrefix: row.price_prefix ?? undefined };
    }) as ServiceTiers["tiers"],
  }));
}

/** All services with current prices. */
export async function pricedServices(): Promise<ServiceTiers[]> {
  return applyPrices(SERVICE_TIERS, await loadPrices());
}

export async function savePrices(
  rows: { slug: string; tier: TierId; price: number | null; pricePrefix: string | null }[],
): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const sql = neon(process.env.DATABASE_URL);
  for (const r of rows) {
    await sql`
      INSERT INTO service_prices (slug, tier, price, price_prefix, updated_at)
      VALUES (${r.slug}, ${r.tier}, ${r.price}, ${r.pricePrefix}, now())
      ON CONFLICT (slug, tier) DO UPDATE
        SET price = EXCLUDED.price, price_prefix = EXCLUDED.price_prefix, updated_at = now()
    `;
  }
}
