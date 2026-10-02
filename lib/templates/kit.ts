import type { Section, SiteDoc, SiteProduct } from "../site-types";
import type { RenderTarget } from "../site-render";

// Shared parts for hand-designed templates: escaping, money, links, the
// lead form, structured data, and the adapter that turns a site document
// (whatever order the AI wrote its sections in) into the fixed slots every
// template fills. Templates own layout; data only drops into slots.

export const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
export const paras = (s: string) => esc(s).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
export const money = (p: SiteProduct) =>
  p.price == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency || "USD" }).format(p.price);

/** Site-relative href ("/products") prefixed for preview. */
export const href = (t: RenderTarget, path: string) => (path.startsWith("/") ? `${t.base}${path === "/" ? "" : path}` || "/" : path);

type Of<T extends Section["type"]> = Extract<Section, { type: T }>;

/** Everything a template can fill, read from the site document. */
export type Slots = {
  doc: SiteDoc;
  brand: SiteDoc["brand"];
  hero: { eyebrow: string; heading: string; sub: string; cta: string; image: string | null; video: string | null };
  highlights: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  story: { heading: string; body: string; image: string | null } | null;
  aboutStory: { heading: string; body: string; image: string | null } | null;
  steps: { heading: string; items: { title: string; body: string }[] } | null;
  faq: { heading: string; items: { q: string; a: string }[] } | null;
  closing: { heading: string; body: string; cta: string; href: string } | null;
  contact: { heading: string; body: string; quote: boolean };
  trust: { title: string; body: string; href?: string }[];
  featured: SiteProduct[];
  products: SiteProduct[];
  categories: (SiteDoc["categories"][number] & { image: string | null; count: number })[];
  promise: string[];
  /** Photos used for editorial moments: rendered visuals first, then product photos. */
  editorial: string[];
};

export function slots(doc: SiteDoc): Slots {
  const home = doc.pages.find((p) => p.slug === "")?.sections ?? [];
  const about = doc.pages.find((p) => p.slug === "about")?.sections ?? [];
  const contact = doc.pages.find((p) => p.slug === "contact")?.sections ?? [];
  const all = doc.pages.flatMap((p) => p.sections);
  const first = <T extends Section["type"]>(list: Section[], type: T) => list.find((s) => s.type === type) as Of<T> | undefined;
  const hero = first(home, "hero");
  const story = first(home, "story");
  const aboutStory = first(about, "story");
  const faq = first(home, "faq") ?? first(all, "faq");
  const cta = first(home, "cta");
  const steps = first(all, "steps");
  const contactSection = first(contact, "contact");
  const featured = doc.products.filter((p) => p.featured);
  const withImage = doc.products.filter((p) => p.image);
  const rendered = [story?.image, aboutStory?.image].filter((u): u is string => !!u && !/bigcommerce|shopify|wp-content/i.test(u));
  return {
    doc,
    brand: doc.brand,
    hero: {
      eyebrow: hero?.eyebrow ?? "",
      heading: hero?.heading ?? doc.brand.name,
      sub: hero?.subheading ?? doc.brand.tagline,
      cta: hero?.ctaLabel ?? "Discover the collection",
      image: hero?.image ?? featured[0]?.image ?? null,
      video: hero?.video ?? null,
    },
    highlights: (first(all, "features")?.items ?? []).slice(0, 3),
    stats: first(all, "stats")?.items ?? [],
    story: story ? { heading: story.heading, body: story.body, image: story.image ?? null } : null,
    aboutStory: aboutStory ? { heading: aboutStory.heading, body: aboutStory.body, image: aboutStory.image ?? null } : null,
    steps: steps ? { heading: steps.heading, items: steps.items } : null,
    faq: faq ? { heading: faq.heading, items: faq.items } : null,
    closing: cta ? { heading: cta.heading, body: cta.body ?? "", cta: cta.ctaLabel, href: cta.ctaHref } : null,
    contact: { heading: contactSection?.heading ?? "Get in touch", body: contactSection?.body ?? "", quote: !!contactSection?.quoteForm },
    trust: (first(all, "trust")?.items ?? []).slice(0, 4),
    featured: featured.length ? featured : withImage.slice(0, 12),
    products: doc.products,
    categories: doc.categories.map((c) => {
      const inCat = doc.products.filter((p) => p.category === c.slug);
      return { ...c, image: inCat.find((p) => p.image)?.image ?? null, count: inCat.length };
    }),
    promise: doc.productPromise ?? [],
    editorial: [...rendered, ...withImage.map((p) => p.image!)].filter((v, i, a) => a.indexOf(v) === i),
  };
}

/** The enquiry / quote form (plain HTML form; no script needed on the site). */
export function leadForm(t: RenderTarget, page: string, label: string, quote: boolean, cls = "form") {
  return `<form class="${cls}" method="post" action="${t.apiOrigin}/api/site-lead/${esc(t.siteId)}">
<input type="hidden" name="page" value="${esc(page)}">
<label><span>Name</span><input name="name" required autocomplete="name"></label>
<label><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
<label><span>Phone (optional)</span><input name="phone" autocomplete="tel"></label>
<label class="full"><span>${quote ? "What do you need? Part numbers, quantities, deadlines" : "How can we help?"}</span><textarea name="message" rows="5" required></textarea></label>
<input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
<button type="submit">${esc(label)}</button></form>`;
}

/** The buy / enquire action for a product, per the site's setting. */
export function productAction(t: RenderTarget, p: SiteProduct, url: string, cls: string): { html: string; enquire: boolean } {
  const d = t.doc;
  const canBuy = d.productAction === "checkout" && p.price != null && p.price > 0;
  if (canBuy) {
    return {
      enquire: false,
      html: `<form method="post" action="${t.apiOrigin}/api/site-checkout/${esc(t.siteId)}"><input type="hidden" name="product" value="${esc(p.slug)}"><input type="hidden" name="url" value="${esc(url)}"><button class="${cls}" type="submit">Buy now</button></form>`,
    };
  }
  if (d.productAction === "link") return { enquire: false, html: `<a class="${cls}" href="${esc(p.sourceUrl)}">Buy now</a>` };
  return { enquire: true, html: `<a class="${cls}" href="#enquire">Ask about this product</a>` };
}

export function productJsonLd(t: RenderTarget, p: SiteProduct, url: string, catName: string | null) {
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${t.origin}/` },
    { "@type": "ListItem", position: 2, name: "Products", item: `${t.origin}/products` },
    ...(catName ? [{ "@type": "ListItem", position: 3, name: catName, item: `${t.origin}/collections/${p.category}` }] : []),
    { "@type": "ListItem", position: catName ? 4 : 3, name: p.title, item: url },
  ];
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.title,
      description: p.description,
      url,
      ...(p.image ? { image: [p.image] } : {}),
      brand: { "@type": "Brand", name: t.doc.brand.name },
      ...(p.price != null ? { offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency || "USD", url } } : {}),
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs },
  ];
}

export const jsonLdTags = (items: object[]) =>
  items.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("");

/** Splits a long product name into a short title and the detail after it. */
export function splitTitle(title: string): { name: string; detail: string } {
  const parts = title.split(/\s+[–—-]\s+/);
  // A first part that's only a size or number ("1", "1/0-13") reads better joined to the next.
  while (parts.length > 2 && parts[0].replace(/[^a-z]/gi, "").length < 3) parts.splice(0, 2, `${parts[0]} ${parts[1]}`);
  if (parts.length > 1) return { name: parts[0], detail: parts.slice(1).join(" · ") };
  return { name: title, detail: "" };
}

/** Product listing state: search, category and page from the query. */
export function listState(t: RenderTarget, categorySlug: string | null, query: URLSearchParams, perPage: number) {
  const cat = categorySlug ? t.doc.categories.find((c) => c.slug === categorySlug) ?? null : null;
  const q = (query.get("q") ?? "").trim().slice(0, 80);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const scope = cat ? t.doc.products.filter((p) => p.category === cat.slug) : t.doc.products;
  const list = words.length ? scope.filter((p) => words.every((w) => `${p.title} ${p.slug}`.toLowerCase().includes(w))) : scope;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const page = Math.min(pages, Math.max(1, Number(query.get("page")) || 1));
  const path = cat ? `/collections/${cat.slug}` : "/products";
  const pageHref = (n: number) => `${t.base}${path}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;
  return { cat, q, list, scope, pages, page, shown: list.slice((page - 1) * perPage, page * perPage), path, pageHref };
}

export const fontsLink = (families: string[]) =>
  `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap" rel="stylesheet">`;
