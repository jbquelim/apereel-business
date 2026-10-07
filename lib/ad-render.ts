import type { BrandKit } from "./ad-brand";
import { googleFont } from "./ad-brand";

// Fonts for an ad image: the brand's heading and body fonts (sans only), with
// a fallback so an image always renders. The designs refer to them as
// "Heading" and "Body" (lib/ad-designs).

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

export async function adFonts(k: BrandKit): Promise<Font[]> {
  const pick = async (family: string, weight: 400 | 700) =>
    (await googleFont(family, weight)) ?? (await googleFont("Inter", weight)) ?? (await googleFont("Plus Jakarta Sans", weight));
  const [h7, b4, b7] = await Promise.all([pick(k.heading, 700), pick(k.body, 400), pick(k.body, 700)]);
  const out: Font[] = [];
  if (h7) out.push({ name: "Heading", data: h7, weight: 700, style: "normal" });
  if (b4) out.push({ name: "Body", data: b4, weight: 400, style: "normal" });
  if (b7) out.push({ name: "Body", data: b7, weight: 700, style: "normal" });
  return out;
}
