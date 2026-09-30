import type { Section, SiteDoc, SitePage, SiteProduct } from "./site-types";

// Renders a customer site to complete HTML documents: no framework on the
// page, one small stylesheet from the template's tokens, a few lines of
// script only when the design has motion. Everything an analysis checks for
// is built in: one H1 per page, unique titles and descriptions, canonical
// URLs, product data for Google (price only when known), breadcrumbs, image
// descriptions, a sitemap and robots.txt, and redirects from the old site.

export type RenderTarget = {
  siteId: string;
  doc: SiteDoc;
  /** Path prefix for links: "/sites/slug" in preview, "" on the customer's domain. */
  base: string;
  /** Absolute origin of this site, for canonicals and the sitemap. */
  origin: string;
  /** Where lead forms post (Apereel's API). */
  apiOrigin: string;
  preview: boolean;
};

export type RenderResult =
  | { kind: "html"; status: number; body: string }
  | { kind: "text"; status: number; body: string; contentType: string }
  | { kind: "redirect"; location: string };

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const para = (s: string) => esc(s).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
const money = (p: SiteProduct) =>
  p.price == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency || "USD" }).format(p.price);

function css(doc: SiteDoc): string {
  const t = doc.tokens;
  const p = t.palette;
  return `:root{--bg:${p.bg};--surface:${p.surface};--text:${p.text};--muted:${p.muted};--accent:${p.accent};--accent-text:${p.accentText};--line:${p.line};--r:${t.radius}px;--fh:"${t.fontHeading}",system-ui,sans-serif;--fb:"${t.fontBody}",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 var(--fb)}
img{max-width:100%;display:block}a{color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
h1,h2,h3{font-family:var(--fh);line-height:1.1;margin:0;font-weight:600;letter-spacing:-.01em${t.headingCase === "upper" ? ";text-transform:uppercase;letter-spacing:.02em" : ""}}
h1{font-size:clamp(2.3rem,5.5vw,4.4rem)}h2{font-size:clamp(1.7rem,3.4vw,2.6rem)}h3{font-size:1.15rem}
.muted{color:var(--muted)}.eyebrow{font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin:0 0 14px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 26px;border-radius:999px;background:var(--accent);color:var(--accent-text);text-decoration:none;font-weight:600;border:0;cursor:pointer;font:600 15px var(--fb)}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line)}
header.site{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:68px}
.brand{font-family:var(--fh);font-size:1.25rem;font-weight:700;text-decoration:none}
nav.main{display:flex;gap:22px;flex-wrap:wrap}nav.main a{text-decoration:none;font-size:.95rem;color:var(--muted)}nav.main a:hover,nav.main a[aria-current]{color:var(--text)}
section{padding:clamp(56px,9vw,110px) 0}
.hero{position:relative;overflow:hidden}
.hero.split .wrap{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center}
.hero.split .media{background:var(--surface);border-radius:var(--r);overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.hero.split .media img{width:100%;height:100%;object-fit:contain}
.hero.full{min-height:78vh;display:flex;align-items:flex-end;color:#fff;padding-bottom:72px}
.hero.full .bg{position:absolute;inset:0}.hero.full .bg img,.hero.full .bg video{width:100%;height:100%;object-fit:cover}
.hero.full .bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.62))}
.hero.full .wrap{position:relative}.hero.full .eyebrow{color:#fff;opacity:.85}.hero.full .lead{color:rgba(255,255,255,.88)}
.hero.centered{text-align:center}.hero.centered .lead{margin-left:auto;margin-right:auto}
.lead{font-size:1.2rem;max-width:620px;margin:18px 0 28px;color:var(--muted)}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.grid{display:grid;gap:22px}.g2{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:repeat(3,1fr)}.g4{grid-template-columns:repeat(4,1fr)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:26px}
.card p{margin:10px 0 0;color:var(--muted)}
.product{display:block;text-decoration:none;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;transition:transform .25s,box-shadow .25s}
.product:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.08)}
.product .ph{aspect-ratio:1;background:#fff;display:flex;align-items:center;justify-content:center}.product .ph img{width:100%;height:100%;object-fit:contain}
.product .info{padding:16px 18px}.product .name{font-weight:600;line-height:1.35}.product .price{color:var(--muted);margin-top:6px}
.head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:34px;flex-wrap:wrap}
.stats{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:30px 0}
.stats b{display:block;font-family:var(--fh);font-size:2.2rem}
.story{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.story .media{border-radius:var(--r);overflow:hidden;background:var(--surface)}
.story .media img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#fff}
details{border-bottom:1px solid var(--line);padding:18px 0}summary{cursor:pointer;font-weight:600;list-style:none}summary::-webkit-details-marker{display:none}details p{color:var(--muted);margin:10px 0 0}
.cta{background:var(--accent);color:var(--accent-text);border-radius:var(--r);padding:clamp(36px,6vw,64px);text-align:center}.cta .btn{background:var(--accent-text);color:var(--accent)}.cta p{opacity:.85}
form.lead{display:grid;gap:12px;max-width:620px}form.lead input,form.lead textarea{width:100%;padding:14px 16px;border:1px solid var(--line);border-radius:calc(var(--r)/1.5);background:var(--surface);color:var(--text);font:inherit}
.crumbs{font-size:.88rem;color:var(--muted);margin-bottom:22px}.crumbs a{text-decoration:none}
.pdp{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}.pdp .ph{background:#fff;border:1px solid var(--line);border-radius:var(--r);aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:contain}
.pdp .price{font-size:1.5rem;margin:14px 0 22px}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px}.chips a{padding:8px 16px;border:1px solid var(--line);border-radius:999px;text-decoration:none;font-size:.92rem}.chips a[aria-current]{background:var(--text);color:var(--bg)}
footer.site{border-top:1px solid var(--line);padding:48px 0;color:var(--muted);font-size:.93rem}footer.site .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.notice{background:#111;color:#fff;text-align:center;font:13px/1.4 system-ui;padding:8px}
@media(max-width:860px){.hero.split .wrap,.story,.pdp{grid-template-columns:1fr}.g3,.g4{grid-template-columns:repeat(2,1fr)}.g2{grid-template-columns:1fr}nav.main{gap:14px}}
@media(max-width:520px){.g3,.g4{grid-template-columns:1fr 1fr}.product .info{padding:12px}}
${t.motion !== "none" ? `[data-reveal]{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}[data-reveal].in{opacity:1;transform:none}` : ""}
${t.motion === "cinematic" ? `.hero.full .bg img{animation:kb 22s ease-out both}@keyframes kb{from{transform:scale(1.12)}to{transform:scale(1)}}` : ""}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-reveal]{opacity:1;transform:none}}`;
}

const MOTION_JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -8% 0px"});document.querySelectorAll("[data-reveal]").forEach(function(el,i){el.style.transitionDelay=(i%4)*70+"ms";o.observe(el)})})();</script>`;

function productCard(p: SiteProduct, t: RenderTarget) {
  return `<a class="product" data-reveal href="${t.base}/products/${esc(p.slug)}"><div class="ph">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ""}</div><div class="info"><div class="name">${esc(p.title)}</div>${p.price != null ? `<div class="price">${esc(money(p))}</div>` : ""}</div></a>`;
}

function leadForm(t: RenderTarget, page: string, label: string, quote: boolean) {
  return `<form class="lead" method="post" action="${t.apiOrigin}/api/site-lead/${esc(t.siteId)}">
<input type="hidden" name="page" value="${esc(page)}"><input name="name" placeholder="Your name" required autocomplete="name"><input name="email" type="email" placeholder="Email" required autocomplete="email"><input name="phone" placeholder="Phone (optional)" autocomplete="tel">
<textarea name="message" rows="5" placeholder="${quote ? "What do you need? Part numbers, quantities, deadlines" : "How can we help?"}" required></textarea>
<input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
<button class="btn" type="submit">${esc(label)}</button></form>`;
}

function section(s: Section, t: RenderTarget, first: boolean): string {
  const { doc } = t;
  const H = first ? "h1" : "h2";
  switch (s.type) {
    case "hero": {
      const style = doc.tokens.heroStyle;
      const media = s.video
        ? `<video src="${esc(s.video)}" autoplay muted loop playsinline${s.image ? ` poster="${esc(s.image)}"` : ""}></video>`
        : s.image
          ? `<img src="${esc(s.image)}" alt="${esc(s.heading)}" fetchpriority="high">`
          : "";
      const text = `${s.eyebrow ? `<p class="eyebrow">${esc(s.eyebrow)}</p>` : ""}<${H}>${esc(s.heading)}</${H}>${s.subheading ? `<p class="lead">${esc(s.subheading)}</p>` : ""}${s.ctaLabel ? `<div class="actions"><a class="btn" href="${esc(link(s.ctaHref ?? "/products", t))}">${esc(s.ctaLabel)}</a></div>` : ""}`;
      if (style === "full" && media) return `<section class="hero full"><div class="bg">${media}</div><div class="wrap">${text}</div></section>`;
      if (style === "split" && media) return `<section class="hero split"><div class="wrap"><div>${text}</div><div class="media">${media}</div></div></section>`;
      return `<section class="hero centered"><div class="wrap">${text}</div></section>`;
    }
    case "features":
      return `<section><div class="wrap"><${H} data-reveal>${esc(s.heading)}</${H}><div class="grid g3" style="margin-top:34px">${s.items.map((i) => `<div class="card" data-reveal><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p></div>`).join("")}</div></div></section>`;
    case "stats":
      return `<section style="padding:0"><div class="wrap"><div class="stats">${s.items.map((i) => `<div data-reveal><b>${esc(i.value)}</b><span class="muted">${esc(i.label)}</span></div>`).join("")}</div></div></section>`;
    case "productGrid": {
      const list = s.products === "featured" ? doc.products.filter((p) => p.featured) : doc.products.filter((p) => (s.products as string[]).includes(p.slug));
      const shown = (list.length ? list : doc.products).slice(0, s.limit ?? 8);
      return `<section><div class="wrap"><div class="head"><${H} data-reveal>${esc(s.heading)}</${H}><a class="btn ghost" href="${t.base}/products">View all</a></div><div class="grid g4">${shown.map((p) => productCard(p, t)).join("")}</div></div></section>`;
    }
    case "categoryGrid": {
      const cats = doc.categories.filter((c) => s.categories.includes(c.slug) || s.categories.length === 0);
      if (!cats.length) return "";
      return `<section><div class="wrap"><${H} data-reveal>${esc(s.heading)}</${H}><div class="grid g3" style="margin-top:34px">${cats
        .slice(0, 9)
        .map((c) => {
          const img = doc.products.find((p) => p.category === c.slug && p.image)?.image;
          return `<a class="product" data-reveal href="${t.base}/collections/${esc(c.slug)}"><div class="ph">${img ? `<img src="${esc(img)}" alt="${esc(c.name)}" loading="lazy">` : ""}</div><div class="info"><div class="name">${esc(c.name)}</div><div class="price">${esc(c.description)}</div></div></a>`;
        })
        .join("")}</div></div></section>`;
    }
    case "story":
      return `<section><div class="wrap story"><div data-reveal><${H}>${esc(s.heading)}</${H}><div class="muted" style="margin-top:18px">${para(s.body)}</div></div>${s.image ? `<div class="media" data-reveal><img src="${esc(s.image)}" alt="${esc(s.heading)}" loading="lazy"></div>` : "<div></div>"}</div></section>`;
    case "faq":
      return `<section><div class="wrap" style="max-width:860px"><${H} data-reveal>${esc(s.heading)}</${H}><div style="margin-top:26px">${s.items.map((i) => `<details data-reveal><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join("")}</div></div></section>`;
    case "cta":
      return `<section><div class="wrap"><div class="cta" data-reveal><${H}>${esc(s.heading)}</${H}>${s.body ? `<p>${esc(s.body)}</p>` : ""}<div style="margin-top:24px"><a class="btn" href="${esc(link(s.ctaHref, t))}">${esc(s.ctaLabel)}</a></div></div></div></section>`;
    case "contact":
      return `<section><div class="wrap"><${H}>${esc(s.heading)}</${H}>${s.body ? `<p class="lead">${esc(s.body)}</p>` : ""}${
        [doc.brand.email && `<a href="mailto:${esc(doc.brand.email)}">${esc(doc.brand.email)}</a>`, doc.brand.phone && `<a href="tel:${esc(doc.brand.phone)}">${esc(doc.brand.phone)}</a>`, doc.brand.address && esc(doc.brand.address)].filter(Boolean).map((x) => `<p>${x}</p>`).join("")
      }<div style="margin-top:28px">${leadForm(t, "contact", s.quoteForm ? "Request a quote" : "Send", !!s.quoteForm)}</div></div></section>`;
  }
}

/** Internal hrefs are written site-relative ("/products"); prefix them for preview. */
function link(href: string, t: RenderTarget) {
  return href.startsWith("/") ? `${t.base}${href === "/" ? "" : href}` || "/" : href;
}

function shell(t: RenderTarget, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; current?: string }) {
  const { doc } = t;
  const fonts = [...new Set([doc.tokens.fontHeading, doc.tokens.fontBody])].map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;600;700`).join("&");
  const nav = [
    ...doc.pages.filter((p) => p.slug && p.navLabel).map((p) => ({ href: `/${p.slug}`, label: p.navLabel! })),
  ];
  const navHtml = [{ href: "/products", label: "Products" }, ...nav]
    .map((n) => `<a href="${link(n.href, t)}"${o.current === n.href ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`)
    .join("");
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}">
${t.preview ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet">
<style>${css(doc)}</style>
${(o.jsonLd ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("")}
</head><body>${t.preview ? '<div class="notice">Preview of your new site · built by Apereel</div>' : ""}
<header class="site"><div class="wrap"><a class="brand" href="${t.base || "/"}">${esc(doc.brand.name)}</a><nav class="main" aria-label="Main">${navHtml}</nav></div></header>
<main>${o.body}</main>
<footer class="site"><div class="wrap"><div><div class="brand">${esc(doc.brand.name)}</div><p>${esc(doc.brand.tagline)}</p>${doc.brand.email ? `<p><a href="mailto:${esc(doc.brand.email)}">${esc(doc.brand.email)}</a></p>` : ""}</div><div>${esc(doc.footerNote ?? "")}<p>© ${new Date().getFullYear()} ${esc(doc.brand.name)}</p></div></div></footer>
${doc.tokens.motion !== "none" ? MOTION_JS : ""}<script>if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="notice" role="status" style="background:var(--accent);color:var(--accent-text)">Thank you for your order. A receipt is on its way to your email.</div>')</script><script>if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="notice" role="status" style="background:var(--accent);color:var(--accent-text)">Thanks, your message was sent. We&#39;ll be in touch soon.</div>')</script></body></html>`;
}

function pageDoc(page: SitePage, t: RenderTarget): string {
  const org = page.slug === "" ? [{ "@context": "https://schema.org", "@type": "Organization", name: t.doc.brand.name, url: t.origin, ...(t.doc.brand.email ? { email: t.doc.brand.email } : {}) }] : [];
  return shell(t, {
    path: page.slug ? `/${page.slug}` : "/",
    title: page.metaTitle,
    description: page.metaDescription,
    current: page.slug ? `/${page.slug}` : undefined,
    body: page.sections.map((s, i) => section(s, t, i === 0)).join(""),
    jsonLd: org,
  });
}

function listing(t: RenderTarget, categorySlug: string | null): string | null {
  const { doc } = t;
  const cat = categorySlug ? doc.categories.find((c) => c.slug === categorySlug) : null;
  if (categorySlug && !cat) return null;
  const list = cat ? doc.products.filter((p) => p.category === cat.slug) : doc.products;
  const chips = doc.categories.length
    ? `<div class="chips"><a href="${t.base}/products"${!cat ? ' aria-current="page"' : ""}>All</a>${doc.categories.map((c) => `<a href="${t.base}/collections/${esc(c.slug)}"${cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(c.name)}</a>`).join("")}</div>`
    : "";
  const title = cat ? cat.name : "All products";
  return shell(t, {
    path: cat ? `/collections/${cat.slug}` : "/products",
    title: `${title} | ${doc.brand.name}`,
    description: cat?.description || `Browse ${list.length} products from ${doc.brand.name}.`,
    current: "/products",
    body: `<section><div class="wrap"><h1 style="font-size:clamp(2rem,4vw,3rem)">${esc(title)}</h1>${cat?.description ? `<p class="lead">${esc(cat.description)}</p>` : ""}<div style="margin-top:28px">${chips}</div><div class="grid g4">${list.map((p) => productCard(p, t)).join("")}</div></div></section>`,
    jsonLd: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${t.origin}/` }, { "@type": "ListItem", position: 2, name: title, item: `${t.origin}${cat ? `/collections/${cat.slug}` : "/products"}` }] }],
  });
}

function productPage(t: RenderTarget, p: SiteProduct): string {
  const { doc } = t;
  const cat = doc.categories.find((c) => c.slug === p.category);
  const url = `${t.origin}/products/${p.slug}`;
  const related = doc.products.filter((x) => x.slug !== p.slug && x.category && x.category === p.category).slice(0, 4);
  const canBuy = doc.productAction === "checkout" && p.price != null && p.price > 0;
  const enquire = doc.productAction === "enquire" || (doc.productAction === "checkout" && !canBuy);
  const action = canBuy
    ? `<form method="post" action="${t.apiOrigin}/api/site-checkout/${esc(t.siteId)}"><input type="hidden" name="product" value="${esc(p.slug)}"><input type="hidden" name="url" value="${esc(url)}"><button class="btn" type="submit">Buy now</button></form>`
    : doc.productAction === "link"
      ? `<a class="btn" href="${esc(p.sourceUrl)}">Buy now</a>`
      : `<a class="btn" href="#enquire">Ask about this product</a>`;
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    url,
    ...(p.image ? { image: [p.image] } : {}),
    brand: { "@type": "Brand", name: doc.brand.name },
    ...(p.price != null ? { offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency || "USD", url } } : {}),
  };
  return shell(t, {
    path: `/products/${p.slug}`,
    title: `${p.title} | ${doc.brand.name}`,
    description: p.description.slice(0, 155),
    current: "/products",
    body: `<section><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="${t.base || "/"}">Home</a> / <a href="${t.base}/products">Products</a>${cat ? ` / <a href="${t.base}/collections/${esc(cat.slug)}">${esc(cat.name)}</a>` : ""}</nav>
<div class="pdp"><div class="ph">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" fetchpriority="high">` : ""}</div><div><h1 style="font-size:clamp(1.8rem,3.5vw,2.7rem)">${esc(p.title)}</h1>${p.price != null ? `<div class="price">${esc(money(p))}</div>` : ""}<div class="muted">${para(p.description)}</div><div class="actions" style="margin-top:26px">${action}</div></div></div>
${enquire ? `<div id="enquire" style="margin-top:72px"><h2>Ask about ${esc(p.title)}</h2><div style="margin-top:22px">${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></div>` : ""}
${related.length ? `<div style="margin-top:80px"><h2>More ${cat ? esc(cat.name) : "products"}</h2><div class="grid g4" style="margin-top:26px">${related.map((r) => productCard(r, t)).join("")}</div></div>` : ""}</div></section>`,
    jsonLd: [
      product,
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${t.origin}/` },
          { "@type": "ListItem", position: 2, name: "Products", item: `${t.origin}/products` },
          ...(cat ? [{ "@type": "ListItem", position: 3, name: cat.name, item: `${t.origin}/collections/${cat.slug}` }] : []),
          { "@type": "ListItem", position: cat ? 4 : 3, name: p.title, item: url },
        ],
      },
    ],
  });
}

export function renderPath(t: RenderTarget, path: string[]): RenderResult {
  const { doc } = t;
  const joined = `/${path.join("/")}`.replace(/\/+$/, "") || "/";
  if (joined === "/robots.txt") {
    return { kind: "text", status: 200, contentType: "text/plain", body: t.preview ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${t.origin}/sitemap.xml\n` };
  }
  if (joined === "/sitemap.xml") {
    const urls = [
      ...doc.pages.map((p) => (p.slug ? `/${p.slug}` : "/")),
      "/products",
      ...doc.categories.map((c) => `/collections/${c.slug}`),
      ...doc.products.map((p) => `/products/${p.slug}`),
    ];
    return { kind: "text", status: 200, contentType: "application/xml", body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${esc(t.origin + u)}</loc></url>`).join("")}</urlset>` };
  }
  const page = doc.pages.find((p) => (p.slug ? `/${p.slug}` : "/") === joined);
  if (page) return { kind: "html", status: 200, body: pageDoc(page, t) };
  if (joined === "/products") return { kind: "html", status: 200, body: listing(t, null)! };
  if (path[0] === "collections" && path[1]) {
    const html = listing(t, path[1]);
    if (html) return { kind: "html", status: 200, body: html };
  }
  if (path[0] === "products" && path[1]) {
    const p = doc.products.find((x) => x.slug === path[1]);
    if (p) return { kind: "html", status: 200, body: productPage(t, p) };
  }
  const to = doc.redirects[joined] ?? doc.redirects[`${joined}/`];
  if (to) return { kind: "redirect", location: `${t.base}${to}` };
  return {
    kind: "html",
    status: 404,
    body: shell(t, { path: joined, title: `Page not found | ${doc.brand.name}`, description: "This page doesn't exist.", body: `<section><div class="wrap"><h1>Page not found</h1><p class="lead">That page doesn't exist.</p><a class="btn" href="${t.base || "/"}">Go to the homepage</a></div></section>` }),
  };
}
