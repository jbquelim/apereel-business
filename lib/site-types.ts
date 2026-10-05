// A customer website is one JSON document (sites.doc), rendered to static-
// fast HTML by lib/site-render. The AI builds and edits the document; the
// renderer guarantees the technical basics every analysis checks for.

export type Palette = { bg: string; surface: string; text: string; muted: string; accent: string; accentText: string; line: string };

export type SiteTokens = {
  palette: Palette;
  fontHeading: string;
  fontBody: string;
  /** Corner radius in px. */
  radius: number;
  heroStyle: "split" | "full" | "centered";
  motion: "none" | "subtle" | "cinematic";
  headingCase: "normal" | "upper";
};

export type Section =
  | { type: "hero"; eyebrow?: string; heading: string; subheading?: string; ctaLabel?: string; ctaHref?: string; image?: string | null; video?: string | null }
  | { type: "features"; heading: string; items: { title: string; body: string }[] }
  | { type: "productGrid"; heading: string; products: string[] | "featured"; limit?: number }
  | { type: "categoryGrid"; heading: string; categories: string[] }
  | { type: "story"; heading: string; body: string; image?: string | null }
  | { type: "faq"; heading: string; items: { q: string; a: string }[] }
  | { type: "cta"; heading: string; body?: string; ctaLabel: string; ctaHref: string }
  | { type: "contact"; heading: string; body?: string; quoteForm?: boolean }
  | { type: "stats"; items: { value: string; label: string }[] }
  /** Facts that build trust (contact, shipping and returns pages, trade accounts), from the business's own site. */
  | { type: "trust"; items: { title: string; body: string; href?: string }[] }
  | { type: "steps"; heading: string; items: { title: string; body: string }[] }
  /** Links into the shop (categories, filtered listings, other pages), used by guides. */
  | { type: "links"; heading: string; items: { label: string; href: string; note?: string }[] };

export type SectionType = Section["type"];

export type SitePage = { slug: string; navLabel?: string; title: string; metaTitle: string; metaDescription: string; sections: Section[]; /** Written from the analysis (guides, trade page); replaced when rewritten. */ source?: "analysis" };

export type SiteProduct = {
  slug: string;
  title: string;
  price: number | null;
  currency: string | null;
  image: string | null;
  description: string;
  category: string | null;
  /** The product's page on the business's current site. */
  sourceUrl: string;
  featured?: boolean;
  /** Specification rows read from the product's own name (Custom and Signature). */
  specs?: { label: string; value: string }[];
};

export type SiteDoc = {
  brand: { name: string; tagline: string; email?: string | null; phone?: string | null; address?: string | null; logo?: string | null };
  /** The hand-designed template this site uses (lib/templates); none = the section renderer. */
  design?: string;
  /** Products in the business's whole catalog (the site may show fewer while it's imported). */
  catalogTotal?: number;
  tokens: SiteTokens;
  pages: SitePage[];
  products: SiteProduct[];
  categories: { slug: string; name: string; description: string; parent?: string | null; count?: number; image?: string | null; rank?: number }[];
  /** Main categories (from the analysis) that the store's own top-level categories sit under; kept across re-imports. */
  categoryGroups?: { slug: string; name: string; description: string; members: string[] }[];
  /** False when no template matched the business's industry at build (the design was picked by usage only). */
  designMatched?: boolean;
  /** Shop filters this catalog supports (lib/facets), read from product names. */
  facets?: { key: string; label: string }[];
  /** Products in site_products (the full catalog); the document keeps only home-page picks. */
  catalogSize?: number;
  /**
   * How a buyer acts on a product: pay here with Stripe (the business's own
   * account), buy on their current store, or send an enquiry.
   */
  productAction: "checkout" | "link" | "enquire";
  /** Old addresses (from our crawl of their current site) → new ones. */
  redirects: Record<string, string>;
  footerNote?: string;
  /** Short reasons to buy from this business, shown on every product page. */
  productPromise?: string[];
};

export type SiteTemplate = {
  id: string;
  name: string;
  industries: string[];
  tier: "fix" | "build" | "grow";
  style: string;
  tokens: SiteTokens;
  /** Sections per page, in order; the AI writes their content. */
  pages: Record<"home" | "about" | "contact", SectionType[]>;
};
