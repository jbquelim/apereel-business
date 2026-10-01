import { imageSize } from "./image-size";

// Store platforms serve product photos at a small size by default, with the
// original behind a predictable address. These rules ask for the large one;
// a rule is only used once it's proven (loads, and is bigger) for that store.

type Rule = { name: string; test: RegExp; apply: (u: string) => string };

const RULES: Rule[] = [
  // BigCommerce: ...name.1624996464.386.513.jpg → .1280.1280.jpg
  { name: "bigcommerce", test: /bigcommerce\.com\/.+\.\d+\.\d+\.(jpe?g|png|webp)(\?|$)/i, apply: (u) => u.replace(/\.\d+\.\d+\.(jpe?g|png|webp)(\?|$)/i, ".1280.1280.$1$2") },
  // Shopify: name_400x400.jpg / ?width=400 → large original
  {
    name: "shopify",
    test: /(cdn\.shopify\.com|\/cdn\/shop\/)/i,
    apply: (u) => {
      const url = new URL(u.replace(/_(\d+x\d*|\d*x\d+)(?=\.(jpe?g|png|webp))/i, ""));
      url.searchParams.set("width", "1600");
      return url.toString();
    },
  },
  // WooCommerce / WordPress: name-300x300.jpg → name.jpg
  { name: "wordpress", test: /\/wp-content\/uploads\/.+-\d+x\d+\.(jpe?g|png|webp)/i, apply: (u) => u.replace(/-\d+x\d+(?=\.(jpe?g|png|webp))/i, "") },
];

/** The best proven rule for these photos (tested on a few), or null. */
export async function provenRule(samples: string[]): Promise<Rule | null> {
  for (const rule of RULES) {
    const matching = samples.filter((s) => rule.test.test(s)).slice(0, 3);
    if (matching.length === 0) continue;
    const results = await Promise.all(
      matching.map(async (s) => {
        const [small, big] = await Promise.all([imageSize(s), imageSize(rule.apply(s))]);
        return !!big && (!small || big.width > small.width);
      }),
    );
    if (results.every(Boolean)) return rule;
  }
  return null;
}

export async function upgradeImages<T extends { image: string | null }>(items: T[]): Promise<T[]> {
  const samples = items.map((i) => i.image).filter((u): u is string => !!u);
  const rule = await provenRule(samples).catch(() => null);
  if (!rule) return items;
  return items.map((i) => (i.image && rule.test.test(i.image) ? { ...i, image: rule.apply(i.image) } : i));
}
