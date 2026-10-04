import { neon } from "@neondatabase/serverless";
import type { SiteDoc } from "./site-types";

// Shop filters from the specs buyers check, read from product names with
// fixed rules (no AI): thread size, socket base, neck size, finish, cord and
// wattage for lighting and hardware; metal, gauge and size for jewelry. A
// store gets the filters its catalog actually uses (enough products, more
// than one value). Saved per product (site_products.facets) and as the list
// of filters on the document (doc.facets).

type Rule = { key: string; label: string; read: (title: string) => string | null };

const FINISHES = [
  "Polished Brass", "Antique Brass", "Unfinished Brass", "Satin Brass", "Flemished Brass", "Polished Nickel", "Satin Nickel", "Brushed Nickel",
  "Oil Rubbed Bronze", "Antique Bronze", "Polished Copper", "Antique Copper", "Chrome", "Polished Gilt", "Matte Black", "Black", "White", "Gold",
];
const finishRe = new RegExp(`\\b(${FINISHES.map((f) => f.replace(/ /g, "\\s+")).join("|")})\\b`, "i");
const canon = (list: string[], v: string) => list.find((x) => x.toLowerCase() === v.toLowerCase().replace(/\s+/g, " ")) ?? v;

const RULES: Rule[] = [
  {
    key: "thread",
    label: "Thread size",
    read: (t) => {
      const m = t.match(/\b(\d\/\d{1,2})(?:-\d{2})?\s*(?:ips|ip)\b/i);
      return m ? `${m[1]} IPS` : null;
    },
  },
  {
    key: "base",
    label: "Socket base",
    read: (t) => {
      const e = t.match(/\bE-?(10|11|12|14|17|26|27|39|40)\b/i);
      if (e) return `E${e[1]}`;
      const g = t.match(/\b(G4|G9|GU10|GU24|G4\.5|GY6\.35|MR16)\b/i);
      if (g) return g[1].toUpperCase();
      if (/\bcandelabra\b/i.test(t)) return "E12";
      if (/\bmogul\b/i.test(t)) return "E39";
      if (/\bmedium base\b/i.test(t)) return "E26";
      return null;
    },
  },
  {
    key: "neck",
    label: "Neck / fitter",
    read: (t) => {
      const m = t.match(/\b(\d+(?:-\d\/\d)?|\d\/\d)\s*(?:in\.?|")\s*(?:neck|fitter)\b/i) ?? t.match(/\b(?:neck|fitter)\s*(?:of\s*)?(\d+(?:-\d\/\d)?)\s*(?:in\.?|")/i);
      return m ? `${m[1]}in` : null;
    },
  },
  {
    key: "finish",
    label: "Finish",
    read: (t) => {
      const m = t.replace(/brushed\s*\/\s*satin/gi, "Satin").match(finishRe);
      return m ? canon(FINISHES, m[1]) : null;
    },
  },
  {
    key: "cord",
    label: "Cord",
    read: (t) => {
      const m = t.match(/\b(1[68]|20)\/([123])\b(?:\s*(SPT-?[12]|SVT|SJT))?/i);
      return m ? `${m[1]}/${m[2]}${m[3] ? ` ${m[3].toUpperCase().replace(/^SPT(\d)/, "SPT-$1")}` : ""}` : null;
    },
  },
  {
    key: "watts",
    label: "Wattage",
    read: (t) => {
      if (!/\b(bulb|lamp|led)\b/i.test(t)) return null;
      const m = t.match(/\b(\d+(?:\.\d)?)\s*(?:W|Watt)s?\b/);
      return m ? `${Number(m[1])}W` : null;
    },
  },
  {
    key: "metal",
    label: "Metal",
    read: (t) => {
      const m = t.match(/\b(14K|18K|10K)\s*(yellow|white|rose)?\s*gold\b|\b(titanium|sterling silver|platinum|surgical steel|niobium)\b/i);
      if (!m) return null;
      return m[3] ? m[3].replace(/\b\w/g, (c) => c.toUpperCase()) : `${m[1].toUpperCase()} ${m[2] ? `${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()} ` : ""}Gold`;
    },
  },
  {
    key: "gauge",
    label: "Gauge",
    read: (t) => {
      const m = t.match(/\b(1[0-8]|20)\s*G(?:auge)?\b/i);
      return m ? `${m[1]}G` : null;
    },
  },
  { key: "size", label: "Size", read: (t) => (/\b(earring|stud|hoop|clicker|ring|chain|necklace)\b/i.test(t) ? t.match(/\b(\d{1,2}(?:\.\d)?)\s*mm\b/i)?.[1]?.concat("mm") ?? null : null) },
];

/** The specs one product name states. */
export function readFacets(title: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of RULES) {
    const v = r.read(title);
    if (v) out[r.key] = v;
  }
  return out;
}

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

/**
 * Reads every product's specs and keeps the filters this catalog uses: on at
 * least 3% of products (min 12) with 2+ values. Saves both; returns the filters.
 */
export async function buildFacets(site: { id: string; doc: SiteDoc }): Promise<NonNullable<SiteDoc["facets"]>> {
  const rows = (await sql()`SELECT slug, title FROM site_products WHERE site_id = ${site.id}`) as { slug: string; title: string }[];
  const read = rows.map((r) => ({ slug: r.slug, f: readFacets(r.title) }));
  const keep = RULES.filter((r) => {
    const vals = read.map((x) => x.f[r.key]).filter(Boolean);
    return vals.length >= Math.max(12, rows.length * 0.03) && new Set(vals).size >= 2;
  });
  const keys = new Set(keep.map((r) => r.key));
  const updates = read.map((x) => ({ slug: x.slug, facets: Object.fromEntries(Object.entries(x.f).filter(([k]) => keys.has(k))) }));
  for (let i = 0; i < updates.length; i += 1000) {
    await sql()`
      UPDATE site_products p SET facets = u.facets
      FROM jsonb_to_recordset(${JSON.stringify(updates.slice(i, i + 1000))}::jsonb) AS u(slug text, facets jsonb)
      WHERE p.site_id = ${site.id} AND p.slug = u.slug
    `;
  }
  const facets = keep.map((r) => ({ key: r.key, label: r.label }));
  await sql()`UPDATE sites SET doc = jsonb_set(doc, '{facets}', ${JSON.stringify(facets)}::jsonb), updated_at = now() WHERE id = ${site.id}`;
  return facets;
}
