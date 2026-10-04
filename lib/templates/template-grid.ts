import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Grid": Template tier. Original design in the language of big
// electronics and appliance retailers: bright white, a sliding hero
// (scroll-snap, no script needed), a strip of small round category icons,
// a bento block of promo tiles, product cards with two clear actions and
// rounded corners. Fast: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#111;--muted:#666;--soft:#f4f4f4;--line:#e6e6e6;--accent:${accent};--on:${onColor(accent)};--f:"Onest",system-ui,sans-serif;--r:20px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(16px,3vw,40px)}
.h1{font:700 clamp(32px,4.4vw,60px)/1.06 var(--f);letter-spacing:-.025em;margin:0}
.h2{font:700 clamp(24px,2.6vw,36px)/1.15 var(--f);letter-spacing:-.02em;margin:0}
.h3{font:700 18px/1.3 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 24px;border-radius:999px;background:var(--ink);color:#fff;font:600 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:opacity .2s}
.btn:hover{opacity:.82}.btn.acc{background:var(--accent);color:var(--on)}.btn.out{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}.btn.sm{height:38px;padding:0 16px;font-size:14px}.btn.white{background:#fff;color:var(--ink)}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:26px;height:68px}
.logo{font:800 23px var(--f);letter-spacing:-.03em;text-decoration:none;flex:none}.logo img{max-height:40px;width:auto}
.hd nav{display:flex;gap:22px;flex:1;white-space:nowrap;overflow:hidden;font:600 15px var(--f)}.hd nav a{text-decoration:none}.hd nav a:hover{text-decoration:underline;text-underline-offset:5px}
.hd form{display:flex;align-items:center;background:var(--soft);border-radius:999px;height:42px;padding:0 6px 0 16px;width:min(320px,30vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:none;cursor:pointer;font:600 14px var(--f);padding:0 8px}
.burger{display:none;margin-left:auto;cursor:pointer;font:600 15px var(--f)}#nav{display:none}.drawer{display:none;border-bottom:1px solid var(--line)}#nav:checked~.drawer{display:block}.drawer .w{padding-block:10px 16px}.drawer a{display:block;padding:12px 0;border-bottom:1px solid var(--line);font-weight:600;text-decoration:none}
.drawer form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 16px;margin:6px 0 10px}.drawer input{flex:1;border:0;background:none;outline:none;font:inherit;min-width:0}.drawer button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:36px;padding:0 14px;font-weight:600}
/* hero slider */
.slides{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:var(--r);margin-top:18px}.slides::-webkit-scrollbar{display:none}
.slide{scroll-snap-align:start;position:relative;min-height:min(560px,70vh);display:grid;grid-template-columns:1fr 1fr;align-items:center;background:var(--soft);overflow:hidden;text-decoration:none}
.slide .t{padding:clamp(28px,5vw,72px)}.slide .t p{color:var(--muted);margin:14px 0 24px;font-size:17px;max-width:520px}.slide .acts{display:flex;gap:10px;flex-wrap:wrap}
.slide .im{height:100%;min-height:320px}.slide .im img{width:100%;height:100%;object-fit:cover}
.slide.cover{grid-template-columns:1fr;color:#fff}.slide.cover .im{position:absolute;inset:0}.slide.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55),transparent 65%)}.slide.cover .t{position:relative;z-index:1}.slide.cover .t p{color:#e3e3e3}
.dots{display:flex;justify-content:center;gap:8px;margin-top:14px}.dots a{width:28px;height:4px;border-radius:2px;background:#d4d4d4}.dots a:first-child{background:var(--ink)}
.kick{font:600 13.5px var(--f);margin:0 0 10px;color:var(--accent)}.slide.cover .kick{color:#fff;opacity:.85}
/* icons strip */
.icons{display:grid;grid-template-columns:repeat(var(--n,8),1fr);gap:10px;padding-top:clamp(32px,4vw,52px)}
.icons a{text-align:center;text-decoration:none;font:600 14px/1.3 var(--f)}.icons .ph{width:min(96px,100%);aspect-ratio:1;margin:0 auto 10px;border-radius:50%;overflow:hidden;background:var(--soft);transition:box-shadow .2s}.icons .ph img{width:100%;height:100%;object-fit:cover}.icons a:hover .ph{box-shadow:0 0 0 2px var(--accent)}
/* bento */
.sec{padding-top:clamp(40px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.sec .top a{font-weight:600;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.bento{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:14px;min-height:520px}
.tile{position:relative;border-radius:var(--r);overflow:hidden;background:var(--soft);text-decoration:none;display:block;min-height:250px}.tile:first-child{grid-row:1/3}
.tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.tile:hover img{transform:scale(1.04)}
.tile:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.5))}
.tile .t{position:absolute;left:22px;right:22px;bottom:20px;z-index:1;color:#fff}.tile .t b{display:block;font:700 22px/1.2 var(--f)}.tile .t span{font-size:14px;opacity:.9}
.tile .t .btn{margin-top:12px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pc{display:flex;flex-direction:column;background:var(--soft);border-radius:var(--r);overflow:hidden}
.pc .ph{display:block;aspect-ratio:1;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{padding:16px 18px 18px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:700 16px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:14px;color:var(--muted);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:10px;font:800 20px var(--f)}.pc .pr small{display:block;font:500 13px var(--f);color:var(--muted)}
.pc .acts{display:flex;gap:8px;margin-top:12px}.pc .acts a{flex:1}
.why{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:14px}.why div{border:1px solid var(--line);border-radius:var(--r);padding:22px}.why b{display:block;font:700 17px var(--f);margin-bottom:6px}.why p{margin:0;color:var(--muted);font-size:15px}
.story{display:grid;grid-template-columns:1fr 1fr;gap:14px}.story .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);min-height:360px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{border-radius:var(--r);background:var(--soft);padding:clamp(24px,4vw,56px);display:flex;flex-direction:column;justify-content:center}.story .t div{color:var(--muted);margin:12px 0 22px}
.qa{max-width:960px;margin:0 auto}.qa details{border-bottom:1px solid var(--line)}.qa summary{list-style:none;cursor:pointer;padding:18px 0;font:600 17px/1.4 var(--f);display:flex;justify-content:space-between;gap:16px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"⌄";font-size:18px}.qa details[open] summary:after{transform:rotate(180deg)}.qa details p{margin:0 0 18px;color:var(--muted)}
.cta{margin-top:clamp(40px,5vw,72px);background:var(--ink);color:#fff;border-radius:var(--r);padding:clamp(28px,4vw,56px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{color:#c3c3c3;margin:8px 0 0}
/* listing */
.crumbs{font-size:14px;color:var(--muted);padding-top:18px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:8px 4px}.lh p{margin:8px 0 0;max-width:760px}
.cats{display:flex;gap:8px;overflow-x:auto;padding-block:16px;scrollbar-width:none}.cats::-webkit-scrollbar{display:none}.cats a{white-space:nowrap;padding:10px 16px;border-radius:999px;background:var(--soft);font:600 14px var(--f);text-decoration:none}.cats a:hover{background:#ebebeb}.cats a[aria-current]{background:var(--ink);color:#fff}.cats span{color:var(--muted);font-weight:500;margin-left:6px}.cats a[aria-current] span{color:#bbb}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 14px}.res form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 16px}.res input{border:0;background:none;outline:none;font:inherit;width:260px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:36px;padding:0 16px;font-weight:600;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:34px 0 6px}.pages a,.pages span{min-width:42px;height:42px;display:grid;place-items:center;border-radius:999px;background:var(--soft);text-decoration:none;font-weight:600;padding:0 14px}.pages a:hover{background:#e9e9e9}.pages [aria-current]{background:var(--ink);color:#fff}.pages .gap{background:none}
/* product */
.pdp{display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(20px,4vw,56px);padding-top:16px;align-items:start}
.pdp .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);aspect-ratio:1}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:700 clamp(26px,2.6vw,36px)/1.15 var(--f);letter-spacing:-.02em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.box{background:var(--soft);border-radius:var(--r);padding:22px;margin-top:20px}.box .pr{font:800 32px var(--f)}.box .acts{display:grid;gap:10px;margin-top:16px}.box .btn{width:100%;height:52px}
.checks{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px;font-size:15px}.checks li:before{content:"✓";color:var(--accent);font-weight:800;margin-right:10px}
.info{margin-top:clamp(28px,4vw,48px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,56px)}.info h2{font:700 20px var(--f);margin:0 0 12px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line)}.info th{width:42%;font-weight:600}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 14px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:13px 16px;border:1px solid #cfcfcf;border-radius:14px;background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 26px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:600 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(20px,5vw,64px);padding-block:clamp(28px,4vw,48px)}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--soft);margin-top:clamp(40px,5vw,72px);padding-block:48px 24px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}.ft h4{font:700 15px var(--f);margin:0 0 12px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#444}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}.ft p{color:var(--muted)}
.ft .base{border-top:1px solid #dcdcdc;margin-top:36px;padding-top:18px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.icons{grid-template-columns:repeat(4,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:780px){.slide,.story,.pdp,.two,.info{grid-template-columns:1fr}.slide .im{order:-1;max-height:300px}.slide.cover .im{max-height:none}.bento{grid-template-columns:1fr;grid-template-rows:none;min-height:0}.tile:first-child{grid-row:auto;min-height:320px}.grid{grid-template-columns:1fr 1fr;gap:10px}.why{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.form,.why,.ft .cols{grid-template-columns:1fr}.pc .acts{flex-direction:column}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  const search = `<form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="What are you looking for?" aria-label="Search products"><button type="submit">Search</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Onest:wght@400;500;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Grid template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Shop</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/contact")}">Support</a></nav>${search}<label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w">${search}<a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Support</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols">
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Support</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>About</h4><ul><li><a href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></li>${extraLinks(t)}</ul></div>
<div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="pr">${esc(money(p)) || "<small>Price on request</small>"}</p><div class="acts"><a class="btn sm out" href="${to}">Learn more</a>${action.enquire ? `<a class="btn sm" href="${to}#enquire">Enquire</a>` : `<a class="btn sm" href="${to}">${t.doc.productAction === "checkout" ? "Buy now" : "View"}</a>`}</div></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  // Slides: the hero, then the two biggest categories.
  const slides = [
    `<div class="slide${cover ? " cover" : ""}"><div class="t">${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:20px"></div>'}<div class="acts"><a class="btn ${cover ? "white" : "acc"}" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">Contact us</a></div></div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div>`,
    ...top.slice(0, 2).map((c) => `<a class="slide" href="${href(t, `/collections/${c.slug}`)}"><div class="t"><p class="kick">${c.count.toLocaleString("en-US")} products</p><h2 class="h1" style="font-size:clamp(28px,3.6vw,50px)">${esc(shortName(c.name))}</h2>${c.description ? `<p>${esc(c.description)}</p>` : '<div style="height:20px"></div>'}<span class="btn">Shop ${esc(shortName(c.name).toLowerCase())}</span></div><div class="im">${img(c.image, c.name)}</div></a>`),
  ];
  const icons = top.slice(0, 8);
  const bento = top.slice(2, 5).length === 3 ? top.slice(2, 5) : top.slice(0, 3);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<div class="w"><section aria-label="Highlights"><div class="slides">${slides.join("")}</div>${slides.length > 1 ? `<div class="dots" aria-hidden="true">${slides.map(() => "<a></a>").join("")}</div>` : ""}</section>
${icons.length >= 4 ? `<section class="icons" style="--n:${icons.length}">${icons.map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div>${esc(shortName(c.name))}</a>`).join("")}</section>` : ""}
${bento.length === 3 ? `<section class="sec"><div class="top"><h2 class="h2">Explore more</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="bento">${bento.map((c, i) => `<a class="tile" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="t"><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span>${i === 0 ? `<br><span class="btn white sm">Shop now</span>` : ""}</div></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Featured products</h2><a href="${href(t, "/products")}">View all</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${trust.length >= 2 ? `<section class="sec"><div class="why" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x) => `<div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><p class="kick">About ${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><div><a class="btn" href="${href(t, "/about")}">Learn more</a></div></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="top" style="justify-content:center"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="cta"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn white" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}</div>`;
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
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="h1" style="font-size:clamp(26px,3vw,40px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="cats" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:16px"></div>'}
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
  const action = productAction(t, p, url, "btn acc");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>Overview</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--soft);border-radius:var(--r);padding-inline:clamp(20px,4vw,48px)"><div><h2 class="h2">Ask about this product</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You may also like</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><div class="slides"><div class="slide"><div class="t"><p class="kick">About ${esc(s.brand.name)}</p><h1 class="h1" style="font-size:clamp(28px,3.6vw,50px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></div></div>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="why" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h) => `<div><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Support</p><section class="two"><div class="facts"><h1 class="h1" style="font-size:clamp(28px,3vw,42px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
