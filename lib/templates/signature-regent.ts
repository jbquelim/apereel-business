import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Regent": Signature tier. Original design in the language of the most
// exclusive motor houses: midnight and pale stone in alternating bands,
// sparse light uppercase type with wide tracking, a transparent header over
// a full-bleed hero, one product at a time in a full-width slider.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--night:#0e131d;--night2:#161d2a;--stone:#ebe8e2;--paper:#f6f4f0;--ink:#121620;--muted:#8a8f99;--mutedd:#5e6470;--line:rgba(127,127,127,.25);--accent:${accent};--on:${onColor(accent)};--f:"Outfit",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:300 17px/1.65 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1400px;margin:0 auto;padding-inline:clamp(20px,5vw,80px)}
.cap{font:400 12px/1.4 var(--f);letter-spacing:.34em;text-transform:uppercase;margin:0}
.display{font:200 clamp(40px,6vw,92px)/1.02 var(--f);letter-spacing:.04em;text-transform:uppercase;margin:0}
.h2{font:200 clamp(30px,3.8vw,56px)/1.08 var(--f);letter-spacing:.04em;text-transform:uppercase;margin:0}
.h3{font:400 15px/1.4 var(--f);letter-spacing:.2em;text-transform:uppercase;margin:0}
.lead{font-size:clamp(17px,1.25vw,19px);max-width:620px;color:var(--mutedd)}
.night{background:var(--night);color:#e9ebef}.night .lead{color:#a6acb8}.stone{background:var(--stone)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:16px;height:54px;padding:0 34px;border:1px solid currentColor;background:transparent;color:inherit;font:400 12.5px var(--f);letter-spacing:.3em;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:background .4s,color .4s}
.btn:hover{background:var(--ink);color:#fff;border-color:var(--ink)}.night .btn:hover{background:#fff;color:var(--night);border-color:#fff}
.btn.solid{background:var(--ink);color:#fff;border-color:var(--ink)}.btn.solid:hover{background:var(--accent);border-color:var(--accent);color:var(--on)}
/* header */
.hd{position:absolute;top:0;left:0;right:0;z-index:30;color:#fff}.hd.solid{position:sticky;background:var(--night)}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:88px}
.logo{justify-self:center;font:300 24px var(--f);letter-spacing:.4em;text-transform:uppercase;text-decoration:none}.logo img{max-height:44px;width:auto}
.hd .l,.hd .r{display:flex;gap:28px;font:400 12px var(--f);letter-spacing:.26em;text-transform:uppercase}.hd .r{justify-self:end}.hd a{text-decoration:none}.hd a:hover{opacity:.7}
.burger{cursor:pointer}#nav{display:none}
.menu{position:fixed;inset:0;z-index:40;background:var(--night);color:#fff;display:none;overflow:auto}#nav:checked~.menu{display:block}
.menu .w{padding-block:32px}.menu .x{font:400 12px var(--f);letter-spacing:.26em;text-transform:uppercase;cursor:pointer}
.menu ul{list-style:none;padding:0;margin:60px 0 0;display:grid;gap:10px}.menu li a{font:200 clamp(30px,4.6vw,58px)/1.15 var(--f);letter-spacing:.06em;text-transform:uppercase;text-decoration:none}.menu li a:hover{color:var(--accent)}
/* hero */
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;background:var(--night);color:#fff}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:drift 24s ease-out both}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,19,29,.6),rgba(14,19,29,.05) 40%,rgba(14,19,29,.85))}
.hero .txt{position:relative;z-index:1;width:100%;text-align:center;padding-block:0 clamp(60px,10vh,120px)}.hero .lead{margin:22px auto 34px;color:#c9ced8}
.hero.plain{align-items:center}.hero.plain:after{display:none}.hero.plain .grid{position:relative;z-index:1;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,90px);align-items:center;padding-block:120px 60px}
.hero.plain .txt{text-align:left;padding:0}.hero.plain .lead{margin:22px 0 34px}.hero.plain .ph{aspect-ratio:4/5;overflow:hidden;background:var(--night2)}.hero.plain .ph img{width:100%;height:100%;object-fit:cover}
@keyframes drift{from{transform:scale(1.08)}to{transform:scale(1)}}
/* sections */
.sec{padding-block:clamp(80px,10vw,160px)}.center{text-align:center;max-width:820px;margin:0 auto}.center .lead{margin:26px auto 36px}
.slider{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.slider::-webkit-scrollbar{display:none}
.slide{scroll-snap-align:start;display:grid;grid-template-columns:1.3fr .7fr;gap:clamp(24px,4vw,70px);align-items:center;text-decoration:none}
.slide .ph{aspect-ratio:4/3;overflow:hidden;background:var(--night2)}.slide .ph img{width:100%;height:100%;object-fit:cover}
.slide .n{font:400 12px var(--f);letter-spacing:.3em;color:var(--muted)}.slide .h2{margin:16px 0}.slide .pr{font:300 20px var(--f);letter-spacing:.1em;margin:0 0 30px}
.slide .d{color:#a6acb8;margin:0 0 30px}
.hint{display:flex;justify-content:space-between;align-items:center;margin-top:28px;font:400 12px var(--f);letter-spacing:.26em;text-transform:uppercase;color:var(--muted)}
.lines{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:clamp(16px,2vw,28px)}
.line{text-decoration:none;display:block}.line .ph{aspect-ratio:3/4;overflow:hidden;background:var(--stone)}.line .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)}.line:hover .ph img{transform:scale(1.04)}
.line .h3{margin-top:22px}.line span{display:block;color:var(--mutedd);font-size:14px;margin-top:6px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,28px)}
.pc{text-decoration:none;display:block}.pc .ph{aspect-ratio:1;overflow:hidden;background:var(--stone)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc .h3{margin-top:18px;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{color:var(--mutedd);font-size:14px;margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;font-size:15px;letter-spacing:.06em}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(30px,5vw,90px)}.pillars div{border-top:1px solid var(--line);padding-top:30px}.pillars p{margin:14px 0 0;color:#a6acb8}
.nums{display:flex;justify-content:center;gap:clamp(40px,8vw,140px);flex-wrap:wrap;text-align:center}.nums b{display:block;font:200 clamp(44px,5vw,80px)/1 var(--f)}.nums span{font:400 12px var(--f);letter-spacing:.26em;text-transform:uppercase;color:var(--mutedd)}
.faq{max-width:900px;margin:0 auto}.faq details{border-top:1px solid var(--line)}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;padding:26px 0;display:flex;justify-content:space-between;gap:20px;font:300 20px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-weight:200;font-size:26px;line-height:1}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 26px;color:var(--mutedd)}
/* listing */
.lh{padding-block:clamp(60px,7vw,110px) clamp(30px,4vw,50px);text-align:center}.lh .lead{margin:22px auto 0}
.crumbs{font:400 11.5px var(--f);letter-spacing:.24em;text-transform:uppercase;color:var(--muted);margin:0 0 22px}.crumbs a{text-decoration:none}
.tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:8px 30px;padding-top:32px;font:400 12px var(--f);letter-spacing:.22em;text-transform:uppercase}.tabs a{text-decoration:none;padding:6px 0;border-bottom:1px solid transparent}.tabs a:hover,.tabs a[aria-current]{border-color:currentColor}.tabs span{opacity:.6;margin-left:6px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-block:20px;margin-bottom:26px}
.bar form{display:flex;gap:10px;align-items:center;border-bottom:1px solid var(--ink);min-width:min(340px,100%)}.bar input{flex:1;border:0;background:none;outline:none;font:inherit;padding:8px 0;min-width:0}.bar button{border:0;background:none;cursor:pointer;font:400 11.5px var(--f);letter-spacing:.24em;text-transform:uppercase}
.bar .n{font:400 11.5px var(--f);letter-spacing:.24em;text-transform:uppercase;color:var(--mutedd)}
.pager{display:flex;gap:18px;justify-content:center;align-items:center;margin-top:60px}.pager span{font:400 11.5px var(--f);letter-spacing:.24em;text-transform:uppercase;color:var(--mutedd)}
/* product */
.pdp{display:grid;grid-template-columns:1.2fr .8fr;gap:clamp(30px,5vw,100px);align-items:center;padding-block:clamp(40px,5vw,80px)}
.pdp .ph{aspect-ratio:1;overflow:hidden;background:var(--night2)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:200 clamp(32px,3.4vw,52px)/1.08 var(--f);letter-spacing:.04em;text-transform:uppercase;margin:18px 0 0}.pdp .d{color:#a6acb8;margin:14px 0 0}
.pdp .price{font:300 22px var(--f);letter-spacing:.08em;margin:26px 0 34px}
.pdp ul{list-style:none;padding:0;margin:40px 0 0;border-top:1px solid var(--line)}.pdp li{padding:14px 0;border-bottom:1px solid var(--line);font:400 12.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:#a6acb8}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(30px,6vw,110px)}
.det table{width:100%;border-collapse:collapse}.det th,.det td{text-align:left;padding:15px 0;border-bottom:1px solid var(--line)}.det th{font:400 12px var(--f);letter-spacing:.22em;text-transform:uppercase;color:var(--mutedd);width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:22px}.form label{display:grid;gap:10px;font:400 11.5px var(--f);letter-spacing:.24em;text-transform:uppercase;color:var(--mutedd)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:inherit;background:transparent;border:0;border-bottom:1px solid var(--muted);padding:10px 0;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:currentColor}
.form button{grid-column:1/-1;justify-self:start;height:54px;padding:0 34px;border:1px solid currentColor;background:transparent;color:inherit;font:400 12.5px var(--f);letter-spacing:.3em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(30px,6vw,110px)}
.facts ul{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:12px;font-size:18px}.facts a{text-decoration:none;border-bottom:1px solid var(--line)}
/* footer */
.ft{padding-block:80px 34px;text-align:center}.ft .logo{display:inline-block;margin-bottom:50px}
.ft .cols{display:grid;grid-template-columns:repeat(3,minmax(0,240px));justify-content:center;gap:clamp(24px,6vw,100px);text-align:left}
.ft h4{font:400 12px var(--f);letter-spacing:.3em;text-transform:uppercase;margin:0 0 16px;color:#fff}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:10px;color:#a6acb8;font-size:15px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.ft .base{margin-top:64px;font:400 11px var(--f);letter-spacing:.26em;text-transform:uppercase;color:var(--muted)}
.note{position:relative;z-index:50;background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}.note~.hd:not(.solid){top:33px}
[data-r]{opacity:0;transform:translateY(20px);transition:opacity 1.4s ease,transform 1.4s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.hd .l{display:none}.hd .w{grid-template-columns:auto 1fr auto}.logo{justify-self:start}}
@media(max-width:780px){.lines,.pillars,.pdp,.det,.two,.hero.plain .grid{grid-template-columns:1fr}.slide{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr;text-align:center}.hd .r a.c{display:none}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*140+"ms";o.observe(el)});document.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){var s=document.querySelector(".slider");if(s)s.scrollBy({left:(b.dataset.go==="next"?1:-1)*s.clientWidth,behavior:"smooth"})})});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; overHero?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#0e131d">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Outfit:wght@200;300;400"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Regent template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd${o.overHero ? "" : " solid"}"><div class="w"><div class="l"><label class="burger" for="nav">Menu</label><a href="${href(t, "/products")}">Collection</a></div>${logo(s, t)}<div class="r"><a class="c" href="${href(t, "/about")}">The house</a><a href="${href(t, "/contact")}">Enquire</a></div></div></header>
<div class="menu" role="dialog" aria-label="Menu"><div class="w"><label class="x" for="nav">Close</label><ul><li><a href="${href(t, "/products")}">The collection</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}<li><a href="${href(t, "/about")}">The house</a></li><li><a href="${href(t, "/contact")}">Enquire</a></li></ul></div></div>
<main>${o.body}</main>
<footer class="ft night"><div class="w">${logo(s, t)}<div class="cols">
<div><h4>Collection</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>The house</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Enquire</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Write to us</a></li>`}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)}</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><h3 class="h3">${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const hero = cover
    ? `<section class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="w txt" data-r>${s.hero.eyebrow ? `<p class="cap">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:20px">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:30px"></div>'}<a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></section>`
    : `<section class="hero plain"><div class="w grid"><div class="txt" data-r>${s.hero.eyebrow ? `<p class="cap">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:20px;font-size:clamp(36px,4.6vw,74px)">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:30px"></div>'}<a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div><div class="ph">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div></section>`;
  const slides = pics.slice(0, 5);
  const lines = top.slice(0, 3);
  return `${hero}
${s.story ? `<section class="sec"><div class="w center" data-r><p class="cap">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:20px">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn" href="${href(t, "/about")}">The house</a></div></section>` : ""}
${slides.length >= 2 ? `<section class="night sec"><div class="w"><p class="cap" style="color:var(--muted);margin-bottom:34px">Selected</p><div class="slider">${slides.map((p, i) => { const { name, detail } = splitTitle(p.title); return `<a class="slide" href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div><p class="n">${String(i + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</p><h2 class="h2">${esc(name)}</h2>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}<span class="btn">Discover</span></div></a>`; }).join("")}</div><div class="hint"><button class="btn" data-go="prev" aria-label="Previous" style="height:44px;padding:0 20px">←</button><span>Swipe</span><button class="btn" data-go="next" aria-label="Next" style="height:44px;padding:0 20px">→</button></div></div></section>` : ""}
${lines.length >= 2 ? `<section class="sec"><div class="w"><div class="center" style="margin-bottom:clamp(40px,5vw,70px)"><p class="cap">The collection</p></div><div class="lines" style="--n:${lines.length}">${lines.map((c) => `<a class="line" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} pieces</span></a>`).join("")}</div></div></section>` : ""}
${s.stats.length ? `<section class="stone sec" style="padding-block:clamp(60px,7vw,110px)"><div class="w nums">${s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${s.featured.length > 5 ? `<section class="sec"><div class="w"><div class="center" style="margin-bottom:clamp(40px,5vw,70px)"><p class="cap">From the collection</p></div><div class="grid">${s.featured.slice(5, 13).map((p) => pc(t, p)).join("")}</div><p style="text-align:center;margin-top:56px"><a class="btn" href="${href(t, "/products")}">View the collection</a></p></div></section>` : ""}
${s.highlights.length ? `<section class="night sec"><div class="w pillars">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="w"><div class="center" style="margin-bottom:40px"><p class="cap">Questions</p><h2 class="h2" style="margin-top:18px">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="stone sec"><div class="w center" data-r><p class="cap">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:20px">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:30px"></div>'}<a class="btn solid" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "The collection";
  const body = `<section class="night lh"><div class="w"><p class="crumbs"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,70px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Collections">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${tabs.slice(0, 24).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : ""}</div></section>
<section class="w" style="padding-block:10px clamp(60px,7vw,110px)"><div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collection"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="text-align:center;margin:40px auto">Nothing matches that yet. <a href="${href(t, "/contact")}">Write to us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn solid" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</section>`;
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
  const body = `<section class="night"><div class="w pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div><p class="crumbs" style="margin:0"><a href="${href(t, "/products")}">Collection</a>${trail.map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="sec" style="padding-block:clamp(56px,7vw,100px)"><div class="w det"><div><p class="cap">Details</p><h2 class="h2" style="margin-top:16px;font-size:clamp(24px,2.6vw,38px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "piece"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table style="margin-top:20px">${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="stone sec" id="enquire" style="padding-block:clamp(56px,7vw,100px)"><div class="w two"><div><p class="cap">Enquire</p><h2 class="h2" style="margin-top:16px">Ask about this piece</h2><p class="lead" style="margin-top:18px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec" style="padding-top:clamp(40px,5vw,80px)"><div class="w"><div class="center" style="margin-bottom:40px"><p class="cap">Also in the collection</p></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="night lh"><div class="w"><p class="cap">The house of ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,70px);margin-top:20px">${esc(st?.heading ?? s.brand.tagline)}</h1></div></section>
${visual ? `<section class="night" style="padding-bottom:clamp(40px,5vw,80px)"><div class="w"><div style="aspect-ratio:21/9;overflow:hidden">${img(visual, s.brand.name, "", true).replace("<img", '<img style="width:100%;height:100%;object-fit:cover"')}</div></div></section>` : ""}
${st ? `<section class="sec"><div class="w center" style="text-align:left;font-size:18.5px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="night sec"><div class="w pillars">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="night lh"><div class="w"><p class="cap">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,70px);margin-top:20px">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</div></section>
<section class="sec" style="padding-block:clamp(56px,7vw,100px)"><div class="w two"><div class="facts"><p class="cap">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
  const meta = t.doc.pages.find((x) => x.slug === "contact");
  return page(t, s, { path: "/contact", title: meta?.metaTitle ?? `Contact | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

export function render(t: RenderTarget, path: string[], query: URLSearchParams): RenderResult | null {
  const s = slots(t.doc);
  const joined = `/${path.join("/")}`.replace(/\/+$/, "") || "/";
  const html = (body: string): RenderResult => ({ kind: "html", status: 200, body });
  if (joined === "/") {
    const meta = t.doc.pages.find((x) => x.slug === "");
    const overHero = !!(s.hero.video ?? s.editorial.find((u) => isLarge(u)));
    return html(page(t, s, { path: "/", title: meta?.metaTitle ?? s.brand.name, description: meta?.metaDescription ?? s.brand.tagline, body: home(t, s), overHero, jsonLd: [{ "@context": "https://schema.org", "@type": "Organization", name: s.brand.name, url: t.origin, ...(s.brand.logo ? { logo: s.brand.logo } : {}) }] }));
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
