import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Showroom": Signature tier. Original design in the language of premium
// appliance makers: crisp white and brushed steel, products on light steel
// backdrops, a calm split hero, an inspiration gallery mixing editorial and
// product photos, and a "visit the showroom" consultation block that leads
// to the enquiry form.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#16181a;--muted:#6b7075;--steel:#eceef0;--steel2:#dfe2e5;--line:#dcdfe2;--accent:${accent};--on:${onColor(accent)};--f:"Mulish",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 16.5px/1.65 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(18px,4.5vw,72px)}
.eye{font:700 12px var(--f);letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 14px}
.display{font:300 clamp(40px,5.4vw,84px)/1.04 var(--f);letter-spacing:-.025em;margin:0}
.h2{font:300 clamp(30px,3.4vw,52px)/1.08 var(--f);letter-spacing:-.02em;margin:0}
.h3{font:700 18px/1.3 var(--f);margin:0}
.lead{font-size:clamp(16.5px,1.25vw,19px);color:var(--muted);max-width:580px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 30px;background:var(--ink);color:#fff;font:700 13px var(--f);letter-spacing:.16em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:background .25s}
.btn:hover{background:#34383c}.btn.acc{background:var(--accent);color:var(--on)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor}.btn.line:hover{background:var(--ink);color:#fff;box-shadow:none}
.knob{display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:inset 0 -3px 0 rgba(0,0,0,.25);vertical-align:-2px;margin-right:10px}
.brushed{background:linear-gradient(180deg,#f4f5f6,#e3e6e9);position:relative}.brushed:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 1px,transparent 1px 3px);pointer-events:none}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:32px;height:80px}
.logo{font:800 22px var(--f);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;flex:none}.logo img{max-height:44px;width:auto}
/* A long business name shown as text wraps on a phone instead of pushing the menu off screen. */
@media(max-width:600px){.logo{flex:0 1 auto;min-width:0;font-size:clamp(14px,4.2vw,20px);line-height:1.15;letter-spacing:.03em}}
.hd nav{display:flex;gap:28px;flex:1;white-space:nowrap;overflow:hidden;font:600 14.5px var(--f)}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--muted)}
.hd .btn{height:44px;padding:0 20px;font-size:12px}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 14px var(--f)}#nav{display:none}.drawer{display:none;position:fixed;inset:80px 0 0;z-index:29;background:#fff;overflow:auto;padding:16px clamp(18px,4.5vw,72px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:15px 0;border-bottom:1px solid var(--line);font:300 26px var(--f);text-decoration:none}
/* hero */
.hero{display:grid;grid-template-columns:.9fr 1.1fr;min-height:min(84vh,840px)}
.hero .t{display:flex;flex-direction:column;justify-content:center;padding:clamp(30px,5vw,90px) clamp(18px,4.5vw,72px)}.hero .lead{margin:22px 0 32px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.hero .im{position:relative;overflow:hidden}.hero .im>img,.hero .im>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .im.prod{display:grid;place-items:center}.hero .im.prod .ph{position:relative;z-index:1;width:64%;aspect-ratio:1;overflow:hidden;background:#fff;box-shadow:0 40px 70px -40px rgba(0,0,0,.45)}.hero .im.prod .ph img{width:100%;height:100%;object-fit:cover}
/* sections */
.sec{padding-block:clamp(64px,8vw,130px)}.head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(28px,3.4vw,48px)}.head a{font:700 13px var(--f);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border-bottom:2px solid var(--accent);padding-bottom:4px}
.cats{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:20px}
.cat{display:block;text-decoration:none}.cat .ph{aspect-ratio:4/3;overflow:hidden;padding:9%}.cat .ph img{position:relative;width:100%;height:100%;object-fit:cover;box-shadow:0 24px 40px -28px rgba(0,0,0,.4);transition:transform .8s cubic-bezier(.2,.7,.2,1)}.cat:hover .ph img{transform:scale(1.03)}
.cat .t{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-top:16px;border-bottom:1px solid var(--line);padding-bottom:14px}.cat span{color:var(--muted);font-size:14px}
.gallery{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(160px,22vw);gap:12px}
.gallery a,.gallery div{position:relative;overflow:hidden;background:var(--steel);display:block}.gallery img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.gallery a:hover img{transform:scale(1.04)}
.gallery .g1{grid-column:span 2;grid-row:span 2}.gallery .g4{grid-column:span 2}
.gallery span{position:absolute;left:14px;bottom:14px;background:#fff;padding:8px 12px;font:700 13px var(--f)}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:28px 18px}
.pc{display:block;text-decoration:none}.pc .ph{aspect-ratio:1;overflow:hidden;padding:10%}.pc .ph img{position:relative;width:100%;height:100%;object-fit:cover;box-shadow:0 20px 34px -26px rgba(0,0,0,.45);transition:transform .8s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc h3{font:700 16px/1.35 var(--f);margin:16px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:14px;color:var(--muted);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;font-weight:700}
.visit{display:grid;grid-template-columns:1fr 1fr;align-items:stretch;background:var(--ink);color:#fff}.visit .t{padding:clamp(32px,5vw,90px)}.visit .lead{color:#b5babf;margin:18px 0 30px}.visit .ph{min-height:420px}.visit .ph img{width:100%;height:100%;object-fit:cover}
.visit ul{list-style:none;padding:0;margin:0 0 32px;display:grid;gap:12px}.visit li{display:flex;gap:12px;color:#d9dcdf}.visit li:before{content:"";flex:none;width:8px;height:8px;margin-top:9px;background:var(--accent);border-radius:50%}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(24px,4vw,64px)}.pillars div{border-top:2px solid var(--ink);padding-top:22px}.pillars p{color:var(--muted);margin:10px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.6fr;gap:clamp(24px,5vw,96px)}.faq>*{min-width:0}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:600 18px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-weight:300;font-size:24px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 22px;color:var(--muted)}
/* listing */
.lh{padding-block:clamp(40px,5vw,80px) 10px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin:16px 0 0}
.subs{display:flex;gap:28px;overflow-x:auto;border-bottom:1px solid var(--line);margin:28px 0 22px;scrollbar-width:none}.subs::-webkit-scrollbar{display:none}.subs a{white-space:nowrap;padding:14px 0;font:600 15px var(--f);color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.subs a:hover{color:var(--ink)}.subs a[aria-current]{color:var(--ink);border-color:var(--accent)}.subs span{margin-left:6px;font-size:12.5px}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px}.res form{display:flex;border:1px solid var(--line)}.res input{border:0;outline:none;font:inherit;padding:0 14px;height:46px;width:300px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:700 12.5px var(--f);letter-spacing:.14em;text-transform:uppercase;padding:0 18px;cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:54px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.2fr .8fr;align-items:stretch;border-bottom:1px solid var(--line)}.pdp>*{min-width:0}
.pdp .ph{display:grid;place-items:center;min-height:min(80vh,780px);padding:8%}.pdp .ph img{position:relative;width:100%;max-width:640px;aspect-ratio:1;object-fit:cover;box-shadow:0 40px 70px -40px rgba(0,0,0,.45)}
.pdp .info{padding:clamp(28px,4vw,72px);display:flex;flex-direction:column;justify-content:center}.pdp h1{font:300 clamp(30px,3vw,46px)/1.1 var(--f);letter-spacing:-.02em;margin:0}.pdp .d{color:var(--muted);margin:12px 0 0}
.pdp .price{font:700 24px var(--f);margin:22px 0 26px}.pdp .acts{display:grid;gap:10px}.pdp .btn{width:100%}
.pdp ul{list-style:none;padding:0;margin:28px 0 0;border-top:1px solid var(--line)}.pdp li{padding:13px 0;border-bottom:1px solid var(--line);font-size:15px}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}.det>*{min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:18px}.det th,.det td{text-align:left;padding:13px 0;border-bottom:1px solid var(--line)}.det th{color:var(--muted);font-weight:600;width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form label{display:grid;gap:6px;font:700 12.5px var(--f);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px;border:1px solid var(--line);background:#fff;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 30px;border:0;background:var(--accent);color:var(--on);font:700 13px var(--f);letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
.visit .form label{color:#b5babf}.visit .form input,.visit .form textarea{background:#22262a;border-color:#3a3f44;color:#fff}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px;font-size:17px}
/* footer */
.ft{border-top:1px solid var(--line);padding-block:64px 28px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:34px}.ft p{color:var(--muted);max-width:320px}.ft h4{font:700 12.5px var(--f);letter-spacing:.18em;text-transform:uppercase;margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;color:var(--muted)}.ft a{text-decoration:none}.ft a:hover{color:var(--ink)}
.ft .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:48px;padding-top:22px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(20px);transition:opacity 1s ease,transform 1s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid4{grid-template-columns:repeat(3,1fr)}.hd nav{display:none}.burger{display:block}.hd .btn{display:none}}
@media(max-width:820px){.hero,.visit,.faq,.pdp,.det,.two{grid-template-columns:1fr}.hero .im{min-height:360px;order:-1}.pdp .ph{min-height:0}.cats{grid-template-columns:1fr 1fr}.pillars{grid-template-columns:1fr}.grid4{grid-template-columns:1fr 1fr}.gallery{grid-template-columns:1fr 1fr;grid-auto-rows:44vw}.gallery .g4{grid-column:span 1}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form,.ft .cols,.cats{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*100+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

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
${fontsLink(["Mulish:wght@300;400;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Showroom template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Products</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a></nav><a class="btn" href="${href(t, "/contact")}"><span class="knob"></span>Talk to us</a><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Talk to us</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Products</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Talk to us</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph brushed">${img(p.image, p.title)}</div><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const media = s.hero.video
    ? `<div class="im"><video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video></div>`
    : cover
      ? `<div class="im">${img(cover, s.hero.heading, "", true)}</div>`
      : `<div class="im prod brushed"><div class="ph">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div>`;
  // Gallery: editorial visuals first, then category and product photos, five tiles.
  const gal = [
    ...large.filter((u) => u !== cover).map((u) => ({ img: u, to: "/about", label: "" })),
    ...top.slice(0, 3).map((c) => ({ img: c.image!, to: `/collections/${c.slug}`, label: shortName(c.name) })),
    ...pics.slice(4, 8).map((p) => ({ img: p.image!, to: `/products/${p.slug}`, label: "" })),
  ].slice(0, 5);
  const visitImg = large[1] ?? pics[1]?.image ?? null;
  return `<section class="hero"><div class="t" data-r>${s.hero.eyebrow ? `<p class="eye">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:28px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn line" href="${href(t, "/contact")}">Talk to us</a></div></div>${media}</section>
${top.length >= 2 ? `<section class="w sec"><div class="head"><div><p class="eye">Explore</p><h2 class="h2" data-r>The collection</h2></div><a href="${href(t, "/products")}">View all</a></div><div class="cats" style="--n:${Math.min(3, top.length)}">${top.slice(0, 3).map((c) => `<a class="cat" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph brushed">${img(c.image, c.name)}</div><div class="t"><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} products →</span></div></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="head"><div><p class="eye">Featured</p><h2 class="h2" data-r>Selected for you</h2></div><a href="${href(t, "/products")}">Shop all</a></div><div class="grid4">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
<section class="visit"><div class="t"><p class="eye" style="color:#9aa0a6"><span class="knob"></span>Get advice</p><h2 class="h2">${esc(s.closing?.heading ?? `Plan your project with ${s.brand.name}`)}</h2><p class="lead">${esc(s.closing?.body || "Tell us what you're planning and we'll help you choose the right products.")}</p>${s.highlights.length ? `<ul>${s.highlights.slice(0, 3).map((h) => `<li>${esc(h.title)}</li>`).join("")}</ul>` : ""}<a class="btn acc" href="${href(t, "/contact")}">Talk to us</a></div>${visitImg ? `<div class="ph">${img(visitImg, s.brand.name)}</div>` : ""}</section>
${gal.length >= 5 ? `<section class="w sec"><div class="head"><div><p class="eye">Inspiration</p><h2 class="h2" data-r>Ideas from ${esc(s.brand.name)}</h2></div></div><div class="gallery">${gal.map((g, i) => `<a class="g${i + 1}" href="${href(t, g.to)}">${img(g.img, g.label || s.brand.name)}${g.label ? `<span>${esc(g.label)}</span>` : ""}</a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec"${gal.length >= 5 ? ' style="padding-top:0"' : ""}><div class="pillars">${[{ title: s.story.heading, body: s.story.body.split(/\n{2,}/)[0] ?? "" }, ...s.highlights.slice(0, 2)].map((x) => `<div data-r><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="eye">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const subs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,66px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${subs.length ? `<nav class="subs" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${subs.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:28px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid4">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn line" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}<div style="height:clamp(56px,7vw,100px)"></div></div>`;
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
  const body = `<section class="pdp"><div class="ph brushed">${img(p.image, p.title, "", true)}</div><div class="info"><p class="crumbs"><a href="${href(t, "/products")}">Products</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p><div class="acts">${action.html}<a class="btn line" href="${href(t, "/contact")}">Talk to us</a></div>${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="det"><div><p class="eye">Details</p><h2 class="h2" style="font-size:clamp(24px,2.4vw,36px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="visit" id="enquire"><div class="t"><p class="eye" style="color:#9aa0a6"><span class="knob"></span>Enquire</p><h2 class="h2">Ask about this product</h2><p class="lead">We reply personally, usually within a working day.</p></div><div class="t" style="padding-top:clamp(24px,4vw,90px)">${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec"><div class="head"><h2 class="h2">You may also like</h2></div><div class="grid4">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero" style="min-height:min(64vh,640px)"><div class="t"><p class="eye">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,66px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="w sec"><div style="max-width:840px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars">${s.highlights.slice(0, 3).map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="visit"><div class="t"><p class="eye" style="color:#9aa0a6"><span class="knob"></span>${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(32px,4vw,60px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand).replace(/<a /g, '<a style="color:#fff" ')}</ul>` : ""}</div><div class="t">${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
