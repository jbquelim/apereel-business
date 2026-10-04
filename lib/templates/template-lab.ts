import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { readFacets } from "../facets";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Lab": Template tier. Original design in the language of engineering-led
// appliance makers: a black top bar, light grey ground, white spec cards
// that list each product's key specs (thread, base, finish… from the shop
// filters), a dark hero band, an "explore" grid, square corners with a
// small radius. Fast and plain: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#121212;--muted:#5c5c5c;--ground:#f2f2f2;--line:#dcdcdc;--accent:${accent};--on:${onColor(accent)};--f:"Space Grotesk",system-ui,sans-serif;--b:"Inter",system-ui,sans-serif;--r:6px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ground);color:var(--ink);font:400 15.5px/1.55 var(--b);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1320px;margin:0 auto;padding-inline:clamp(16px,3vw,32px)}
.h1{font:700 clamp(32px,4.2vw,58px)/1.04 var(--f);letter-spacing:-.025em;margin:0}
.h2{font:700 clamp(24px,2.4vw,34px)/1.12 var(--f);letter-spacing:-.02em;margin:0}
.h3{font:600 17px/1.3 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 22px;border-radius:var(--r);background:var(--accent);color:var(--on);font:600 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:filter .2s}
.btn:hover{filter:brightness(.9)}.btn.ink{background:var(--ink);color:#fff}.btn.out{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}.btn.out:hover{filter:none;background:rgba(127,127,127,.12)}
.tag{display:inline-block;font:600 12px var(--f);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
/* header */
.hd{background:var(--ink);color:#fff;position:sticky;top:0;z-index:30}
.hd .w{display:flex;align-items:center;gap:26px;height:62px}
.logo{font:700 21px var(--f);letter-spacing:-.02em;text-decoration:none;flex:none}.logo img{max-height:38px;width:auto;filter:brightness(0) invert(1)}
.hd nav{display:flex;gap:22px;flex:1;white-space:nowrap;overflow:hidden;font:500 14.5px var(--f)}.hd nav a{text-decoration:none;opacity:.85}.hd nav a:hover{opacity:1}
.hd form{display:flex;align-items:center;background:#2a2a2a;border-radius:var(--r);height:38px;padding:0 4px 0 12px;width:min(300px,28vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;color:#fff;font:inherit;font-size:14px}.hd form button{border:0;background:none;color:#fff;cursor:pointer;font:600 13px var(--f);padding:0 8px}
.hd .btn{height:38px;font-size:14px;padding:0 16px}
.sub{background:#fff;border-bottom:1px solid var(--line)}.sub .w{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;height:48px;align-items:center}.sub .w::-webkit-scrollbar{display:none}
.sub a{white-space:nowrap;padding:8px 12px;border-radius:var(--r);text-decoration:none;font:500 14px var(--f)}.sub a:hover{background:var(--ground)}
/* hero */
.hero{background:var(--ink);color:#fff;border-radius:var(--r);margin-top:18px;display:grid;grid-template-columns:1fr 1fr;align-items:stretch;overflow:hidden;min-height:min(520px,70vh)}
.hero .t{padding:clamp(28px,5vw,64px);display:flex;flex-direction:column;justify-content:center}.hero .t p{color:#c8c8c8;margin:16px 0 26px;font-size:17px;max-width:520px}
.hero .acts{display:flex;gap:10px;flex-wrap:wrap}.hero .im{background:#1e1e1e;position:relative}.hero .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.specs{display:flex;gap:28px;flex-wrap:wrap;margin-top:34px;padding-top:22px;border-top:1px solid #333}.specs b{display:block;font:700 26px var(--f)}.specs span{font-size:13px;color:#a9a9a9}
/* sections */
.sec{padding-top:clamp(40px,5vw,64px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.sec .top a{font:600 14.5px var(--f);text-decoration:none}.sec .top a:hover{text-decoration:underline}
.explore{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}
.ex{display:block;background:#fff;border-radius:var(--r);overflow:hidden;text-decoration:none;border:1px solid var(--line);transition:border-color .2s}.ex:hover{border-color:var(--ink)}
.ex .ph{aspect-ratio:4/3;overflow:hidden;background:#fff}.ex .ph img{width:100%;height:100%;object-fit:cover}.ex .t{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px}.ex b{font:600 16px/1.25 var(--f)}.ex span{font-size:13px;color:var(--muted);white-space:nowrap}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.pc{display:flex;flex-direction:column;background:#fff;border-radius:var(--r);border:1px solid var(--line);overflow:hidden;text-decoration:none;transition:border-color .2s}.pc:hover{border-color:var(--ink)}
.pc .ph{aspect-ratio:1;background:#fff;overflow:hidden;border-bottom:1px solid var(--line)}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:14px 16px 16px;display:flex;flex-direction:column;flex:1}.pc h3{font:600 15.5px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc dl{margin:10px 0 0;display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:13px}.pc dt{color:var(--muted)}.pc dd{margin:0;font-weight:500;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pc .d{font-size:13.5px;color:var(--muted);margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:12px;display:flex;justify-content:space-between;align-items:center;font:700 18px var(--f)}.pc .pr i{font-style:normal;font:600 13px var(--f);color:var(--accent)}
.how{background:#fff;border-radius:var(--r);border:1px solid var(--line);display:grid;grid-template-columns:repeat(var(--n,3),1fr)}.how div{padding:clamp(20px,2.6vw,32px);border-right:1px solid var(--line)}.how div:last-child{border-right:0}
.how i{font:700 13px var(--f);font-style:normal;color:var(--accent);display:block;margin-bottom:12px}.how p{color:var(--muted);margin:8px 0 0;font-size:14.5px}
.panel{display:grid;grid-template-columns:1fr 1fr;background:#fff;border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}.panel .ph{min-height:320px}.panel .ph img{width:100%;height:100%;object-fit:cover}.panel .t{padding:clamp(24px,4vw,56px)}.panel .t div{color:var(--muted);margin:12px 0 22px}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qa details{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:0 18px}.qa summary{list-style:none;cursor:pointer;padding:16px 0;font:600 15.5px/1.4 var(--f);display:flex;justify-content:space-between;gap:14px}
.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";color:var(--accent);font-size:20px;line-height:1}.qa details[open] summary:after{content:"–"}.qa details p{margin:0 0 16px;color:var(--muted)}
.band{margin-top:clamp(40px,5vw,64px);background:var(--ink);color:#fff;border-radius:var(--r);padding:clamp(28px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.band p{color:#bdbdbd;margin:6px 0 0}
/* listing */
.crumbs{font-size:13.5px;color:var(--muted);padding-top:18px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:10px 4px}.lh p{margin:8px 0 0;max-width:760px}
.chips{display:flex;gap:6px;flex-wrap:wrap;padding-block:14px}.chips a{padding:8px 14px;background:#fff;border:1px solid var(--line);border-radius:var(--r);font:500 14px var(--f);text-decoration:none}.chips a:hover{border-color:var(--ink)}.chips a[aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.chips span{color:var(--muted);margin-left:6px;font-size:12.5px}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 14px}.res form{display:flex;background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:40px;width:260px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:600 13px var(--f);padding:0 14px;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:32px 0 6px}.pages a,.pages span{min-width:40px;height:40px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:var(--r);text-decoration:none;font:600 14px var(--f);padding:0 12px}.pages a:hover{border-color:var(--ink)}.pages [aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.pages .gap{border:0;background:none}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(20px,3vw,40px);padding-top:16px;align-items:start}
.pdp .ph{background:#fff;border-radius:var(--r);border:1px solid var(--line);overflow:hidden;aspect-ratio:1}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{background:#fff;border-radius:var(--r);border:1px solid var(--line);padding:clamp(20px,3vw,32px)}.pdp h1{font:700 clamp(24px,2.4vw,34px)/1.15 var(--f);letter-spacing:-.02em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.pdp .price{font:700 30px var(--f);margin:18px 0}.pdp .acts{display:grid;gap:8px}.pdp .btn{width:100%}
.pdp table,.det table{width:100%;border-collapse:collapse;font-size:14.5px;margin-top:18px}.pdp th,.pdp td,.det th,.det td{text-align:left;padding:9px 0;border-bottom:1px solid var(--line)}.pdp th,.det th{color:var(--muted);font-weight:500;width:45%}
.checks{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:7px;font-size:14.5px}.checks li:before{content:"✓";color:var(--accent);font-weight:700;margin-right:10px}
.det{margin-top:16px;background:#fff;border-radius:var(--r);border:1px solid var(--line);padding:clamp(20px,3vw,32px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,3vw,40px)}.det h2{font:700 19px var(--f);margin:0 0 10px}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:6px;font:600 13.5px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:11px 13px;border:1px solid #bdbdbd;border-radius:var(--r);background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:46px;padding:0 24px;border:0;border-radius:var(--r);background:var(--accent);color:var(--on);font:600 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(20px,4vw,56px);background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:clamp(20px,3vw,40px);margin-top:16px}
.facts ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:7px}
/* footer */
.ft{background:var(--ink);color:#bdbdbd;margin-top:clamp(40px,5vw,64px);padding-block:44px 22px;font-size:14px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft .logo{color:#fff}.ft h4{color:#fff;font:600 14.5px var(--f);margin:0 0 12px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.ft .base{border-top:1px solid #2c2c2c;margin-top:32px;padding-top:16px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:12.5px;color:#888}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.explore{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.hd .btn{margin-left:auto}}
@media(max-width:760px){.hero,.panel,.pdp,.det,.two,.qa{grid-template-columns:1fr}.hero .im{min-height:280px;order:-1}.how{grid-template-columns:1fr}.how div{border-right:0;border-bottom:1px solid var(--line)}.grid,.explore{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.form,.ft .cols{grid-template-columns:1fr}.pc dl{display:none}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

/** The product's key specs, in the shop's own filter labels (up to three). */
function specRows(t: RenderTarget, p: SiteProduct): [string, string][] {
  if (!t.doc.facets?.length) return [];
  const f = readFacets(p.title);
  return t.doc.facets.filter((x) => f[x.key]).slice(0, 3).map((x) => [x.label, f[x.key]]);
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#121212">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Space+Grotesk:wght@500;600;700", "Inter:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Lab template · built by Apereel</div>' : ""}
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Products</a><a href="${href(t, "/about")}">About</a>${extraLinks(t).replace(/<\/?li>/g, "")}</nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search by name or part number" aria-label="Search products"><button type="submit">Search</button></form><a class="btn" href="${href(t, "/contact")}">${t.doc.productAction === "enquire" ? "Get a quote" : "Contact"}</a></div></header>
${top.length ? `<nav class="sub" aria-label="Categories"><div class="w"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 12).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</div></nav>` : ""}
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Products</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Company</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Support</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const rows = specRows(t, p);
  return `<a class="pc" href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${rows.length ? `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : detail ? `<p class="d">${esc(detail)}</p>` : ""}<div class="pr"><span>${esc(money(p)) || '<span style="font-size:14px;font-weight:600">Price on request</span>'}</span><i>Details →</i></div></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const steps = s.steps?.items.length ? s.steps.items : s.highlights;
  const panelImg = large.find((u) => u !== cover) ?? pics[1]?.image ?? null;
  return `<div class="w"><section class="hero"><div class="t">${s.hero.eyebrow ? `<p class="tag">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">${t.doc.productAction === "enquire" ? "Get a quote" : "Contact us"}</a></div>
${s.stats.length ? `<div class="specs">${s.stats.slice(0, 3).map((x) => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}</div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>
${top.length >= 3 ? `<section class="sec"><div class="top"><h2 class="h2">Explore the range</h2><a href="${href(t, "/products")}">All products →</a></div><div class="explore" style="--n:${Math.min(4, top.length)}">${top.slice(0, 8).map((c) => `<a class="ex" href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><div class="t"><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")}</span></div></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Popular products</h2><a href="${href(t, "/products")}">View all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${steps.length >= 2 ? `<section class="sec"><div class="top"><h2 class="h2">${esc(s.steps?.heading ?? `Why ${s.brand.name}`)}</h2></div><div class="how" style="--n:${Math.min(4, steps.length)}">${steps.slice(0, 4).map((x, i) => `<div><i>${String(i + 1).padStart(2, "0")}</i><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="panel">${panelImg ? `<div class="ph">${img(panelImg, s.story.heading)}</div>` : ""}<div class="t"${panelImg ? "" : ' style="grid-column:1/-1"'}><p class="tag">About ${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ink" href="${href(t, "/about")}">Learn more</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="top"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="band"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}</div>`;
}

function pageLinks(n: number, current: number, to: (n: number) => string) {
  const show = [...new Set([1, n, current - 1, current, current + 1].filter((x) => x >= 1 && x <= n))].sort((a, b) => a - b);
  const out: string[] = [];
  show.forEach((x, i) => {
    if (i && x - show[i - 1] > 1) out.push('<span class="gap">…</span>');
    out.push(x === current ? `<span aria-current="page">${x}</span>` : `<a href="${to(x)}">${x}</a>`);
  });
  return `${current > 1 ? `<a href="${to(current - 1)}" rel="prev" aria-label="Previous page">‹</a>` : ""}${out.join("")}${current < n ? `<a href="${to(current + 1)}" rel="next" aria-label="Next page">›</a>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Search results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Products</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="h1" style="font-size:clamp(26px,3vw,40px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All products"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:14px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : ""}</div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${title}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q || Object.keys(st.chosen).length > 1,
    body,
  });
}

function product(t: RenderTarget, s: Slots, p: SiteProduct): string {
  const url = `${t.origin}/products/${p.slug}`;
  const cat = t.doc.categories.find((c) => c.slug === p.category) ?? null;
  const { name, detail } = splitTitle(p.title);
  const action = productAction(t, p, url, "btn");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const rows = [...specRows(t, p), ...(p.specs ?? []).map((r) => [r.label, r.value] as [string, string])];
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Products</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="tag">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>
${rows.length ? `<table>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="det"><div><h2>Product details</h2>${paras(p.description)}</div><div><h2>Need help choosing?</h2><p class="muted">Tell us what you're fitting it to and we'll confirm it's the right part.</p><a class="btn ink" href="${href(t, action.enquire ? "#enquire" : "/contact")}">Ask us</a></div></section>
${action.enquire ? `<section id="enquire"><div class="two"><div><h2 class="h2">Request a quote</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">Related products</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><section class="hero"><div class="t"><p class="tag">About ${esc(s.brand.name)}</p><h1 class="h1" style="font-size:clamp(28px,3.4vw,46px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:16.5px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="sec"><div class="how" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h, i) => `<div><i>${String(i + 1).padStart(2, "0")}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / Contact</p><section class="two"><div class="facts"><h1 class="h1" style="font-size:clamp(28px,3vw,42px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
  const meta = t.doc.pages.find((x) => x.slug === "contact");
  return page(t, s, { path: "/contact", title: meta?.metaTitle ?? `Contact | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

export function render(t: RenderTarget, path: string[], query: URLSearchParams): RenderResult | null {
  const s = slots(t.doc);
  const joined = `/${path.join("/")}`.replace(/\/+$/, "") || "/";
  const html = (body: string): RenderResult => ({ kind: "html", status: 200, body });
  if (joined === "/") {
    const meta = t.doc.pages.find((x) => x.slug === "");
    return html(page(t, s, { path: "/", title: meta?.metaTitle ?? s.brand.name, description: meta?.metaDescription ?? s.brand.tagline, body: home(t, s), jsonLd: [{ "@context": "https://schema.org", "@type": "Organization", name: s.brand.name, url: t.origin, ...(s.brand.logo ? { logo: s.brand.logo } : {}) }] }));
  }
  if (joined === "/about") return html(about(t, s));
  if (joined === "/contact") return html(contact(t, s));
  const cp = contentPage(t, joined);
  if (cp) return html(page(t, s, { path: joined, title: cp.metaTitle || metaTitle(cp.title, s.brand.name), description: cp.metaDescription, body: `<section class="w" style="background:#fff;border-radius:6px;margin-top:18px">${articleBody(t, cp)}</section>` }));
  if (joined === "/products") return html(listing(t, s, null, query)!);
  if (path[0] === "collections" && path[1]) {
    const r = listing(t, s, path[1], query);
    if (r) return html(r);
  }
  if (path[0] === "products" && path[1]) {
    const p = t.catalog?.kind === "product" ? t.catalog.product : t.doc.products.find((x) => x.slug === path[1]);
    if (p) return html(product(t, s, p));
  }
  return null;
}
