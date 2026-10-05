import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Edge": Custom tier. Original design in the language of precision
// performance brands: crisp white with graphite, angular cut panels, a
// diagonal split hero, a "choose by" quick bar of main categories, a
// performance stats band, cards with a clipped corner.

const PER_PAGE = 24;
const CLIP = "polygon(0 0,100% 0,100% calc(100% - 26px),calc(100% - 26px) 100%,0 100%)";

function css(accent: string) {
  return `
:root{--ink:#121315;--graph:#25282c;--muted:#666a70;--soft:#f1f2f3;--line:#dcdee1;--accent:${accent};--on:${onColor(accent)};--f:"Exo 2",system-ui,sans-serif;--b:"Inter",system-ui,sans-serif;--clip:${CLIP}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.6 var(--b);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1480px;margin:0 auto;padding-inline:clamp(16px,4vw,64px)}
.kick{font:700 12.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin:0 0 14px}
.display{font:800 clamp(40px,5.8vw,90px)/.95 var(--f);letter-spacing:-.02em;text-transform:uppercase;font-style:italic;margin:0}
.h2{font:800 clamp(28px,3.2vw,48px)/1 var(--f);letter-spacing:-.015em;text-transform:uppercase;margin:0}
.h3{font:700 19px/1.2 var(--f);text-transform:uppercase;margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);color:var(--muted);max-width:580px;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 30px;background:var(--accent);color:var(--on);font:700 14px var(--f);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);transition:filter .2s}
.btn:hover{filter:brightness(1.1)}.btn.dark{background:var(--ink);color:#fff}.btn.ghost{background:transparent;color:inherit;clip-path:none;box-shadow:inset 0 0 0 1.5px currentColor}.btn.sm{height:40px;padding:0 20px;font-size:12.5px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:30px;height:70px}
.logo{font:800 italic 24px var(--f);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap}.logo img{max-height:38px;width:auto}
.hd nav{display:flex;gap:26px;flex:1;white-space:nowrap;overflow:hidden;font:700 13.5px var(--f);letter-spacing:.12em;text-transform:uppercase}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--accent)}
.hd form{display:flex;align-items:center;background:var(--soft);height:40px;padding:0 4px 0 12px}.hd form input{border:0;background:none;outline:none;font:inherit;font-size:14px;width:170px}.hd form button{border:0;background:var(--ink);color:#fff;height:32px;padding:0 12px;font:700 12px var(--f);letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 14px var(--f);text-transform:uppercase;letter-spacing:.1em}#nav{display:none}.drawer{display:none;position:fixed;inset:70px 0 0;z-index:29;background:#fff;overflow:auto;padding:16px clamp(16px,4vw,64px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:14px 0;border-bottom:1px solid var(--line);font:800 italic 26px var(--f);text-transform:uppercase;text-decoration:none}
/* hero */
.hero{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:min(84vh,840px);background:var(--graph);color:#fff;overflow:hidden}
.hero .t{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;padding:clamp(30px,5vw,90px) clamp(16px,4vw,64px)}.hero .lead{color:#c2c6cb;margin:22px 0 32px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.hero .im{position:relative;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%);background:#30343a}.hero .im img,.hero .im video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero:after{content:"";position:absolute;left:46%;top:0;bottom:0;width:6px;background:var(--accent);transform:skewX(-10deg);z-index:1}
/* quick bar */
.quick{display:grid;grid-template-columns:repeat(var(--n,5),1fr);border-bottom:1px solid var(--line)}.quick a{display:flex;flex-direction:column;gap:2px;padding:20px 22px;border-right:1px solid var(--line);text-decoration:none;transition:background .2s}.quick a:last-child{border-right:0}.quick a:hover{background:var(--soft)}
.quick b{font:800 italic 18px/1.15 var(--f);text-transform:uppercase}.quick span{font-size:13px;color:var(--muted)}.quick b:after{content:" →";color:var(--accent)}
/* sections */
.sec{padding-block:clamp(60px,8vw,120px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(24px,3vw,40px)}.sec .top a{font:700 13px var(--f);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;color:var(--accent)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pc{display:flex;flex-direction:column;background:var(--soft);text-decoration:none;clip-path:var(--clip);transition:background .2s}.pc:hover{background:#e7e9eb}
.pc .ph{aspect-ratio:1;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc .t{padding:18px 20px 26px;display:flex;flex-direction:column;flex:1}.pc h3{font:700 16.5px/1.25 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13.5px;color:var(--muted);margin:5px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:12px;font:800 italic 20px var(--f)}
.band{background:var(--ink);color:#fff}.band .w{display:grid;grid-template-columns:repeat(var(--n,3),1fr)}.band div{padding:clamp(36px,5vw,72px) 24px;border-right:1px solid #2e3136}.band div:last-child{border-right:0}
.band b{display:block;font:800 italic clamp(44px,5vw,84px)/.9 var(--f);color:var(--accent)}.band span{font:700 12.5px var(--f);letter-spacing:.18em;text-transform:uppercase;color:#b5b9be}
.panels{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:16px}
.panel{position:relative;display:block;aspect-ratio:4/5;overflow:hidden;background:var(--soft);clip-path:var(--clip);color:#fff;text-decoration:none}.panel img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.panel:hover img{transform:scale(1.05)}
.panel:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65))}.panel .t{position:absolute;left:22px;right:22px;bottom:24px;z-index:1}.panel .t span{display:block;font-size:14px;opacity:.85;margin-top:4px}
.story{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(28px,5vw,96px);align-items:center}.story .ph{aspect-ratio:4/3;overflow:hidden;background:var(--soft);clip-path:var(--clip)}.story .ph img{width:100%;height:100%;object-fit:cover}.story .lead{margin:18px 0 28px}
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.feats div{border-left:4px solid var(--accent);background:var(--soft);padding:clamp(22px,2.6vw,34px)}.feats p{color:var(--muted);margin:10px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,90px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:20px 0;display:flex;justify-content:space-between;gap:20px;font:700 17px/1.35 var(--f);text-transform:uppercase}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";color:var(--accent);font-size:24px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted)}
.closing{background:var(--graph);color:#fff;position:relative;overflow:hidden}.closing:before{content:"";position:absolute;right:-10%;top:0;bottom:0;width:40%;background:var(--accent);transform:skewX(-14deg);opacity:.9}
.closing .w{position:relative;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding-block:clamp(56px,7vw,110px)}.closing .lead{color:#c2c6cb;margin-top:12px}.closing .btn{background:#fff;color:var(--ink)}
/* listing */
.lh{padding-block:clamp(36px,5vw,72px) 10px}.crumbs{font:600 13.5px var(--b);color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin-top:14px}
.chips{display:flex;gap:8px;flex-wrap:wrap;padding-block:24px}.chips a{padding:10px 18px;background:var(--soft);font:700 13px var(--f);letter-spacing:.08em;text-transform:uppercase;text-decoration:none;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}.chips a:hover{background:#e3e5e8}.chips a[aria-current]{background:var(--ink);color:#fff}.chips span{opacity:.6;margin-left:6px}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px}.res form{display:flex;background:var(--soft)}.res input{border:0;outline:none;font:inherit;background:none;padding:0 14px;height:44px;width:300px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:700 13px var(--f);letter-spacing:.1em;text-transform:uppercase;padding:0 18px;cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:50px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.3fr .7fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:22px clamp(48px,6vw,90px)}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:4/3;overflow:hidden;background:var(--soft);clip-path:var(--clip)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:92px}.pdp h1{font:800 italic clamp(28px,2.8vw,44px)/1 var(--f);text-transform:uppercase;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{font:800 italic 32px var(--f);margin:20px 0 22px}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:8px}.pdp li{border-left:3px solid var(--accent);background:var(--soft);padding:10px 14px;font-size:14.5px}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}.det>*{min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:18px}.det th,.det td{text-align:left;padding:13px 0;border-bottom:1px solid var(--line)}.det th{font:700 12.5px var(--f);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:700 12.5px var(--f);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:13px 14px;border:0;border-bottom:2px solid var(--line);background:var(--soft);letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{outline:none;border-color:var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 30px;border:0;background:var(--accent);color:var(--on);font:700 14px var(--f);letter-spacing:.14em;text-transform:uppercase;cursor:pointer;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(40px,5vw,80px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
/* footer */
.ft{background:var(--ink);color:#a9adb2;padding-block:56px 28px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft .logo{color:#fff}.ft p{max-width:320px}.ft h4{color:#fff;font:700 14px var(--f);letter-spacing:.14em;text-transform:uppercase;margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px}.ft a{text-decoration:none}.ft a:hover{color:var(--accent)}
.ft .base{margin-top:40px;padding-top:18px;border-top:1px solid #2a2d31;font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(20px);transition:opacity .8s ease,transform .8s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:820px){.hero,.story,.faq,.pdp,.det,.two{grid-template-columns:1fr}.hero .im{min-height:320px;order:-1;clip-path:polygon(0 0,100% 0,100% 88%,0 100%)}.hero:after{display:none}.pdp .info{position:static}.quick{grid-template-columns:1fr 1fr}.quick a{border-bottom:1px solid var(--line)}.panels,.feats{grid-template-columns:1fr}.band .w{grid-template-columns:1fr}.band div{border-right:0;border-bottom:1px solid #2e3136}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -5% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%4)*70+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Exo+2:ital,wght@0,700;0,800;1,700;1,800", "Inter:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Edge template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Range</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/contact")}">Contact</a></nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Go</button></form><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Range</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Range</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "On request"}</span></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const withImg = top.filter((c) => c.image);
  const media = s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true);
  const storyImg = large.find((u) => u !== cover) ?? pics[3]?.image ?? null;
  return `<section class="hero"><div class="t" data-r>${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:28px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div><div class="im">${media}</div></section>
${top.length >= 3 ? `<nav class="quick" style="--n:${Math.min(5, top.length)}" aria-label="Choose by category">${top.slice(0, 5).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></a>`).join("")}</nav>` : ""}
${s.featured.length ? `<section class="w sec"><div class="top"><div><p class="kick">Featured</p><h2 class="h2" data-r>Best sellers</h2></div><a href="${href(t, "/products")}">View all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.stats.length >= 2 ? `<section class="band"><div class="w" style="--n:${Math.min(3, s.stats.length)}">${s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${withImg.length >= 3 ? `<section class="w sec"><div class="top"><div><p class="kick">Explore</p><h2 class="h2" data-r>Explore the range</h2></div></div><div class="panels" style="--n:3">${withImg.slice(0, 3).map((c) => `<a class="panel" data-r href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="t"><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} products →</span></div></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec"${withImg.length >= 3 ? ' style="padding-top:0"' : ""}><div class="story">${storyImg ? `<div class="ph" data-r>${img(storyImg, s.story.heading)}</div>` : ""}<div${storyImg ? "" : ' style="grid-column:1/-1"'} data-r><p class="kick">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn dark" href="${href(t, "/about")}">About us</a></div></div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="feats">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="kick">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="closing"><div class="w"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results: ${st.q}` : st.cat ? shortName(st.cat.name) : "The range";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,66px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:24px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the range"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn ghost" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products"}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Explore ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
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
  const body = `<div class="w"><p class="crumbs" style="padding-top:20px"><a href="${href(t, "/products")}">Range</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="det"><div><p class="kick">Details</p><h2 class="h2" style="font-size:clamp(22px,2.2vw,32px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></section>
${action.enquire ? `<section id="enquire" class="two" style="border-top:1px solid var(--line)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</section>` : ""}
${related.length ? `<section class="sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Also in the range</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero" style="min-height:min(60vh,600px)"><div class="t"><p class="kick">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(32px,4.2vw,64px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="w sec"><div style="max-width:820px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="feats">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><p class="kick">Contact</p><h1 class="display" style="font-size:clamp(30px,3.6vw,54px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
