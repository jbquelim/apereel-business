import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Chrono": Signature tier. Original design in the language of
// performance watchmakers: deep charcoal, precise geometric type, a ring of
// tick marks behind the hero product, numbered collections in a racing
// strip, technical spec rows, the brand colour as a single hot accent.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--bg:#0d0e10;--panel:#16181b;--panel2:#1f2226;--ink:#eef0f2;--muted:#8c9198;--line:#2a2e33;--accent:${accent};--on:${onColor(accent)};--fd:"Chakra Petch",system-ui,sans-serif;--fb:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(18px,4vw,64px)}
.tick{font:600 12px/1 var(--fd);letter-spacing:.24em;text-transform:uppercase;color:var(--accent);margin:0 0 16px;display:flex;align-items:center;gap:12px}.tick:before{content:"";width:22px;height:2px;background:var(--accent)}
.display{font:600 clamp(40px,6vw,96px)/.95 var(--fd);letter-spacing:-.01em;text-transform:uppercase;margin:0}
.h2{font:600 clamp(30px,3.6vw,56px)/1 var(--fd);text-transform:uppercase;margin:0}
.h3{font:600 20px/1.15 var(--fd);text-transform:uppercase;letter-spacing:.02em;margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);color:var(--muted);max-width:600px}
.btn{display:inline-flex;align-items:center;gap:12px;height:52px;padding:0 28px;background:var(--accent);color:var(--on);font:600 14px var(--fd);letter-spacing:.18em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:filter .2s,transform .2s}
.btn:hover{filter:brightness(1.1);transform:translateY(-2px)}.btn.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--muted)}.btn.ghost:hover{box-shadow:inset 0 0 0 1px var(--ink);filter:none}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(13,14,16,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:30px;height:72px}
.logo{font:700 22px var(--fd);letter-spacing:.18em;text-transform:uppercase;text-decoration:none;flex:none}.logo img{max-height:40px;width:auto}
/* A long business name shown as text wraps on a phone instead of pushing the menu off screen. */
@media(max-width:600px){.logo{flex:0 1 auto;min-width:0;font-size:clamp(14px,4.2vw,20px);line-height:1.15;letter-spacing:.03em}}
.hd nav{display:flex;gap:26px;flex:1;white-space:nowrap;overflow:hidden;font:600 13px var(--fd);letter-spacing:.18em;text-transform:uppercase}.hd nav a{text-decoration:none;color:var(--muted)}.hd nav a:hover{color:var(--ink)}
.hd form{display:flex;align-items:center;border:1px solid var(--line);height:40px;padding:0 4px 0 12px}.hd form input{border:0;background:none;outline:none;color:var(--ink);font:inherit;font-size:14px;width:160px}.hd form button{border:0;background:none;color:var(--accent);cursor:pointer;font:600 12px var(--fd);letter-spacing:.14em;text-transform:uppercase}
.burger{display:none;margin-left:auto;cursor:pointer;font:600 13px var(--fd);letter-spacing:.18em;text-transform:uppercase}#nav{display:none}
.drawer{display:none;position:fixed;inset:72px 0 0;z-index:29;background:var(--bg);overflow:auto;padding:20px clamp(18px,4vw,64px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:14px 0;border-bottom:1px solid var(--line);font:600 24px var(--fd);text-transform:uppercase;text-decoration:none}
/* hero */
.hero{position:relative;overflow:hidden;background:radial-gradient(70% 90% at 72% 50%,#24282d 0%,var(--bg) 70%)}
.hero .grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,64px);align-items:center;min-height:min(86vh,860px);padding-block:40px}
.hero .lead{margin:22px 0 32px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.dial{position:relative;aspect-ratio:1;display:grid;place-items:center}
.dial:before{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--muted) 0 .35deg,transparent .35deg 6deg);-webkit-mask:radial-gradient(circle,transparent 66%,#000 66.4%,#000 70%,transparent 70.4%);mask:radial-gradient(circle,transparent 66%,#000 66.4%,#000 70%,transparent 70.4%);opacity:.55}
.dial:after{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--accent) 0 .8deg,transparent .8deg 30deg);-webkit-mask:radial-gradient(circle,transparent 63%,#000 63.4%,#000 70%,transparent 70.4%);mask:radial-gradient(circle,transparent 63%,#000 63.4%,#000 70%,transparent 70.4%)}
.dial .ph{width:58%;aspect-ratio:1;border-radius:50%;overflow:hidden;background:var(--panel2);box-shadow:0 40px 90px -30px rgba(0,0,0,.8);animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}.dial .ph img,.dial .ph video{width:100%;height:100%;object-fit:cover}
.hero.full .grid{grid-template-columns:1fr}.hero.full>img,.hero.full>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.6}.hero.full .grid>div{position:relative;max-width:820px}
@keyframes rise{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
/* sections */
.sec{padding-block:clamp(64px,8vw,130px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(28px,3vw,44px)}.more{font:600 13px var(--fd);letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:var(--accent)}
.strip{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(280px,1fr);gap:2px;overflow-x:auto;scrollbar-width:thin;scroll-snap-type:x mandatory}
.lap{scroll-snap-align:start;position:relative;display:block;background:var(--panel);text-decoration:none;padding:26px;min-height:420px;transition:background .3s}.lap:hover{background:var(--panel2)}
.lap .no{font:600 64px/1 var(--fd);color:transparent;-webkit-text-stroke:1px var(--muted)}.lap .ph{aspect-ratio:1;overflow:hidden;margin:18px 0;background:var(--panel2)}.lap .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.lap:hover .ph img{transform:scale(1.05)}
.lap span{display:block;color:var(--muted);font-size:14px;margin-top:6px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
.pc{display:flex;flex-direction:column;background:var(--panel);text-decoration:none;transition:background .3s}.pc:hover{background:var(--panel2)}
.pc .ph{aspect-ratio:1;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:18px 20px 22px;display:flex;flex-direction:column;flex:1}.pc h3{font:600 17px/1.2 var(--fd);text-transform:uppercase;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13.5px;color:var(--muted);margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:12px;font:600 17px var(--fd);letter-spacing:.06em;color:var(--accent)}
.specs{display:grid;grid-template-columns:repeat(var(--n,3),1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.specs div{padding:clamp(24px,3vw,44px) 20px;border-right:1px solid var(--line)}.specs div:last-child{border-right:0}
.specs b{display:block;font:600 clamp(40px,4.4vw,72px)/1 var(--fd)}.specs span{font:600 12px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.feature{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(28px,5vw,96px);align-items:center}.feature .ph{aspect-ratio:4/3;overflow:hidden;background:var(--panel)}.feature .ph img{width:100%;height:100%;object-fit:cover}.feature .lead{margin:18px 0 28px}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}.pillars div{background:var(--panel);padding:clamp(24px,3vw,40px)}.pillars i{display:block;font:600 13px var(--fd);font-style:normal;letter-spacing:.2em;color:var(--accent);margin-bottom:16px}.pillars p{color:var(--muted);margin:10px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(28px,6vw,110px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:600 18px/1.3 var(--fd);text-transform:uppercase;letter-spacing:.02em}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";color:var(--accent);font-size:24px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 22px;color:var(--muted)}
.closing{background:linear-gradient(120deg,var(--panel2),var(--bg));border:1px solid var(--line);padding:clamp(48px,7vw,110px) clamp(24px,5vw,90px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}.closing .lead{margin:14px 0 0}
/* listing */
.lh{padding-block:clamp(40px,5vw,80px) 10px}.crumbs{font:600 12px var(--fd);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin:18px 0 0}
.chips{display:flex;gap:2px;flex-wrap:wrap;margin:28px 0 2px}.chips a{background:var(--panel);padding:12px 16px;text-decoration:none;font:600 13px var(--fd);letter-spacing:.14em;text-transform:uppercase}.chips a:hover,.chips a[aria-current]{background:var(--accent);color:var(--on)}.chips span{opacity:.6;margin-left:8px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:16px;margin:24px 0 20px}
.bar form{display:flex;flex:1;max-width:520px;border-bottom:1px solid var(--muted)}.bar input{flex:1;min-width:0;background:none;border:0;outline:none;color:var(--ink);font:inherit;padding:8px 0}.bar button{background:none;border:0;color:var(--accent);font:600 13px var(--fd);letter-spacing:.18em;text-transform:uppercase;cursor:pointer}.bar .n{font:600 12px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.pager{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:54px}.pager span{font:600 12px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,90px);align-items:center;padding-block:clamp(30px,4vw,60px) clamp(48px,6vw,90px)}
.pdp .dial .ph{width:64%}.pdp h1{font:600 clamp(32px,3.6vw,56px)/.98 var(--fd);text-transform:uppercase;margin:0}.pdp .d{color:var(--muted);margin:14px 0 0}
.pdp .price{font:600 32px var(--fd);letter-spacing:.04em;color:var(--accent);margin:24px 0 28px}
.pdp table,.det table{width:100%;border-collapse:collapse;margin-top:26px}.pdp th,.pdp td,.det th,.det td{text-align:left;padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px}.pdp th,.det th{font:600 12px var(--fd);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);width:44%}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(28px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}.det p{color:#c4c8cd}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:600 12px var(--fd);letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);padding:13px 14px;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 28px;border:0;background:var(--accent);color:var(--on);font:600 14px var(--fd);letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(28px,6vw,110px);padding-block:clamp(48px,6vw,90px);border-top:1px solid var(--line)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:10px;font-size:17px}.facts a{text-decoration:none;border-bottom:1px solid var(--accent)}
/* footer */
.ft{border-top:1px solid var(--line);padding-block:64px 28px;margin-top:clamp(40px,5vw,80px)}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:36px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:600 12px var(--fd);letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 16px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px}.ft a{text-decoration:none}.ft a:hover{color:var(--accent)}
.ft .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:50px;padding-top:22px;border-top:1px solid var(--line);font:600 11.5px var(--fd);letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(24px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid4{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:820px){.hero .grid,.feature,.faq,.pdp,.det,.two{grid-template-columns:1fr}.hero .grid{min-height:0;padding-block:30px 60px}.dial{max-width:420px;margin:0 auto}.pillars{grid-template-columns:1fr}.grid4{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.specs{grid-template-columns:1fr}.specs div{border-right:0;border-bottom:1px solid var(--line)}}
@media(max-width:520px){.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.pc .t{padding:14px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%4)*80+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#0d0e10">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Chakra+Petch:wght@500;600;700", "Inter:wght@400;500"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Chrono template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Collections</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a></nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Find</button></form><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">All collections</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Collections</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
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
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const txt = `<div data-r>${s.hero.eyebrow ? `<p class="tick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:28px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div>`;
  // The dial frames a product photo; a wide rendered visual or film fills the hero instead.
  const hero = cover
    ? `<section class="hero full">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="w grid">${txt}</div></section>`
    : `<section class="hero"><div class="w grid">${txt}<div class="dial"><div class="ph">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div></div></section>`;
  const feat = large.find((u) => u !== cover) ?? pics[1]?.image ?? null;
  return `${hero}
${s.stats.length ? `<section class="w" style="padding-top:clamp(40px,5vw,70px)"><div class="specs" style="--n:${Math.min(4, s.stats.length)}">${s.stats.slice(0, 4).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${top.length >= 3 ? `<section class="w sec"><div class="top"><div><p class="tick">The collections</p><h2 class="h2" data-r>Pick your line</h2></div><a class="more" href="${href(t, "/products")}">All collections →</a></div><div class="strip">${top.slice(0, 8).map((c, i) => `<a class="lap" href="${href(t, `/collections/${c.slug}`)}"><div class="no">${String(i + 1).padStart(2, "0")}</div><div class="ph">${img(c.image, c.name)}</div><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} products</span></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="feature">${feat ? `<div class="ph" data-r>${img(feat, s.story.heading)}</div>` : ""}<div${feat ? "" : ' style="grid-column:1/-1"'} data-r><p class="tick">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ghost" href="${href(t, "/about")}">Our story</a></div></div></section>` : ""}
${s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="top"><div><p class="tick">Selected</p><h2 class="h2" data-r>Featured</h2></div><a class="more" href="${href(t, "/products")}">View all →</a></div><div class="grid4">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars">${s.highlights.map((h, i) => `<div data-r><i>${String(i + 1).padStart(2, "0")}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="tick">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results: ${st.q}` : st.cat ? shortName(st.cat.name) : "All collections";
  const body = `<section class="w lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Collections</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(38px,5.4vw,84px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : ""}
<div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the range"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span></div>
${filterBar(t, st)}<div class="grid4">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn ghost" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></section>`;
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
  const body = `<section class="hero" style="background:radial-gradient(60% 80% at 30% 50%,#24282d 0%,var(--bg) 70%)"><div class="w pdp"><div class="dial"><div class="ph">${img(p.image, p.title, "", true)}</div></div><div><p class="crumbs" style="margin-bottom:22px"><a href="${href(t, "/products")}">Collections</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "On request"}</p>${action.html}${s.promise.length ? `<table>${s.promise.map((x, i) => `<tr><th scope="row">${String(i + 1).padStart(2, "0")}</th><td>${esc(x)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
<section class="w"><div class="det"><div><p class="tick">Details</p><h2 class="h2" style="font-size:clamp(24px,2.6vw,38px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two"><div><p class="tick">Enquire</p><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:16px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Also in the range</h2></div><div class="grid4">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w lh"><p class="tick">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(36px,5vw,80px)">${esc(st?.heading ?? s.brand.tagline)}</h1></section>
${visual ? `<section class="w" style="padding-top:30px"><div style="aspect-ratio:21/9;overflow:hidden;background:var(--panel)">${img(visual, s.brand.name, "", true).replace("<img", '<img style="width:100%;height:100%;object-fit:cover"')}</div></section>` : ""}
${st ? `<section class="w sec"><div style="max-width:840px;font-size:18px;color:#c4c8cd">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars">${s.highlights.map((h, i) => `<div data-r><i>${String(i + 1).padStart(2, "0")}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="tick">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(36px,5vw,80px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two" style="margin-top:30px"><div class="facts"><p class="tick">Reach us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
