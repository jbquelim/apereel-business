import { ImageResponse } from "next/og";
import { neon } from "@neondatabase/serverless";
import { getClientByToken } from "@/lib/clients";
import type { CarouselAd, StaticAd } from "@/lib/ads-engine";
import type { PostData } from "@/lib/content-engine";
import { brandKit, drawable } from "@/lib/ad-brand";
import { adFonts } from "@/lib/ad-render";
import { fit } from "@/lib/content-qa";
import { designById, designFor, type AdSlots } from "@/lib/ad-designs";

// Renders an ad or post as a PNG from the product's real photo in one of the
// client's ad designs (lib/ad-designs), in their brand's name, logo, colours
// and fonts (lib/ad-brand). Sizes for feeds, stories and Google display.
// ?t= is the client's studio token; ?design= shows the item in another design.

const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 628 },
} as const;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  const client = await getClientByToken(url.searchParams.get("t") ?? "");
  const id = Number((await params).id);
  if (!client || !Number.isInteger(id) || !process.env.DATABASE_URL) return new Response("Not found", { status: 404 });
  const item = ((await neon(process.env.DATABASE_URL)`
    SELECT kind, image, data FROM content_items WHERE id = ${id} AND client_id = ${client.id}
  `) as { kind: string; image: string | null; data: unknown }[])[0];
  if (!item) return new Response("Not found", { status: 404 });

  const size = SIZES[(url.searchParams.get("size") as keyof typeof SIZES) ?? "square"] ?? SIZES.square;
  let image = item.image;
  let headline = "";
  let sub = "";
  let badge = "";
  if (item.kind === "ad") {
    const a = item.data as StaticAd;
    headline = a.overlay.headline;
    sub = a.overlay.sub;
    badge = a.overlay.badge || a.price || "";
  } else if (item.kind === "carousel") {
    const c = item.data as CarouselAd;
    const f = c.frames[Math.min(Number(url.searchParams.get("frame") ?? 0) || 0, c.frames.length - 1)];
    image = f?.image ?? null;
    headline = f?.headline ?? "";
    sub = f?.sub ?? "";
  } else if (item.kind === "post") {
    const p = item.data as PostData;
    headline = fit(p.hook, 60);
  } else {
    return new Response("Not an image item", { status: 400 });
  }

  // The client's brand kit and one of their designs (lib/ad-designs), rotated across items; ?design= previews another.
  const kit = await brandKit(client.domain);
  const slots: AdSlots = { photo: await drawable(image), headline, sub, badge, cta: "" };
  const chosen = designById(url.searchParams.get("design") ?? "");
  const design = chosen && chosen.suits(slots) ? chosen : designFor(client.id, client.tier, id, slots);
  return new ImageResponse(design.render(slots, kit, size), { ...size, fonts: await adFonts(kit), headers: { "Cache-Control": "private, max-age=300" } });
}
