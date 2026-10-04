import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Heritage": Custom tier. Original design in the language of American
// heritage leather houses: warm cream and tan, chunky friendly display type,
// a three-photo collage hero, pill category tabs, numbered craft notes and
// stitched-line details. Gentle motion.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--cream:#f7f1e8;--tan:#e9dcc8;--card:#fffaf2;--ink:#2a2118;--muted:#7a6b5b;--line:#e2d5c2;--accent:${accent};--on:${onColor(accent)};--fd:"Bricolage Grotesque",system-ui,sans-serif;--fb:"Inter",system-ui,sans-serif;--r:14px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--cream);color:var(--ink);font:400 16px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1360px;margin:0 auto;padding-inline:clamp(16px,3.6vw,52px)}
.display{font:800 clamp(40px,5.6vw,84px)/.98 var(--fd);letter-spacing:-.03em;margin:0}
.h2{font:800 clamp(28px,3.2vw,48px)/1.04 var(--fd);letter-spacing:-.025em;margin:0}
.h3{font:700 19px/1.25 var(--fd);margin:0}
.lead{font-size:clamp(16px,1.2vw,18.5px);color:var(--muted);max-width:580px;margin:0}
.kick{font:600 12.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 28px;border-radius:999px;background:var(--ink);color:var(--cream);font:600 15px var(--fb);text-decoration:none;border:0;cursor:pointer;transition:transform .2s,background .2s}
.btn:hover{transform:translateY(-2px)}.btn.acc{background:var(--accent);color:var(--on)}.btn.line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}
.stitch{border:0;border-top:2px dashed var(--line);margin:0}
/* header */
.hd{position:sticky;top:0;z-index:30;background:var(--cream);border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:28px;height:74px}
.logo{font:800 25px var(--fd);letter-spacing:-.03em;text-decoration:none;flex:none}.logo img{max-height:44px;width:auto}
.hd nav{display:flex;gap:26px;flex:1;white-space:nowrap;overflow:hidden;font:600 15px var(--fb)}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--accent)}
.hd form{display:flex;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:999px;height:42px;padding:0 6px 0 16px;width:min(260px,24vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:none;cursor:pointer;font:600 13.5px var(--fb)}
.burger{display:none;margin-left:auto;cursor:pointer;font:600 15px var(--fb)}#nav{display:none}.drawer{display:none;background:var(--cream);border-bottom:1px solid var(--line)}#nav:checked~.drawer{display:block}.drawer .w{padding-block:10px 16px}.drawer a{display:block;padding:13px 0;border-bottom:1px dashed var(--line);font:700 19px var(--fd);text-decoration:none}
/* hero collage */
.hero{display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(24px,4vw,72px);align-items:center;padding-block:clamp(30px,4vw,60px) clamp(56px,7vw,100px)}
.hero .lead{margin:20px 0 30px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.collage{position:relative;aspect-ratio:1.1}.collage .a,.collage .b,.collage .c{position:absolute;overflow:hidden;border-radius:var(--r);background:var(--tan);box-shadow:0 30px 60px -36px rgba(60,40,20,.45)}
.collage img,.collage video{width:100%;height:100%;object-fit:cover}
.collage .a{left:0;top:0;width:64%;height:74%}.collage .b{right:0;top:12%;width:42%;height:46%}.collage .c{right:8%;bottom:0;width:48%;height:44%}
.collage.one .a{width:100%;height:100%}
.badge{position:absolute;left:4%;bottom:6%;z-index:2;background:var(--card);border:1px dashed var(--accent);border-radius:999px;padding:12px 18px;font:700 14px var(--fd)}
/* sections */
.sec{padding-block:clamp(56px,7vw,100px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}.sec .top a{font-weight:600;text-decoration:none;color:var(--accent)}
.pills input{position:absolute;opacity:0;pointer-events:none}.pills .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.pills label{cursor:pointer;padding:10px 18px;border-radius:999px;border:1.5px solid var(--line);font:600 14.5px var(--fb);background:var(--card)}.pills label:hover{border-color:var(--ink)}.pills .panel{display:none}
${Array.from({ length: 5 }, (_, i) => `#hp${i}:checked~.tabs label[for=hp${i}]{background:var(--ink);color:var(--cream);border-color:var(--ink)}#hp${i}:checked~.panels .q${i}{display:block}#hp${i}:focus-visible~.tabs label[for=hp${i}]{outline:2px solid var(--accent)}`).join("")}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 16px}
.pc{text-decoration:none;display:block}.pc .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--tan)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc .t{padding:12px 4px 0}.pc h3{font:700 16px/1.3 var(--fd);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{color:var(--muted);font-size:14px;margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:6px 0 0;font-weight:600}
.cats{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:16px}
.cat{position:relative;display:block;aspect-ratio:3/4;border-radius:var(--r);overflow:hidden;background:var(--tan);text-decoration:none}.cat img{width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.cat:hover img{transform:scale(1.04)}
.cat span{position:absolute;left:14px;right:14px;bottom:14px;background:var(--card);border-radius:999px;padding:10px 16px;font:700 15px var(--fd);display:flex;justify-content:space-between;gap:10px}.cat span i{font-style:normal;color:var(--muted);font:500 13px var(--fb)}
.craft{background:var(--ink);color:var(--cream);border-radius:calc(var(--r) + 10px);padding:clamp(36px,5vw,80px)}.craft .lead{color:#cbbda9;margin:16px 0 0}
.notes{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:clamp(20px,3vw,44px);margin-top:clamp(28px,4vw,52px)}.notes div{border-top:2px dashed rgba(247,241,232,.3);padding-top:22px}
.notes b{display:block;font:800 40px/1 var(--fd);color:var(--accent);margin-bottom:12px}.notes p{color:#cbbda9;margin:8px 0 0}
.story{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(24px,5vw,90px);align-items:center}.story .ph{aspect-ratio:4/3;border-radius:var(--r);overflow:hidden;background:var(--tan)}.story .ph img{width:100%;height:100%;object-fit:cover}.story .lead{margin:16px 0 26px}
.faq{max-width:880px;margin:0 auto}.faq details{background:var(--card);border:1px solid var(--line);border-radius:var(--r);margin-bottom:10px;padding:0 22px}.faq summary{list-style:none;cursor:pointer;padding:20px 0;display:flex;justify-content:space-between;gap:16px;font:700 17px/1.4 var(--fd)}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";color:var(--accent);font-size:22px;line-height:1}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted)}
.closing{text-align:center;border:2px dashed var(--line);border-radius:calc(var(--r) + 10px);padding:clamp(40px,6vw,90px) 20px}.closing .lead{margin:14px auto 26px}
/* shop */
.sh{padding-block:clamp(26px,3vw,44px) 4px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 12px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
.sh .lead{margin-top:12px}
.chips{display:flex;gap:8px;flex-wrap:wrap;padding-block:20px}.chips a{padding:9px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);font:600 14px var(--fb);text-decoration:none}.chips a:hover{border-color:var(--ink)}.chips a[aria-current]{background:var(--ink);color:var(--cream);border-color:var(--ink)}.chips span{color:var(--muted);font-weight:500;margin-left:6px}.chips a[aria-current] span{color:#cbbda9}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px}.res form{display:flex;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 4px 4px 16px}.res input{border:0;background:none;outline:none;font:inherit;width:260px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:var(--cream);height:38px;padding:0 16px;font-weight:600;cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:44px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:18px clamp(48px,6vw,90px)}
.pdp .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--tan)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:96px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:clamp(22px,3vw,36px)}
.pdp h1{font:800 clamp(28px,2.8vw,40px)/1.05 var(--fd);letter-spacing:-.025em;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}.pdp .price{font:700 24px var(--fd);margin:18px 0 22px}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:8px}.pdp li{padding-left:24px;position:relative;font-size:14.5px}.pdp li:before{content:"";position:absolute;left:0;top:9px;width:12px;border-top:2px dashed var(--accent)}
.acc{margin-top:22px}.acc details{border-top:2px dashed var(--line)}.acc summary{list-style:none;cursor:pointer;padding:16px 0;font:700 16px var(--fd);display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"+";color:var(--accent)}.acc details[open] summary:after{content:"−"}
.acc .b{padding-bottom:16px;color:#4a3f33;font-size:15px}.acc table{width:100%;border-collapse:collapse}.acc th,.acc td{text-align:left;padding:8px 0;border-bottom:1px solid var(--line)}.acc th{color:var(--muted);font-weight:500;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 13.5px var(--fb);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:13px 16px;border:1.5px solid var(--line);border-radius:12px;background:var(--card)}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 28px;border:0;border-radius:999px;background:var(--ink);color:var(--cream);font:600 15px var(--fb);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,80px);padding-block:clamp(36px,5vw,70px)}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--tan);margin-top:clamp(48px,6vw,90px);padding-block:56px 26px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:700 16px var(--fd);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#4a3f33}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}
.ft .base{margin-top:40px;padding-top:18px;border-top:2px dashed #d6c6ae;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--ink);color:var(--cream);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(18px);transition:opacity .8s ease,transform .8s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:820px){.hero,.story,.pdp,.two{grid-template-columns:1fr}.pdp .info{position:static}.cats{grid-template-columns:1fr 1fr}.notes{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}.ft .cols{grid-template-columns:1fr}.res input{width:100%}.res form{flex:1}}
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
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#f7f1e8">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800", "Inter:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Heritage template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">Our story</a></nav><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Search</button></form><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">Our story</a><a href="${href(t, "/contact")}">Contact</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 5).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">Our story</a></li>${extraLinks(t)}</ul></div>
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
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const first = s.hero.video ? null : large[0] ?? s.hero.image ?? pics[0]?.image ?? null;
  const others = [...large.slice(1), ...pics.map((p) => p.image!)].filter((u) => u !== first).slice(0, 2);
  const collage = `<div class="collage${others.length < 2 ? " one" : ""}" data-r><div class="a">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(first, s.hero.heading, "", true)}</div>${others.length >= 2 ? `<div class="b">${img(others[0], s.brand.name)}</div><div class="c">${img(others[1], s.brand.name)}</div>` : ""}${s.stats[0] ? `<div class="badge">${esc(s.stats[0].value)} · ${esc(s.stats[0].label)}</div>` : ""}</div>`;
  const tabs = top.slice(0, 5).map((c, i) => {
    const sub = new Set([c.slug]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
    }
    return { c, i, items: pics.filter((p) => p.category && sub.has(p.category)).slice(0, 4) };
  }).filter((x) => x.items.length >= 4);
  const notes = s.steps?.items.length ? s.steps.items : s.highlights;
  const storyImg = large[1] ?? pics[4]?.image ?? null;
  return `<section class="w hero"><div data-r>${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:26px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn line" href="${href(t, "/about")}">Our story</a></div></div>${collage}</section>
${top.length >= 3 ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">See everything →</a></div><div class="cats" style="--n:${Math.min(4, top.length)}">${top.slice(0, 4).map((c) => `<a class="cat" data-r href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span>${esc(shortName(c.name))}<i>${c.count.toLocaleString("en-US")}</i></span></a>`).join("")}</div></section>` : ""}
${tabs.length >= 2 ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">Favourites</h2><a href="${href(t, "/products")}">Shop all →</a></div><div class="pills">${tabs.map(({ i }, n) => `<input type="radio" name="hp" id="hp${i}"${n === 0 ? " checked" : ""}>`).join("")}<div class="tabs">${tabs.map(({ c, i }) => `<label for="hp${i}">${esc(shortName(c.name))}</label>`).join("")}</div><div class="panels">${tabs.map(({ i, items }) => `<div class="panel q${i}"><div class="grid">${items.map((p) => pc(t, p, false)).join("")}</div></div>`).join("")}</div></div></section>`
    : s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">Favourites</h2><a href="${href(t, "/products")}">Shop all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${notes.length >= 2 ? `<section class="w sec" style="padding-top:0"><div class="craft"><p class="kick">How we do it</p><h2 class="h2" style="max-width:760px">${esc(s.steps?.heading ?? `Why ${s.brand.name}`)}</h2><div class="notes" style="--n:${Math.min(3, notes.length)}">${notes.slice(0, 3).map((x, i) => `<div data-r><b>${String(i + 1).padStart(2, "0")}</b><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="story">${storyImg ? `<div class="ph" data-r>${img(storyImg, s.story.heading)}</div>` : ""}<div${storyImg ? "" : ' style="grid-column:1/-1"'} data-r><p class="kick">Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn line" href="${href(t, "/about")}">Read more</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="top" style="justify-content:center"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:22px"></div>'}<a class="btn acc" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "Shop all";
  const body = `<div class="w"><section class="sh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(32px,4vw,58px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:20px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
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
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<div class="acc"><details open><summary>Details</summary><div class="b">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="b"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section id="enquire"><div class="two" style="border-top:2px dashed var(--line)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Pairs well with</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w hero"><div><p class="kick">Our story</p><h1 class="display" style="font-size:clamp(34px,4.4vw,66px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="collage one"><div class="a">${img(visual, s.brand.name, "", true)}</div></div></section>
${st ? `<section class="w sec" style="padding-top:0"><div style="max-width:820px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="craft"><div class="notes" style="--n:${Math.min(3, s.highlights.length)};margin-top:0">${s.highlights.slice(0, 3).map((h, i) => `<div data-r><b>${String(i + 1).padStart(2, "0")}</b><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><p class="kick">Contact</p><h1 class="display" style="font-size:clamp(32px,4vw,58px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
