import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Officina": Signature tier. Original design in the language of the great
// Italian machine makers: warm cream and deep espresso, polished-metal
// gradients, the hero product on a lit round pedestal, big numerals, the
// story told as a timeline of the business's own facts.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--cream:#f6f1ea;--paper:#fcf9f4;--espresso:#2a1d16;--roast:#3b2a21;--ink:#211712;--muted:#7d6e63;--line:#e3d8cb;--accent:${accent};--on:${onColor(accent)};--fd:"Red Hat Display",system-ui,sans-serif;--fb:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:400 16.5px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1400px;margin:0 auto;padding-inline:clamp(18px,4.5vw,72px)}
.over{font:700 12.5px var(--fd);letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin:0 0 16px}
.display{font:800 clamp(42px,6vw,96px)/.95 var(--fd);letter-spacing:-.035em;margin:0}
.h2{font:800 clamp(30px,3.6vw,56px)/1 var(--fd);letter-spacing:-.03em;margin:0}
.h3{font:700 20px/1.2 var(--fd);margin:0}
.lead{font-size:clamp(16.5px,1.25vw,19px);color:var(--muted);max-width:580px}
.btn{display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 30px;border-radius:999px;background:var(--accent);color:var(--on);font:700 15px var(--fd);letter-spacing:.04em;text-decoration:none;border:0;cursor:pointer;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 80%,transparent)}.btn.dark{background:var(--espresso);color:var(--cream)}.btn.line{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
.chrome{background:linear-gradient(135deg,#f4f4f4 0%,#c9c9c9 22%,#fbfbfb 40%,#a8a8a8 62%,#eaeaea 80%,#bdbdbd 100%)}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(252,249,244,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:30px;height:78px}
.logo{font:800 26px var(--fd);letter-spacing:-.03em;text-decoration:none;flex:none}.logo img{max-height:46px;width:auto}
.hd nav{display:flex;gap:28px;flex:1;white-space:nowrap;overflow:hidden;font:600 15px var(--fd)}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--accent)}
.hd .btn{height:44px;padding:0 20px;font-size:14px}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 15px var(--fd)}#nav{display:none}.drawer{display:none;position:fixed;inset:78px 0 0;z-index:29;background:var(--paper);overflow:auto;padding:16px clamp(18px,4.5vw,72px)}#nav:checked~.drawer{display:block}.drawer a{display:block;padding:14px 0;border-bottom:1px solid var(--line);font:800 26px var(--fd);text-decoration:none}
/* hero */
.hero{background:radial-gradient(80% 70% at 70% 60%,#fff 0%,var(--cream) 60%)}
.hero .grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,72px);align-items:center;min-height:min(86vh,860px);padding-block:40px}
.hero .lead{margin:24px 0 34px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.pedestal{position:relative;display:grid;place-items:end center;aspect-ratio:1}
.pedestal .disc{position:absolute;left:8%;right:8%;bottom:4%;height:22%;border-radius:50%;box-shadow:0 30px 50px -20px rgba(42,29,22,.45)}
.pedestal .ph{position:relative;z-index:1;width:70%;aspect-ratio:1;border-radius:24px;overflow:hidden;margin-bottom:12%;background:#fff;box-shadow:0 40px 80px -40px rgba(42,29,22,.55);animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}.pedestal .ph img,.pedestal .ph video{width:100%;height:100%;object-fit:cover}
.hero.full{background:var(--espresso);color:var(--cream);position:relative;overflow:hidden}.hero.full>img,.hero.full>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.7}.hero.full .grid{position:relative;grid-template-columns:1fr}.hero.full .grid>div{max-width:760px}.hero.full .lead{color:#dccdbd}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
/* sections */
.sec{padding-block:clamp(64px,8vw,130px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:clamp(28px,3vw,44px)}.sec .top a{font:700 14.5px var(--fd);text-decoration:none;color:var(--accent)}
.lines{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:16px}
.line{display:block;text-decoration:none;background:var(--cream);border-radius:24px;padding:clamp(18px,2vw,28px);transition:background .3s}.line:hover{background:#efe6da}
.line .ph{aspect-ratio:1;border-radius:18px;overflow:hidden;background:#fff}.line .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.line:hover .ph img{transform:scale(1.04)}
.line .t{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-top:18px}.line .t span{font:800 36px/1 var(--fd);color:var(--line)}
.dark{background:var(--espresso);color:var(--cream)}.dark .lead{color:#c8b8a7}
.timeline{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:0;margin-top:clamp(30px,4vw,56px);border-top:2px solid rgba(246,241,234,.2)}
.timeline div{position:relative;padding:34px 24px 0 0}.timeline div:before{content:"";position:absolute;top:-8px;left:0;width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px var(--espresso)}
.timeline b{display:block;font:800 clamp(34px,3.6vw,56px)/1 var(--fd);margin-bottom:10px}.timeline p{color:#c8b8a7;margin:8px 0 0}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px 16px}
.pc{display:block;text-decoration:none}.pc .ph{aspect-ratio:1;border-radius:20px;overflow:hidden;background:var(--cream)}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc .t{padding:14px 4px 0}.pc h3{font:700 17px/1.25 var(--fd);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:14px;color:var(--muted);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;font:700 16px var(--fd);color:var(--accent)}
.feature{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,96px);align-items:center}.feature .ph{aspect-ratio:4/3;border-radius:28px;overflow:hidden;background:var(--cream)}.feature .ph img{width:100%;height:100%;object-fit:cover}.feature .lead{margin:18px 0 28px}
.faq{max-width:900px;margin:0 auto}.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:700 19px/1.35 var(--fd)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";color:var(--accent);font-size:24px;line-height:1;flex:none}.faq details[open] summary:after{content:"−"}.faq details p{margin:0 0 22px;color:var(--muted)}
.closing{border-radius:32px;padding:clamp(48px,7vw,110px) clamp(24px,5vw,90px);text-align:center;color:var(--ink)}.closing .lead{margin:16px auto 28px;color:#4a3d34}
/* listing */
.lh{padding-block:clamp(40px,5vw,80px) 10px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}.lh .lead{margin:16px 0 0}
.chips{display:flex;gap:8px;flex-wrap:wrap;padding-block:24px}.chips a{padding:10px 18px;border-radius:999px;background:var(--cream);font:700 14px var(--fd);text-decoration:none}.chips a:hover{background:#efe6da}.chips a[aria-current]{background:var(--espresso);color:var(--cream)}.chips span{color:var(--muted);margin-left:6px;font-weight:600}.chips a[aria-current] span{color:#c8b8a7}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px}.res form{display:flex;background:var(--cream);border-radius:999px;padding:4px 4px 4px 18px}.res input{border:0;background:none;outline:none;font:inherit;width:280px;min-width:0}.res button{border:0;border-radius:999px;background:var(--espresso);color:var(--cream);height:42px;padding:0 18px;font:700 14px var(--fd);cursor:pointer}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:50px}.pager span{color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(24px,5vw,90px);align-items:center;padding-block:clamp(24px,3vw,48px) clamp(56px,7vw,100px)}.pdp>*{min-width:0}
.pdp h1{font:800 clamp(30px,3.4vw,52px)/1 var(--fd);letter-spacing:-.03em;margin:0}.pdp .d{color:var(--muted);margin:12px 0 0}.pdp .price{font:800 32px var(--fd);color:var(--accent);margin:22px 0 26px}
.pdp ul{list-style:none;padding:0;margin:28px 0 0;display:grid;gap:10px}.pdp li{display:flex;gap:12px;font-size:15px}.pdp li:before{content:"";flex:none;width:10px;height:10px;margin-top:7px;border-radius:50%;background:var(--accent)}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}.det>*{min-width:0}
.det table{width:100%;border-collapse:collapse;margin-top:18px}.det th,.det td{text-align:left;padding:13px 0;border-bottom:1px solid var(--line)}.det th{color:var(--muted);font-weight:500;width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:700 13.5px var(--fd);color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 18px;border:0;border-radius:16px;background:var(--cream)}.form input:focus,.form textarea:focus{outline:2px solid var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:54px;padding:0 30px;border:0;border-radius:999px;background:var(--accent);color:var(--on);font:700 15px var(--fd);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,96px);padding-block:clamp(48px,6vw,90px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px;font-size:17px}
/* footer */
.ft{background:var(--espresso);color:#c8b8a7;padding-block:64px 28px;margin-top:clamp(40px,5vw,80px)}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:34px}.ft .logo{color:var(--cream)}.ft p{max-width:320px}.ft h4{color:var(--cream);font:700 16px var(--fd);margin:0 0 14px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:9px}.ft a{text-decoration:none}.ft a:hover{color:var(--cream)}
.ft .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:48px;padding-top:22px;border-top:1px solid rgba(246,241,234,.15);font-size:13px}
.note{background:var(--espresso);color:var(--cream);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(22px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid4{grid-template-columns:repeat(3,1fr)}.hd nav{display:none}.burger{display:block}.hd .btn{display:none}}
@media(max-width:820px){.hero .grid,.feature,.pdp,.det,.two{grid-template-columns:1fr}.hero .grid{min-height:0;padding-block:30px 60px}.pedestal{max-width:420px;margin:0 auto}.lines{grid-template-columns:1fr}.timeline{grid-template-columns:1fr;border-top:0;border-left:2px solid rgba(246,241,234,.2);padding-left:24px}.timeline div{padding:0 0 28px}.timeline div:before{left:-32px;top:6px}.grid4{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}
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
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#fcf9f4">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Red+Hat+Display:wght@600;700;800", "Red+Hat+Text:wght@400;500"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Officina template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Collection</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">Our story</a></nav><a class="btn" href="${href(t, "/contact")}">Contact</a><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><a href="${href(t, "/products")}">Collection</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">Our story</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Collection</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">Our story</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const txt = `<div data-r>${s.hero.eyebrow ? `<p class="over">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:28px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn line" href="${href(t, "/about")}">Our story</a></div></div>`;
  const hero = cover
    ? `<section class="hero full">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}<div class="w grid">${txt}</div></section>`
    : `<section class="hero"><div class="w grid">${txt}<div class="pedestal"><div class="disc chrome"></div><div class="ph">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div></div></section>`;
  // The story as a timeline of the business's own facts (stats first, then highlights).
  const marks = s.stats.length >= 2 ? s.stats.slice(0, 4).map((x) => ({ big: x.value, title: x.label, body: "" })) : s.highlights.slice(0, 3).map((h, i) => ({ big: String(i + 1).padStart(2, "0"), title: h.title, body: h.body }));
  const feat = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  const lines = top.slice(0, 3);
  return `${hero}
${lines.length >= 2 ? `<section class="w sec"><div class="top"><div><p class="over">The collection</p><h2 class="h2" data-r>Choose your line</h2></div><a href="${href(t, "/products")}">All products →</a></div><div class="lines" style="--n:${lines.length}">${lines.map((c, i) => `<a class="line" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><div class="t"><div><h3 class="h3">${esc(shortName(c.name))}</h3><p style="margin:4px 0 0;color:var(--muted);font-size:14px">${c.count.toLocaleString("en-US")} products</p></div><span>${String(i + 1).padStart(2, "0")}</span></div></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="dark sec"><div class="w"><p class="over">${esc(s.brand.name)}</p><h2 class="h2" style="max-width:860px" data-r>${esc(s.story.heading)}</h2><div class="lead" style="margin-top:18px">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div>${marks.length >= 2 ? `<div class="timeline" style="--n:${marks.length}">${marks.map((m) => `<div data-r><b>${esc(m.big)}</b><h3 class="h3">${esc(m.title)}</h3>${m.body ? `<p>${esc(m.body)}</p>` : ""}</div>`).join("")}</div>` : ""}</div></section>` : ""}
${s.featured.length ? `<section class="w sec"><div class="top"><div><p class="over">Selected</p><h2 class="h2" data-r>Featured</h2></div><a href="${href(t, "/products")}">View all →</a></div><div class="grid4">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${feat && s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="feature"><div class="ph" data-r>${img(feat, s.brand.name)}</div><div data-r><p class="over">Why ${esc(s.brand.name)}</p><h2 class="h2">${esc(s.highlights[0].title)}</h2><p class="lead">${esc(s.highlights[0].body)}</p><a class="btn dark" href="${href(t, "/products")}">Explore the collection</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="top" style="justify-content:center"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing chrome" data-r><p class="over" style="color:var(--espresso)">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : '<div style="height:26px"></div>'}<a class="btn dark" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "The collection";
  const body = `<div class="w"><section class="lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,70px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:24px"></div>'}
<div class="res"><span style="color:var(--muted)">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collection"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid4">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
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
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<section class="hero"><div class="w pdp"><div class="pedestal"><div class="disc chrome"></div><div class="ph">${img(p.image, p.title, "", true)}</div></div><div><p class="crumbs"><a href="${href(t, "/products")}">Collection</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="w"><div class="det"><div><p class="over">Details</p><h2 class="h2" style="font-size:clamp(24px,2.6vw,38px)">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div>${paras(p.description)}${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two" style="border-top:1px solid var(--line)"><div><p class="over">Enquire</p><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:16px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="top"><h2 class="h2">Also in the collection</h2></div><div class="grid4">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const marks = s.stats.length >= 2 ? s.stats.slice(0, 4).map((x) => ({ big: x.value, title: x.label })) : [];
  const body = `<section class="w lh"><p class="over">Our story</p><h1 class="display" style="font-size:clamp(36px,5vw,80px)">${esc(st?.heading ?? s.brand.tagline)}</h1></section>
${visual ? `<section class="w" style="padding-top:30px"><div class="feature" style="grid-template-columns:1fr"><div class="ph" style="aspect-ratio:21/9">${img(visual, s.brand.name, "", true)}</div></div></section>` : ""}
${st ? `<section class="w sec"><div style="max-width:840px;font-size:18px">${paras(st.body)}</div></section>` : ""}
${marks.length ? `<section class="dark sec"><div class="w"><div class="timeline" style="--n:${marks.length};margin-top:0">${marks.map((m) => `<div data-r><b>${esc(m.big)}</b><h3 class="h3">${esc(m.title)}</h3></div>`).join("")}</div></div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="over">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(36px,5vw,80px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two"><div class="facts"><p class="over">Reach us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
