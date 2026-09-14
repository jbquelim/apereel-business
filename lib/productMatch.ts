// Product-level price comparison between a client and competitors, restricted
// to live product-feed data (exact titles and prices). Matching is
// deterministic and conservative: a pair is only reported when the products
// share a type and enough title vocabulary that a human would call them
// comparable. Both titles ship verbatim so every pairing is verifiable on
// either site — a false equivalence is worse than no comparison.

export type RawProduct = {
  title: string;
  productType: string | null;
  priceCents: number | null;
  url: string | null;
};

export type ProductMatch = {
  clientTitle: string;
  clientPriceCents: number;
  competitorTitle: string;
  competitorPriceCents: number;
  competitorName: string;
  competitorDomain: string;
  confidence: number;
};

// Materials and marketing words describe the variant, not the product — two
// stores' "Beaded Bracelet" should pair even when one is plated and one is
// solid gold. The titles ship verbatim, so the material difference (and why
// the prices differ) stays visible to the reader.
const STOPWORDS = new Set([
  "the", "and", "with", "for", "of", "in", "a", "an", "on", "to", "by",
  "set", "new", "our", "your", "from",
  "18ct", "14k", "18k", "9ct", "gold", "silver", "plated", "vermeil",
  "solid", "sterling", "recycled", "mini", "midi", "large", "small",
]);

// "Hoops" must match "Hoop", "Huggie Earrings" must match "Huggies" —
// singularize every token before comparing (tuned on real store feeds).
function singular(t: string): string {
  return t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t;
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
      .map(singular),
  );
}

function normType(t: string | null): string {
  return (t ?? "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(singular)
    .join(" ");
}

// Same family when equal, one is a suffix of the other ("hoop earring" /
// "earring"), or they share a word. null = at least one side has no type.
function typeFamily(a: string, b: string): boolean | null {
  if (!a || !b) return null;
  if (a === b || a.endsWith(b) || b.endsWith(a)) return true;
  const bWords = b.split(" ");
  return a.split(" ").some((w) => bWords.includes(w));
}

function similarity(a: Set<string>, b: Set<string>): { jaccard: number; shared: number } {
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  const union = a.size + b.size - shared;
  return { jaccard: union === 0 ? 0 : shared / union, shared };
}

const MIN_JACCARD = 0.5;
const MIN_SHARED_TOKENS = 2;
const MAX_MATCHES = 6;

export function matchProducts(
  clientProducts: RawProduct[],
  competitors: { name: string; domain: string; products: RawProduct[] }[],
): ProductMatch[] {
  const matches: ProductMatch[] = [];

  for (const client of clientProducts) {
    if (client.priceCents == null) continue;
    const clientTokens = tokens(client.title);
    const clientType = normType(client.productType);

    for (const comp of competitors) {
      let best: ProductMatch | null = null;
      for (const p of comp.products) {
        if (p.priceCents == null) continue;
        const family = typeFamily(clientType, normType(p.productType));
        if (family === false) continue;
        const { jaccard, shared } = similarity(clientTokens, tokens(p.title));
        // No declared type on one side → title overlap must clear a higher bar.
        const minJaccard = family === true ? MIN_JACCARD : MIN_JACCARD + 0.15;
        if (jaccard < minJaccard || shared < MIN_SHARED_TOKENS) continue;
        if (!best || jaccard > best.confidence) {
          best = {
            clientTitle: client.title,
            clientPriceCents: client.priceCents,
            competitorTitle: p.title,
            competitorPriceCents: p.priceCents,
            competitorName: comp.name,
            competitorDomain: comp.domain,
            confidence: jaccard,
          };
        }
      }
      if (best) matches.push(best);
    }
  }

  // Strongest pairings first; drop variant-level duplicates (same client
  // product in two finishes, or two client items pairing to one listing).
  const seenClient = new Set<string>();
  const seenCompetitor = new Set<string>();
  return matches
    .sort((a, b) => b.confidence - a.confidence)
    .filter((m) => {
      const clientBase = m.clientTitle.split("|")[0].trim();
      const compKey = `${m.competitorDomain}:${m.competitorTitle}`;
      if (seenClient.has(clientBase) || seenCompetitor.has(compKey)) return false;
      seenClient.add(clientBase);
      seenCompetitor.add(compKey);
      return true;
    })
    .slice(0, MAX_MATCHES);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
