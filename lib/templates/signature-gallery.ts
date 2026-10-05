import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Gallery": Signature tier. Original design in the language of avant-garde
// fashion and eyewear houses that treat stores as art spaces: stark
// monochrome, an asymmetric off-grid layout, products shown as numbered
// "exhibits" with wall-label captions, a slow scrolling text band, oversized
// index numerals.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#0a0a0a;--muted:#7b7b7b;--wall:#f3f2ef;--line:#d9d8d4;--accent:${accent};--on:${onColor(accent)};--f:"Space Grotesk",system-ui,sans-serif;--m:"IBM Plex Mono",ui-monospace,monospace}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 15.5px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1600px;margin:0 auto;padding-inline:clamp(16px,3.6vw,56px)}
.mono{font:400 12px/1.5 var(--m);letter-spacing:.06em;text-transform:uppercase;margin:0}
.display{font:500 clamp(46px,8vw,140px)/.86 var(--f);letter-spacing:-.05em;margin:0}
.h2{font:500 clamp(32px,4vw,64px)/.95 var(--f);letter-spacing:-.04em;margin:0}
.lead{font-size:clamp(16px,1.2vw,18px);color:var(--muted);max-width:520px}
.btn{display:inline-flex;align-items:center;gap:12px;height:48px;padding:0 24px;background:var(--ink);color:#fff;font:400 12.5px var(--m);letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border:1px solid var(--ink);cursor:pointer;transition:background .2s,color .2s}
.btn:hover{background:#fff;color:var(--ink)}.btn.line{background:transparent;color:inherit;border-color:currentColor}.btn.line:hover{background:var(--ink);color:#fff}
.btn:after{content:"↗"}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--ink)}
.hd .w{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:30px;height:60px}
.logo{font:700 20px var(--f);letter-spacing:-.03em;text-transform:uppercase;text-decoration:none}.logo img{max-height:32px;width:auto}
.hd nav{display:flex;gap:24px;font:400 12.5px var(--m);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none}.hd nav a:hover{background:var(--ink);color:#fff}
.hd .r{display:flex;gap:18px;align-items:center;font:400 12.5px var(--m);text-transform:uppercase}.hd .r a{text-decoration:none}
.hd form{display:flex;border-bottom:1px solid var(--ink)}.hd form input{border:0;outline:none;background:none;font:400 12.5px var(--m);width:140px;padding:4px 0}.hd form button{border:0;background:none;cursor:pointer;font:400 12.5px var(--m)}
.burger{display:none;cursor:pointer;font:400 12.5px var(--m);text-transform:uppercase}#nav{display:none}.drawer{display:none;position:fixed;inset:60px 0 0;z-index:29;background:#fff;overflow:auto;padding:20px clamp(16px,3.6vw,56px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:10px 0;font:500 clamp(34px,8vw,60px)/1.05 var(--f);letter-spacing:-.04em;text-decoration:none}
/* hero */
.hero{display:grid;grid-template-columns:repeat(12,1fr);gap:clamp(10px,1.4vw,20px);padding-block:clamp(20px,3vw,44px) clamp(40px,6vw,90px);align-items:end}
.hero .t{grid-column:1/7;grid-row:1}.hero .lead{margin:22px 0 28px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero .a{grid-column:7/13;grid-row:1/3;aspect-ratio:4/5;overflow:hidden;background:var(--wall)}.hero .b{grid-column:3/7;grid-row:2;aspect-ratio:1;overflow:hidden;background:var(--wall);margin-top:clamp(20px,3vw,40px)}
.hero .a img,.hero .a video,.hero .b img{width:100%;height:100%;object-fit:cover}
.hero .idx{grid-column:1/3;grid-row:2;align-self:start;margin-top:clamp(20px,3vw,40px)}
/* band */
.band{border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);overflow:hidden;white-space:nowrap;padding-block:16px}
.band div{display:inline-block;animation:slide 40s linear infinite;font:500 clamp(28px,3.4vw,52px)/1 var(--f);letter-spacing:-.04em}
.band span{margin-inline:clamp(18px,2vw,36px)}.band i{font-style:normal;color:var(--accent)}
@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
/* exhibits */
.sec{padding-block:clamp(56px,8vw,130px)}.head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(28px,3.4vw,48px)}.head a{font:400 12.5px var(--m);text-transform:uppercase;text-decoration:none;border-bottom:1px solid currentColor}
.exhibits{display:grid;grid-template-columns:repeat(12,1fr);gap:clamp(24px,3vw,48px) clamp(10px,1.4vw,20px)}
.ex{display:block;text-decoration:none}.ex:nth-child(6n+1){grid-column:1/6}.ex:nth-child(6n+2){grid-column:7/11;margin-top:clamp(40px,8vw,140px)}.ex:nth-child(6n+3){grid-column:11/13;margin-top:clamp(10px,2vw,30px)}
.ex:nth-child(6n+4){grid-column:2/5}.ex:nth-child(6n+5){grid-column:6/9;margin-top:clamp(30px,5vw,90px)}.ex:nth-child(6n+6){grid-column:9/13}
.ex .ph{aspect-ratio:4/5;overflow:hidden;background:var(--wall)}.ex .ph img{width:100%;height:100%;object-fit:cover;filter:grayscale(.15);transition:filter .6s,transform 1.2s cubic-bezier(.2,.7,.2,1)}.ex:hover .ph img{filter:none;transform:scale(1.03)}
.label{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin-top:12px;font:400 12px/1.45 var(--m);text-transform:uppercase}.label b{font-weight:500;color:var(--accent)}.label span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.label em{grid-column:2;font-style:normal;color:var(--muted)}
.rooms{display:grid;grid-template-columns:repeat(var(--n,3),1fr);border-top:1px solid var(--ink)}
.room{display:block;text-decoration:none;padding:20px 20px 28px;border-right:1px solid var(--ink);transition:background .25s}.room:last-child{border-right:0}.room:hover{background:var(--ink);color:#fff}
.room .n{font:500 clamp(54px,6vw,104px)/.85 var(--f);letter-spacing:-.05em}.room .ph{aspect-ratio:1;overflow:hidden;margin:18px 0;background:var(--wall)}.room .ph img{width:100%;height:100%;object-fit:cover}.room h3{font:500 22px/1.1 var(--f);letter-spacing:-.02em;margin:0}.room span{font:400 12px var(--m);text-transform:uppercase;color:var(--muted)}
.statement{display:grid;grid-template-columns:repeat(12,1fr);gap:20px}.statement .t{grid-column:2/9}.statement .lead{margin:20px 0 26px}.statement .ph{grid-column:9/13;aspect-ratio:3/4;overflow:hidden;background:var(--wall)}.statement .ph img{width:100%;height:100%;object-fit:cover}
.notes{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:20px}.notes div{border-top:1px solid var(--ink);padding-top:18px}.notes h3{font:500 20px/1.2 var(--f);margin:10px 0 0}.notes p{color:var(--muted);margin:8px 0 0}
.faq{max-width:980px}.faq details{border-top:1px solid var(--ink)}.faq details:last-child{border-bottom:1px solid var(--ink)}.faq summary{list-style:none;cursor:pointer;padding:20px 0;display:grid;grid-template-columns:60px 1fr auto;gap:16px;font:500 19px/1.35 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary i{font:400 12px var(--m);font-style:normal;color:var(--muted);padding-top:5px}.faq summary:after{content:"+";font:400 22px/1 var(--m)}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px 76px;color:var(--muted)}
.closing{background:var(--ink);color:#fff}.closing .w{padding-block:clamp(60px,9vw,150px)}.closing .lead{color:#a5a5a5;margin:20px 0 30px}.closing .btn{background:#fff;color:var(--ink);border-color:#fff}.closing .btn:hover{background:transparent;color:#fff}
/* listing */
.lh{padding-block:clamp(36px,5vw,80px) 10px}.crumbs{margin:0 0 18px}.crumbs a{text-decoration:none}.lh .lead{margin:18px 0 0}
.tabs{display:flex;gap:4px 22px;flex-wrap:wrap;padding-block:24px;border-bottom:1px solid var(--ink);margin-bottom:22px}.tabs a{font:400 12.5px var(--m);text-transform:uppercase;text-decoration:none;padding:4px 0}.tabs a:hover,.tabs a[aria-current]{background:var(--ink);color:#fff}.tabs span{color:var(--muted);margin-left:6px}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:20px}.res form{display:flex;border-bottom:1px solid var(--ink);min-width:min(320px,100%)}.res input{flex:1;border:0;outline:none;background:none;font:inherit;padding:8px 0;min-width:0}.res button{border:0;background:none;cursor:pointer;font:400 12.5px var(--m);text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(24px,3vw,40px) clamp(10px,1.4vw,20px)}.grid .ex{grid-column:auto!important;margin-top:0!important}
.pager{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:56px;font:400 12.5px var(--m);text-transform:uppercase}
/* product */
.pdp{display:grid;grid-template-columns:repeat(12,1fr);gap:clamp(10px,1.4vw,20px);padding-block:clamp(20px,3vw,40px) clamp(48px,6vw,90px);align-items:start}.pdp>*{min-width:0}
.pdp .ph{grid-column:1/8;aspect-ratio:4/5;overflow:hidden;background:var(--wall)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{grid-column:9/13;position:sticky;top:90px}.pdp h1{font:500 clamp(30px,3vw,48px)/.98 var(--f);letter-spacing:-.04em;margin:14px 0 0}.pdp .d{color:var(--muted);margin:12px 0 0}
.pdp .price{font:400 16px var(--m);margin:22px 0 24px}.pdp .btn{width:100%;justify-content:space-between}
.pdp ul{list-style:none;padding:0;margin:26px 0 0;border-top:1px solid var(--ink)}.pdp li{padding:12px 0;border-bottom:1px solid var(--line);font:400 12.5px/1.5 var(--m);text-transform:uppercase}
.det{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;border-top:1px solid var(--ink);padding-block:clamp(40px,6vw,90px)}.det .a{grid-column:1/5}.det .b{grid-column:6/12;min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:16px}.det th,.det td{text-align:left;padding:12px 0;border-bottom:1px solid var(--line);font-size:14.5px}.det th{font:400 12px var(--m);text-transform:uppercase;color:var(--muted);width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:400 12px var(--m);text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:inherit;background:transparent;border:0;border-bottom:1px solid currentColor;padding:10px 0;outline:none;text-transform:none}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 24px;background:var(--ink);color:#fff;border:1px solid var(--ink);font:400 12.5px var(--m);text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(40px,6vw,90px);border-top:1px solid var(--ink)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:10px;font-size:17px}
/* footer */
.ft{border-top:1px solid var(--ink);padding-block:50px 24px}
.ft .big{font:500 clamp(60px,14vw,240px)/.8 var(--f);letter-spacing:-.06em;text-transform:uppercase;margin:0 0 40px;overflow:hidden;white-space:nowrap;text-overflow:clip}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;font:400 12.5px/1.8 var(--m);text-transform:uppercase}.ft h4{font:inherit;color:var(--muted);margin:0 0 8px}.ft ul{list-style:none;padding:0;margin:0}.ft a{text-decoration:none}.ft a:hover{background:var(--ink);color:#fff}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transition:opacity 1.2s ease}[data-r].in{opacity:1}
@media(max-width:1100px){.hd nav,.hd form{display:none}.burger{display:block}.hd .w{grid-template-columns:auto 1fr auto auto}.grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:820px){.hero{grid-template-columns:1fr 1fr}.hero .t{grid-column:1/-1}.hero .a{grid-column:1/-1;grid-row:auto}.hero .b{grid-column:2;grid-row:auto;margin-top:0}.hero .idx{grid-column:1;grid-row:auto;margin-top:0}
.exhibits{grid-template-columns:1fr 1fr}.ex{grid-column:auto!important;margin-top:0!important}.rooms,.notes{grid-template-columns:1fr}.room{border-right:0;border-bottom:1px solid var(--ink)}.statement .t,.statement .ph,.pdp .ph,.pdp .info,.det .a,.det .b{grid-column:1/-1}.statement{grid-template-columns:1fr}.pdp .info{position:static}.two{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form{grid-template-columns:1fr}.faq summary{grid-template-columns:1fr auto}.faq summary i{display:none}.faq details p{margin-left:0}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el){o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Space+Grotesk:wght@400;500;700", "IBM+Plex+Mono:wght@400;500"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Gallery template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Index</a>${top.slice(0, 5).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a></nav><div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">→</button></form><a href="${href(t, "/contact")}">Contact</a></div><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Index</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><p class="big" aria-hidden="true">${esc(s.brand.name)}</p><div class="cols">
<div><h4>Index</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div>
<div><h4>Contact</h4><ul><li><a href="${href(t, "/contact")}">Write to us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>©${new Date().getFullYear()}</h4><ul><li>${esc(s.brand.tagline)}</li></ul></div></div></div></footer>
${JS}</body></html>`;
}

function ex(t: RenderTarget, p: SiteProduct, n: number, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="ex"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="label"><b>${String(n).padStart(3, "0")}</b><span>${esc(name)}</span>${detail ? `<em>${esc(detail.slice(0, 60))}</em>` : ""}${money(p) ? `<em>${esc(money(p))}</em>` : ""}</div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const a = s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true);
  const bImg = large.find((u) => u !== cover) ?? pics.find((p) => p.image !== (cover ?? s.hero.image))?.image ?? null;
  const words = [s.brand.name, ...top.slice(0, 5).map((c) => shortName(c.name))];
  const statementImg = large[2] ?? pics[6]?.image ?? null;
  return `<section class="w hero"><div class="t" data-r>${s.hero.eyebrow ? `<p class="mono">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:16px">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:26px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></div><div class="a" data-r>${a}</div>${bImg ? `<div class="b" data-r>${img(bImg, s.brand.name)}</div>` : ""}<p class="mono idx">Exhibition ${new Date().getFullYear()}<br>${(s.doc.catalogSize ?? s.doc.products.length).toLocaleString("en-US")} pieces</p></section>
<div class="band" aria-hidden="true"><div>${[...words, ...words].map((w, i) => `<span>${esc(w)}</span><i>✦</i>`).join("")}</div></div>
${pics.length >= 3 ? `<section class="w sec"><div class="head"><div><p class="mono">Current exhibition</p><h2 class="h2" style="margin-top:12px">Selected works</h2></div><a href="${href(t, "/products")}">Full index</a></div><div class="exhibits">${pics.slice(0, 6).map((p, i) => ex(t, p, i + 1)).join("")}</div></section>` : ""}
${top.length >= 2 ? `<section class="w sec" style="padding-top:0"><p class="mono" style="margin-bottom:20px">Rooms</p><div class="rooms" style="--n:${Math.min(3, top.length)}">${top.slice(0, 3).map((c, i) => `<a class="room" href="${href(t, `/collections/${c.slug}`)}"><div class="n">${String(i + 1).padStart(2, "0")}</div><div class="ph">${img(c.image, c.name)}</div><h3>${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} pieces</span></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="statement"><div class="t" data-r><p class="mono">Statement</p><h2 class="h2" style="margin-top:14px">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn line" href="${href(t, "/about")}">Read more</a></div>${statementImg ? `<div class="ph" data-r>${img(statementImg, s.story.heading)}</div>` : ""}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="notes" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div data-r><p class="mono">Note ${String(i + 1).padStart(2, "0")}</p><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><p class="mono" style="margin-bottom:20px">${esc(s.faq.heading)}</p><div class="faq">${s.faq.items.map((f, i) => `<details><summary><i>Q${String(i + 1).padStart(2, "0")}</i><span>${esc(f.q)}</span></summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="closing"><div class="w" data-r><p class="mono" style="color:#a5a5a5">${esc(s.brand.name)}</p><h2 class="display" style="font-size:clamp(40px,6vw,104px);margin-top:16px">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:30px"></div>'}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "Index";
  const offset = (st.page - 1) * PER_PAGE;
  const body = `<section class="w lh"><p class="mono crumbs"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(44px,7vw,120px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Rooms">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "Index"))}</a>` : ""}${tabs.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:24px;border-bottom:1px solid var(--ink);margin-bottom:22px"></div>'}
<div class="res"><span class="mono">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the index"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p, i) => ex(t, p, offset + i + 1, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Write to us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></section>`;
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
  const body = `<section class="w pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info"><p class="mono"><a href="${href(t, "/products")}" style="text-decoration:none">Index</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}" style="text-decoration:none">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="det"><div class="a"><p class="mono">Wall text</p><h2 class="h2" style="font-size:clamp(24px,2.4vw,36px);margin-top:12px">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "piece"}</h2></div><div class="b">${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two"><div><p class="mono">Enquire</p><h2 class="h2" style="margin-top:12px">Ask about this piece</h2><p class="lead" style="margin-top:16px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="head"><h2 class="h2">In the same room</h2></div><div class="grid">${related.map((r, i) => ex(t, r, i + 1, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w lh"><p class="mono">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(40px,6vw,104px);margin-top:16px">${esc(st?.heading ?? s.brand.tagline)}</h1></section>
<section class="w sec" style="padding-top:30px"><div class="statement">${st ? `<div class="t"><div class="lead" style="font-size:18px;max-width:640px">${paras(st.body)}</div></div>` : ""}${visual ? `<div class="ph">${img(visual, s.brand.name, "", true)}</div>` : ""}</div></section>
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="notes" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div data-r><p class="mono">Note ${String(i + 1).padStart(2, "0")}</p><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="mono">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(40px,6vw,104px);margin-top:16px">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two" style="margin-top:30px"><div class="facts"><p class="mono">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
