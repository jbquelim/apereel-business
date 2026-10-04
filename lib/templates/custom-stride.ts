import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, contentPage, extraLinks, filterBar, filteredTitle, listPath, byRank, categoryNav, contactItems, esc, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Stride": Custom tier. Original design in the language of athletic
// brands: loud condensed uppercase headlines, edge-to-edge product photos
// on light grey, minimal text under each product, black pill buttons, big
// photo cards with a label button, a swipeable "trending" row.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#111;--muted:#707072;--soft:#f5f5f5;--line:#e5e5e5;--accent:${accent};--on:${onColor(accent)};--fd:"Anton",Impact,sans-serif;--fb:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.5 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1920px;margin:0 auto;padding-inline:clamp(16px,3.4vw,48px)}
.shout{font:400 clamp(44px,7vw,108px)/.92 var(--fd);text-transform:uppercase;letter-spacing:.005em;margin:0}
.h2{font:400 clamp(30px,3.6vw,54px)/.95 var(--fd);text-transform:uppercase;margin:0}
.h3{font:600 20px/1.25 var(--fb);margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);max-width:620px;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 24px;border-radius:999px;background:var(--ink);color:#fff;font:500 16px var(--fb);text-decoration:none;border:0;cursor:pointer;transition:opacity .2s}
.btn:hover{opacity:.75}.btn.white{background:#fff;color:var(--ink)}.btn.acc{background:var(--accent);color:var(--on)}.btn.line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px #cacacb}.btn.line:hover{box-shadow:inset 0 0 0 1.5px var(--ink);opacity:1}
/* header */
.strip{background:var(--soft);font-size:12.5px;text-align:center;padding:8px 16px}
.hd{position:sticky;top:0;z-index:30;background:#fff;transition:transform .3s}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:64px;gap:20px}
.logo{font:400 28px var(--fd);text-transform:uppercase;text-decoration:none;letter-spacing:.02em}.logo img{max-height:36px;width:auto}
.hd nav{display:flex;gap:24px;font:500 16px var(--fb);white-space:nowrap}.hd nav a{text-decoration:none}.hd nav a:hover{text-decoration:underline;text-underline-offset:6px}
.hd .tools{justify-self:end;display:flex;gap:12px;align-items:center}
.hd form{display:flex;align-items:center;background:var(--soft);border-radius:999px;padding:0 6px 0 16px;height:40px;width:min(220px,22vw)}
.hd form input{border:0;background:none;outline:none;font:inherit;font-size:15px;flex:1;min-width:0}.hd form button{border:0;background:none;cursor:pointer;font-size:15px;padding:0 8px}
.burger{display:none;cursor:pointer;font:500 16px var(--fb)}#nav{display:none}
.drawer{display:none;position:fixed;inset:0;z-index:40;background:#fff;padding:24px;overflow:auto}#nav:checked~.drawer{display:block}
.drawer .x{display:block;text-align:right;cursor:pointer;font-size:15px;margin-bottom:28px}.drawer a{display:block;font:500 26px/1.3 var(--fb);text-decoration:none;padding:6px 0}
.drawer form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 16px;margin-bottom:22px}.drawer input{flex:1;border:0;background:none;outline:none;font:inherit;min-width:0}.drawer button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:38px;padding:0 16px}
/* hero */
.hero{position:relative}
.hero .media{position:relative;aspect-ratio:16/8;max-height:84vh;width:100%;overflow:hidden;background:var(--soft)}
.hero .media img,.hero .media video{width:100%;height:100%;object-fit:cover}
.hero .media.prod{display:grid;grid-template-columns:1fr 1fr;aspect-ratio:auto;height:min(78vh,760px)}.hero .media.prod img{height:100%;object-fit:cover}
.hero .txt{text-align:center;padding-block:clamp(28px,4vw,52px) clamp(40px,5vw,64px)}.hero .txt .lead{margin:16px auto 26px}
.hero .acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.eyebrow{font:500 16px var(--fb);margin:0 0 10px}
/* rows */
.sec{padding-block:clamp(40px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}
.sec .top h2{font:500 24px var(--fb);text-transform:none;letter-spacing:-.01em}.sec .top a{font-weight:500;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.row{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 24px) / 3);gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}.row::-webkit-scrollbar{display:none}
.row>*{scroll-snap-align:start}
.big{position:relative;display:block;aspect-ratio:4/5;overflow:hidden;background:var(--soft);text-decoration:none}
.big img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.big:hover img{transform:scale(1.03)}
.big .lab{position:absolute;left:clamp(16px,2.4vw,36px);bottom:clamp(16px,2.4vw,36px);right:16px}
.big .lab p{margin:0 0 12px;font:500 16px var(--fb);color:#fff;text-shadow:0 1px 14px rgba(0,0,0,.45)}.big:after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.42));pointer-events:none}.big .lab{z-index:1}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 12px}
.pc{display:block;text-decoration:none}.pc .ph{aspect-ratio:1;background:var(--soft);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{padding:12px 2px 18px}.pc .flag{color:var(--accent);font-weight:500;font-size:15px;margin:0 0 2px}
.pc h3{font:500 16px/1.35 var(--fb);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{color:var(--muted);margin:2px 0 0;font-size:15px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;font-weight:500}
.mega{background:var(--ink);color:#fff;text-align:center;padding:clamp(56px,8vw,120px) 20px}.mega .lead{margin:18px auto 28px;color:#cfcfcf}
.pts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.pts div{background:var(--soft);padding:clamp(24px,3vw,40px)}.pts p{color:var(--muted);margin:10px 0 0}
.pts b{display:block;font:400 clamp(40px,4.4vw,64px)/1 var(--fd);margin-bottom:6px}
.faq{max-width:900px;margin:0 auto}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;font:500 19px/1.35 var(--fb);display:flex;justify-content:space-between;gap:20px}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"⌄";font-size:20px;transition:transform .3s}.faq details[open] summary:after{transform:rotate(180deg)}.faq details p{color:var(--muted);margin:0 0 22px}
.story{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:stretch}.story .ph{background:var(--soft);aspect-ratio:1;overflow:hidden}.story .ph img{width:100%;height:100%;object-fit:cover}
.story .t{background:var(--soft);display:flex;flex-direction:column;justify-content:center;padding:clamp(28px,5vw,80px)}.story .lead{margin:18px 0 26px}
/* shop */
.shop{display:grid;grid-template-columns:240px 1fr;gap:clamp(20px,3vw,44px);align-items:start;padding-bottom:70px}
.sh{display:flex;justify-content:space-between;align-items:end;gap:20px;padding-block:22px 22px;position:sticky;top:64px;background:#fff;z-index:5}
.sh h1{font:500 clamp(22px,2vw,26px)/1.2 var(--fb);margin:0}.sh h1 span{color:var(--muted);font-weight:400}
.side{position:sticky;top:140px;max-height:calc(100vh - 160px);overflow:auto;font-size:16px}.side a{display:block;padding:7px 0;text-decoration:none;font-weight:500}.side a:hover{color:var(--muted)}.side a[aria-current]{text-decoration:underline;text-underline-offset:5px}
.side .up{color:var(--muted);font-weight:400}.side span{color:var(--muted);font-weight:400;font-size:13px;margin-left:6px}
.side form{display:flex;border-bottom:1px solid var(--line);margin-bottom:16px}.side input{border:0;outline:none;font:inherit;flex:1;min-width:0;padding:8px 0}.side button{border:0;background:none;cursor:pointer;font-weight:500}
.side details summary{display:none}
.pager{display:flex;gap:10px;justify-content:center;align-items:center;margin-top:40px}.pager span{color:var(--muted)}
.crumbs{font-size:14px;color:var(--muted);margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
/* product */
.pdp{display:grid;grid-template-columns:1.25fr .75fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:28px 60px}
.pdp .ph{background:var(--soft);aspect-ratio:1;overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:90px;max-width:460px}.pdp h1{font:500 clamp(24px,2.2vw,30px)/1.2 var(--fb);margin:0}
.pdp .cat{font-weight:500;margin:4px 0 0}.pdp .d{color:var(--muted);margin:6px 0 0}.pdp .price{font-weight:500;font-size:18px;margin:18px 0 28px}
.pdp .btn{width:100%;height:58px;font-size:16px}.pdp .info .body{margin-top:30px}
.ticks{list-style:none;padding:0;margin:26px 0 0;display:grid;gap:10px}.ticks li{padding-left:28px;position:relative}.ticks li:before{content:"✓";position:absolute;left:0;font-weight:700}
.acc details{border-top:1px solid var(--line)}.acc details:last-child{border-bottom:1px solid var(--line)}.acc summary{list-style:none;cursor:pointer;padding:20px 0;font:500 19px var(--fb);display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"⌄"}.acc details[open] summary:after{transform:rotate(180deg)}
.acc .b{padding-bottom:20px}.acc table{width:100%;border-collapse:collapse}.acc th,.acc td{text-align:left;padding:8px 0;font-size:15px}.acc th{color:var(--muted);font-weight:400;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font-size:14px;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 16px;border:1px solid #cacacb;border-radius:8px;background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 28px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:500 16px var(--fb);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,80px);padding-block:clamp(40px,5vw,72px)}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px;font-size:18px}
/* footer */
.ft{background:var(--ink);color:#fff;padding-block:48px 28px;margin-top:clamp(40px,5vw,72px);font-size:14px}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}.ft h4{font:500 15px var(--fb);margin:0 0 14px;text-transform:uppercase;letter-spacing:.02em}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;color:#a7a7a7}.ft a{text-decoration:none}.ft a:hover{color:#fff}.ft p{color:#a7a7a7;margin:0}
.ft .base{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:44px;color:#7e7e7e;font-size:12.5px}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav{display:none}.hd .w{grid-template-columns:auto 1fr}.burger{display:block}.hd form{display:none}}
@media(max-width:860px){.row{grid-auto-columns:78%}.pts,.story,.pdp,.two{grid-template-columns:1fr}.pdp .info{position:static;max-width:none}.shop{grid-template-columns:1fr}.side{position:static;max-height:none}.sh{position:static}
.side details summary{display:flex;justify-content:space-between;cursor:pointer;list-style:none;padding:12px 18px;border:1px solid var(--line);border-radius:999px;font-weight:500;margin-bottom:10px}.side details summary::-webkit-details-marker{display:none}
.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.hero .media{aspect-ratio:4/5;max-height:none}.hero .media.prod{grid-template-columns:1fr;height:auto}.hero .media.prod img+img{display:none}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}}
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
  const search = `<form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit" aria-label="Search">⌕</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Anton", "Inter:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Stride template · built by Apereel</div>' : ""}
<div class="strip">${esc(s.promise[0] ?? s.brand.tagline)}</div>
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main">${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/products")}">Shop all</a></nav><div class="tools">${search}<label class="burger" for="nav">Menu</label></div></div></header>
<div class="drawer" role="dialog" aria-label="Menu"><label class="x" for="nav">Close ✕</label>${search}<a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols">
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 5).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><p>${esc(s.brand.tagline)}</p></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, cat: string | null, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3><p class="d">${esc(detail || cat || "")}</p>${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</div></a>`;
}

const catName = (t: RenderTarget, p: SiteProduct) => {
  const c = t.doc.categories.find((x) => x.slug === p.category);
  return c ? shortName(c.name) : null;
};

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const media = s.hero.video
    ? `<div class="media"><video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video></div>`
    : cover
      ? `<div class="media">${img(cover, s.hero.heading, "", true)}</div>`
      : pics.length >= 2
        ? `<div class="media prod">${img(pics[0].image, pics[0].title, "", true)}${img(pics[1].image, pics[1].title)}</div>`
        : `<div class="media">${img(s.hero.image, s.hero.heading, "", true)}</div>`;
  const second = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<section class="hero">${media}<div class="w txt">${s.hero.eyebrow ? `<p class="eyebrow">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="shout" data-r>${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : ""}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a>${top[0] ? `<a class="btn line" href="${href(t, `/collections/${top[0].slug}`)}">${esc(shortName(top[0].name))}</a>` : ""}</div></div></section>
${top.length >= 3 ? `<section class="w sec"><div class="top"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="row">${top.slice(0, 8).map((c) => `<a class="big" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="lab"><p>${c.count.toLocaleString("en-US")} products</p><span class="btn white">${esc(shortName(c.name))}</span></div></a>`).join("")}</div></section>` : ""}
${pics.length ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">Trending now</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="row" style="grid-auto-columns:calc((100% - 36px) / 4)">${pics.slice(0, 10).map((p) => pc(t, p, catName(t, p), false)).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="story">${second ? `<div class="ph">${img(second, s.story.heading)}</div>` : ""}<div class="t"${second ? "" : ' style="grid-column:1/-1;text-align:center;align-items:center"'}><h2 class="shout" style="font-size:clamp(40px,5vw,84px)" data-r>${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><div><a class="btn" href="${href(t, "/about")}">Our story</a></div></div></div></section>` : ""}
${s.highlights.length || s.stats.length ? `<section class="w sec" style="padding-top:0"><div class="pts">${(s.stats.length >= 3 ? s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><p style="margin:0">${esc(x.label)}</p></div>`) : s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`)).join("")}</div></section>` : ""}
${s.featured.length >= 14 ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">The essentials</h2></div><div class="grid">${s.featured.slice(10, 18).map((p) => pc(t, p, catName(t, p))).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><h2 class="h2" style="text-align:center;margin-bottom:20px">${esc(s.faq.heading)}</h2>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="mega"><h2 class="shout" style="font-size:clamp(42px,6vw,96px)" data-r>${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}<a class="btn white" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const list = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? shortName(st.cat.name) : "All products";
  const side = `<aside class="side"><details open><summary>Filter ▾</summary><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "products"}" aria-label="Search"><button type="submit">Go</button></form>${st.cat ? `<a class="up" href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All products"))}</a>` : ""}${list.slice(0, 50).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</details></aside>`;
  const body = `<div class="w"><div class="sh"><div><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(title)} <span>(${st.total.toLocaleString("en-US")})</span></h1></div></div>
<div class="shop">${side}<div>${st.cat?.description && !st.q && st.page === 1 ? `<p class="lead" style="color:var(--muted);margin:0 0 20px">${esc(st.cat.description)}</p>` : ""}${filterBar(t, st)}<div class="grid" style="grid-template-columns:repeat(3,1fr)">${st.shown.map((p) => pc(t, p, catName(t, p), false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</div></div></div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.cat ? st.cat.name : title}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
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
  const body = `<div class="w" style="padding-top:20px"><p class="crumbs"><a href="${href(t, "/products")}">All products</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p></div>
<section class="w pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info"><h1>${esc(name)}</h1>${cat ? `<p class="cat">${esc(shortName(cat.name))}</p>` : ""}${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}
${s.promise.length ? `<ul class="ticks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<div class="acc body"><details open><summary>Details</summary><div class="b">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="b"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two" style="background:var(--soft);padding-inline:clamp(20px,4vw,56px)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:14px;color:var(--muted)">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec"><div class="top"><h2 class="h2">You might also like</h2></div><div class="grid">${related.map((r) => pc(t, r, catName(t, r), false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero">${visual ? `<div class="media">${img(visual, s.brand.name, "", true)}</div>` : ""}<div class="w txt"><p class="eyebrow">About ${esc(s.brand.name)}</p><h1 class="shout" style="font-size:clamp(44px,7vw,110px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div></section>
${st ? `<section class="w sec" style="padding-top:0"><div style="max-width:820px;margin:0 auto;font-size:19px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pts">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w"><div class="two"><div class="facts"><h1 class="shout" style="font-size:clamp(44px,6vw,96px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:16px;color:var(--muted)">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
