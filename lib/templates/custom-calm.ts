import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Calm": Custom tier. Original design in the language of premium wellness
// and studio-wear brands: airy warm neutrals, big soft corners, a quiet
// full-width hero with a small centred caption, "shop the look" tiles that
// pair a big image with a short product list, generous three-column grids.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--bg:#fbfaf8;--sand:#efebe4;--stone:#e3ddd3;--ink:#1f1d1a;--muted:#77716a;--line:#e6e1d9;--accent:${accent};--on:${onColor(accent)};--f:"Albert Sans",system-ui,sans-serif;--r:28px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.6 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1480px;margin:0 auto;padding-inline:clamp(14px,3vw,40px)}
.display{font:500 clamp(36px,4.8vw,70px)/1.05 var(--f);letter-spacing:-.03em;margin:0}
.h2{font:500 clamp(28px,3vw,44px)/1.1 var(--f);letter-spacing:-.025em;margin:0}
.h3{font:600 17px/1.3 var(--f);margin:0}
.lead{font-size:clamp(16px,1.2vw,18.5px);color:var(--muted);max-width:560px;margin:0}
.small{font:600 12.5px var(--f);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:50px;padding:0 28px;border-radius:999px;background:var(--ink);color:var(--bg);font:600 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:opacity .2s}
.btn:hover{opacity:.82}.btn.light{background:var(--bg);color:var(--ink)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(251,250,248,.94);backdrop-filter:blur(14px)}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:72px}
.logo{justify-self:center;font:600 23px var(--f);letter-spacing:.06em;text-decoration:none}.logo img{max-height:40px;width:auto}
.hd nav{display:flex;gap:22px;font:500 15px var(--f);white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--muted)}
.hd .r{justify-self:end;display:flex;gap:12px;align-items:center}
.hd form{display:flex;align-items:center;background:var(--sand);border-radius:999px;height:40px;padding:0 6px 0 16px;width:min(240px,22vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:none;cursor:pointer;font:600 13.5px var(--f)}
.burger{display:none;cursor:pointer;font:600 15px var(--f)}#nav{display:none}.drawer{display:none;position:fixed;inset:72px 0 0;z-index:29;background:var(--bg);overflow:auto;padding:16px clamp(14px,3vw,40px)}#nav:checked~.drawer{display:block}
.drawer a{display:block;padding:14px 0;border-bottom:1px solid var(--line);font:500 22px var(--f);text-decoration:none}
/* hero */
.hero{position:relative;border-radius:var(--r);overflow:hidden;background:var(--sand);height:min(82vh,820px);margin-top:4px}
.hero>img,.hero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .cap{position:absolute;left:50%;bottom:clamp(20px,4vw,44px);transform:translateX(-50%);z-index:1;background:rgba(251,250,248,.9);backdrop-filter:blur(10px);border-radius:var(--r);padding:clamp(18px,2.4vw,30px) clamp(22px,3vw,44px);text-align:center;width:min(640px,calc(100% - 28px))}
.hero .cap .lead{margin:10px auto 18px;max-width:none}
.hero.split{display:grid;grid-template-columns:1fr 1fr;height:auto;min-height:min(78vh,760px)}.hero.split>img{position:static;height:100%}.hero.split .cap{position:static;transform:none;background:none;backdrop-filter:none;align-self:center;text-align:left;width:auto;padding:clamp(28px,5vw,80px)}.hero.split .cap .lead{margin:16px 0 26px}
/* sections */
.sec{padding-top:clamp(56px,7vw,110px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}.sec .top a{font-weight:600;text-decoration:none;border-bottom:1.5px solid currentColor}
.cats{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}
.cat{display:block;text-decoration:none}.cat .ph{aspect-ratio:4/5;border-radius:var(--r);overflow:hidden;background:var(--sand)}.cat .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.cat:hover .ph img{transform:scale(1.04)}
.cat b{display:block;margin-top:12px;font:600 16px var(--f);padding-inline:6px}.cat span{font-size:14px;color:var(--muted);padding-inline:6px}
.look{display:grid;grid-template-columns:1.2fr 1fr;gap:12px;align-items:stretch}.look+.look{margin-top:12px}.look.flip{grid-template-columns:1fr 1.2fr}.look.flip .big{order:2}
.look .big{position:relative;border-radius:var(--r);overflow:hidden;background:var(--sand);min-height:520px;text-decoration:none;color:#fff}.look .big img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.look .big:after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.45))}.look .big span{position:absolute;left:28px;bottom:26px;z-index:1;font:500 clamp(24px,2.4vw,34px)/1.1 var(--f);letter-spacing:-.02em}
.look .list{background:var(--sand);border-radius:var(--r);padding:clamp(20px,3vw,36px);display:flex;flex-direction:column;gap:12px}
.mini{display:grid;grid-template-columns:84px 1fr auto;gap:14px;align-items:center;background:var(--bg);border-radius:18px;padding:10px;text-decoration:none}.mini .ph{aspect-ratio:1;border-radius:12px;overflow:hidden;background:var(--stone)}.mini .ph img{width:100%;height:100%;object-fit:cover}
.mini b{display:block;font:600 15px/1.3 var(--f);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mini span{font-size:13.5px;color:var(--muted)}.mini i{font-style:normal;font-weight:600;white-space:nowrap;padding-right:6px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px 12px}
.pc{display:block;text-decoration:none}.pc .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--sand)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.03)}
.pc .t{padding:14px 8px 0;display:flex;justify-content:space-between;gap:16px}.pc h3{font:600 15.5px/1.35 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:14px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{font-weight:600;white-space:nowrap}
.values{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:12px}.values div{background:var(--sand);border-radius:var(--r);padding:clamp(24px,3vw,40px)}.values p{color:var(--muted);margin:10px 0 0}
.values b{display:block;font:500 clamp(34px,3.6vw,52px)/1 var(--f);letter-spacing:-.03em;margin-bottom:10px}
.story{display:grid;grid-template-columns:1fr 1fr;gap:12px}.story .ph{border-radius:var(--r);overflow:hidden;background:var(--sand);min-height:440px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{border-radius:var(--r);background:var(--sand);padding:clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:center}.story .lead{margin:16px 0 26px}
.faq{max-width:860px;margin:0 auto}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:20px 4px;display:flex;justify-content:space-between;gap:16px;font:500 18px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-size:22px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 20px;color:var(--muted);padding-inline:4px}
.closing{margin-top:clamp(56px,7vw,110px);border-radius:var(--r);background:var(--ink);color:var(--bg);text-align:center;padding:clamp(48px,7vw,110px) 20px}.closing .lead{color:#bcb6ad;margin:14px auto 26px}
/* shop */
.sh{padding-block:clamp(28px,4vw,56px) 6px;text-align:center}.crumbs{font-size:14px;color:var(--muted);margin:0 0 12px}.crumbs a{text-decoration:none}.sh .lead{margin:14px auto 0}
.chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding-block:20px}.chips a{padding:10px 18px;border-radius:999px;background:var(--sand);font:500 14.5px var(--f);text-decoration:none}.chips a:hover{background:var(--stone)}.chips a[aria-current]{background:var(--ink);color:var(--bg)}.chips span{color:var(--muted);margin-left:6px}.chips a[aria-current] span{color:#bcb6ad}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px}.res form{display:flex;background:var(--sand);border-radius:999px;padding:4px 4px 4px 18px}.res input{border:0;background:none;outline:none;font:inherit;width:260px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:var(--bg);height:40px;padding:0 18px;font-weight:600;cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:48px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.3fr .7fr;gap:clamp(24px,4vw,64px);align-items:start;padding-block:16px 0}
.pdp .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--sand)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{position:sticky;top:92px}.pdp h1{font:500 clamp(26px,2.6vw,38px)/1.15 var(--f);letter-spacing:-.025em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}.pdp .price{font:600 22px var(--f);margin:18px 0 24px}.pdp .btn{width:100%;height:56px}
.pdp ul{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:8px}.pdp li{background:var(--sand);border-radius:16px;padding:12px 16px;font-size:14.5px}
.acc{margin-top:22px}.acc details{border-top:1px solid var(--line)}.acc details:last-child{border-bottom:1px solid var(--line)}.acc summary{list-style:none;cursor:pointer;padding:18px 0;font:600 16px var(--f);display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"+"}.acc details[open] summary:after{content:"−"}
.acc .b{padding-bottom:18px;color:#4a4641}.acc table{width:100%;border-collapse:collapse;font-size:15px}.acc th,.acc td{text-align:left;padding:8px 0;border-bottom:1px solid var(--line)}.acc th{color:var(--muted);font-weight:500;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 13.5px var(--f);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 18px;border:0;border-radius:18px;background:var(--sand)}.form input:focus,.form textarea:focus{outline:2px solid var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 28px;border:0;border-radius:999px;background:var(--ink);color:var(--bg);font:600 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,80px);padding-block:clamp(36px,5vw,70px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px}
/* footer */
.ft{margin-top:clamp(56px,7vw,110px);padding-block:56px 26px;border-top:1px solid var(--line);font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:600 15px var(--f);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#4a4641}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}
.ft .base{margin-top:40px;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.note{background:var(--ink);color:var(--bg);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(14px);transition:opacity 1s ease,transform 1s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.hd nav,.hd form{display:none}.burger{display:block}.hd .w{grid-template-columns:auto 1fr auto}.logo{justify-self:start}}
@media(max-width:820px){.hero.split,.look,.look.flip,.story,.pdp,.two{grid-template-columns:1fr}.look.flip .big{order:0}.look .big{min-height:380px}.hero.split>img{max-height:380px;order:-1}.pdp .info{position:static}.cats{grid-template-columns:1fr 1fr}.values{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.hero{height:min(70vh,620px)}}
@media(max-width:520px){.form,.ft .cols{grid-template-columns:1fr}.pc .t{flex-direction:column;gap:4px}.pc .d{display:none}.res input{width:100%}.res form{flex:1}.mini{grid-template-columns:64px 1fr}.mini i{display:none}}
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
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#fbfaf8">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Albert+Sans:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Calm template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><nav aria-label="Main"><a href="${href(t, "/products")}">Shop</a>${top.slice(0, 3).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav><label class="burger" for="nav">Menu</label>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Go</button></form><a href="${href(t, "/contact")}" style="text-decoration:none;font-weight:500">Contact</a></div></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 5).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><div><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}</div>${money(p) ? `<span class="pr">${esc(money(p))}</span>` : ""}</div></a>`;
}

function descendants(t: RenderTarget, slug: string) {
  const sub = new Set([slug]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
  }
  return sub;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const cap = (split: boolean) => `<div class="cap">${s.hero.eyebrow ? `<p class="small">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display"${split ? "" : ' style="font-size:clamp(28px,3.4vw,48px)"'}>${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:16px"></div>'}<a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div>`;
  const hero = cover
    ? `<section class="w"><div class="hero">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}${cap(false)}</div></section>`
    : `<section class="w"><div class="hero split">${cap(true)}${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>`;
  // Shop the look: a big image of a category beside a few of its products.
  const looks = top.slice(0, 2).map((c) => {
    const sub = descendants(t, c.slug);
    return { c, items: pics.filter((p) => p.category && sub.has(p.category)).slice(0, 4) };
  }).filter((l) => l.items.length >= 2);
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  const vals = s.stats.length >= 3 ? s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><p style="margin:0">${esc(x.label)}</p></div>`) : s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`);
  return `${hero}
${top.length >= 3 ? `<section class="w sec"><div class="top"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="cats" style="--n:${Math.min(4, top.length)}">${top.slice(0, 4).map((c) => `<a class="cat" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></a>`).join("")}</div></section>` : ""}
${looks.length ? `<section class="w sec"><div class="top"><h2 class="h2">Shop the edit</h2></div>${looks.map((l, i) => `<div class="look${i % 2 ? " flip" : ""}"><a class="big" href="${href(t, `/collections/${l.c.slug}`)}">${img(l.c.image, l.c.name)}<span>${esc(shortName(l.c.name))}</span></a><div class="list">${l.items.map((p) => `<a class="mini" href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div><b>${esc(splitTitle(p.title).name)}</b><span>${esc(splitTitle(p.title).detail || shortName(l.c.name))}</span></div>${money(p) ? `<i>${esc(money(p))}</i>` : ""}</a>`).join("")}<a class="btn line" style="align-self:flex-start;margin-top:auto" href="${href(t, `/collections/${l.c.slug}`)}">Shop ${esc(shortName(l.c.name).toLowerCase())}</a></div></div>`).join("")}</section>` : ""}
${s.featured.length ? `<section class="w sec"><div class="top"><h2 class="h2">Most loved</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="grid">${s.featured.slice(0, 6).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${vals.length ? `<section class="w sec"><div class="values" style="--n:${Math.min(3, vals.length)}">${vals.slice(0, 3).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><p class="small">Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><div><a class="btn" href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></div></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec"><div class="top" style="justify-content:center"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:22px"></div>'}<a class="btn light" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "Shop all";
  const body = `<div class="w"><section class="sh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(30px,3.8vw,56px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:20px"></div>'}</section>
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px auto;text-align:center">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
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
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 3);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w"><p class="crumbs" style="padding-top:14px"><a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="small">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<div class="acc"><details open><summary>Details</summary><div class="b">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="b"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section id="enquire"><div class="two" style="background:var(--sand);border-radius:var(--r);padding-inline:clamp(20px,4vw,56px);margin-top:clamp(36px,4vw,60px)"><div><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:12px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You may also like</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w"><div class="hero split"><div class="cap"><p class="small">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(30px,3.8vw,56px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div>${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="w sec"><div style="max-width:820px;margin:0 auto;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec"><div class="values" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><section class="two"><div class="facts"><p class="small">Contact</p><h1 class="display" style="font-size:clamp(30px,3.8vw,56px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead" style="margin-top:14px">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
