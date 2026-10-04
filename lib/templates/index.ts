import type { RenderResult, RenderTarget } from "../site-render";
import * as crown from "./signature-crown";
import * as studio from "./custom-studio";
import * as ledger from "./template-ledger";
import * as apex from "./signature-apex";
import * as stride from "./custom-stride";
import * as fleet from "./template-fleet";
import * as maison from "./signature-maison";
import * as flow from "./custom-flow";
import * as lab from "./template-lab";
import * as regent from "./signature-regent";
import * as torque from "./custom-torque";
import * as gridT from "./template-grid";

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
  {
    id: "apex",
    name: "Apex",
    tier: "grow",
    reference: "lamborghini.com",
    summary: "Near-black, condensed uppercase type, angular cut corners, numbered product lines, a full-screen hero.",
    perPage: 24,
    render: apex.render,
  },
  {
    id: "stride",
    name: "Stride",
    tier: "build",
    reference: "nike.com",
    summary: "Loud condensed headlines, edge-to-edge photos on light grey, big category cards, a swipeable trending row.",
    perPage: 24,
    render: stride.render,
  },
  {
    id: "fleet",
    name: "Fleet",
    tier: "fix",
    reference: "toyota.com",
    summary: "Clean and practical: photo hero with a content card, a find-what-you-need panel, cards with price and two actions, a sticky quote bar on phones.",
    perPage: 24,
    render: fleet.render,
  },
  {
    id: "maison",
    name: "Maison",
    tier: "grow",
    reference: "cartier.com",
    summary: "Warm ivory, light wide type in small capitals, a two-tier centred header, arch-topped photo frames, hairline rules.",
    perPage: 24,
    render: maison.render,
  },
  {
    id: "flow",
    name: "Flow",
    tier: "build",
    reference: "lululemon.com",
    summary: "Clean white, a big image hero with two promo tiles, rounded cards, soft grey panels, a values strip.",
    perPage: 24,
    render: flow.render,
  },
  {
    id: "lab",
    name: "Lab",
    tier: "fix",
    reference: "dyson.com",
    summary: "Engineering-led: black top bar, light grey ground, white spec cards listing each product's key specs, a dark hero band.",
    perPage: 24,
    render: lab.render,
  },
  {
    id: "regent",
    name: "Regent",
    tier: "grow",
    reference: "rolls-roycemotorcars.com",
    summary: "Midnight and stone bands, sparse light uppercase type, a transparent header over a full-bleed hero, a one-at-a-time product slider.",
    perPage: 24,
    render: regent.render,
  },
  {
    id: "torque",
    name: "Torque",
    tier: "build",
    reference: "porsche.com",
    summary: "Precise light grey and white, a left-aligned hero, a range picker: tabs that switch the product grid between main categories.",
    perPage: 24,
    render: torque.render,
  },
  {
    id: "grid",
    name: "Grid",
    tier: "fix",
    reference: "samsung.com",
    summary: "Bright retail: a sliding hero, round category icons, a bento block of promo tiles, product cards with two clear actions.",
    perPage: 24,
    render: gridT.render,
  },
];

export const templateById = (id: string | null | undefined) => TEMPLATES.find((t) => t.id === id) ?? null;
