import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { readFacets } from "../facets";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Sleek": Custom tier. Original design in the language of refined luxury
// car makers: a black header over a dark hero with a soft light sweep, a
// white body, a side-scrolling line-up of large cards with a "from" price and
// two actions, experience tiles, and a compare table of featured products.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#111214;--muted:#6a6d72;--soft:#f3f3f4;--line:#dedfe1;--night:#0c0d0f;--accent:${accent};--on:${onColor(accent)};--f:"Instrument Sans",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1500px;margin:0 auto;padding-inline:clamp(16px,4vw,64px)}
.display{font:500 clamp(38px,5.4vw,82px)/1.02 var(--f);letter-spacing:-.035em;margin:0}
.h2{font:500 clamp(28px,3.2vw,48px)/1.08 var(--f);letter-spacing:-.03em;margin:0}
.h3{font:600 19px/1.25 var(--f);margin:0}
.lead{font-size:clamp(16px,1.2vw,19px);color:var(--muted);max-width:600px;margin:0}
.lbl{font:600 12.5px var(--f);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 14px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:50px;padding:0 26px;background:var(--ink);color:#fff;font:600 14.5px var(--f);letter-spacing:.02em;text-decoration:none;border:0;cursor:pointer;transition:background .2s}
.btn:hover{background:#2b2d31}.btn.white{background:#fff;color:var(--ink)}.btn.white:hover{background:var(--soft)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor}.btn.line:hover{background:rgba(127,127,127,.12)}.btn.sm{height:40px;padding:0 16px;font-size:13.5px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:var(--night);color:#fff}
.hd .w{display:flex;align-items:center;gap:30px;height:66px}
.logo{font:600 20px var(--f);letter-spacing:.3em;text-transform:uppercase;text-decoration:none;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.logo img{max-height:36px;width:auto}
.hd nav{display:flex;gap:26px;flex:1;white-space:nowrap;overflow:hidden;font:500 14.5px var(--f)}.hd nav a{text-decoration:none;opacity:.8}.hd nav a:hover{opacity:1}
.hd .r{display:flex;gap:14px;align-items:center}.hd form{display:flex;align-items:center;border-bottom:1px solid #444;height:34px}.hd form input{border:0;background:none;outline:none;color:#fff;font:inherit;font-size:14px;width:170px}.hd form button{border:0;background:none;color:#fff;cursor:pointer;font:600 13px var(--f)}
.burger{display:none;margin-left:auto;cursor:pointer;font:600 14.5px var(--f)}#nav{display:none}.drawer{display:none;position:fixed;inset:66px 0 0;z-index:29;background:var(--night);color:#fff;overflow:auto;padding:16px clamp(16px,4vw,64px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:16px 0;border-bottom:1px solid #26282c;font:500 24px var(--f);text-decoration:none}
/* hero */
.hero{position:relative;background:var(--night);color:#fff;overflow:hidden;min-height:min(88vh,880px);display:flex;align-items:flex-end}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,13,15,.2),rgba(12,13,15,.75))}
.hero .txt{position:relative;z-index:1;padding-block:0 clamp(48px,9vh,110px);max-width:820px}.hero .lead{color:#c9cbcf;margin:20px 0 30px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.hero.sweep{align-items:center}.hero.sweep:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 210deg at 70% 50%,transparent 0 40deg,rgba(255,255,255,.09) 60deg,transparent 90deg);pointer-events:none}.hero.sweep:after{display:none}
.hero.sweep .grid{position:relative;z-index:1;width:100%;display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(24px,4vw,72px);align-items:center;padding-block:60px}
.hero.sweep .ph{aspect-ratio:16/11;overflow:hidden;background:#1a1b1e}.hero.sweep .ph img{width:100%;height:100%;object-fit:cover}.hero.sweep .txt{padding:0}
/* sections */
.sec{padding-block:clamp(64px,8vw,120px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(24px,3vw,40px)}.sec .top a{font-weight:600;text-decoration:none}.sec .top a:hover{text-decoration:underline}
.lineup{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(min(440px,82vw),1fr);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;scrollbar-width:thin}
.model{scroll-snap-align:start;display:flex;flex-direction:column;background:var(--soft)}
.model .ph{aspect-ratio:16/10;overflow:hidden}.model .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.model:hover .ph img{transform:scale(1.03)}
.model .t{padding:22px 24px 24px;display:flex;flex-direction:column;flex:1}.model .t p{color:var(--muted);margin:6px 0 0;font-size:14.5px}.model .from{margin:14px 0 18px;font-size:15px}.model .from b{font-size:20px;font-weight:600}
.model .acts{display:flex;gap:8px;margin-top:auto;flex-wrap:wrap}
.exp{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:16px}
.tile{position:relative;display:block;aspect-ratio:3/4;overflow:hidden;background:var(--soft);color:#fff;text-decoration:none}.tile img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.tile:hover img{transform:scale(1.04)}
.tile:after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.6))}.tile .t{position:absolute;left:24px;right:24px;bottom:24px;z-index:1}.tile .t span{display:block;font-size:14px;opacity:.85;margin-top:4px}
.compare{width:100%;border-collapse:collapse;font-size:15px}.compare th,.compare td{text-align:left;padding:16px 14px;border-bottom:1px solid var(--line);vertical-align:top}.compare thead th{font-weight:600;border-bottom:2px solid var(--ink)}.compare tbody th{color:var(--muted);font-weight:500;width:18%}
.compare .ph{width:100%;max-width:200px;aspect-ratio:1;overflow:hidden;background:var(--soft);margin-bottom:12px}.compare .ph img{width:100%;height:100%;object-fit:cover}.compare a{text-decoration:none}
.cmpwrap{overflow-x:auto}
.story{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(28px,5vw,96px);align-items:center}.story .ph{aspect-ratio:4/3;overflow:hidden;background:var(--soft)}.story .ph img{width:100%;height:100%;object-fit:cover}.story .lead{margin:18px 0 28px}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,90px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:500 18px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-size:22px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 22px;color:var(--muted)}
.closing{background:var(--night);color:#fff}.closing .w{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding-block:clamp(56px,7vw,110px)}.closing .lead{color:#b9bcc1;margin-top:12px}
/* listing */
.lh{padding-block:clamp(36px,5vw,72px) 10px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin-top:14px}
.subs{display:flex;gap:28px;overflow-x:auto;border-bottom:1px solid var(--line);margin:26px 0 22px;scrollbar-width:none}.subs::-webkit-scrollbar{display:none}.subs a{white-space:nowrap;padding:14px 0;font:500 15px var(--f);color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.subs a:hover{color:var(--ink)}.subs a[aria-current]{color:var(--ink);border-color:var(--ink)}.subs span{margin-left:6px;font-size:12.5px}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px}.res form{display:flex;border:1px solid var(--line)}.res input{border:0;outline:none;font:inherit;padding:0 14px;height:44px;width:300px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:600 14px var(--f);padding:0 18px;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.pc{display:flex;flex-direction:column;background:var(--soft);text-decoration:none}.pc .ph{aspect-ratio:16/12;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}.pc .t{padding:18px 20px 22px}.pc h3{font:600 17px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{color:var(--muted);font-size:14px;margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:12px 0 0;font-size:14.5px}.pc .pr b{font-size:18px;font-weight:600}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:48px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.4fr .6fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:22px clamp(48px,6vw,90px)}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:16/11;overflow:hidden;background:var(--soft)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:90px}.pdp h1{font:500 clamp(28px,2.8vw,42px)/1.08 var(--f);letter-spacing:-.03em;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{margin:22px 0 24px;font-size:15px;color:var(--muted)}.pdp .price b{display:block;font:600 28px var(--f);color:var(--ink)}.pdp .btn{width:100%}
.pdp table{width:100%;border-collapse:collapse;margin-top:22px;font-size:14.5px}.pdp th,.pdp td{text-align:left;padding:11px 0;border-bottom:1px solid var(--line)}.pdp th{color:var(--muted);font-weight:500;width:45%}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}.det>*{min-width:0}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form label{display:grid;gap:6px;font:600 13.5px var(--f);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:13px 14px;border:1px solid var(--line);background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 26px;border:0;background:var(--ink);color:#fff;font:600 14.5px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(40px,5vw,80px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
/* footer */
.ft{background:var(--night);color:#a8abb0;padding-block:56px 28px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft .logo{color:#fff}.ft p{max-width:320px}.ft h4{color:#fff;font:600 15px var(--f);margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.ft .base{margin-top:40px;padding-top:18px;border-top:1px solid #26282c;font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(18px);transition:opacity .9s ease,transform .9s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.hd nav,.hd form{display:none}.burger{display:block}.grid{grid-template-columns:1fr 1fr}}
@media(max-width:820px){.hero.sweep .grid,.story,.faq,.pdp,.det,.two{grid-template-columns:1fr}.pdp .info{position:static}.exp{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.logo{letter-spacing:.12em;font-size:18px}.hd .r{display:none}.form,.ft .cols,.grid{grid-template-columns:1fr}.exp{grid-template-columns:1fr}.res input{width:100%}.res form{flex:1}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -5% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*90+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#0c0d0f">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Instrument+Sans:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Sleek template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Line-up</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a></nav><div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Search</button></form><a class="btn white sm" href="${href(t, "/contact")}">Contact</a></div><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Line-up</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Line-up</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="pr">${money(p) ? `<b>${esc(money(p))}</b>` : "Price on request"}</p></div></a>`;
}

/** Lowest price among products, for a "from $X" line. */
const fromPrice = (ps: SiteProduct[]) => {
  const priced = ps.filter((p) => p.price != null && p.price > 0).sort((a, b) => a.price! - b.price!);
  return priced[0] ? money(priced[0]) : "";
};

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const txt = `<div class="txt" data-r>${s.hero.eyebrow ? `<p class="lbl" style="color:#9fa2a7">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:26px"></div>'}<div class="acts"><a class="btn white" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn line" href="${href(t, "/contact")}">Contact</a></div></div>`;
  const hero = cover
    ? `<section class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="w" style="width:100%">${txt}</div></section>`
    : `<section class="hero sweep"><div class="w grid">${txt}<div class="ph">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div></section>`;
  // The line-up: one large card per main category, priced "from" its featured products.
  const lineup = top.slice(0, 8).map((c) => {
    const sub = new Set([c.slug]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
    }
    return { c, from: fromPrice(s.featured.filter((p) => p.category && sub.has(p.category))) };
  });
  const cmp = pics.slice(0, 4);
  const specKeys = (t.doc.facets ?? []).filter((f) => cmp.some((p) => readFacets(p.title)[f.key])).slice(0, 3);
  const storyImg = large.find((u) => u !== cover) ?? pics[4]?.image ?? null;
  return `${hero}
${lineup.length >= 2 ? `<section class="w sec"><div class="top"><div><p class="lbl">The line-up</p><h2 class="h2">Explore the line-up</h2></div><a href="${href(t, "/products")}">View all →</a></div><div class="lineup">${lineup.map(({ c, from }) => `<div class="model"><a class="ph" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}</a><div class="t"><h3 class="h3">${esc(c.name)}</h3><p>${c.count.toLocaleString("en-US")} products${c.description ? ` · ${esc(c.description.slice(0, 90))}` : ""}</p>${from ? `<p class="from">From <b>${esc(from)}</b></p>` : '<div style="height:18px"></div>'}<div class="acts"><a class="btn sm" href="${href(t, `/collections/${c.slug}`)}">Explore</a><a class="btn sm line" href="${href(t, "/contact")}">Enquire</a></div></div></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="story">${storyImg ? `<div class="ph" data-r>${img(storyImg, s.story.heading)}</div>` : ""}<div${storyImg ? "" : ' style="grid-column:1/-1"'} data-r><p class="lbl">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn line" href="${href(t, "/about")}">About us</a></div></div></section>` : ""}
${cmp.length >= 3 ? `<section class="w sec" style="padding-top:0"><div class="top"><div><p class="lbl">Compare</p><h2 class="h2">Featured side by side</h2></div></div><div class="cmpwrap"><table class="compare"><thead><tr><th></th>${cmp.map((p) => `<th><a href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div>${esc(splitTitle(p.title).name)}</a></th>`).join("")}</tr></thead><tbody><tr><th scope="row">Price</th>${cmp.map((p) => `<td>${esc(money(p)) || "On request"}</td>`).join("")}</tr><tr><th scope="row">Category</th>${cmp.map((p) => `<td>${esc(shortName(t.doc.categories.find((c) => c.slug === p.category)?.name ?? "—"))}</td>`).join("")}</tr>${specKeys.map((f) => `<tr><th scope="row">${esc(f.label)}</th>${cmp.map((p) => `<td>${esc(readFacets(p.title)[f.key] ?? "—")}</td>`).join("")}</tr>`).join("")}<tr><th></th>${cmp.map((p) => `<td><a class="btn sm" href="${href(t, `/products/${p.slug}`)}">View</a></td>`).join("")}</tr></tbody></table></div></section>` : s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2">Featured</h2></div><div class="grid">${s.featured.slice(0, 6).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${top.length >= 3 ? `<section class="w sec" style="padding-top:0"><div class="top"><div><p class="lbl">Explore</p><h2 class="h2">More to discover</h2></div></div><div class="exp" style="--n:3">${top.slice(0, 3).map((c) => `<a class="tile" data-r href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="t"><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} products →</span></div></a>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="lbl">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="closing"><div class="w"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}</div><a class="btn white" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const subs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "The line-up";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(32px,4vw,60px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${subs.length ? `<nav class="subs" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${subs.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:26px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></div>`;
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
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 3);
  const trail = categoryNav(t.doc, cat).trail;
  const f = readFacets(p.title);
  const rows = [...(t.doc.facets ?? []).filter((x) => f[x.key]).map((x) => [x.label, f[x.key]] as [string, string]), ...(p.specs ?? []).map((r) => [r.label, r.value] as [string, string])];
  const body = `<div class="w"><p class="crumbs" style="padding-top:20px"><a href="${href(t, "/products")}">Line-up</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="lbl">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${money(p) ? `Price<b>${esc(money(p))}</b>` : "<b>Price on request</b>"}</p>${action.html}${rows.length ? `<table>${rows.slice(0, 8).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}</div></section>
<section class="det"><div><p class="lbl">Overview</p><h2 class="h2" style="font-size:clamp(22px,2.2vw,32px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${s.promise.length ? `<ul style="padding-left:18px;color:var(--muted)">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
${action.enquire ? `<section id="enquire" class="two" style="border-top:1px solid var(--line)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</section>` : ""}
${related.length ? `<section class="sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Also in the line-up</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero sweep" style="min-height:min(64vh,640px)"><div class="w grid"><div class="txt"><p class="lbl" style="color:#9fa2a7">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(32px,4.2vw,64px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="ph">${img(visual, s.brand.name, "", true)}</div></div></section>
${st ? `<section class="w sec"><div style="max-width:820px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="exp" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h) => `<div style="background:var(--soft);padding:clamp(22px,3vw,36px)" data-r><h3 class="h3">${esc(h.title)}</h3><p style="color:var(--muted);margin:10px 0 0">${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><p class="lbl">Contact</p><h1 class="display" style="font-size:clamp(30px,3.6vw,54px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
