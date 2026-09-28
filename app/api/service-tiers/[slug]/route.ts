import { NextResponse } from "next/server";
import { tiersForService } from "@/lib/service-tiers";
import { pricedServices } from "@/lib/service-prices";

// Draft tiers for ?tiers=preview on service pages. Kept out of the static
// page HTML so unpriced drafts aren't published in the page source.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = tiersForService(slug, await pricedServices());
  if (!service) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, service }, { headers: { "X-Robots-Tag": "noindex" } });
}
