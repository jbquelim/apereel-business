import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Drive": Custom tier. Original design in the language of premium car
// makers' modern sites: white and cool grey, big rounded image containers,
// a hero inside a rounded frame with buttons over the image, category tabs
// (pure CSS) that each open a swipeable row of large rounded cards, rounded
// discover tiles, and twin action boxes.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#1a1b1d;--muted:#666a70;--soft:#f2f3f5;--line:#dfe1e5;--accent:${accent};--on:${onColor(accent)};--f:"Plus Jakarta Sans",system-ui,sans-serif;--r:22px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1520px;margin:0 auto;padding-inline:clamp(14px,3vw,44px)}
.display{font:700 clamp(36px,5vw,76px)/1.04 var(--f);letter-spacing:-.035em;margin:0}
.h2{font:700 clamp(26px,2.8vw,42px)/1.1 var(--f);letter-spacing:-.03em;margin:0}
.h3{font:700 18px/1.3 var(--f);margin:0}
.lead{font-size:clamp(16px,1.2vw,18.5px);color:var(--muted);max-width:600px;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border-radius:999px;background:var(--accent);color:var(--on);font:600 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:filter .2s}
.btn:hover{filter:brightness(1.08)}.btn.ink{background:var(--ink);color:#fff}.btn.white{background:#fff;color:var(--ink)}.btn.glass{background:rgba(255,255,255,.18);color:#fff;backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px var(--line)}.btn.line:hover{box-shadow:inset 0 0 0 1.5px var(--ink)}.btn.sm{height:40px;padding:0 18px;font-size:14px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.95);backdrop-filter:blur(14px)}
.hd .w{display:flex;align-items:center;gap:28px;height:72px}
.logo{font:800 22px var(--f);letter-spacing:-.03em;text-decoration:none;flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap}.logo img{max-height:42px;width:auto}
.hd nav{display:flex;gap:6px;flex:1;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none;font:600 15px var(--f);padding:9px 14px;border-radius:999px}.hd nav a:hover{background:var(--soft)}
.hd form{display:flex;align-items:center;background:var(--soft);border-radius:999px;height:42px;padding:0 6px 0 16px;width:min(260px,24vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:none;cursor:pointer;font:600 14px var(--f)}
.burger{display:none;margin-left:auto;cursor:pointer;font:600 15px var(--f)}#nav{display:none}.drawer{display:none;position:fixed;inset:72px 0 0;z-index:29;background:#fff;overflow:auto;padding:16px clamp(14px,3vw,44px)}#nav:checked~.drawer{display:block}.drawer a{display:flex;justify-content:space-between;padding:16px 4px;border-bottom:1px solid var(--line);font:600 20px var(--f);text-decoration:none}.drawer a:after{content:"›"}
/* hero */
.hero{position:relative;border-radius:var(--r);overflow:hidden;background:var(--soft);height:min(80vh,800px);margin-top:4px;color:#fff}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.5),transparent 60%)}
.hero .t{position:absolute;left:clamp(20px,4vw,64px);bottom:clamp(24px,5vw,64px);right:20px;z-index:1;max-width:720px}.hero .lead{color:#e3e3e3;margin:16px 0 26px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero.light{color:var(--ink);display:grid;grid-template-columns:1fr 1fr;height:auto;min-height:min(74vh,740px)}.hero.light:after{display:none}.hero.light>img{position:static;height:100%}.hero.light .t{position:static;align-self:center;padding:clamp(28px,5vw,72px)}.hero.light .lead{color:var(--muted)}
/* model tabs */
.sec{padding-top:clamp(56px,7vw,110px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.sec .top a{font-weight:600;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.models input{position:absolute;opacity:0;pointer-events:none}.models .tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:18px;scrollbar-width:none}.models .tabs::-webkit-scrollbar{display:none}
.models label{white-space:nowrap;cursor:pointer;padding:10px 18px;border-radius:999px;background:var(--soft);font:600 14.5px var(--f)}.models label:hover{background:#e7e9ec}.models .panel{display:none}
${Array.from({ length: 6 }, (_, i) => `#dm${i}:checked~.tabs label[for=dm${i}]{background:var(--ink);color:#fff}#dm${i}:checked~.panels .m${i}{display:block}#dm${i}:focus-visible~.tabs label[for=dm${i}]{outline:2px solid var(--accent)}`).join("")}
.row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(min(380px,80vw),1fr);gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:thin}
.card{scroll-snap-align:start;display:flex;flex-direction:column;background:var(--soft);border-radius:var(--r);overflow:hidden;text-decoration:none}.card .ph{aspect-ratio:16/11;overflow:hidden}.card .ph img{width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.card:hover .ph img{transform:scale(1.03)}
.card .t{padding:18px 20px 22px;display:flex;flex-direction:column;flex:1}.card .t p{color:var(--muted);font-size:14px;margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.card .pr{margin:12px 0 0;font-size:14.5px;color:var(--muted)}.card .pr b{color:var(--ink);font-size:18px}
.disc{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:14px}
.tile{position:relative;display:block;aspect-ratio:4/5;border-radius:var(--r);overflow:hidden;background:var(--soft);color:#fff;text-decoration:none}.tile img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.tile:hover img{transform:scale(1.04)}
.tile:after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.55))}.tile .t{position:absolute;left:22px;right:22px;bottom:22px;z-index:1}.tile .t span{display:block;font-size:14px;opacity:.85;margin-top:4px}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{border-radius:var(--r);padding:clamp(26px,4vw,52px);background:var(--soft);display:flex;flex-direction:column;align-items:flex-start;gap:14px}.box.dark{background:var(--ink);color:#fff}.box.dark p{color:#b8bbc0}.box p{color:var(--muted);margin:0}
.facts3{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:14px}.facts3 div{border-radius:var(--r);border:1px solid var(--line);padding:24px}.facts3 b{display:block;font:700 clamp(32px,3.4vw,50px)/1 var(--f);letter-spacing:-.03em;margin-bottom:8px}.facts3 p{color:var(--muted);margin:6px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,90px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:20px 0;display:flex;justify-content:space-between;gap:16px;font:600 17px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";flex:none;font-size:22px;line-height:1;color:var(--accent)}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted)}
/* listing */
.lh{padding-block:clamp(28px,4vw,56px) 6px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 12px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin-top:12px}
.chips{display:flex;gap:6px;overflow-x:auto;padding-block:18px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}.chips a{white-space:nowrap;padding:10px 18px;border-radius:999px;background:var(--soft);font:600 14px var(--f);text-decoration:none}.chips a:hover{background:#e7e9ec}.chips a[aria-current]{background:var(--ink);color:#fff}.chips span{color:var(--muted);margin-left:6px;font-weight:500}.chips a[aria-current] span{color:#b8bbc0}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px}.res form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 18px}.res input{border:0;background:none;outline:none;font:inherit;width:280px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:40px;padding:0 18px;font-weight:600;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:44px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.35fr .65fr;gap:clamp(20px,4vw,56px);align-items:start;padding-top:12px}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:16/11;border-radius:var(--r);overflow:hidden;background:var(--soft)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:92px;background:var(--soft);border-radius:var(--r);padding:clamp(22px,3vw,34px)}.pdp h1{font:700 clamp(24px,2.4vw,34px)/1.15 var(--f);letter-spacing:-.025em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.pdp .price{margin:20px 0 22px;color:var(--muted);font-size:14.5px}.pdp .price b{display:block;font:700 28px var(--f);color:var(--ink)}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:8px}.pdp li{background:#fff;border-radius:14px;padding:11px 14px;font-size:14.5px}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);padding-block:clamp(40px,5vw,80px)}.det>*{min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:16px}.det th,.det td{text-align:left;padding:12px 0;border-bottom:1px solid var(--line)}.det th{color:var(--muted);font-weight:500;width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 13.5px var(--f);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 16px;border:0;border-radius:14px;background:var(--soft)}.form input:focus,.form textarea:focus{outline:2px solid var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 24px;border:0;border-radius:999px;background:var(--accent);color:var(--on);font:600 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,80px);padding-block:clamp(36px,5vw,70px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--soft);margin-top:clamp(56px,7vw,110px);padding-block:52px 26px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:700 15px var(--f);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#45484d}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}
.ft .base{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(16px);transition:opacity .8s ease,transform .8s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.hd nav,.hd form{display:none}.burger{display:block}.grid{grid-template-columns:1fr 1fr}}
@media(max-width:820px){.hero.light,.duo,.faq,.pdp,.det,.two{grid-template-columns:1fr}.hero.light>img{order:-1;max-height:360px}.pdp .info{position:static}.disc{grid-template-columns:1fr 1fr}.facts3{grid-template-columns:1fr}.ft .cols{grid-template-columns:1fr 1fr}.hero{height:min(70vh,620px)}}
@media(max-width:520px){.hd .btn{display:none}.form,.ft .cols,.grid,.disc{grid-template-columns:1fr}.res input{width:100%}.res form{flex:1}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -5% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*80+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Plus+Jakarta+Sans:wght@400;500;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Drive template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Go</button></form><a class="btn ink sm" href="${href(t, "/contact")}">Contact</a><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Products</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function card(t: RenderTarget, p: SiteProduct, reveal = false) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="card"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3 class="h3">${esc(name)}</h3>${detail ? `<p>${esc(detail)}</p>` : ""}<p class="pr">${money(p) ? `<b>${esc(money(p))}</b>` : "Price on request"}</p></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const withImg = top.filter((c) => c.image);
  const hero = cover
    ? `<section class="w"><div class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="t" data-r>${s.hero.eyebrow ? `<p style="margin:0 0 10px;font-weight:600;opacity:.85">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:24px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn glass" href="${href(t, "/contact")}">Contact</a></div></div></div></section>`
    : `<section class="w"><div class="hero light"><div class="t" data-r>${s.hero.eyebrow ? `<p style="margin:0 0 10px;font-weight:600;color:var(--accent)">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:24px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn line" href="${href(t, "/contact")}">Contact</a></div></div>${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>`;
  // Model tabs: one tab per main category, a swipeable row of its featured products.
  const tabs = top.slice(0, 6).map((c, i) => {
    const sub = new Set([c.slug]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
    }
    return { c, i, items: pics.filter((p) => p.category && sub.has(p.category)).slice(0, 8) };
  }).filter((x) => x.items.length >= 3);
  const models = tabs.length >= 2
    ? `<section class="w sec"><div class="top"><h2 class="h2">Explore the range</h2><a href="${href(t, "/products")}">All products</a></div><div class="models">${tabs.map(({ i }, n) => `<input type="radio" name="dm" id="dm${i}"${n === 0 ? " checked" : ""}>`).join("")}<div class="tabs" role="tablist">${tabs.map(({ c, i }) => `<label for="dm${i}" role="tab">${esc(shortName(c.name))}</label>`).join("")}</div><div class="panels">${tabs.map(({ i, items }) => `<div class="panel m${i}"><div class="row">${items.map((p) => card(t, p)).join("")}</div></div>`).join("")}</div></div></section>`
    : pics.length ? `<section class="w sec"><div class="top"><h2 class="h2">Featured</h2><a href="${href(t, "/products")}">All products</a></div><div class="row">${pics.slice(0, 8).map((p) => card(t, p)).join("")}</div></section>` : "";
  const storyImg = large.find((u) => u !== cover) ?? null;
  return `${hero}${models}
${withImg.length >= 3 ? `<section class="w sec"><div class="top"><h2 class="h2">Discover more</h2></div><div class="disc" style="--n:${Math.min(3, withImg.length)}">${withImg.slice(0, 3).map((c) => `<a class="tile" data-r href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="t"><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} products →</span></div></a>`).join("")}</div></section>` : ""}
${s.stats.length >= 2 ? `<section class="w sec"><div class="facts3" style="--n:${Math.min(3, s.stats.length)}">${s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><p>${esc(x.label)}</p></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec"><div class="duo"><div class="box" data-r><p style="font-weight:600;color:var(--accent);margin:0">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><p>${esc((s.story.body.split(/\n{2,}/)[0] ?? "").slice(0, 320))}</p><a class="btn ink" href="${href(t, "/about")}">About us</a></div>${storyImg ? `<div class="tile" style="aspect-ratio:auto;min-height:360px">${img(storyImg, s.story.heading)}</div>` : `<div class="box dark" data-r><h2 class="h2">${esc(s.closing?.heading ?? "Talk to us")}</h2><p>${esc(s.closing?.body || "Questions about a product or an order? We reply within a working day.")}</p><a class="btn" href="${href(t, "/contact")}">${esc(s.closing?.cta ?? "Contact us")}</a></div>`}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec"><div class="faq"><div><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing && storyImg ? `<section class="w sec"><div class="duo"><div class="box dark" data-r><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div><div class="box" data-r><h2 class="h2">Browse everything</h2><p>${(s.doc.catalogSize ?? s.doc.products.length).toLocaleString("en-US")} products, searchable by name and filter.</p><a class="btn ink" href="${href(t, "/products")}">All products</a></div></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(30px,3.6vw,52px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:18px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => card(t, p)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn ink" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${title}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
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
  const body = `<div class="w"><p class="crumbs" style="padding-top:14px"><a href="${href(t, "/products")}">All products</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p style="margin:0 0 8px;font-weight:600;color:var(--accent)">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${money(p) ? `Price<b>${esc(money(p))}</b>` : "<b>Price on request</b>"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="det"><div><h2 class="h2" style="font-size:clamp(22px,2.2vw,32px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></section>
${action.enquire ? `<section id="enquire"><div class="two" style="background:var(--soft);border-radius:var(--r);padding-inline:clamp(20px,4vw,56px)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You might also like</h2></div><div class="row">${related.map((r) => card(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w"><div class="hero light" style="min-height:min(60vh,600px)"><div class="t"><p style="margin:0 0 10px;font-weight:600;color:var(--accent)">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(30px,3.8vw,56px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div>${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="w sec"><div style="max-width:820px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec"><div class="facts3" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><h1 class="display" style="font-size:clamp(30px,3.6vw,52px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
