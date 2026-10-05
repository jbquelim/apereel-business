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
import * as galleryT from "./signature-gallery";
import * as legacy from "./custom-legacy";
import * as field from "./template-field";
import * as campaign from "./signature-campaign";
import * as drive from "./custom-drive";
import * as pop from "./template-pop";

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
  /** Kinds of business it suits (words matched against the business's industry). */
  fits?: string[];
  /** Built for a big catalog (strong shop, filters, lists) or a small, image-led one. */
  catalog?: "large" | "small";
  render: (t: RenderTarget, path: string[], query: URLSearchParams) => RenderResult | null;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "crown",
    fits: ["watch", "jewelry", "jewellery", "luxury", "accessories", "timepiece"],
    name: "Crown",
    tier: "grow",
    reference: "rolex.com",
    summary: "Products on a soft spotlit stage, very large bold type, a dark band of tall collection cards, tiled catalog.",
    perPage: 24,
    render: crown.render,
  },
  {
    id: "studio",
    fits: ["kitchen", "appliance", "home", "cookware", "coffee", "housewares"],
    name: "Studio",
    tier: "build",
    reference: "breville.com",
    summary: "Warm off-white, products on soft tinted panels, a split hero, a category rail, a shop with a category sidebar.",
    perPage: 24,
    render: studio.render,
  },
  {
    id: "ledger",
    fits: ["kitchen", "cookware", "cutlery", "hardware", "tools", "parts", "supplies"],
    catalog: "large",
    name: "Ledger",
    tier: "fix",
    reference: "henckels.com",
    summary: "Retail catalogue: utility bar, wide header search, category bar, banner hero, round category tiles, dense product grid, numbered pages.",
    perPage: 24,
    render: ledger.render,
  },
  {
    id: "apex",
    fits: ["automotive", "car", "performance", "motor", "motorsport", "supercar"],
    name: "Apex",
    tier: "grow",
    reference: "lamborghini.com",
    summary: "Near-black, condensed uppercase type, angular cut corners, numbered product lines, a full-screen hero.",
    perPage: 24,
    render: apex.render,
  },
  {
    id: "stride",
    fits: ["sport", "athletic", "footwear", "shoes", "sneaker", "apparel", "fitness", "running"],
    name: "Stride",
    tier: "build",
    reference: "nike.com",
    summary: "Loud condensed headlines, edge-to-edge photos on light grey, big category cards, a swipeable trending row.",
    perPage: 24,
    render: stride.render,
  },
  {
    id: "fleet",
    fits: ["parts", "hardware", "supplies", "wholesale", "distributor", "industrial", "lighting", "components", "b2b"],
    catalog: "large",
    name: "Fleet",
    tier: "fix",
    reference: "toyota.com",
    summary: "Clean and practical: photo hero with a content card, a find-what-you-need panel, cards with price and two actions, a sticky quote bar on phones.",
    perPage: 24,
    render: fleet.render,
  },
  {
    id: "maison",
    fits: ["jewelry", "jewellery", "watch", "luxury", "beauty", "fragrance", "bridal", "diamond"],
    catalog: "small",
    name: "Maison",
    tier: "grow",
    reference: "cartier.com",
    summary: "Warm ivory, light wide type in small capitals, a two-tier centred header, arch-topped photo frames, hairline rules.",
    perPage: 24,
    render: maison.render,
  },
  {
    id: "flow",
    fits: ["activewear", "yoga", "fitness", "apparel", "wellness", "athleisure"],
    catalog: "small",
    name: "Flow",
    tier: "build",
    reference: "lululemon.com",
    summary: "Clean white, a big image hero with two promo tiles, rounded cards, soft grey panels, a values strip.",
    perPage: 24,
    render: flow.render,
  },
  {
    id: "lab",
    fits: ["electronics", "appliance", "technical", "hardware", "parts", "components", "electrical"],
    catalog: "large",
    name: "Lab",
    tier: "fix",
    reference: "dyson.com",
    summary: "Engineering-led: black top bar, light grey ground, white spec cards listing each product's key specs, a dark hero band.",
    perPage: 24,
    render: lab.render,
  },
  {
    id: "regent",
    fits: ["luxury", "bespoke", "yacht", "furniture", "interior", "automotive"],
    catalog: "small",
    name: "Regent",
    tier: "grow",
    reference: "rolls-roycemotorcars.com",
    summary: "Midnight and stone bands, sparse light uppercase type, a transparent header over a full-bleed hero, a one-at-a-time product slider.",
    perPage: 24,
    render: regent.render,
  },
  {
    id: "torque",
    fits: ["automotive", "car", "parts", "performance", "tools", "motorsport"],
    name: "Torque",
    tier: "build",
    reference: "porsche.com",
    summary: "Precise light grey and white, a left-aligned hero, a range picker: tabs that switch the product grid between main categories.",
    perPage: 24,
    render: torque.render,
  },
  {
    id: "grid",
    fits: ["electronics", "appliance", "phones", "computers", "general", "retail"],
    name: "Grid",
    tier: "fix",
    reference: "samsung.com",
    summary: "Bright retail: a sliding hero, round category icons, a bento block of promo tiles, product cards with two clear actions.",
    perPage: 24,
    render: gridT.render,
  },
  {
    id: "atelier",
    fits: ["fashion", "apparel", "leather", "bag", "handbag", "luxury", "designer"],
    catalog: "small",
    name: "Atelier",
    tier: "grow",
    reference: "louisvuitton.com",
    summary: "Stark white and black, tiny uppercase type, a slide-out menu, a full-bleed two-column editorial mosaic.",
    perPage: 24,
    render: atelier.render,
  },
  {
    id: "heritage",
    fits: ["leather", "bags", "accessories", "heritage", "gifts", "craft", "goods"],
    catalog: "small",
    name: "Heritage",
    tier: "build",
    reference: "coach.com",
    summary: "Warm cream and tan, chunky display type, a three-photo collage hero, pill category tabs, numbered craft notes.",
    perPage: 24,
    render: heritage.render,
  },
  {
    id: "arena",
    fits: ["footwear", "sneaker", "sport", "apparel", "streetwear"],
    name: "Arena",
    tier: "fix",
    reference: "footlocker.com",
    summary: "High-energy retail: italic condensed headlines, a promo bar, a slanted hero, a swipeable new-in row, bold category blocks.",
    perPage: 24,
    render: arena.render,
  },
  {
    id: "chrono",
    fits: ["watch", "timepiece", "sport", "precision", "eyewear", "instrument"],
    name: "Chrono",
    tier: "grow",
    reference: "tagheuer.com",
    summary: "Deep charcoal and precise type, a ring of tick marks around the hero product, numbered collections in a racing strip.",
    perPage: 24,
    render: chrono.render,
  },
  {
    id: "calm",
    fits: ["wellness", "beauty", "skincare", "cosmetics", "apparel", "home", "candles"],
    catalog: "small",
    name: "Calm",
    tier: "build",
    reference: "aloyoga.com",
    summary: "Airy warm neutrals and big soft corners, a quiet hero with a floating caption, shop-the-edit tiles, three-column grids.",
    perPage: 24,
    render: calm.render,
  },
  {
    id: "depot",
    fits: ["general", "retail", "supplies", "hardware", "home", "grocery", "office", "wholesale"],
    catalog: "large",
    name: "Depot",
    tier: "fix",
    reference: "walmart.com",
    summary: "Everyday retail: brand-colour header with a big search, a departments grid, deal tiles, a dense five-column grid, a department sidebar.",
    perPage: 30,
    render: depot.render,
  },
  {
    id: "officina",
    fits: ["coffee", "espresso", "kitchen", "appliance", "machine", "cookware", "food"],
    name: "Officina",
    tier: "grow",
    reference: "faema.com",
    summary: "Warm cream and espresso, polished-metal gradients, the hero product on a lit round pedestal, the story as a timeline.",
    perPage: 24,
    render: officina.render,
  },
  {
    id: "sleek",
    fits: ["automotive", "luxury", "electronics", "audio", "technology"],
    name: "Sleek",
    tier: "build",
    reference: "lexus.com",
    summary: "Black header over a dark hero with a light sweep, a side-scrolling line-up with from-prices, a compare table of featured products.",
    perPage: 24,
    render: sleek.render,
  },
  {
    id: "outpost",
    fits: ["outdoor", "hunting", "fishing", "camping", "sporting", "marine", "garden"],
    name: "Outpost",
    tier: "fix",
    reference: "basspro.com",
    summary: "Outdoor outfitter: forest green and canvas, sturdy condensed headings, department tiles, an expert-advice strip linking the site's guides.",
    perPage: 24,
    render: outpost.render,
  },
  {
    id: "showroom",
    fits: ["appliance", "kitchen", "home", "furniture", "interior", "lighting", "fixture", "design"],
    name: "Showroom",
    tier: "grow",
    reference: "subzero-wolf.com",
    summary: "Crisp white and brushed steel, products on steel backdrops, an inspiration gallery, a talk-to-us block leading to the enquiry form.",
    perPage: 24,
    render: showroom.render,
  },
  {
    id: "edge",
    fits: ["automotive", "performance", "tools", "outdoor", "sport", "power", "equipment"],
    name: "Edge",
    tier: "build",
    reference: "acura.com",
    summary: "Angular cut panels and italic uppercase type, a diagonal split hero, a choose-by quick bar, a stats band.",
    perPage: 24,
    render: edge.render,
  },
  {
    id: "flyer",
    fits: ["retail", "outdoor", "sporting", "general", "deals", "hardware", "home"],
    name: "Flyer",
    tier: "fix",
    reference: "sail.ca",
    summary: "Weekly retail flyer: a banner grid beside a department list, product cards with round price stickers, a this-week band.",
    perPage: 24,
    render: flyer.render,
  },
  {
    id: "gallery",
    fits: ["eyewear", "sunglasses", "glasses", "art", "fashion", "design", "gallery", "ceramics"],
    catalog: "small",
    name: "Gallery",
    tier: "grow",
    reference: "gentlemonster.com",
    summary: "Avant-garde art space: stark monochrome, an off-grid layout, products as numbered exhibits with wall labels, a scrolling text band.",
    perPage: 24,
    render: galleryT.render,
  },
  {
    id: "legacy",
    fits: ["watch", "jewelry", "jewellery", "heritage", "luxury", "pens"],
    catalog: "small",
    name: "Legacy",
    tier: "build",
    reference: "longines.com",
    summary: "Navy and silver heritage elegance, a navy hero band, each collection as its own split row with a strip of its products.",
    perPage: 24,
    render: legacy.render,
  },
  {
    id: "field",
    fits: ["parts", "equipment", "machinery", "hardware", "industrial", "agricultural", "lighting", "components", "electrical", "plumbing"],
    catalog: "large",
    name: "Field",
    tier: "fix",
    reference: "deere.com",
    summary: "Practical equipment-maker style: a find-what-you-need selector, help blocks, and the shop as a catalog list with specs on each row.",
    perPage: 30,
    render: field.render,
  },
  {
    id: "campaign",
    fits: ["outerwear", "apparel", "fashion", "clothing", "jacket", "coat", "streetwear"],
    catalog: "small",
    name: "Campaign",
    tier: "grow",
    reference: "mackage.com",
    summary: "Outerwear-campaign editorial: monochrome, full-height imagery, a pinned text column beside a scrolling image column, a condensed wordmark.",
    perPage: 24,
    render: campaign.render,
  },
  {
    id: "drive",
    fits: ["automotive", "electronics", "appliance", "technology", "mobility"],
    name: "Drive",
    tier: "build",
    reference: "bmw.com",
    summary: "Big rounded image frames, a hero with buttons over the image, category tabs opening swipeable card rows, twin action boxes.",
    perPage: 24,
    render: drive.render,
  },
  {
    id: "pop",
    fits: ["home", "appliance", "coffee", "kitchen", "beauty", "gifts", "toys", "pets"],
    catalog: "small",
    name: "Pop",
    tier: "fix",
    reference: "keurig.com",
    summary: "Friendly and rounded: each category on its own pastel card, a hero with a round product cut-out, benefit pills, best-seller cards.",
    perPage: 24,
    render: pop.render,
  },
];

/**
 * A tier's templates ranked for a business: +3 for each word its industry
 * shares with what a template suits, +2 when the template fits the
 * catalog's size (-3 when it clearly doesn't), -0.5 per site already using
 * it so similar businesses don't all look alike. `hits` is the word matches.
 */
export function rankTemplates(tier: TemplateMeta["tier"], industry: string, catalogSize: number, used: Map<string | null, number>) {
  const words = new Set(industry.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2));
  const size = catalogSize >= 1000 ? "large" : catalogSize > 0 && catalogSize < 300 ? "small" : null;
  return TEMPLATES.filter((t) => t.tier === tier)
    .map((t) => {
      const hits = (t.fits ?? []).filter((f) => words.has(f) || [...words].some((w) => w.startsWith(f) || (f.startsWith(w) && w.length > 4))).length;
      const score = hits * 3 + (size && t.catalog === size ? 2 : size && t.catalog && t.catalog !== size ? -3 : 0) - (used.get(t.id) ?? 0) * 0.5;
      return { template: t, score, hits };
    })
    .sort((a, b) => b.score - a.score);
}

/** The best template of a tier for a business (see rankTemplates). */
export function matchTemplate(tier: TemplateMeta["tier"], industry: string, catalogSize: number, used: Map<string | null, number>): TemplateMeta | null {
  return rankTemplates(tier, industry, catalogSize, used)[0]?.template ?? null;
}

export const templateById = (id: string | null | undefined) => TEMPLATES.find((t) => t.id === id) ?? null;
