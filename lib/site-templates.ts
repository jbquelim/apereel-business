import { neon } from "@neondatabase/serverless";
import type { Palette, SiteTemplate, SiteTokens } from "./site-types";

// The template library: a design per industry family and tier. These are
// Apereel's own designs (palette, type, layout and motion per industry), not
// copies of anyone's site. Seeded into site_templates, where the library
// grows; the builder picks the best match for each business.

type Family = { id: string; name: string; match: RegExp; palette: Palette; fontHeading: string; fontBody: string; headingCase?: "upper" };

const FAMILIES: Family[] = [
  { id: "jewelry-fashion", name: "Jewelry & Fashion", match: /jewel|fashion|apparel|cloth|accessor|watch|bridal|ring|earring|necklace/i,
    palette: { bg: "#faf7f2", surface: "#ffffff", text: "#1c1917", muted: "#78716c", accent: "#8a6d3b", accentText: "#ffffff", line: "#e7e0d6" }, fontHeading: "Cormorant Garamond", fontBody: "Inter" },
  { id: "home-lighting", name: "Home, Lighting & Decor", match: /light|lamp|home|decor|furnit|interior|kitchen|bath|garden/i,
    palette: { bg: "#f7f5f2", surface: "#ffffff", text: "#1f2937", muted: "#6b7280", accent: "#b45309", accentText: "#ffffff", line: "#e5e1da" }, fontHeading: "DM Serif Display", fontBody: "DM Sans" },
  { id: "industrial-b2b", name: "Industrial & B2B Supply", match: /industr|manufactur|b2b|wholesale|distribut|oem|component|part|hardware|electrical|equipment|supply/i,
    palette: { bg: "#f8fafc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", accent: "#1d4ed8", accentText: "#ffffff", line: "#e2e8f0" }, fontHeading: "Inter Tight", fontBody: "Inter", headingCase: "upper" },
  { id: "beauty-wellness", name: "Beauty & Wellness", match: /beauty|skin|cosmetic|wellness|spa|salon|hair|fragrance|perfume/i,
    palette: { bg: "#fdf8f6", surface: "#ffffff", text: "#2a1f24", muted: "#8b7780", accent: "#be185d", accentText: "#ffffff", line: "#f1e4e0" }, fontHeading: "Fraunces", fontBody: "Manrope" },
  { id: "food-beverage", name: "Food & Beverage", match: /food|beverage|coffee|tea|wine|beer|bakery|restaurant|snack|grocer|drink/i,
    palette: { bg: "#fffbeb", surface: "#ffffff", text: "#1c1917", muted: "#78716c", accent: "#c2410c", accentText: "#ffffff", line: "#f3e8d2" }, fontHeading: "Playfair Display", fontBody: "Work Sans" },
  { id: "electronics-tech", name: "Electronics & Tech", match: /electronic|tech|software|gadget|computer|audio|camera|phone|gaming/i,
    palette: { bg: "#0b0f19", surface: "#131a2a", text: "#e5e7eb", muted: "#94a3b8", accent: "#22d3ee", accentText: "#0b0f19", line: "#1f2a3d" }, fontHeading: "Space Grotesk", fontBody: "Inter" },
  { id: "sports-outdoor", name: "Sports, Outdoor & Fitness", match: /sport|outdoor|fitness|gym|bike|cycl|camp|hik|golf|athlet/i,
    palette: { bg: "#f5f5f4", surface: "#ffffff", text: "#0c0a09", muted: "#57534e", accent: "#16a34a", accentText: "#ffffff", line: "#e7e5e4" }, fontHeading: "Archivo", fontBody: "Archivo", headingCase: "upper" },
  { id: "professional-services", name: "Professional Services", match: /service|consult|law|legal|account|agency|clinic|dental|medical|real estate|insurance/i,
    palette: { bg: "#ffffff", surface: "#f8fafc", text: "#0f172a", muted: "#64748b", accent: "#0f766e", accentText: "#ffffff", line: "#e2e8f0" }, fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans" },
  { id: "pets-family", name: "Pets, Kids & Family", match: /pet|dog|cat|kid|baby|toy|child|family/i,
    palette: { bg: "#fffdf7", surface: "#ffffff", text: "#1f2937", muted: "#6b7280", accent: "#d97706", accentText: "#ffffff", line: "#f1ead8" }, fontHeading: "Nunito", fontBody: "Nunito" },
  { id: "general-retail", name: "General Retail", match: /./,
    palette: { bg: "#ffffff", surface: "#f9fafb", text: "#111827", muted: "#6b7280", accent: "#111827", accentText: "#ffffff", line: "#e5e7eb" }, fontHeading: "Manrope", fontBody: "Manrope" },
];

const TIERS: { tier: SiteTemplate["tier"]; style: string; heroStyle: SiteTokens["heroStyle"]; motion: SiteTokens["motion"]; radius: number; pages: SiteTemplate["pages"] }[] = [
  {
    tier: "fix",
    style: "Clean",
    heroStyle: "split",
    motion: "none",
    radius: 10,
    pages: {
      home: ["hero", "features", "productGrid", "story", "cta"],
      about: ["story", "features", "faq"],
      contact: ["contact"],
    },
  },
  {
    tier: "build",
    style: "Editorial",
    heroStyle: "full",
    motion: "subtle",
    radius: 16,
    pages: {
      home: ["hero", "stats", "categoryGrid", "productGrid", "features", "story", "faq", "cta"],
      about: ["story", "stats", "features", "faq"],
      contact: ["contact"],
    },
  },
  {
    tier: "grow",
    style: "Cinematic",
    heroStyle: "full",
    motion: "cinematic",
    radius: 20,
    pages: {
      home: ["hero", "stats", "features", "categoryGrid", "productGrid", "story", "faq", "cta"],
      about: ["story", "stats", "features", "faq", "cta"],
      contact: ["contact"],
    },
  },
];

/** The built-in library: every industry family in every tier's style. */
export const BUILT_IN_TEMPLATES: SiteTemplate[] = FAMILIES.flatMap((f) =>
  TIERS.map((t) => ({
    id: `${f.id}-${t.tier}`,
    name: `${f.name} · ${t.style}`,
    industries: [f.id],
    tier: t.tier,
    style: t.style,
    tokens: {
      palette: f.palette,
      fontHeading: f.fontHeading,
      fontBody: f.fontBody,
      radius: t.radius,
      heroStyle: t.heroStyle,
      motion: t.motion,
      headingCase: f.headingCase ?? "normal",
    },
    pages: t.pages,
  })),
);

export const familyFor = (text: string) => FAMILIES.find((f) => f.id !== "general-retail" && f.match.test(text)) ?? FAMILIES[FAMILIES.length - 1];
export const FAMILY_IDS = FAMILIES.map((f) => ({ id: f.id, name: f.name }));

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

type Row = { id: string; name: string; industries: string[]; tier: SiteTemplate["tier"]; style: string | null; sections: SiteTemplate["pages"]; tokens: SiteTokens };
const fromRow = (r: Row): SiteTemplate => ({ id: r.id, name: r.name, industries: r.industries, tier: r.tier, style: r.style ?? "", tokens: r.tokens, pages: r.sections });

/** Copies the built-in designs into the library (existing rows are kept as edited). */
export async function seedTemplates(): Promise<number> {
  for (const t of BUILT_IN_TEMPLATES) {
    await sql()`
      INSERT INTO site_templates (id, name, industries, tier, style, sections, tokens)
      VALUES (${t.id}, ${t.name}, ${t.industries}, ${t.tier}, ${t.style}, ${JSON.stringify(t.pages)}::jsonb, ${JSON.stringify(t.tokens)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return BUILT_IN_TEMPLATES.length;
}

export async function listTemplates(): Promise<SiteTemplate[]> {
  const rows = (await sql()`SELECT id, name, industries, tier, style, sections, tokens FROM site_templates ORDER BY id`) as Row[];
  return rows.length ? rows.map(fromRow) : BUILT_IN_TEMPLATES;
}

/** The best template for a business: its industry family, in its tier's style. */
export async function pickTemplate(industryText: string, tier: SiteTemplate["tier"]): Promise<SiteTemplate> {
  const family = familyFor(industryText);
  const all = await listTemplates();
  return (
    all.find((t) => t.tier === tier && t.industries.includes(family.id)) ??
    all.find((t) => t.tier === tier) ??
    BUILT_IN_TEMPLATES.find((t) => t.id === `${family.id}-${tier}`)!
  );
}
