import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { savePrices } from "@/lib/service-prices";
import { SERVICE_TIERS, type TierId } from "@/lib/service-tiers";

// Saves tier prices from /admin/pricing and refreshes the static service
// pages so a fully priced service shows its tiers straight away.
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    prices?: { slug: string; tier: TierId; price: number | null; pricePrefix: string | null }[];
  };
  const valid = (body.prices ?? []).filter(
    (p) =>
      SERVICE_TIERS.some((s) => s.slug === p.slug) &&
      ["fix", "build", "grow"].includes(p.tier) &&
      (p.price === null || (Number.isInteger(p.price) && p.price > 0 && p.price < 1_000_000)) &&
      (p.pricePrefix === null || p.pricePrefix === "from"),
  );
  if (valid.length === 0) return NextResponse.json({ ok: false, error: "Nothing to save." }, { status: 400 });
  await savePrices(valid);
  for (const slug of new Set(valid.map((p) => p.slug))) revalidatePath(`/services/${slug}`);
  return NextResponse.json({ ok: true, saved: valid.length });
}
