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
    // Picks with photos first; a grid of empty frames looks broken.
    featured: (() => {
      const pics = featured.filter((p) => p.image);
      return pics.length >= 4 ? pics : featured.length ? [...pics, ...featured.filter((p) => !p.image)] : withImage.slice(0, 12);
    })(),
    products: doc.products,
    categories: doc.categories.map((c) => {
      const inCat = doc.products.filter((p) => p.category === c.slug || (c.slug && doc.categories.some((k) => k.parent === c.slug && k.slug === p.category)));
      return { ...c, image: c.image ?? inCat.find((p) => p.image)?.image ?? null, count: c.count ?? inCat.length };
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
  // "1-1/16in Center Hole - Plain Brass Canopy - Polished Copper": the product is the
  // part that names a thing, not the measurement, so it leads.
  if (parts.length > 1 && /^\d[\d\s./-]*(in|ips|mm|cm|ft)\b/i.test(parts[0]) && !/^\d/.test(parts[1]) && parts[1].split(/\s+/).length > 1) parts.unshift(...parts.splice(1, 1));
  if (parts.length > 1) return { name: parts[0], detail: parts.slice(1).join(" · ") };
  return { name: title, detail: "" };
}

/** Product listing state: search, category and page (from the imported catalog, or the document). */
export function listState(t: RenderTarget, categorySlug: string | null, query: URLSearchParams, perPage: number) {
  const view = t.catalog?.kind === "listing" ? t.catalog : null;
  const cat = view ? view.category : categorySlug ? t.doc.categories.find((c) => c.slug === categorySlug) ?? null : null;
  const q = view ? view.q : (query.get("q") ?? "").trim().slice(0, 80);
  const path = cat ? `/collections/${cat.slug}` : "/products";
  let shown: SiteProduct[];
  let total: number;
  let scopeTotal: number;
  let pages: number;
  let page: number;
  if (view) {
    ({ products: shown, total, pages, page } = view);
    scopeTotal = view.scopeCount;
  } else {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const scope = cat ? t.doc.products.filter((p) => p.category === cat.slug) : t.doc.products;
    const list = words.length ? scope.filter((p) => words.every((w) => `${p.title} ${p.slug}`.toLowerCase().includes(w))) : scope;
    total = list.length;
    scopeTotal = scope.length;
    pages = Math.max(1, Math.ceil(total / perPage));
    page = Math.min(pages, Math.max(1, Number(query.get("page")) || 1));
    shown = list.slice((page - 1) * perPage, page * perPage);
  }
  const facets = view?.facets ?? [];
  const chosen = Object.fromEntries(facets.filter((f) => f.selected).map((f) => [f.key, f.selected!]));
  /** This listing's link with filters changed (null removes one); back to page 1. */
  const withFilters = (change: Record<string, string | null>) => {
    const next = { ...chosen, ...change };
    const params = new URLSearchParams({ ...(q ? { q } : {}) });
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const qs = params.toString();
    return `${t.base}${path}${qs ? `?${qs}` : ""}`;
  };
  const pageHref = (n: number) => {
    const params = new URLSearchParams({ ...(q ? { q } : {}), ...chosen, page: String(n) });
    return `${t.base}${path}?${params}`;
  };
  return { cat, q, total, scopeTotal, pages, page, shown, path, pageHref, facets, chosen, withFilters, missing: !!categorySlug && !cat };
}

/** Main categories in their set order (highest value first), the rest by size. */
export const byRank = (a: { rank?: number; count?: number }, b: { rank?: number; count?: number }) =>
  (a.rank ?? 1e6) - (b.rank ?? 1e6) || (b.count ?? 0) - (a.count ?? 0);

/** The category trail (parents first) and the chips to show: children, or siblings at a leaf. */
export function categoryNav(doc: SiteDoc, current: SiteDoc["categories"][number] | null) {
  const bySlug = new Map(doc.categories.map((c) => [c.slug, c]));
  const trail: SiteDoc["categories"] = [];
  for (let c = current; c; c = c.parent ? bySlug.get(c.parent) ?? null : null) trail.unshift(c);
  const children = (slug: string | null) => doc.categories.filter((c) => (c.parent ?? null) === slug).sort(byRank);
  const kids = current ? children(current.slug) : children(null);
  const chips = kids.length ? kids : current ? children(current.parent ?? null) : [];
  return { trail, chips, parent: current?.parent ? bySlug.get(current.parent) ?? null : null };
}

export const fontsLink = (families: string[]) =>
  `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap" rel="stylesheet">`;

/** "Wire & Cord Sets - Lamp Wire" → "Wire & Cord Sets" for compact labels. */
export const shortName = (name: string) => name.split(/\s+[-–—]\s+/)[0].trim() || name;

/** Black or white, whichever reads better on a hex colour (for text on accent buttons). */
export function onColor(hex: string): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return "#fff";
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#141414" : "#fff";
}

/** An <img> that removes itself if the photo fails to load. */
export function imgTag(src: string | null | undefined, alt: string, cls = "", eager = false) {
  return src ? `<img${cls ? ` class="${cls}"` : ""} src="${esc(src)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} onerror="this.remove()">` : "";
}

/** Contact lines from the brand (email, phone, address) as list items. */
export const contactItems = (b: SiteDoc["brand"]) =>
  [b.email && `<li><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>`, b.phone && `<li><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></li>`, b.address && `<li>${esc(b.address)}</li>`].filter(Boolean).join("");

/** A page title Google shows whole: the name cut at a word to fit, then the brand. */
export function metaTitle(name: string, brand: string, max = 62): string {
  const room = max - brand.length - 3;
  const short = name.length <= room ? name : `${name.slice(0, room).replace(/\s+\S*$/, "").replace(/[\s,–—·-]+$/, "")}…`;
  return room < 20 ? name.slice(0, max) : `${short} | ${brand}`;
}

/**
 * The spec filters (thread size, finish, …) as a row of dropdown chips. Plain
 * HTML (no script); colours come from the template's own --accent and text.
 */
export function filterBar(t: RenderTarget, st: ReturnType<typeof listState>): string {
  if (!st.facets.length) return "";
  const accent = t.doc.tokens.palette.accent;
  const css = `<style>.fx{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 20px;font-size:14px;position:relative;z-index:6}
.fx details{position:relative}.fx summary{list-style:none;cursor:pointer;display:inline-flex;gap:8px;align-items:center;height:38px;padding:0 14px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;white-space:nowrap;user-select:none}
.fx summary::-webkit-details-marker{display:none}.fx summary:after{content:"▾";font-size:11px;opacity:.7}.fx details[open] summary{border-color:currentColor}
.fx .on{background:${esc(accent)};color:${onColor(accent)};border-color:${esc(accent)}}
.fx .menu{position:absolute;top:44px;left:0;min-width:220px;max-height:320px;overflow:auto;background:#fff;color:#141414;border:1px solid #e3e3e3;border-radius:12px;box-shadow:0 18px 40px -20px rgba(0,0,0,.35);padding:6px;display:grid}
.fx .menu a{display:flex;justify-content:space-between;gap:14px;padding:9px 12px;border-radius:8px;text-decoration:none;color:#141414}.fx .menu a:hover{background:#f2f2f2}.fx .menu a[aria-current]{font-weight:700}.fx .menu span{color:#777;font-size:12.5px}
.fx .chip{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:999px;text-decoration:none;background:${esc(accent)};color:${onColor(accent)}}.fx .clear{text-decoration:underline;text-underline-offset:3px;opacity:.8}</style>`;
  const groups = st.facets.map((f) => `<details><summary${f.selected ? ' class="on"' : ""}>${esc(f.label)}${f.selected ? `: ${esc(f.selected)}` : ""}</summary><div class="menu">${f.selected ? `<a href="${esc(st.withFilters({ [f.key]: null }))}">Any ${esc(f.label.toLowerCase())}</a>` : ""}${f.values
    .map((v) => `<a href="${esc(st.withFilters({ [f.key]: v.value }))}"${f.selected === v.value ? ' aria-current="true"' : ""}>${esc(v.value)}<span>${v.count.toLocaleString("en-US")}</span></a>`)
    .join("")}</div></details>`);
  const chosen = Object.keys(st.chosen).length ? `<a class="clear" href="${esc(st.withFilters(Object.fromEntries(Object.keys(st.chosen).map((k) => [k, null]))))}">Clear filters</a>` : "";
  return `${css}<div class="fx" role="group" aria-label="Filter products">${groups.join("")}${chosen}</div>`;
}

/** Listing page title with a single chosen filter ("2-1/4in neck · Shades & Glass"). */
export function filteredTitle(base: string, st: ReturnType<typeof listState>): string {
  const sel = st.facets.filter((f) => f.selected);
  return sel.length === 1 ? `${sel[0].selected} ${sel[0].label.toLowerCase().split(" / ")[0]} · ${base}` : base;
}

/** A listing's canonical path: page and a single filter are their own pages; searches aren't. */
export function listPath(st: ReturnType<typeof listState>): string {
  const params = new URLSearchParams();
  const sel = Object.entries(st.chosen);
  if (sel.length === 1) params.set(sel[0][0], sel[0][1]);
  if (st.page > 1) params.set("page", String(st.page));
  const qs = st.q ? "" : params.toString();
  return `${st.path}${qs ? `?${qs}` : ""}`;
}

/** Pages beyond home, about and contact (guides, trade): top-level ones linked from the footer. */
export function extraLinks(t: RenderTarget): string {
  return t.doc.pages
    .filter((p) => p.slug && !["about", "contact"].includes(p.slug) && !p.slug.includes("/"))
    .map((p) => `<li><a href="${href(t, `/${p.slug}`)}">${esc(p.navLabel ?? p.title)}</a></li>`)
    .join("");
}

/** The site page at this path other than home, about and contact. */
export const contentPage = (t: RenderTarget, joined: string) =>
  t.doc.pages.find((p) => p.slug && !["about", "contact"].includes(p.slug) && `/${p.slug}` === joined) ?? null;

/**
 * A content page (guide, trade page) in any template: readable article
 * layout using the template's own fonts and colours (--accent, --muted,
 * --line). The template wraps it in its page shell.
 */
export function articleBody(t: RenderTarget, page: SiteDoc["pages"][number]): string {
  const css = `<style>.art{max-width:860px;margin:0 auto;padding-block:clamp(36px,5vw,72px) 20px}.art .crumb{font-size:14px;color:var(--muted);margin:0 0 16px}.art .crumb a{text-decoration:none}
.art h1{font-size:clamp(32px,4vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0 0 18px}.art h2{font-size:clamp(22px,2.2vw,30px);line-height:1.2;margin:clamp(36px,4vw,56px) 0 14px}
.art p,.art li{font-size:18px;line-height:1.65}.art .intro{font-size:20px;color:var(--muted)}
.art ol.st{list-style:none;padding:0;margin:0;display:grid;gap:14px;counter-reset:s}.art ol.st li{display:grid;grid-template-columns:44px 1fr;gap:14px;border-top:1px solid var(--line);padding-top:16px}.art ol.st li:before{counter-increment:s;content:counter(s);display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--accent);color:${onColor(t.doc.tokens.palette.accent)};font-weight:700}
.art ol.st b{display:block;font-size:18px}.art .fl{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;padding:0;list-style:none}.art .fl li{border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:16px}.art .fl b{display:block;margin-bottom:4px}
.art .ln{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}.art .ln a{display:block;border:1px solid var(--line);border-radius:12px;padding:14px 18px;text-decoration:none;font-weight:600;font-size:16px;transition:border-color .2s}.art .ln a:hover{border-color:var(--accent)}.art .ln span{display:block;font-weight:400;color:var(--muted);font-size:14px;margin-top:2px}
.art details{border-bottom:1px solid var(--line);padding:16px 0}.art summary{cursor:pointer;font-weight:600;font-size:18px}.art details p{margin:10px 0 0;color:var(--muted)}
.art .cta{margin-top:clamp(36px,4vw,56px);border-top:2px solid var(--accent);padding-top:24px}.art .cta a.go{display:inline-block;margin-top:8px;font-weight:700;color:var(--accent)}
.art .form{margin-top:18px}</style>`;
  const sec = page.sections.map((s) => {
    switch (s.type) {
      case "hero":
        return `${s.eyebrow ? `<p class="crumb">${esc(s.eyebrow)}</p>` : ""}<h1>${esc(s.heading)}</h1>${s.subheading ? `<p class="intro">${esc(s.subheading)}</p>` : ""}`;
      case "story":
        return `<h2>${esc(s.heading)}</h2>${paras(s.body)}`;
      case "steps":
        return `<h2>${esc(s.heading)}</h2><ol class="st">${s.items.map((i) => `<li><div><b>${esc(i.title)}</b>${esc(i.body)}</div></li>`).join("")}</ol>`;
      case "features":
        return `<h2>${esc(s.heading)}</h2><ul class="fl">${s.items.map((i) => `<li><b>${esc(i.title)}</b>${esc(i.body)}</li>`).join("")}</ul>`;
      case "links":
        return `<h2>${esc(s.heading)}</h2><ul class="ln">${s.items.map((i) => `<li><a href="${esc(href(t, i.href))}">${esc(i.label)}${i.note ? `<span>${esc(i.note)}</span>` : ""}</a></li>`).join("")}</ul>`;
      case "faq":
        return `<h2>${esc(s.heading)}</h2>${s.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}`;
      case "cta":
        return `<div class="cta"><h2 style="margin-top:0">${esc(s.heading)}</h2>${s.body ? `<p>${esc(s.body)}</p>` : ""}<a class="go" href="${esc(href(t, s.ctaHref))}">${esc(s.ctaLabel)} →</a></div>`;
      case "contact":
        return `<h2 id="apply">${esc(s.heading)}</h2>${s.body ? `<p>${esc(s.body)}</p>` : ""}${leadForm(t, `page:${page.slug}`, s.quoteForm ? "Send application" : "Send message", !!s.quoteForm)}`;
      default:
        return "";
    }
  });
  const hasHero = page.sections[0]?.type === "hero";
  return `${css}<article class="art">${hasHero ? "" : `<h1>${esc(page.title)}</h1>`}${sec.join("")}</article>`;
}
