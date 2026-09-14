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

const STOPWORDS = new Set([
  "the", "and", "with", "for", "of", "in", "a", "an", "on", "to", "by",
  "set", "new", "our", "your", "from",
]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t)),
  );
}

function normType(t: string | null): string {
  return (t ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function similarity(a: Set<string>, b: Set<string>): { jaccard: number; shared: number } {
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  const union = a.size + b.size - shared;
  return { jaccard: union === 0 ? 0 : shared / union, shared };
}

const MIN_JACCARD = 0.45;
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
        // Types must agree when both sides declare one; when either side
        // omits it, title overlap alone must clear a higher bar.
        const pType = normType(p.productType);
        const typedMatch = clientType !== "" && pType !== "" && clientType === pType;
        const { jaccard, shared } = similarity(clientTokens, tokens(p.title));
        const minJaccard = typedMatch ? MIN_JACCARD : MIN_JACCARD + 0.15;
        if (clientType !== "" && pType !== "" && !typedMatch) continue;
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

  // Strongest pairings first; one appearance per client product per
  // competitor is already guaranteed above.
  return matches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, MAX_MATCHES);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
