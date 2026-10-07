import type { ReactElement } from "react";
import type { AdPhoto, BrandKit } from "./ad-brand";

// Ad and post image designs, drawn by next/og from a brand kit (lib/ad-brand)
// and one product photo. Every design works at the three sizes (feed square,
// story, landscape) and sizes its type to the copy, so text never overflows:
// the font is the largest that fits the box in its line count.

export type AdSize = { width: number; height: number };
export type AdSlots = {
  photo: AdPhoto | null;
  headline: string;
  sub: string;
  /** A price or a short fact; empty when none. */
  badge: string;
  /** Call to action on the image; empty for none. */
  cta: string;
};
export type AdDesign = {
  id: string;
  name: string;
  summary: string;
  /** Whether it suits this photo and copy (a full-bleed design needs a scene, a price design a price). */
  suits: (s: AdSlots) => boolean;
  render: (s: AdSlots, k: BrandKit, size: AdSize) => ReactElement;
};

/** The largest font size (≤ max, ≥ min) at which `text` wraps to at most `lines` lines in `width` px. */
export function fitSize(text: string, width: number, lines: number, max: number, min: number, charWidth = 0.56): number {
  const words = text.split(/\s+/).filter(Boolean);
  for (let fs = max; fs > min; fs -= 2) {
    let n = 1;
    let line = 0;
    for (const w of words) {
      const ww = (w.length + 1) * fs * charWidth;
      if (line + ww > width && line > 0) {
        n++;
        line = ww;
      } else line += ww;
    }
    if (n <= lines) return fs;
  }
  return min;
}

const kind = (z: AdSize) => (z.width > z.height * 1.4 ? "wide" : z.height > z.width * 1.3 ? "tall" : "square");
const caseOf = (k: BrandKit, t: string) => (k.upper ? t.toUpperCase() : t);

/** Logo, or the name set in the heading font. */
function Mark({ k, height, color }: { k: BrandKit; height: number; color: string }) {
  return k.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={k.logo} alt="" style={{ height, maxWidth: height * 5, objectFit: "contain" }} />
  ) : (
    <div style={{ display: "flex", fontFamily: "Heading", fontSize: height * 0.62, fontWeight: 700, color, letterSpacing: -0.5 }}>{k.name}</div>
  );
}

function Photo({ p, fit, pad = 0 }: { p: AdPhoto; fit: "contain" | "cover"; pad?: number }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", padding: pad, alignItems: "center", justifyContent: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: fit }} />
    </div>
  );
}

function Pill({ text, bg, color, size }: { text: string; bg: string; color: string; size: number }) {
  return <div style={{ display: "flex", alignSelf: "flex-start", background: bg, color, fontFamily: "Body", fontWeight: 700, fontSize: size, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999 }}>{text}</div>;
}

function Text({ text, size, color, weight = 700, family = "Heading", lh = 1.05, ls = -0.02 }: { text: string; size: number; color: string; weight?: number; family?: string; lh?: number; ls?: number }) {
  return <div style={{ display: "flex", fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: `${ls}em`, color }}>{text}</div>;
}

// 1. Showcase: the product on the brand's tinted card; type below.
const showcase: AdDesign = {
  id: "showcase",
  name: "Showcase",
  summary: "Product on the brand's tinted card, headline and price below",
  suits: () => true,
  render: (s, k, z) => {
    const v = kind(z);
    const pad = v === "wide" ? 44 : 64;
    const textW = v === "wide" ? z.width * 0.5 - pad * 2 : z.width - pad * 2;
    const hs = fitSize(caseOf(k, s.headline), textW, v === "tall" ? 4 : 3, v === "wide" ? 54 : v === "tall" ? 92 : 74, 30);
    return (
      <div style={{ display: "flex", flexDirection: v === "wide" ? "row" : "column", width: "100%", height: "100%", background: k.bg }}>
        <div style={{ display: "flex", flex: v === "wide" ? "0 0 50%" : v === "tall" ? "0 0 58%" : "0 0 60%", background: k.surface, margin: v === "wide" ? 24 : 32, marginBottom: v === "wide" ? 24 : 0, borderRadius: k.radius * 2 }}>
          {s.photo && <Photo p={s.photo} fit={s.photo.cutout ? "contain" : "cover"} pad={s.photo.cutout ? 48 : 0} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: pad, gap: v === "wide" ? 16 : 22 }}>
          <Mark k={k} height={v === "wide" ? 40 : 52} color={k.ink} />
          <Text text={caseOf(k, s.headline)} size={hs} color={k.ink} />
          {s.sub && <Text text={s.sub} size={Math.round(hs * 0.42)} color={k.muted} weight={400} family="Body" lh={1.35} ls={0} />}
          {s.badge && <Pill text={s.badge} bg={k.accent} color={k.onAccent} size={v === "wide" ? 26 : 32} />}
        </div>
      </div>
    );
  },
};

// 2. Split: a block of the brand colour with the headline beside the photo.
const split: AdDesign = {
  id: "split",
  name: "Split",
  summary: "Brand-colour panel with the headline, photo beside it",
  suits: () => true,
  render: (s, k, z) => {
    const v = kind(z);
    const pad = v === "wide" ? 48 : 72;
    const panelW = v === "wide" ? z.width * 0.48 : z.width;
    const hs = fitSize(caseOf(k, s.headline), panelW - pad * 2, v === "tall" ? 5 : 4, v === "wide" ? 56 : v === "tall" ? 100 : 80, 30);
    return (
      <div style={{ display: "flex", flexDirection: v === "wide" ? "row" : "column-reverse", width: "100%", height: "100%", background: k.bg }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: v === "wide" ? "0 0 48%" : "0 0 44%", background: k.accent, padding: pad }}>
          <Mark k={{ ...k, logo: k.logo }} height={v === "wide" ? 36 : 48} color={k.onAccent} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Text text={caseOf(k, s.headline)} size={hs} color={k.onAccent} />
            {s.sub && <Text text={s.sub} size={Math.round(hs * 0.4)} color={k.onAccent} weight={400} family="Body" lh={1.35} ls={0} />}
          </div>
          {s.badge || s.cta ? <Pill text={s.badge || s.cta} bg={k.onAccent} color={k.accent} size={v === "wide" ? 24 : 32} /> : <div style={{ display: "flex" }} />}
        </div>
        <div style={{ display: "flex", flex: 1, background: s.photo?.cutout ? "#ffffff" : k.surface }}>
          {s.photo && <Photo p={s.photo} fit={s.photo.cutout ? "contain" : "cover"} pad={s.photo.cutout ? 56 : 0} />}
        </div>
      </div>
    );
  },
};

// 3. Full bleed: the scene fills the frame; white type over a dark fade.
const fullBleed: AdDesign = {
  id: "full-bleed",
  name: "Full bleed",
  summary: "The photo fills the frame, white type over a dark fade (scenes only)",
  suits: (s) => !!s.photo && !s.photo.cutout,
  render: (s, k, z) => {
    const v = kind(z);
    const pad = v === "wide" ? 48 : 72;
    const hs = fitSize(caseOf(k, s.headline), (v === "wide" ? z.width * 0.6 : z.width) - pad * 2, 3, v === "wide" ? 58 : v === "tall" ? 96 : 82, 30);
    return (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#111" }}>
        {s.photo && <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}><Photo p={s.photo} fit="cover" /></div>}
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.78) 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: pad, gap: 18 }}>
          <Text text={caseOf(k, s.headline)} size={hs} color="#ffffff" />
          {s.sub && <Text text={s.sub} size={Math.round(hs * 0.4)} color="rgba(255,255,255,0.86)" weight={400} family="Body" lh={1.35} ls={0} />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            {s.badge || s.cta ? <Pill text={s.badge || s.cta} bg={k.accent} color={k.onAccent} size={v === "wide" ? 24 : 30} /> : <div style={{ display: "flex" }} />}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.92)", padding: "10px 18px", borderRadius: 999 }}><Mark k={k} height={v === "wide" ? 28 : 36} color="#141414" /></div>
          </div>
        </div>
      </div>
    );
  },
};

// 4. Spotlight: the product glowing on the brand's dark ink.
const spotlight: AdDesign = {
  id: "spotlight",
  name: "Spotlight",
  summary: "Product lit on the brand's dark colour, headline above (cut-outs)",
  suits: (s) => !!s.photo?.cutout,
  render: (s, k, z) => {
    const v = kind(z);
    const pad = v === "wide" ? 44 : 68;
    const dark = onColor(k.ink) === "#ffffff" ? k.ink : "#141414";
    const hs = fitSize(caseOf(k, s.headline), (v === "wide" ? z.width * 0.5 : z.width) - pad * 2, v === "wide" ? 3 : 2, v === "wide" ? 54 : v === "tall" ? 88 : 72, 28);
    return (
      <div style={{ display: "flex", flexDirection: v === "wide" ? "row-reverse" : "column", width: "100%", height: "100%", background: dark, backgroundImage: `radial-gradient(circle at ${v === "wide" ? "25% 50%" : "50% 62%"}, ${k.accent}55 0%, ${dark} 62%)` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: pad, paddingBottom: v === "wide" ? pad : 0, justifyContent: "center", flex: v === "wide" ? "0 0 50%" : "0 0 auto" }}>
          <Mark k={k} height={v === "wide" ? 32 : 42} color="#ffffff" />
          <Text text={caseOf(k, s.headline)} size={hs} color="#ffffff" />
          {s.sub && v !== "square" && <Text text={s.sub} size={Math.round(hs * 0.42)} color="rgba(255,255,255,0.75)" weight={400} family="Body" lh={1.35} ls={0} />}
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative", padding: v === "wide" ? 36 : 56 }}>
          {s.photo && (
            <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", borderRadius: k.radius * 2, padding: 36 }}>
              <Photo p={s.photo} fit="contain" />
            </div>
          )}
          {s.badge && <div style={{ display: "flex", position: "absolute", right: v === "wide" ? 24 : 40, top: v === "wide" ? 24 : 40 }}><Pill text={s.badge} bg={k.accent} color={k.onAccent} size={v === "wide" ? 24 : 32} /></div>}
        </div>
      </div>
    );
  },
};

// 5. Price tag: an oversized price leads (needs a price).
const priceTag: AdDesign = {
  id: "price-tag",
  name: "Price tag",
  summary: "Oversized price, product beside it (only with a price)",
  suits: (s) => /\$\s?\d/.test(s.badge),
  render: (s, k, z) => {
    const v = kind(z);
    const pad = v === "wide" ? 44 : 68;
    const textW = (v === "wide" ? z.width * 0.5 : z.width) - pad * 2;
    const ps = fitSize(s.badge, textW, 1, v === "wide" ? 120 : v === "tall" ? 210 : 170, 60, 0.6);
    const hs = fitSize(caseOf(k, s.headline), textW, 3, v === "wide" ? 40 : v === "tall" ? 64 : 52, 24);
    return (
      <div style={{ display: "flex", flexDirection: v === "wide" ? "row" : "column", width: "100%", height: "100%", background: k.surface }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: pad, flex: v === "wide" ? "0 0 50%" : "0 0 auto" }}>
          <Mark k={k} height={v === "wide" ? 34 : 44} color={k.ink} />
          <Text text={s.badge} size={ps} color={k.accent} ls={-0.04} lh={1} />
          <Text text={caseOf(k, s.headline)} size={hs} color={k.ink} />
        </div>
        <div style={{ display: "flex", flex: 1, margin: v === "wide" ? 24 : 40, marginTop: v === "wide" ? 24 : 0, background: "#ffffff", borderRadius: k.radius * 2 }}>
          {s.photo && <Photo p={s.photo} fit={s.photo.cutout ? "contain" : "cover"} pad={s.photo.cutout ? 40 : 0} />}
        </div>
      </div>
    );
  },
};

// 6. Frame: minimal, a thin brand-colour border, the logo at the top, the product centred.
const frame: AdDesign = {
  id: "frame",
  name: "Frame",
  summary: "Minimal: brand-colour border, logo at top, product centred, headline below",
  suits: () => true,
  render: (s, k, z) => {
    const v = kind(z);
    const inset = v === "wide" ? 22 : 34;
    const hs = fitSize(caseOf(k, s.headline), (v === "wide" ? z.width * 0.46 : z.width) - inset * 2 - 80, 2, v === "wide" ? 46 : v === "tall" ? 76 : 60, 24);
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", background: k.bg, padding: inset }}>
        <div style={{ display: "flex", flexDirection: v === "wide" ? "row" : "column", width: "100%", height: "100%", border: `3px solid ${k.accent}`, borderRadius: k.radius, padding: v === "wide" ? 28 : 44, alignItems: "center", gap: v === "wide" ? 32 : 24 }}>
          {v !== "wide" && <Mark k={k} height={46} color={k.ink} />}
          <div style={{ display: "flex", flex: 1, width: v === "wide" ? "50%" : "100%", ...(v === "wide" ? { height: "100%" } : {}), minHeight: 0 }}>
            {s.photo && <Photo p={s.photo} fit={s.photo.cutout ? "contain" : "cover"} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: v === "wide" ? "flex-start" : "center", gap: 12, width: v === "wide" ? "46%" : "100%" }}>
            {v === "wide" && <Mark k={k} height={34} color={k.ink} />}
            <div style={{ display: "flex", textAlign: v === "wide" ? "left" : "center", justifyContent: v === "wide" ? "flex-start" : "center" }}>
              <Text text={caseOf(k, s.headline)} size={hs} color={k.ink} />
            </div>
            {s.badge && <div style={{ display: "flex", fontFamily: "Body", fontWeight: 700, fontSize: v === "wide" ? 26 : 34, color: k.accent }}>{s.badge}</div>}
          </div>
        </div>
      </div>
    );
  },
};

function onColor(hex: string): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#141414" : "#ffffff";
}

export const AD_DESIGNS: AdDesign[] = [showcase, split, fullBleed, spotlight, priceTag, frame];

/** How many designs a client's month rotates through, by tier. */
const PER_TIER: Record<string, number> = { fix: 2, build: 4, grow: 6 };

/**
 * The design for one item: the client's set (by tier, the same every month)
 * rotated across items for variety, skipping designs that don't suit the
 * photo or copy.
 */
export function designFor(clientId: string, tier: string, itemId: number, s: AdSlots): AdDesign {
  const seed = [...clientId].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const order = AD_DESIGNS.map((d, i) => ({ d, r: (seed >>> (i * 3)) % 97 })).sort((a, b) => a.r - b.r).map((x) => x.d);
  const set = order.slice(0, PER_TIER[tier] ?? 2);
  for (let i = 0; i < AD_DESIGNS.length; i++) {
    const d = set[(itemId + i) % set.length];
    if (d.suits(s)) return d;
  }
  return AD_DESIGNS.find((d) => d.suits(s)) ?? showcase;
}

export const designById = (id: string) => AD_DESIGNS.find((d) => d.id === id);
