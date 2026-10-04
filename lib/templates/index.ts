import type { RenderResult, RenderTarget } from "../site-render";
import * as crown from "./signature-crown";
import * as studio from "./custom-studio";
import * as ledger from "./template-ledger";

// The hand-designed template library. Each template is a complete design
// (home, collection, product, about, contact); a site's data drops into its
// slots. A site uses a template when its document names one (doc.design).

export type TemplateMeta = {
  id: string;
  name: string;
  tier: "fix" | "build" | "grow";
  /** The site whose design language it's built in (as reference, not copied). */
  reference: string;
  summary: string;
  /** Products per listing page. */
  perPage: number;
  render: (t: RenderTarget, path: string[], query: URLSearchParams) => RenderResult | null;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "crown",
    name: "Crown",
    tier: "grow",
    reference: "rolex.com",
    summary: "Products on a soft spotlit stage, very large bold type, a dark band of tall collection cards, tiled catalog.",
    perPage: 24,
    render: crown.render,
  },
  {
    id: "studio",
    name: "Studio",
    tier: "build",
    reference: "breville.com",
    summary: "Warm off-white, products on soft tinted panels, a split hero, a category rail, a shop with a category sidebar.",
    perPage: 24,
    render: studio.render,
  },
  {
    id: "ledger",
    name: "Ledger",
    tier: "fix",
    reference: "henckels.com",
    summary: "Retail catalogue: utility bar, wide header search, category bar, banner hero, round category tiles, dense product grid, numbered pages.",
    perPage: 24,
    render: ledger.render,
  },
];

export const templateById = (id: string | null | undefined) => TEMPLATES.find((t) => t.id === id) ?? null;
