import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Legacy": Custom tier. Original design in the language of heritage
// watchmakers: deep navy and silver on white, refined centred type with
// fine rules, a navy hero band, and each collection told as its own split
// row (image, description, a strip of its products), alternating sides.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--navy:#0f1d33;--navy2:#18294a;--ink:#141a24;--muted:#6c7584;--silver:#eef0f3;--line:#dde1e7;--accent:${accent};--on:${onColor(accent)};--f:"Urbanist",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16.5px/1.65 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1380px;margin:0 auto;padding-inline:clamp(18px,4.5vw,72px)}
.ribbon{display:inline-flex;align-items:center;gap:14px;font:600 12px var(--f);letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}.ribbon:before,.ribbon:after{content:"";width:28px;height:1px;background:currentColor;opacity:.5}
.display{font:300 clamp(40px,5.4vw,80px)/1.05 var(--f);letter-spacing:-.02em;margin:0}
.h2{font:300 clamp(30px,3.4vw,50px)/1.1 var(--f);letter-spacing:-.015em;margin:0}
.h3{font:600 18px/1.3 var(--f);letter-spacing:.04em;text-transform:uppercase;margin:0}
.lead{font-size:clamp(16.5px,1.2vw,18.5px);color:var(--muted);max-width:600px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:50px;padding:0 30px;border-radius:999px;background:var(--navy);color:#fff;font:600 13px var(--f);letter-spacing:.16em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:background .25s}
.btn:hover{background:var(--navy2)}.btn.silver{background:#fff;color:var(--navy)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor}.btn.line:hover{background:rgba(127,127,127,.12)}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:20px;align-items:center;height:78px}
.logo{justify-self:center;font:600 24px var(--f);letter-spacing:.26em;text-transform:uppercase;text-decoration:none;color:var(--navy)}.logo img{max-height:44px;width:auto}
.hd nav{display:flex;gap:24px;font:600 13px var(--f);letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--accent)}
.hd .r{justify-self:end;display:flex;gap:18px;align-items:center;font:600 13px var(--f);letter-spacing:.14em;text-transform:uppercase}.hd .r a{text-decoration:none}
.hd form{display:flex;border-bottom:1px solid var(--line)}.hd form input{border:0;outline:none;background:none;font:inherit;letter-spacing:normal;text-transform:none;font-size:14px;width:150px;padding:4px 0}.hd form button{border:0;background:none;cursor:pointer;font:inherit}
.burger{display:none;cursor:pointer;font:600 13px var(--f);letter-spacing:.14em;text-transform:uppercase}#nav{display:none}.drawer{display:none;position:fixed;inset:78px 0 0;z-index:29;background:#fff;overflow:auto;padding:16px clamp(18px,4.5vw,72px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:14px 0;border-bottom:1px solid var(--line);font:300 26px var(--f);text-decoration:none}
/* hero */
.hero{background:var(--navy);color:#fff;text-align:center;position:relative;overflow:hidden}
.hero .t{position:relative;z-index:1;padding-block:clamp(56px,8vw,120px) clamp(30px,4vw,56px);max-width:860px;margin:0 auto}.hero .lead{color:#b9c2d1;margin:22px auto 32px}.hero .ribbon{color:#9fb0c8}
.hero .stage{position:relative;z-index:1;max-width:1100px;margin:0 auto;aspect-ratio:16/8;overflow:hidden}.hero .stage img,.hero .stage video{width:100%;height:100%;object-fit:cover}
.hero .stage.prod{aspect-ratio:auto;display:flex;justify-content:center;gap:clamp(12px,2vw,24px);padding-bottom:clamp(40px,6vw,80px)}.hero .stage.prod div{width:min(300px,28vw);aspect-ratio:1;overflow:hidden;border-radius:50%;background:var(--navy2);box-shadow:0 0 0 1px rgba(255,255,255,.15)}.hero .stage.prod img{width:100%;height:100%;object-fit:cover}
.hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:30%;background:linear-gradient(transparent,rgba(255,255,255,.04))}
/* collection rows */
.sec{padding-block:clamp(64px,8vw,130px)}.center{text-align:center;max-width:820px;margin:0 auto clamp(36px,4vw,64px)}.center .lead{margin:18px auto 0}
.row{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(28px,5vw,90px);align-items:center}.row+.row{margin-top:clamp(56px,7vw,110px)}.row.flip .ph{order:2}
.row .ph{aspect-ratio:5/4;overflow:hidden;background:var(--silver)}.row .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.row .ph:hover img{transform:scale(1.03)}
.row .lead{margin:16px 0 22px}.row .strip{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 26px}
.mini{display:block;text-decoration:none;text-align:center}.mini .p{aspect-ratio:1;overflow:hidden;background:var(--silver)}.mini .p img{width:100%;height:100%;object-fit:cover}.mini span{display:block;font-size:13px;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mini b{display:block;font-size:13px;color:var(--muted);font-weight:500}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px 18px}
.pc{display:block;text-decoration:none;text-align:center}.pc .ph{aspect-ratio:1;overflow:hidden;background:var(--silver)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc h3{font:600 15px/1.35 var(--f);margin:16px 6px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:13.5px;color:var(--muted);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;color:var(--navy);font-weight:600}
.pillars{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:clamp(24px,4vw,64px);text-align:center}.pillars .n{font:300 46px/1 var(--f);color:var(--accent);margin-bottom:14px}.pillars p{color:var(--muted);margin:10px 0 0}
.navyband{background:var(--navy);color:#fff}.navyband .lead{color:#b9c2d1}
.figs{display:flex;justify-content:center;gap:clamp(40px,8vw,140px);flex-wrap:wrap;text-align:center}.figs b{display:block;font:300 clamp(46px,5vw,80px)/1 var(--f)}.figs span{font:600 12px var(--f);letter-spacing:.24em;text-transform:uppercase;color:#9fb0c8}
.faq{max-width:900px;margin:0 auto}.faq details{border-top:1px solid var(--line)}.faq details:last-child{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:500 18px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-weight:300;font-size:24px;line-height:1;flex:none;color:var(--navy)}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 22px;color:var(--muted)}
.closing{text-align:center;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:clamp(60px,8vw,120px)}.closing .lead{margin:16px auto 30px}
/* listing */
.lh{padding-block:clamp(40px,5vw,80px) 10px;text-align:center}.crumbs{font:600 12px var(--f);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin:0 0 16px}.crumbs a{text-decoration:none}.lh .lead{margin:16px auto 0}
.tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding-block:24px}.tabs a{padding:9px 18px;border-radius:999px;border:1px solid var(--line);font:600 13px var(--f);letter-spacing:.08em;text-transform:uppercase;text-decoration:none}.tabs a:hover{border-color:var(--navy)}.tabs a[aria-current]{background:var(--navy);color:#fff;border-color:var(--navy)}.tabs span{color:var(--muted);margin-left:6px}.tabs a[aria-current] span{color:#b9c2d1}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:18px;margin-bottom:22px}.res form{display:flex;border-bottom:1px solid var(--navy);min-width:min(320px,100%)}.res input{flex:1;border:0;outline:none;background:none;font:inherit;padding:8px 0;min-width:0}.res button{border:0;background:none;cursor:pointer;font:600 12.5px var(--f);letter-spacing:.14em;text-transform:uppercase;color:var(--navy)}
.pager{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:56px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,96px);align-items:center;padding-block:clamp(24px,3vw,48px) clamp(56px,7vw,100px)}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:1;overflow:hidden;background:var(--silver)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{text-align:center;max-width:480px;margin:0 auto}.pdp h1{font:300 clamp(30px,3vw,46px)/1.12 var(--f);margin:0}.pdp .d{color:var(--muted);margin:12px 0 0}.pdp .price{font:600 22px var(--f);color:var(--navy);margin:22px 0 28px}
.pdp ul{list-style:none;padding:0;margin:32px 0 0;border-top:1px solid var(--line)}.pdp li{padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px;color:var(--muted)}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}.det>*{min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:18px}.det th,.det td{text-align:left;padding:13px 0;border-bottom:1px solid var(--line)}.det th{font:600 12px var(--f);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:600 12px var(--f);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);background:transparent;border:0;border-bottom:1px solid #b6bdc8;padding:10px 0;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:var(--navy)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 30px;border-radius:999px;border:0;background:var(--navy);color:#fff;font:600 13px var(--f);letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px;font-size:17px}
/* footer */
.ft{background:var(--navy);color:#b9c2d1;padding-block:64px 28px;text-align:center}
.ft .logo{color:#fff;display:inline-block;margin-bottom:40px}.ft .cols{display:grid;grid-template-columns:repeat(3,minmax(0,240px));justify-content:center;gap:clamp(24px,5vw,80px);text-align:left}
.ft h4{color:#fff;font:600 12.5px var(--f);letter-spacing:.2em;text-transform:uppercase;margin:0 0 14px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;font-size:15px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.ft .base{margin-top:50px;font:600 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:#7f8ea6}
.note{background:var(--navy);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(18px);transition:opacity 1.1s ease,transform 1.1s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}.hd .w{grid-template-columns:auto 1fr auto}.logo{justify-self:center}}
@media(max-width:820px){.row,.row.flip,.pdp,.det,.two{grid-template-columns:1fr}.row.flip .ph{order:0}.pillars{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr;text-align:center}.hero .stage.prod div{width:40vw}.hero .stage.prod div:nth-child(3){display:none}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}.row .strip{grid-template-columns:1fr 1fr}.row .strip a:nth-child(3){display:none}.hd .r a{display:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*110+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Urbanist:wght@300;400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Legacy template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><nav aria-label="Main"><a href="${href(t, "/products")}">Collections</a>${top.slice(0, 2).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav><label class="burger" for="nav">Menu</label>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Find</button></form><a href="${href(t, "/contact")}">Contact</a></div></div></header>
<div class="drawer"><a href="${href(t, "/products")}">All collections</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">Our story</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w">${logo(s, t)}<div class="cols">
<div><h4>Collections</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">Our story</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Write to us</a></li>`}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)} · ${esc(s.brand.tagline)}</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const stage = s.hero.video
    ? `<div class="stage"><video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video></div>`
    : cover
      ? `<div class="stage">${img(cover, s.hero.heading, "", true)}</div>`
      : pics.length ? `<div class="stage prod">${pics.slice(0, 3).map((p, i) => `<div>${img(p.image, p.title, "", i === 0)}</div>`).join("")}</div>` : "";
  // Each main collection as its own row: its photo, its description, three of its products.
  const rows = top.slice(0, 3).map((c) => {
    const sub = new Set([c.slug]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const k of t.doc.categories) if (k.parent && sub.has(k.parent) && !sub.has(k.slug)) (sub.add(k.slug), (grew = true));
    }
    return { c, items: pics.filter((p) => p.category && sub.has(p.category)).slice(0, 3) };
  });
  return `<section class="hero"><div class="w t" data-r>${s.hero.eyebrow ? `<p class="ribbon">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:30px"></div>'}<a class="btn silver" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div><div class="w">${stage}</div></section>
${rows.length ? `<section class="w sec"><div class="center"><p class="ribbon">The collections</p><h2 class="h2">${esc(s.brand.name)} collections</h2></div>${rows.map(({ c, items }, i) => `<div class="row${i % 2 ? " flip" : ""}"><a class="ph" data-r href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}</a><div data-r><p class="ribbon" style="margin-bottom:12px">${c.count.toLocaleString("en-US")} pieces</p><h3 class="h2" style="font-size:clamp(28px,2.8vw,42px)">${esc(shortName(c.name))}</h3>${c.description ? `<p class="lead">${esc(c.description)}</p>` : '<div style="height:20px"></div>'}${items.length >= 2 ? `<div class="strip">${items.map((p) => `<a class="mini" href="${href(t, `/products/${p.slug}`)}"><div class="p">${img(p.image, p.title)}</div><span>${esc(splitTitle(p.title).name)}</span>${money(p) ? `<b>${esc(money(p))}</b>` : ""}</a>`).join("")}</div>` : ""}<a class="btn line" href="${href(t, `/collections/${c.slug}`)}">Discover the collection</a></div></div>`).join("")}</section>` : ""}
${s.stats.length >= 2 ? `<section class="navyband sec" style="padding-block:clamp(56px,7vw,100px)"><div class="w figs">${s.stats.slice(0, 3).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="w sec"><div class="center"><p class="ribbon">Selected</p><h2 class="h2">Featured pieces</h2></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div><p style="text-align:center;margin-top:clamp(36px,4vw,56px)"><a class="btn" href="${href(t, "/products")}">View all</a></p></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="center" data-r style="margin-bottom:0"><p class="ribbon">Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn line" href="${href(t, "/about")}">Read our story</a></div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div data-r><div class="n">${["I", "II", "III"][i]}</div><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="center"><p class="ribbon">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><p class="ribbon">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:28px"></div>'}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "All collections";
  const body = `<section class="w lh"><p class="crumbs"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,64px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Collections">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${tabs.slice(0, 24).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:24px"></div>'}</section>
<section class="w"><div class="res"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collections"}" aria-label="Search"><button type="submit">Search</button></form><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="text-align:center;margin:40px auto">Nothing matches that yet. <a href="${href(t, "/contact")}">Write to us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></section>`;
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
  const body = `<div class="w"><p class="crumbs" style="padding-top:24px;margin:0;text-align:center"><a href="${href(t, "/products")}">Collections</a>${trail.map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p></div>
<section class="w pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="ribbon">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="det"><div><p class="ribbon">Details</p><h2 class="h2" style="font-size:clamp(24px,2.4vw,36px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "piece"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two" style="border-top:1px solid var(--line)"><div><p class="ribbon">Enquire</p><h2 class="h2">Ask about this piece</h2><p class="lead" style="margin-top:16px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="center"><p class="ribbon">You may also like</p></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero"><div class="w t"><p class="ribbon">Our story</p><h1 class="display" style="font-size:clamp(34px,4.6vw,66px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div>${visual ? `<div class="w"><div class="stage" style="margin-bottom:clamp(40px,6vw,80px)">${img(visual, s.brand.name, "", true)}</div></div>` : ""}</section>
${st ? `<section class="w sec"><div style="max-width:820px;margin:0 auto;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div data-r><div class="n">${["I", "II", "III"][i]}</div><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="ribbon">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,66px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two"><div class="facts"><p class="ribbon">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
