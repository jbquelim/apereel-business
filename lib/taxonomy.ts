// The pinned two-level taxonomy. Classification MUST choose from this list —
// free-text labels drift ("Jewelry" / "Jewelry & Accessories" / "Retail")
// and drifted labels make benchmark queries meaningless. Extend deliberately;
// never let the model invent a label.

export const TAXONOMY: Record<string, readonly string[]> = {
  "Jewelry & Watches": [
    "Fine Jewelry",
    "Demi-Fine Jewelry",
    "Fashion Jewelry",
    "Diamonds & Engagement",
    "Watches",
    "Piercing Jewelry",
  ],
  "Fashion & Apparel": [
    "Womenswear",
    "Menswear",
    "Kids & Baby Apparel",
    "Athletic & Activewear",
    "Underwear & Basics",
    "Suiting & Formalwear",
  ],
  Footwear: ["Casual & Sneakers", "Designer Footwear", "Athletic Footwear", "Comfort Footwear"],
  "Bags & Accessories": ["Handbags", "Designer Accessories", "Eyewear", "Travel Gear"],
  "Beauty & Personal Care": [
    "Skincare",
    "Cosmetics",
    "Haircare",
    "Fragrance",
    "Wellness & Supplements",
  ],
  "Home & Furniture": ["Furniture", "Home Decor", "Bedding & Bath", "Kitchen & Dining"],
  "Sports & Outdoors": ["Outdoor Gear", "Sporting Goods", "Fitness Equipment", "Cycling"],
  Pets: ["Pet Food & Supplies", "Pet Accessories"],
  "Kids & Baby": ["Baby Gear", "Toys & Games"],
  "Food & Beverage": ["Specialty Food", "Coffee & Tea", "Alcohol"],
  "Health & Medical": ["Medical Equipment & Supplies", "Mobility & Accessibility", "Pharmacy & Health Retail"],
  "Electronics & Appliances": ["Consumer Electronics", "Appliances", "Audio & Photo"],
  "Packaging & Print": ["Custom Packaging", "Commercial Printing", "Labels & Stickers"],
  "Industrial & Manufacturing": [
    "On-Demand Manufacturing",
    "Industrial Equipment",
    "Components & Parts",
    "Food Service Equipment",
  ],
  "Business Services": [
    "Marketing & Creative Services",
    "Software & SaaS",
    "Logistics & Fulfillment",
  ],
  Automotive: ["Parts & Accessories", "Tires & Wheels"],
  "Garden & Hardware": ["Garden & Landscaping", "Tools & Hardware"],
  "Books & Media": ["Books", "Hobby & Craft"],
  "General Retail": ["Department & Variety", "Marketplace"],
  Other: ["Other"],
} as const;

export const INDUSTRIES = Object.keys(TAXONOMY);

// Compact single-string form for prompts.
export function taxonomyPromptBlock(): string {
  return INDUSTRIES.map((ind) => `${ind}: ${TAXONOMY[ind].join(" | ")}`).join("\n");
}

// Snap a model-returned pair onto the taxonomy. Exact match first, then
// case-insensitive, then Other — never trust free text into the dataset.
export function normalizeClassification(
  industry: unknown,
  subIndustry: unknown,
): { industry: string; subIndustry: string } {
  const ind = typeof industry === "string" ? industry.trim() : "";
  const sub = typeof subIndustry === "string" ? subIndustry.trim() : "";

  const matchedInd =
    INDUSTRIES.find((i) => i === ind) ??
    INDUSTRIES.find((i) => i.toLowerCase() === ind.toLowerCase()) ??
    "Other";
  const subs = TAXONOMY[matchedInd];
  const matchedSub =
    subs.find((s) => s === sub) ??
    subs.find((s) => s.toLowerCase() === sub.toLowerCase()) ??
    subs[0];
  return { industry: matchedInd, subIndustry: matchedSub };
}

// Marketplaces, mass-market giants, and non-business domains poison peer
// benchmarks — a boutique jeweler's "peer group" must never contain Amazon.
const BLOCKED_DOMAINS = new Set([
  "amazon.com", "amazon.ca", "amazon.co.uk", "ebay.com", "ebay.ca", "etsy.com",
  "walmart.com", "walmart.ca", "target.com", "costco.com", "costco.ca",
  "aliexpress.com", "alibaba.com", "temu.com", "shein.com", "wish.com",
  "wayfair.com", "wayfair.ca", "overstock.com",
  "hm.com", "zara.com", "uniqlo.com", "asos.com", "shopify.com",
  "nordstrom.com", "macys.com", "saksfifthavenue.com", "bloomingdales.com",
  "facebook.com", "instagram.com", "youtube.com", "tiktok.com", "pinterest.com",
  "wikipedia.org", "reddit.com", "google.com", "apple.com",
]);

export function isBlockedDomain(domain: string): boolean {
  const d = domain.replace(/^www\./, "").toLowerCase();
  return BLOCKED_DOMAINS.has(d);
}
