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
import * as atelier from "./signature-atelier";
import * as heritage from "./custom-heritage";
import * as arena from "./template-arena";
import * as chrono from "./signature-chrono";
import * as calm from "./custom-calm";
import * as depot from "./template-depot";
import * as officina from "./signature-officina";
import * as sleek from "./custom-sleek";
import * as outpost from "./template-outpost";
import * as showroom from "./signature-showroom";
import * as edge from "./custom-edge";
import * as flyer from "./template-flyer";

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
  {
    id: "atelier",
    name: "Atelier",
    tier: "grow",
    reference: "louisvuitton.com",
    summary: "Stark white and black, tiny uppercase type, a slide-out menu, a full-bleed two-column editorial mosaic.",
    perPage: 24,
    render: atelier.render,
  },
  {
    id: "heritage",
    name: "Heritage",
    tier: "build",
    reference: "coach.com",
    summary: "Warm cream and tan, chunky display type, a three-photo collage hero, pill category tabs, numbered craft notes.",
    perPage: 24,
    render: heritage.render,
  },
  {
    id: "arena",
    name: "Arena",
    tier: "fix",
    reference: "footlocker.com",
    summary: "High-energy retail: italic condensed headlines, a promo bar, a slanted hero, a swipeable new-in row, bold category blocks.",
    perPage: 24,
    render: arena.render,
  },
  {
    id: "chrono",
    name: "Chrono",
    tier: "grow",
    reference: "tagheuer.com",
    summary: "Deep charcoal and precise type, a ring of tick marks around the hero product, numbered collections in a racing strip.",
    perPage: 24,
    render: chrono.render,
  },
  {
    id: "calm",
    name: "Calm",
    tier: "build",
    reference: "aloyoga.com",
    summary: "Airy warm neutrals and big soft corners, a quiet hero with a floating caption, shop-the-edit tiles, three-column grids.",
    perPage: 24,
    render: calm.render,
  },
  {
    id: "depot",
    name: "Depot",
    tier: "fix",
    reference: "walmart.com",
    summary: "Everyday retail: brand-colour header with a big search, a departments grid, deal tiles, a dense five-column grid, a department sidebar.",
    perPage: 30,
    render: depot.render,
  },
  {
    id: "officina",
    name: "Officina",
    tier: "grow",
    reference: "faema.com",
    summary: "Warm cream and espresso, polished-metal gradients, the hero product on a lit round pedestal, the story as a timeline.",
    perPage: 24,
    render: officina.render,
  },
  {
    id: "sleek",
    name: "Sleek",
    tier: "build",
    reference: "lexus.com",
    summary: "Black header over a dark hero with a light sweep, a side-scrolling line-up with from-prices, a compare table of featured products.",
    perPage: 24,
    render: sleek.render,
  },
  {
    id: "outpost",
    name: "Outpost",
    tier: "fix",
    reference: "basspro.com",
    summary: "Outdoor outfitter: forest green and canvas, sturdy condensed headings, department tiles, an expert-advice strip linking the site's guides.",
    perPage: 24,
    render: outpost.render,
  },
  {
    id: "showroom",
    name: "Showroom",
    tier: "grow",
    reference: "subzero-wolf.com",
    summary: "Crisp white and brushed steel, products on steel backdrops, an inspiration gallery, a talk-to-us block leading to the enquiry form.",
    perPage: 24,
    render: showroom.render,
  },
  {
    id: "edge",
    name: "Edge",
    tier: "build",
    reference: "acura.com",
    summary: "Angular cut panels and italic uppercase type, a diagonal split hero, a choose-by quick bar, a stats band.",
    perPage: 24,
    render: edge.render,
  },
  {
    id: "flyer",
    name: "Flyer",
    tier: "fix",
    reference: "sail.ca",
    summary: "Weekly retail flyer: a banner grid beside a department list, product cards with round price stickers, a this-week band.",
    perPage: 24,
    render: flyer.render,
  },
];

export const templateById = (id: string | null | undefined) => TEMPLATES.find((t) => t.id === id) ?? null;
