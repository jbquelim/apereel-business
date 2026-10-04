import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Torque": Custom tier. Original design in the language of precision
// sports-car makers: light grey and white, crisp medium-weight type, thin
// rules, a left-aligned hero, and a range picker: tabs (pure CSS) that
// switch the product grid between the main categories.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#0e0f11;--muted:#626669;--soft:#eeeff2;--card:#f6f6f7;--line:#d8d9dc;--accent:${accent};--on:${onColor(accent)};--f:"Sora",system-ui,sans-serif;--r:4px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1536px;margin:0 auto;padding-inline:clamp(16px,4vw,64px)}
.display{font:600 clamp(36px,5vw,72px)/1.04 var(--f);letter-spacing:-.03em;margin:0}
.h2{font:600 clamp(26px,2.8vw,42px)/1.1 var(--f);letter-spacing:-.025em;margin:0}
.h3{font:600 17px/1.3 var(--f);margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);color:var(--muted);max-width:600px;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:50px;padding:0 26px;border-radius:var(--r);background:var(--ink);color:#fff;font:500 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:background .2s}
.btn:hover{background:#2c2e33}.btn.ghost{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor}.btn.ghost:hover{background:rgba(127,127,127,.12)}.btn.white{background:#fff;color:var(--ink)}.btn.white:hover{background:var(--soft)}
.arrow:after{content:"›";font-size:20px;line-height:1;margin-left:4px}
.kick{font:500 13px var(--f);color:var(--muted);margin:0 0 14px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:68px}
.logo{justify-self:center;font:600 20px var(--f);letter-spacing:.24em;text-transform:uppercase;text-decoration:none}.logo img{max-height:38px;width:auto}
.hd .l{display:flex;gap:22px;font:500 14.5px var(--f)}.hd .r{justify-self:end;display:flex;gap:16px;align-items:center;font:500 14.5px var(--f)}.hd a{text-decoration:none}.hd a:hover{color:var(--muted)}
.hd form{display:flex;align-items:center;border:1px solid var(--line);border-radius:var(--r);height:38px;padding:0 4px 0 12px}.hd form input{border:0;outline:none;background:none;font:inherit;font-size:14px;width:180px}.hd form button{border:0;background:none;cursor:pointer;font:500 13px var(--f)}
.burger{cursor:pointer}#nav{display:none}.drawer{display:none;position:fixed;inset:68px 0 0;z-index:29;background:#fff;overflow:auto;padding:20px clamp(16px,4vw,64px)}#nav:checked~.drawer{display:block}
.drawer a{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--line);font:500 20px var(--f);text-decoration:none}.drawer a:after{content:"›"}
/* hero */
.hero{position:relative;min-height:min(86vh,860px);display:flex;align-items:flex-end;overflow:hidden;background:var(--soft)}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero.dark{color:#fff}.hero.dark:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0) 60%)}
.hero .txt{position:relative;z-index:1;padding-block:0 clamp(48px,9vh,100px);max-width:780px}.hero .lead{color:inherit;opacity:.85;margin:18px 0 30px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.hero.light{display:grid;grid-template-columns:1fr 1fr;align-items:center;background:var(--soft)}.hero.light>img{position:static;height:100%;max-height:860px}.hero.light .txt{padding:clamp(28px,5vw,80px)}
/* range picker */
.sec{padding-block:clamp(56px,7vw,110px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.sec .top a{font-weight:500;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.picker input{position:absolute;opacity:0;pointer-events:none}
.picker .tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--line);margin-bottom:28px;scrollbar-width:none}.picker .tabs::-webkit-scrollbar{display:none}
.picker label{white-space:nowrap;cursor:pointer;padding:14px 18px;font:500 15px var(--f);color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px}.picker label:hover{color:var(--ink)}
.picker .panel{display:none}
${Array.from({ length: 6 }, (_, i) => `#rp${i}:checked~.tabs label[for=rp${i}]{color:var(--ink);border-color:var(--ink)}#rp${i}:checked~.panels .p${i}{display:block}#rp${i}:focus-visible~.tabs label[for=rp${i}]{outline:2px solid var(--accent)}`).join("")}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pc{display:flex;flex-direction:column;background:var(--card);border-radius:var(--r);overflow:hidden;text-decoration:none;transition:background .2s}.pc:hover{background:var(--soft)}
.pc .ph{aspect-ratio:4/3;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{padding:18px 20px 22px;display:flex;flex-direction:column;flex:1}.pc h3{font:600 17px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{color:var(--muted);font-size:14px;margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:14px;font-size:14.5px}.pc .pr b{font-weight:600}
.pc .go{margin-top:14px;font:500 14px var(--f)}
.picker .all{margin-top:28px}
.figures{display:grid;grid-template-columns:repeat(var(--n,3),1fr);border-top:1px solid var(--line)}.figures div{padding:30px 24px 0 0}
.figures b{display:block;font:600 clamp(36px,4vw,60px)/1 var(--f);letter-spacing:-.03em}.figures span{color:var(--muted);font-size:14.5px}
.story{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,96px);align-items:center}.story .ph{aspect-ratio:4/3;overflow:hidden;border-radius:var(--r);background:var(--soft)}.story .ph img{width:100%;height:100%;object-fit:cover}.story .lead{margin:18px 0 28px}
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.feats div{background:var(--card);border-radius:var(--r);padding:clamp(22px,2.6vw,34px)}.feats p{color:var(--muted);margin:10px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,90px)}.faq>*,.story>*,.det>*,.two>*,.pdp>*{min-width:0}.faq summary>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:500 18px/1.4 var(--f)}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"›";flex:none;width:22px;height:22px;display:grid;place-items:center;transform:rotate(90deg);font-size:22px;line-height:1;transition:transform .2s}.faq details[open] summary:after{transform:rotate(-90deg)}.faq details p{margin:0 0 22px;color:var(--muted)}
.closing{background:var(--ink);color:#fff}.closing .w{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding-block:clamp(48px,6vw,90px)}.closing p{color:#b9bcc2;margin:10px 0 0}
/* listing */
.lh{padding-block:clamp(28px,4vw,56px) 10px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
.lh .lead{margin-top:12px}
.subs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--line);margin:24px 0 20px;scrollbar-width:none}.subs::-webkit-scrollbar{display:none}.subs a{white-space:nowrap;padding:14px 18px;font:500 15px var(--f);color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.subs a:hover{color:var(--ink)}.subs a[aria-current]{color:var(--ink);border-color:var(--ink)}.subs span{margin-left:6px;font-size:12.5px}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px}.res form{display:flex;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}.res input{border:0;outline:none;font:inherit;padding:0 14px;height:44px;width:300px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:500 14px var(--f);padding:0 18px;cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:44px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.3fr .7fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:20px clamp(48px,6vw,90px)}
.pdp .ph{aspect-ratio:4/3;overflow:hidden;border-radius:var(--r);background:var(--soft)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:96px}.pdp h1{font:600 clamp(26px,2.6vw,38px)/1.12 var(--f);letter-spacing:-.025em;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{margin:22px 0 26px;font-size:15px;color:var(--muted)}.pdp .price b{display:block;font:600 28px var(--f);color:var(--ink)}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:26px 0 0;border-top:1px solid var(--line)}.pdp li{padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px;display:flex;gap:12px}.pdp li:before{content:"";flex:none;width:6px;height:6px;margin-top:9px;background:var(--accent)}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}
.det table{width:100%;border-collapse:collapse}.det th,.det td{text-align:left;padding:14px 0;border-bottom:1px solid var(--line)}.det th{color:var(--muted);font-weight:400;width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form label{display:grid;gap:6px;font:500 13.5px var(--f);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:13px 14px;border:1px solid var(--line);border-radius:var(--r);background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 26px;border:0;border-radius:var(--r);background:var(--ink);color:#fff;font:500 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(40px,5vw,80px)}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
/* footer */
.ft{background:var(--soft);padding-block:56px 28px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:600 15px var(--f);margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;color:#3a3d42}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}
.ft .base{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(18px);transition:opacity .8s ease,transform .8s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd .l a,.hd form{display:none}}
@media(max-width:800px){.hero.light,.story,.faq,.pdp,.det,.two{grid-template-columns:1fr}.hero.light>img{order:-1;max-height:360px}.pdp .info{position:static}.feats{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.figures{grid-template-columns:1fr}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}.ft .cols{grid-template-columns:1fr}.res input{width:100%}.res form{flex:1}}
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
${fontsLink(["Sora:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Torque template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><div class="l"><label class="burger" for="nav">☰ Menu</label><a href="${href(t, "/products")}">Range</a></div>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Search</button></form><a href="${href(t, "/contact")}">Contact</a></div></div></header>
<div class="drawer"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
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
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="pr">${money(p) ? `<b>${esc(money(p))}</b>` : "Price on request"}</p><span class="go arrow">Explore</span></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const hero = cover
    ? `<section class="hero dark">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="w" style="width:100%"><div class="txt" data-r>${s.hero.eyebrow ? `<p class="kick" style="color:inherit;opacity:.8">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:26px"></div>'}<div class="acts"><a class="btn white arrow" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div></div></section>`
    : `<section class="hero light"><div class="txt" data-r>${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:26px"></div>'}<div class="acts"><a class="btn arrow" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div>${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</section>`;
  // The range picker: one tab per main category, its products from the featured picks (or its own photo cards).
  const tabs = top.slice(0, 6).map((c, i) => {
    const sub = new Set([c.slug]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
    }
    const own = pics.filter((p) => p.category && sub.has(p.category));
    // Too few featured picks in this category: fill with its subcategories.
    const subs = t.doc.categories.filter((k) => k.parent === c.slug && k.image && (k.count ?? 0) > 0).sort(byRank);
    return { c, i, items: own.slice(0, 4), subs: own.length >= 4 ? [] : subs.slice(0, 4 - Math.min(4, own.length)) };
  });
  const picker = tabs.length >= 2
    ? `<section class="w sec"><div class="top"><div><p class="kick">The range</p><h2 class="h2">Choose a category</h2></div><a href="${href(t, "/products")}">All products ›</a></div><div class="picker">${tabs.map(({ i }) => `<input type="radio" name="rp" id="rp${i}"${i === 0 ? " checked" : ""}>`).join("")}<div class="tabs" role="tablist">${tabs.map(({ c, i }) => `<label for="rp${i}" role="tab">${esc(shortName(c.name))}</label>`).join("")}</div><div class="panels">${tabs.map(({ c, i, items, subs }) => `<div class="panel p${i}"><div class="grid">${items.length || subs.length ? items.map((p) => pc(t, p, false)).join("") + subs.map((k) => `<a class="pc" href="${href(t, `/collections/${k.slug}`)}"><div class="ph">${img(k.image ?? null, k.name)}</div><div class="t"><h3>${esc(shortName(k.name))}</h3><p class="pr">${(k.count ?? 0).toLocaleString("en-US")} products</p><span class="go arrow">Explore</span></div></a>`).join("") : `<a class="pc" href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image ?? null, c.name)}</div><div class="t"><h3>${esc(c.name)}</h3><p class="pr">${(c.count ?? 0).toLocaleString("en-US")} products</p><span class="go arrow">Explore</span></div></a>`}</div><p class="all"><a class="btn ghost arrow" href="${href(t, `/collections/${c.slug}`)}">All ${esc(shortName(c.name).toLowerCase())} · ${(c.count ?? 0).toLocaleString("en-US")}</a></p></div>`).join("")}</div></div></section>`
    : s.featured.length
      ? `<section class="w sec"><div class="top"><h2 class="h2">Featured</h2><a href="${href(t, "/products")}">All products ›</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>`
      : "";
  const storyImg = large.find((u) => u !== cover) ?? pics[4]?.image ?? pics[1]?.image ?? null;
  return `${hero}${picker}
${s.stats.length ? `<section class="w" style="padding-bottom:clamp(56px,7vw,110px)"><div class="figures" style="--n:${Math.min(3, s.stats.length)}">${s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div${storyImg ? "" : ' style="grid-column:1/-1"'} data-r><p class="kick">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ghost arrow" href="${href(t, "/about")}">About us</a></div></div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="feats">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="kick">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="closing"><div class="w"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn white arrow" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const subs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(30px,3.6vw,54px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${subs.length ? `<nav class="subs" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${subs.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:24px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn ghost" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn arrow" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></div>`;
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
  const action = productAction(t, p, url, "btn arrow");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w"><p class="crumbs" style="padding-top:20px"><a href="${href(t, "/products")}">Range</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${money(p) ? `Price<b>${esc(money(p))}</b>` : "<b>Price on request</b>"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="det"><div><p class="kick">Details</p><h2 class="h2" style="font-size:clamp(22px,2.2vw,32px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table style="margin-top:18px">${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></section>
${action.enquire ? `<section id="enquire" class="two" style="border-top:1px solid var(--line)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</section>` : ""}
${related.length ? `<section class="sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Also in the range</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero light" style="min-height:min(64vh,640px)"><div class="txt"><p class="kick">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(32px,4vw,60px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div>${img(visual, s.brand.name, "", true)}</section>
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
