import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { pricedServices } from "@/lib/service-prices";
import { PricingForm } from "./pricing-form";

export const metadata: Metadata = { title: "Service pricing", robots: { index: false, follow: false } };

export default async function PricingPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const services = await pricedServices();
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1120px] px-6 py-20 sm:px-8">
        <Link href="/admin" className="font-mono text-[12px] text-muted underline underline-offset-4">
          ← Orders
        </Link>
        <h1 className="font-display mt-6 text-4xl text-ink">Service pricing</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          Prices in US dollars. A service&apos;s Fix / Build / Grow table appears on its public page
          once all three of its tiers have a price. Leave a box empty to keep it unpriced. Growth
          Plans show a price for any tier that has one.
        </p>
        <PricingForm
          services={services.map((s) => ({
            slug: s.slug,
            tag: s.tag,
            tiers: s.tiers.map((t) => ({ id: t.id, name: t.name, cadence: t.cadence, price: t.price, from: t.pricePrefix === "from" })),
          }))}
        />
      </section>
    </main>
  );
}
