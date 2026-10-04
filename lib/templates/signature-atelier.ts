import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Atelier": Signature tier. Original design in the language of the great
// fashion maisons: stark white, black, tiny uppercase type, almost no
// chrome, a full-bleed two-column editorial mosaic, products on pure white
// with their names small beneath, edge-to-edge everything.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#000;--muted:#767676;--line:#e8e8e8;--tint:#f5f5f3;--accent:${accent};--on:${onColor(accent)};--f:"Figtree",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 14.5px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1600px;margin:0 auto;padding-inline:clamp(16px,3vw,48px)}
.mini{font:500 11.5px/1.4 var(--f);letter-spacing:.16em;text-transform:uppercase;margin:0}
.display{font:400 clamp(30px,3.6vw,54px)/1.12 var(--f);letter-spacing:.005em;margin:0}
.h2{font:400 clamp(24px,2.4vw,36px)/1.15 var(--f);margin:0}
.lead{font-size:15.5px;color:var(--muted);max-width:560px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 30px;border-radius:999px;background:var(--ink);color:#fff;font:500 12px var(--f);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border:1px solid var(--ink);cursor:pointer;transition:background .25s,color .25s}
.btn:hover{background:#fff;color:var(--ink)}.btn.line{background:transparent;color:inherit;border-color:currentColor}.btn.line:hover{background:var(--ink);color:#fff;border-color:var(--ink)}.btn.white{background:#fff;color:var(--ink);border-color:#fff}.btn.white:hover{background:transparent;color:#fff}
.u{text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px;font:500 11.5px var(--f);letter-spacing:.16em;text-transform:uppercase}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.97);border-bottom:1px solid transparent;transition:border-color .3s}.hd.scrolled{border-color:var(--line)}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:70px}
.logo{justify-self:center;font:500 22px var(--f);letter-spacing:.42em;text-transform:uppercase;text-decoration:none;padding-left:.42em}.logo img{max-height:40px;width:auto}
.hd .l,.hd .r{display:flex;gap:24px;align-items:center;font:500 11.5px var(--f);letter-spacing:.16em;text-transform:uppercase}.hd .r{justify-self:end}.hd a{text-decoration:none}
.hd form{display:flex;align-items:center;gap:8px}.hd form input{border:0;border-bottom:1px solid var(--line);outline:none;background:none;font:inherit;letter-spacing:normal;text-transform:none;width:150px;padding:4px 0}.hd form button{border:0;background:none;cursor:pointer;font:inherit}
.burger{cursor:pointer}#nav{display:none}
.panel{position:fixed;top:0;left:0;bottom:0;width:min(420px,92vw);z-index:40;background:#fff;transform:translateX(-102%);transition:transform .45s cubic-bezier(.2,.7,.2,1);padding:28px clamp(20px,3vw,40px);overflow:auto;box-shadow:0 0 0 100vmax rgba(0,0,0,0)}
#nav:checked~.panel{transform:none;box-shadow:0 0 0 100vmax rgba(0,0,0,.25)}.panel .x{cursor:pointer;font:500 11.5px var(--f);letter-spacing:.16em;text-transform:uppercase}
.panel ul{list-style:none;padding:0;margin:44px 0 0;display:grid;gap:4px}.panel li a{display:block;padding:10px 0;font:400 20px var(--f);text-decoration:none}.panel li a:hover{text-decoration:underline;text-underline-offset:5px}
/* hero */
.hero{position:relative;height:calc(100svh - 70px);min-height:520px;overflow:hidden;background:var(--tint);color:#fff}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero:after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.4))}
.hero .txt{position:absolute;left:0;right:0;bottom:clamp(36px,7vh,80px);z-index:1;text-align:center;padding-inline:clamp(18px,4vw,48px)}.hero .lead{color:#fff;opacity:.9;margin:14px auto 24px}
.hero.duo{display:grid;grid-template-columns:1fr 1fr;color:var(--ink);background:#fff;height:auto;min-height:0}.hero.duo:after{display:none}
.hero.duo .ph{aspect-ratio:4/5;overflow:hidden;background:var(--tint)}.hero.duo .ph img{width:100%;height:100%;object-fit:cover}
.hero.duo .txt{position:static;grid-column:1/-1;padding-block:clamp(36px,5vw,64px) clamp(20px,3vw,30px)}.hero.duo .lead{color:var(--muted);opacity:1}
/* mosaic */
.mosaic{display:grid;grid-template-columns:1fr 1fr;gap:2px}
.mo{position:relative;display:block;aspect-ratio:4/5;overflow:hidden;background:var(--tint);text-decoration:none;color:#fff}
.mo img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)}.mo:hover img{transform:scale(1.03)}
.mo:after{content:"";position:absolute;inset:60% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.35))}
.mo .cap{position:absolute;left:0;right:0;bottom:28px;z-index:1;text-align:center}.mo .cap b{display:block;font:400 clamp(20px,2vw,28px)/1.2 var(--f);margin:8px 0 12px}
.sec{padding-block:clamp(56px,7vw,110px)}.head{text-align:center;margin-bottom:clamp(28px,4vw,52px)}.head .h2{margin-top:12px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(24px,3vw,44px) 2px}
.pc{display:block;text-decoration:none;text-align:center}.pc .ph{aspect-ratio:1;overflow:hidden;background:var(--tint)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc h3{font:400 14px/1.4 var(--f);margin:14px 12px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:4px 0 0;color:var(--muted);font-size:13.5px}
.statement{text-align:center;max-width:820px;margin:0 auto}.statement .lead{margin:20px auto 28px}
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--line)}.trio div{background:#fff;padding:clamp(28px,4vw,56px) clamp(20px,3vw,40px);text-align:center}.trio p{color:var(--muted);margin:12px 0 0}
.faq{max-width:780px;margin:0 auto}.faq details{border-top:1px solid var(--line)}.faq details:last-child{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:20px 0;display:flex;justify-content:space-between;gap:20px;font:400 16px/1.45 var(--f)}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-size:20px;line-height:1}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted)}
.closing{position:relative;overflow:hidden;background:var(--ink);color:#fff;text-align:center;padding-block:clamp(70px,9vw,140px)}.closing .lead{color:#bbb;margin:16px auto 28px}
/* listing */
.lh{text-align:center;padding-block:clamp(36px,5vw,70px) 8px}.lh .lead{margin:14px auto 0}.crumbs{color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}
.tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:8px 22px;padding-block:22px}.tabs a{text-decoration:none;font:500 11.5px var(--f);letter-spacing:.14em;text-transform:uppercase;padding:6px 0;border-bottom:1px solid transparent}.tabs a:hover,.tabs a[aria-current]{border-color:var(--ink)}.tabs span{color:var(--muted);margin-left:5px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:12px;margin-bottom:20px}
.bar form{display:flex;align-items:center;gap:10px;min-width:min(320px,100%)}.bar input{flex:1;border:0;outline:none;background:none;font:inherit;padding:6px 0;min-width:0}.bar button{border:0;background:none;cursor:pointer;font:500 11.5px var(--f);letter-spacing:.14em;text-transform:uppercase}
.bar .n{color:var(--muted)}
.pager{display:flex;gap:16px;justify-content:center;align-items:center;margin-top:60px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.4fr 1fr;align-items:start}
.pdp .ph{aspect-ratio:1;overflow:hidden;background:var(--tint)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:70px;padding:clamp(28px,4vw,72px) clamp(20px,4vw,72px)}.pdp h1{font:400 clamp(24px,2.2vw,32px)/1.25 var(--f);margin:12px 0 0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{font-size:16px;margin:18px 0 26px}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:28px 0 0;border-top:1px solid var(--line)}.pdp li{padding:13px 0;border-bottom:1px solid var(--line);color:var(--muted)}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}
.det table{width:100%;border-collapse:collapse}.det th,.det td{text-align:left;padding:12px 0;border-bottom:1px solid var(--line)}.det th{font:500 11.5px var(--f);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:500 11px var(--f);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;font-size:15px;color:inherit;background:transparent;border:0;border-bottom:1px solid #bbb;padding:10px 0;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 30px;border-radius:999px;border:1px solid var(--ink);background:var(--ink);color:#fff;font:500 12px var(--f);letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:10px;font-size:16px}
/* footer */
.ft{border-top:1px solid var(--line);padding-block:56px 26px}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}.ft h4{font:500 11.5px var(--f);letter-spacing:.16em;text-transform:uppercase;margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:var(--muted)}.ft a{text-decoration:none}.ft a:hover{color:var(--ink)}
.ft .base{margin-top:56px;text-align:center}.ft .base .logo{display:inline-block;margin-bottom:14px}.ft .base p{color:var(--muted);margin:0;font-size:12.5px}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transition:opacity 1.1s ease}[data-r].in{opacity:1}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.hd form{display:none}}
@media(max-width:760px){.mosaic,.trio,.pdp,.det,.two{grid-template-columns:1fr}.hero.duo{grid-template-columns:1fr}.hero.duo .ph+.ph{display:none}.pdp .info{position:static}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.hd .l a{display:none}}
@media(max-width:520px){.form{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1}}`;
}

const JS = `<script>(function(){var h=document.querySelector(".hd");addEventListener("scroll",function(){h&&h.classList.toggle("scrolled",scrollY>8)},{passive:true});var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el){o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Figtree:wght@400;500"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Atelier template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><div class="l"><label class="burger" for="nav">☰ Menu</label><a href="${href(t, "/products")}">Collections</a></div>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">⌕</button></form><a href="${href(t, "/contact")}">Contact us</a></div></div></header>
<nav class="panel" aria-label="Menu"><label class="x" for="nav">✕ Close</label><ul><li><a href="${href(t, "/products")}">All collections</a></li>${top.slice(0, 10).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}<li><a href="${href(t, "/about")}">The maison</a></li><li><a href="${href(t, "/contact")}">Contact us</a></li></ul></nav>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols">
<div><h4>Collections</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>The maison</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div>
<div><h4>Client services</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li>${esc(s.brand.tagline)}</li></ul></div></div>
<div class="base">${logo(s, t)}<p>© ${new Date().getFullYear()} ${esc(s.brand.name)}</p></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><h3>${esc(name)}</h3>${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const txt = (white: boolean) => `<div class="txt">${s.hero.eyebrow ? `<p class="mini">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:12px">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<a class="btn ${white ? "white" : ""}" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div>`;
  const hero = cover
    ? `<section class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}${txt(true)}</section>`
    : `<section class="hero duo" style="grid-template-columns:repeat(${Math.max(1, Math.min(2, pics.length))},1fr)">${(pics.length ? pics : [{ image: s.hero.image, title: s.hero.heading }]).slice(0, 2).map((p, i) => `<div class="ph">${img(p.image, p.title, "", i === 0)}</div>`).join("")}${txt(false)}</section>`;
  const mosaic = top.slice(0, 4);
  const second = large.find((u) => u !== cover) ?? null;
  return `${hero}
${mosaic.length >= 2 ? `<section class="mosaic" style="margin-top:2px">${mosaic.slice(0, mosaic.length >= 4 ? 4 : 2).map((c) => `<a class="mo" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="cap"><p class="mini">${c.count.toLocaleString("en-US")} pieces</p><b>${esc(shortName(c.name))}</b><span class="u">Discover</span></div></a>`).join("")}</section>` : ""}
${s.story ? `<section class="w sec"><div class="statement" data-r><p class="mini">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:14px">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="u" href="${href(t, "/about")}">The maison</a></div></section>` : ""}
${second ? `<section class="hero" style="height:auto;aspect-ratio:21/9;min-height:0">${img(second, s.brand.name)}</section>` : ""}
${s.featured.length ? `<section class="w sec"><div class="head"><p class="mini">Selected</p><h2 class="h2">${esc(s.doc.catalogTotal && s.doc.catalogTotal > 50 ? "New and notable" : "The selection")}</h2></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div><p style="text-align:center;margin-top:clamp(36px,4vw,60px)"><a class="btn line" href="${href(t, "/products")}">View all</a></p></section>` : ""}
${s.highlights.length ? `<section class="trio">${s.highlights.map((h) => `<div data-r><p class="mini">${esc(h.title)}</p><p>${esc(h.body)}</p></div>`).join("")}</section>` : ""}
${s.faq?.items.length ? `<section class="w sec"><div class="head"><p class="mini">Client services</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="closing"><div class="w" data-r><p class="mini">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:14px">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:26px"></div>'}<a class="btn white" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "All collections";
  const body = `<section class="w lh"><p class="crumbs mini"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Collections">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${tabs.slice(0, 24).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:22px"></div>'}</section>
<section class="w" style="padding-bottom:clamp(56px,7vw,110px)"><div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collections"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="text-align:center;margin:40px auto">Nothing matches that yet. <a href="${href(t, "/contact")}">Contact us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</section>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products"}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Explore ${st.scopeTotal.toLocaleString("en-US")} pieces from ${s.brand.name}.`,
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
  const body = `<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info"><p class="mini" style="color:var(--muted)"><a href="${href(t, "/products")}" style="text-decoration:none">Collections</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}" style="text-decoration:none">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="det"><div><p class="mini">Details</p><h2 class="h2" style="margin-top:12px;font-size:clamp(20px,2vw,28px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "piece"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table style="margin-top:18px">${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two" style="border-top:1px solid var(--line)"><div><p class="mini">Client services</p><h2 class="h2" style="margin-top:12px">Ask about this piece</h2><p class="lead" style="margin-top:14px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="head"><p class="mini">You may also like</p></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `${visual ? `<section class="hero" style="height:clamp(280px,42vw,640px);min-height:0">${img(visual, s.brand.name, "", true)}</section>` : ""}
<section class="w sec"><div class="statement"><p class="mini">The maison</p><h1 class="display" style="margin-top:14px">${esc(st?.heading ?? s.brand.tagline)}</h1>${st ? `<div class="lead" style="text-align:left;max-width:680px;margin:26px auto 0;font-size:16.5px">${paras(st.body)}</div>` : ""}</div></section>
${s.highlights.length ? `<section class="trio">${s.highlights.map((h) => `<div data-r><p class="mini">${esc(h.title)}</p><p>${esc(h.body)}</p></div>`).join("")}</section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="mini">Client services</p><h1 class="display" style="margin-top:12px">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two"><div class="facts"><p class="mini">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
  if (cp) return html(page(t, s, { path: joined, title: cp.metaTitle || metaTitle(cp.title, s.brand.name), description: cp.metaDescription, body: `<section class="w">${articleBody(t, cp)}</section>` }));
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
