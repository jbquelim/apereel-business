import { ImageResponse } from "next/og";
import { neon } from "@neondatabase/serverless";
import { getClientByToken } from "@/lib/clients";
import type { CarouselAd, StaticAd } from "@/lib/ads-engine";
import type { PostData } from "@/lib/content-engine";

// Renders an ad or post as a PNG from the product's real photo: the photo on
// a clean card with the on-image headline, line and badge. Sizes for feeds,
// stories and Google display. ?t= is the client's studio token.

const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 628 },
} as const;

async function photo(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0" } });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/image\/(jpeg|png|gif)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4_000_000) return null;
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

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
    headline = p.hook.slice(0, 60);
  } else {
    return new Response("Not an image item", { status: 400 });
  }

  const src = await photo(image);
  const tall = size.height > size.width;
  const wide = size.width > size.height * 1.5;
  const brand = client.domain.replace(/\.[a-z.]+$/, "").replace(/[-_]/g, " ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: wide ? "row" : "column", background: "#f5f3ef", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flex: wide ? "0 0 52%" : tall ? "0 0 58%" : "0 0 62%", alignItems: "center", justifyContent: "center", background: "#ffffff", padding: 48 }}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", fontSize: 48, color: "#9aa3b2" }}>{brand}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: wide ? "40px 48px" : "48px 64px", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#1a5fb8" }}>{brand}</div>
          <div style={{ display: "flex", fontSize: wide ? 50 : tall ? 76 : 66, lineHeight: 1.05, fontWeight: 700, color: "#111827" }}>{headline}</div>
          {sub && <div style={{ display: "flex", fontSize: wide ? 26 : 34, lineHeight: 1.3, color: "#4b5563" }}>{sub}</div>}
          {badge && (
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", background: "#1a5fb8", color: "#ffffff", fontSize: wide ? 26 : 32, padding: "10px 24px", borderRadius: 999 }}>{badge}</div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "private, max-age=300" } },
  );
}
