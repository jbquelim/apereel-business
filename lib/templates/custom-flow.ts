import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Flow": Custom tier. Original design in the language of modern active
// brands: clean white, one big image hero with a headline on it and two
// promo tiles beside it, rounded cards, soft grey panels, a values strip,
// friendly medium-weight type, the brand colour on small details.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#16171a;--muted:#6b6e75;--soft:#f4f4f2;--line:#e6e6e3;--accent:${accent};--on:${onColor(accent)};--f:"Manrope",system-ui,sans-serif;--r:18px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:500 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(16px,3vw,40px)}
.display{font:800 clamp(38px,5.2vw,76px)/1.02 var(--f);letter-spacing:-.035em;margin:0}
.h2{font:800 clamp(26px,2.8vw,40px)/1.1 var(--f);letter-spacing:-.025em;margin:0}
.h3{font:700 18px/1.3 var(--f);margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);color:var(--muted);max-width:600px;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:50px;padding:0 26px;border-radius:999px;background:var(--ink);color:#fff;font:700 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:transform .2s,background .2s}
.btn:hover{transform:translateY(-1px)}.btn.white{background:#fff;color:var(--ink)}.btn.acc{background:var(--accent);color:var(--on)}.btn.line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line)}.btn.line:hover{box-shadow:inset 0 0 0 1.5px var(--ink)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-right:10px;vertical-align:middle}
/* header */
.promo{background:var(--ink);color:#fff;text-align:center;font:600 13px var(--f);padding:9px 16px}
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:26px;height:70px}
.logo{font:800 22px var(--f);letter-spacing:-.03em;text-decoration:none;flex:none}.logo img{max-height:40px;width:auto}
.hd nav{display:flex;gap:6px;flex:1;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none;font:700 14.5px var(--f);padding:9px 14px;border-radius:999px}.hd nav a:hover{background:var(--soft)}
.hd form{display:flex;align-items:center;background:var(--soft);border-radius:999px;height:42px;padding:0 6px 0 16px;width:min(280px,26vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:var(--ink);color:#fff;border-radius:999px;height:32px;padding:0 14px;font:700 13px var(--f);cursor:pointer}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 15px var(--f)}#nav{display:none}
.drawer{display:none;position:fixed;inset:0;z-index:40;background:#fff;padding:20px;overflow:auto}#nav:checked~.drawer{display:block}.drawer .x{display:block;text-align:right;font-weight:700;cursor:pointer;margin-bottom:20px}.drawer a{display:block;padding:14px 4px;border-bottom:1px solid var(--line);font:700 20px var(--f);text-decoration:none}
/* hero */
.hero{display:grid;grid-template-columns:2fr 1fr;gap:14px;padding-top:16px}
.big{position:relative;border-radius:var(--r);overflow:hidden;background:var(--soft);min-height:min(74vh,700px)}
.big>img,.big>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.big:after{content:"";position:absolute;inset:40% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.55))}
.big .txt{position:absolute;left:clamp(20px,3vw,48px);right:clamp(20px,3vw,48px);bottom:clamp(20px,3vw,48px);z-index:1;color:#fff}.big .txt p{color:rgba(255,255,255,.88);margin:14px 0 22px;max-width:560px;font-size:18px}
.big .eyebrow{color:#fff;opacity:.9}
.big.plain{display:grid;grid-template-columns:1fr 1fr;align-items:center}.big.plain:after{display:none}.big.plain>img{position:relative;inset:auto;width:100%;height:auto;aspect-ratio:1;object-fit:cover;order:2;align-self:center}
.big.plain .txt{position:relative;inset:auto;color:var(--ink);padding:clamp(24px,4vw,56px)}.big.plain .txt p{color:var(--muted)}.big.plain .eyebrow{color:var(--muted)}.big.plain .btn.white{background:var(--ink);color:#fff}
.tiles{display:grid;grid-template-rows:1fr 1fr;gap:14px}
.tile{position:relative;border-radius:var(--r);overflow:hidden;background:var(--soft);text-decoration:none;min-height:220px}.tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.tile:hover img{transform:scale(1.04)}
.tile span{position:absolute;left:16px;bottom:16px;z-index:1;background:#fff;border-radius:999px;padding:10px 16px;font:700 14.5px var(--f)}
.eyebrow{font:700 13px var(--f);letter-spacing:.06em;text-transform:uppercase;margin:0 0 12px;color:var(--muted)}
/* sections */
.sec{padding-top:clamp(48px,6vw,90px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}.sec .top a{font-weight:700;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.cats{display:grid;grid-template-columns:repeat(var(--n,6),1fr);gap:14px}
.cat{text-decoration:none;display:block}.cat .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--soft)}.cat .ph img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.cat:hover .ph img{transform:scale(1.05)}
.cat b{display:block;margin-top:12px;font:700 15.5px/1.3 var(--f)}.cat span{font-size:13.5px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px 14px}
.pc{text-decoration:none;display:block}.pc .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--soft);position:relative}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{padding:12px 4px 0}.pc h3{font:700 15.5px/1.35 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:14px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:6px 0 0;font-weight:800}
.vals{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:14px}.vals div{background:var(--soft);border-radius:var(--r);padding:clamp(22px,2.6vw,34px)}.vals p{color:var(--muted);margin:8px 0 0}
.vals b{display:block;font:800 clamp(30px,3vw,44px)/1 var(--f);letter-spacing:-.03em;margin-bottom:8px}
.feature{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:stretch}.feature .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);min-height:400px}.feature .ph img{width:100%;height:100%;object-fit:cover}
.feature .t{border-radius:var(--r);background:var(--soft);padding:clamp(28px,4vw,64px);display:flex;flex-direction:column;justify-content:center}.feature .lead{margin:16px 0 26px}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,80px)}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:20px 0;font:700 17px/1.4 var(--f);display:flex;justify-content:space-between;gap:16px}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-size:22px;color:var(--accent);line-height:1}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted)}
.closing{margin-top:clamp(48px,6vw,90px);border-radius:var(--r);background:var(--accent);color:var(--on);padding:clamp(36px,5vw,72px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}.closing p{margin:10px 0 0;opacity:.85}.closing .btn{background:var(--on);color:var(--accent)}
/* shop */
.sh{padding-block:clamp(24px,3vw,40px) 10px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 10px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
.sh .row{display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap}.sh .n{color:var(--muted)}
.chips{display:flex;gap:8px;overflow-x:auto;padding-block:18px 18px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}
.chips a{white-space:nowrap;padding:10px 16px;border-radius:999px;background:var(--soft);text-decoration:none;font:700 14px var(--f)}.chips a:hover{background:#e9e9e6}.chips a[aria-current]{background:var(--ink);color:#fff}.chips a span{color:var(--muted);font-weight:600;margin-left:6px}.chips a[aria-current] span{color:#bbb}
.find{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 18px;max-width:440px;flex:1}.find input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit}.find button{border:0;background:var(--ink);color:#fff;border-radius:999px;height:40px;padding:0 18px;font:700 14px var(--f);cursor:pointer}
.pager{display:flex;gap:10px;justify-content:center;align-items:center;margin-top:44px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.2fr .8fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:20px 0}
.pdp .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);aspect-ratio:1}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:90px}.pdp h1{font:800 clamp(26px,2.6vw,36px)/1.15 var(--f);letter-spacing:-.025em;margin:6px 0 0}.pdp .d{color:var(--muted);margin:8px 0 0}
.pdp .price{font:800 24px var(--f);margin:18px 0 22px}.pdp .btn{width:100%;height:56px}
.perks{display:grid;gap:8px;margin-top:20px;padding:18px;border-radius:var(--r);background:var(--soft);font-size:14.5px}.perks div{display:flex;gap:10px}.perks div:before{content:"";flex:none;width:8px;height:8px;margin-top:7px;border-radius:50%;background:var(--accent)}
.acc{margin-top:22px}.acc details{border-top:1px solid var(--line)}.acc details:last-child{border-bottom:1px solid var(--line)}.acc summary{list-style:none;cursor:pointer;padding:18px 0;font:700 16.5px var(--f);display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"+"}.acc details[open] summary:after{content:"−"}
.acc .b{padding-bottom:18px;color:#3e4046}.acc table{width:100%;border-collapse:collapse;font-size:15px}.acc th,.acc td{text-align:left;padding:8px 0;border-bottom:1px solid var(--line)}.acc th{color:var(--muted);font-weight:600;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:700 13.5px var(--f);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;font-weight:500;color:var(--ink);padding:14px 16px;border:1.5px solid var(--line);border-radius:14px;background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 28px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:700 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,80px);padding-block:clamp(36px,5vw,64px)}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--soft);margin-top:clamp(48px,6vw,90px);padding-block:56px 26px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:800 15px var(--f);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#45474d}.ft a{text-decoration:none}.ft a:hover{color:var(--ink);text-decoration:underline}
.ft .base{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.cats{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:820px){.big.plain{grid-template-columns:1fr}.big.plain>img{order:-1;height:300px}.hero,.feature,.pdp,.faq,.two{grid-template-columns:1fr}.tiles{grid-template-rows:none;grid-template-columns:1fr 1fr}.big{min-height:520px}.pdp .info{position:static}.vals{grid-template-columns:1fr}.grid,.cats{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form{grid-template-columns:1fr}.tiles{grid-template-columns:1fr}.pc .d{display:none}.ft .cols{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -5% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%4)*60+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Manrope:wght@500;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Flow template · built by Apereel</div>' : ""}
${s.promise[0] ? `<div class="promo">${esc(s.promise[0])}</div>` : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search products" aria-label="Search products"><button type="submit">Search</button></form><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer" role="dialog" aria-label="Menu"><label class="x" for="nav">Close ✕</label><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 5).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const bigMedia = s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true);
  const tiles = top.length >= 2 ? top.slice(0, 2).map((c) => ({ to: `/collections/${c.slug}`, img: c.image, label: shortName(c.name) })) : pics.slice(1, 3).map((p) => ({ to: `/products/${p.slug}`, img: p.image, label: splitTitle(p.title).name }));
  const featImg = large.find((u) => u !== cover) ?? pics[3]?.image ?? null;
  const vals = s.stats.length >= 3 ? s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><p style="margin:0">${esc(x.label)}</p></div>`) : s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`);
  return `<div class="w"><section class="hero"><div class="big${s.hero.video || cover ? "" : " plain"}">${bigMedia}<div class="txt">${s.hero.eyebrow ? `<p class="eyebrow">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:20px"></div>'}<a class="btn white" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></div>
${tiles.length === 2 ? `<div class="tiles">${tiles.map((x) => `<a class="tile" href="${href(t, x.to)}">${img(x.img, x.label)}<span>${esc(x.label)} →</span></a>`).join("")}</div>` : ""}</section>
${top.length >= 3 ? `<section class="sec"><div class="top"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">See all</a></div><div class="cats" style="--n:${Math.min(6, top.length)}">${top.slice(0, 6).map((c) => `<a class="cat" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Best sellers</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${vals.length ? `<section class="sec"><div class="vals" style="--n:${Math.min(3, vals.length)}">${vals.slice(0, 3).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="feature">${featImg ? `<div class="ph">${img(featImg, s.story.heading)}</div>` : ""}<div class="t"${featImg ? "" : ' style="grid-column:1/-1"'}><p class="eyebrow"><span class="dot"></span>Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><div><a class="btn" href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></div></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="faq"><div><p class="eyebrow">Help</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="closing"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}</div>`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "Shop all";
  const body = `<div class="w"><section class="sh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><div class="row"><div><h1 class="display" style="font-size:clamp(30px,3.6vw,52px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead" style="margin-top:10px">${esc(st.cat.description)}</p>` : ""}</div><form class="find" role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:18px"></div>'}</section>
<p class="n" style="color:var(--muted);margin:0 0 14px">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</p>${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</div>`;
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
  const body = `<div class="w"><p class="crumbs" style="padding-top:20px"><a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="eyebrow">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}
${s.promise.length ? `<div class="perks">${s.promise.map((x) => `<div>${esc(x)}</div>`).join("")}</div>` : ""}
<div class="acc"><details open><summary>Details</summary><div class="b">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="b"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section id="enquire"><div class="two" style="background:var(--soft);border-radius:var(--r);padding-inline:clamp(20px,4vw,56px);margin-top:clamp(36px,4vw,60px)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You may also like</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><section class="hero" style="grid-template-columns:1fr"><div class="big" style="min-height:min(56vh,520px)">${img(visual, s.brand.name, "", true)}<div class="txt"><p class="eyebrow">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,64px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div></div></section>
${st ? `<section class="sec"><div style="max-width:820px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="sec"><div class="vals" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><p class="eyebrow">Contact</p><h1 class="display" style="font-size:clamp(32px,3.8vw,56px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
