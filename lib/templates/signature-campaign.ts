import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Campaign": Signature tier. Original design in the language of luxury
// outerwear campaigns: monochrome, full-height editorial imagery, a pinned
// text column beside a scrolling column of images, a condensed bold
// wordmark, minimal product cards. Imagery leads, text stays out of its way.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#0b0b0b;--muted:#7a7a7a;--fog:#f4f4f2;--line:#e2e2df;--accent:${accent};--on:${onColor(accent)};--fd:"Archivo",system-ui,sans-serif;--fb:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 15.5px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1600px;margin:0 auto;padding-inline:clamp(16px,3.4vw,52px)}
.tag{font:600 11.5px var(--fb);letter-spacing:.2em;text-transform:uppercase;margin:0}
.display{font:800 clamp(48px,8vw,136px)/.86 var(--fd);letter-spacing:-.04em;text-transform:uppercase;font-stretch:75%;margin:0}
.h2{font:800 clamp(32px,4vw,64px)/.92 var(--fd);letter-spacing:-.03em;text-transform:uppercase;font-stretch:75%;margin:0}
.lead{font-size:clamp(15.5px,1.15vw,17.5px);color:var(--muted);max-width:460px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 26px;background:var(--ink);color:#fff;font:600 12px var(--fb);letter-spacing:.18em;text-transform:uppercase;text-decoration:none;border:1px solid var(--ink);cursor:pointer;transition:background .2s,color .2s}
.btn:hover{background:#fff;color:var(--ink)}.btn.white{background:#fff;color:var(--ink);border-color:#fff}.btn.white:hover{background:transparent;color:#fff}.btn.line{background:transparent;color:inherit;border-color:currentColor}.btn.line:hover{background:var(--ink);color:#fff}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;height:64px;gap:20px}
.logo{justify-self:center;font:800 26px var(--fd);letter-spacing:-.02em;text-transform:uppercase;font-stretch:75%;text-decoration:none}.logo img{max-height:36px;width:auto}
.hd nav{display:flex;gap:22px;font:600 12px var(--fb);letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none}.hd nav a:hover{text-decoration:underline;text-underline-offset:5px}
.hd .r{justify-self:end;display:flex;gap:18px;align-items:center;font:600 12px var(--fb);letter-spacing:.14em;text-transform:uppercase}.hd .r a{text-decoration:none}
.hd form{display:flex;border-bottom:1px solid var(--line)}.hd form input{border:0;outline:none;background:none;font:400 13.5px var(--fb);width:140px;padding:4px 0}.hd form button{border:0;background:none;cursor:pointer;font:inherit}
.burger{display:none;cursor:pointer;font:600 12px var(--fb);letter-spacing:.14em;text-transform:uppercase}#nav{display:none}.drawer{display:none;position:fixed;inset:64px 0 0;z-index:29;background:#fff;overflow:auto;padding:20px clamp(16px,3.4vw,52px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:8px 0;font:800 clamp(34px,8vw,60px)/1.05 var(--fd);text-transform:uppercase;font-stretch:75%;text-decoration:none}
/* hero */
.hero{position:relative;height:calc(100svh - 64px);min-height:540px;overflow:hidden;background:var(--fog);color:#fff}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.5))}
.hero .t{position:absolute;left:0;right:0;bottom:clamp(30px,6vh,70px);z-index:1}.hero .lead{color:#e8e8e8;margin:18px 0 24px}
.hero.duo{display:grid;grid-template-columns:repeat(var(--n,2),1fr);height:auto;min-height:0;color:var(--ink);background:#fff}.hero.duo:after{display:none}.hero.duo .ph{position:relative;overflow:hidden;background:var(--fog);height:min(64vh,640px)}.hero.duo .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero.duo .t{position:static;grid-column:1/-1;padding-block:clamp(28px,4vw,56px) 0}.hero.duo .lead{color:var(--muted)}
/* pinned story */
.pin{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(20px,4vw,72px);padding-block:clamp(60px,8vw,130px)}
.pin .side{position:sticky;top:110px;align-self:start}.pin .lead{margin:18px 0 26px}
.pin .stack{display:grid;gap:clamp(12px,1.6vw,22px)}.pin .stack a,.pin .stack div{display:block;aspect-ratio:4/5;overflow:hidden;background:var(--fog);position:relative;text-decoration:none;color:#fff}.pin .stack img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)}.pin .stack a:hover img{transform:scale(1.03)}
.pin .stack span{position:absolute;left:18px;bottom:16px;font:800 clamp(22px,2.2vw,32px)/1 var(--fd);text-transform:uppercase;font-stretch:75%}
.pin .stack .half{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.6vw,22px);aspect-ratio:auto;background:none}.pin .stack .half a{aspect-ratio:3/4}
/* products */
.sec{padding-block:clamp(56px,8vw,120px)}.head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(24px,3vw,40px)}.head a{font:600 12px var(--fb);letter-spacing:.16em;text-transform:uppercase;text-decoration:none;border-bottom:1px solid currentColor}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(24px,3vw,40px) 4px}
.pc{display:block;text-decoration:none}.pc .ph{aspect-ratio:4/5;overflow:hidden;background:var(--fog)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{display:flex;justify-content:space-between;gap:12px;padding:12px 6px 0}.pc h3{font:500 13.5px/1.35 var(--fb);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{font:500 13.5px var(--fb);white-space:nowrap}
.full{position:relative;height:min(90vh,900px);overflow:hidden;background:var(--fog);color:#fff}.full img{width:100%;height:100%;object-fit:cover}.full .t{position:absolute;left:0;right:0;bottom:clamp(30px,6vh,70px)}.full:after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.45))}.full .t{z-index:1}
.three{display:grid;grid-template-columns:repeat(var(--n,3),1fr);border-top:1px solid var(--ink)}.three div{padding:24px 24px 0 0}.three p{color:var(--muted);margin:8px 0 0}.three b{display:block;font:800 22px/1.05 var(--fd);text-transform:uppercase;font-stretch:75%}
.faq{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(20px,4vw,72px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:18px 0;display:flex;justify-content:space-between;gap:20px;font:500 16.5px/1.4 var(--fb)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";flex:none;font-size:20px;line-height:1}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 18px;color:var(--muted)}
/* listing */
.lh{padding-block:clamp(36px,5vw,70px) 10px}.crumbs{margin:0 0 16px;color:var(--muted)}.crumbs a{text-decoration:none}.lh .lead{margin:14px 0 0}
.tabs{display:flex;gap:6px 22px;flex-wrap:wrap;padding-block:22px;border-bottom:1px solid var(--line);margin-bottom:18px}.tabs a{font:600 12px var(--fb);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;padding:4px 0;border-bottom:1px solid transparent}.tabs a:hover,.tabs a[aria-current]{border-color:var(--ink)}.tabs span{color:var(--muted);margin-left:6px}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px}.res form{display:flex;border-bottom:1px solid var(--ink);min-width:min(320px,100%)}.res input{flex:1;border:0;outline:none;background:none;font:inherit;padding:8px 0;min-width:0}.res button{border:0;background:none;cursor:pointer;font:600 12px var(--fb);letter-spacing:.14em;text-transform:uppercase}
.pager{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:56px;color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.3fr .7fr;gap:clamp(20px,4vw,64px);align-items:start;padding-bottom:clamp(48px,6vw,90px)}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:4/5;overflow:hidden;background:var(--fog)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:96px;padding-top:clamp(20px,3vw,40px)}.pdp h1{font:800 clamp(32px,3.4vw,54px)/.92 var(--fd);text-transform:uppercase;font-stretch:75%;margin:12px 0 0}.pdp .d{color:var(--muted);margin:12px 0 0}
.pdp .price{font:500 17px var(--fb);margin:20px 0 24px}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:26px 0 0;border-top:1px solid var(--line)}.pdp li{padding:12px 0;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted)}
.acc details{border-bottom:1px solid var(--line)}.acc summary{list-style:none;cursor:pointer;padding:16px 0;font:600 12px var(--fb);letter-spacing:.14em;text-transform:uppercase;display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"+"}.acc details[open] summary:after{content:"−"}
.acc .b{padding-bottom:16px;color:#3f3f3f;font-size:14.5px}.acc table{width:100%;border-collapse:collapse}.acc th,.acc td{text-align:left;padding:8px 0;border-bottom:1px solid var(--line)}.acc th{color:var(--muted);font-weight:500;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:600 11.5px var(--fb);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;font-size:15px;color:inherit;background:transparent;border:0;border-bottom:1px solid #bbb;padding:10px 0;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:46px;padding:0 26px;background:var(--ink);color:#fff;border:1px solid var(--ink);font:600 12px var(--fb);letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(20px,4vw,72px);padding-block:clamp(40px,6vw,90px);border-top:1px solid var(--line)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:10px;font-size:16px}
/* footer */
.ft{background:var(--ink);color:#a8a8a8;padding-block:56px 26px}
.ft .word{font:800 clamp(60px,15vw,260px)/.8 var(--fd);letter-spacing:-.05em;text-transform:uppercase;font-stretch:75%;color:#fff;margin:0 0 40px;white-space:nowrap;overflow:hidden}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;font-size:14px}.ft h4{color:#fff;font:600 11.5px var(--fb);letter-spacing:.18em;text-transform:uppercase;margin:0 0 12px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transition:opacity 1.2s ease}[data-r].in{opacity:1}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:820px){.pin,.faq,.pdp,.two{grid-template-columns:1fr}.pin .side,.pdp .info{position:static}.hero.duo{grid-template-columns:1fr}.hero.duo .ph+.ph{display:none}.three{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .t{flex-direction:column;gap:2px}.hd .r a{display:none}}
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
${fontsLink(["Archivo:wdth,wght@75,800", "Inter:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Campaign template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><nav aria-label="Main"><a href="${href(t, "/products")}">Shop</a>${top.slice(0, 2).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav><label class="burger" for="nav">Menu</label>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">→</button></form><a href="${href(t, "/contact")}">Contact</a></div></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><p class="word" aria-hidden="true">${esc(s.brand.name)}</p><div class="cols">
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div>
<div><h4>Client care</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>©${new Date().getFullYear()}</h4><ul><li>${esc(s.brand.tagline)}</li></ul></div></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${money(p) ? `<span class="pr">${esc(money(p))}</span>` : ""}</div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const txt = (white: boolean) => `<div class="w t" data-r>${s.hero.eyebrow ? `<p class="tag">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:12px">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div><a class="btn ${white ? "white" : ""}" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></div>`;
  const hero = cover
    ? `<section class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}${txt(true)}</section>`
    : `<section class="hero duo" style="--n:${Math.max(1, Math.min(2, pics.length))}">${(pics.length ? pics : [{ image: s.hero.image, title: s.hero.heading }]).slice(0, 2).map((p, i) => `<div class="ph">${img(p.image, p.title, "", i === 0)}</div>`).join("")}${txt(false)}</section>`;
  // The pinned story: text holds still while the categories scroll past as full images.
  const stack = top.slice(0, 4);
  const fullImg = large.find((u) => u !== cover) ?? null;
  return `${hero}
${s.story && stack.length >= 2 ? `<section class="w pin"><div class="side" data-r><p class="tag">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:14px">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn line" href="${href(t, "/products")}">Shop all</a></div><div class="stack">${stack.slice(0, 1).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span>${esc(shortName(c.name))}</span></a>`).join("")}${stack.length >= 3 ? `<div class="half">${stack.slice(1, 3).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span>${esc(shortName(c.name))}</span></a>`).join("")}</div>` : ""}${stack.slice(stack.length >= 3 ? 3 : 1, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span>${esc(shortName(c.name))}</span></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="w sec"${s.story && stack.length >= 2 ? ' style="padding-top:0"' : ""}><div class="head"><div><p class="tag">The edit</p><h2 class="h2" style="margin-top:12px">Featured</h2></div><a href="${href(t, "/products")}">Shop all</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${fullImg ? `<section class="full">${img(fullImg, s.brand.name)}<div class="w t"><h2 class="display" style="font-size:clamp(40px,6vw,104px)">${esc(s.brand.tagline || s.brand.name)}</h2></div></section>` : ""}
${s.highlights.length ? `<section class="w sec"><div class="three" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h) => `<div data-r><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="tag">Client care</p><h2 class="h2" style="margin-top:12px">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="w sec" style="padding-top:0;text-align:center"><p class="tag">${esc(s.brand.name)}</p><h2 class="display" style="font-size:clamp(40px,6vw,100px);margin-top:14px">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead" style="margin:16px auto 26px">${esc(s.closing.body)}</p>` : '<div style="height:26px"></div>'}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "Shop all";
  const body = `<section class="w lh"><p class="tag crumbs"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(44px,7vw,116px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${tabs.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:22px;border-bottom:1px solid var(--line);margin-bottom:18px"></div>'}
<div class="res"><span class="tag" style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collection"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Contact us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></section>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products"}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} pieces from ${s.brand.name}.`,
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
  const body = `<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info w"><p class="tag" style="color:var(--muted)"><a href="${href(t, "/products")}" style="text-decoration:none">Shop</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}" style="text-decoration:none">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<div class="acc" style="margin-top:20px"><details open><summary>Details</summary><div class="b">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="b"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two"><div><p class="tag">Client care</p><h2 class="h2" style="margin-top:12px">Ask about this piece</h2><p class="lead" style="margin-top:14px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="head"><h2 class="h2">You may also like</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `${visual ? `<section class="full" style="height:min(70vh,700px)">${img(visual, s.brand.name, "", true)}<div class="w t"><p class="tag">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(40px,6vw,100px);margin-top:12px">${esc(st?.heading ?? s.brand.tagline)}</h1></div></section>` : `<section class="w lh"><p class="tag">About ${esc(s.brand.name)}</p><h1 class="display" style="margin-top:12px">${esc(st?.heading ?? s.brand.tagline)}</h1></section>`}
${st ? `<section class="w sec"><div style="max-width:760px;font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="three" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h) => `<div data-r><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="tag">Client care</p><h1 class="display" style="font-size:clamp(40px,6vw,100px);margin-top:12px">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two" style="margin-top:30px"><div class="facts"><p class="tag">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
