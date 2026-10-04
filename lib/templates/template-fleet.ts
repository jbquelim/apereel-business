import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { byRank, categoryNav, contactItems, esc, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Fleet": Template tier. Original design in the language of trusted
// mass-market makers: clean white and light grey, the brand colour for
// actions, a photo hero with a content card, a "find the right one" panel
// (search plus category buttons), tidy rounded cards with a clear price and
// two actions, a sticky quote bar on phones. Fast: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#1a1c1f;--muted:#5f6368;--soft:#f3f4f6;--line:#e2e4e8;--dark:#1d2024;--accent:${accent};--on:${onColor(accent)};--f:"Figtree",system-ui,sans-serif;--r:12px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1280px;margin:0 auto;padding-inline:clamp(16px,3vw,32px)}
.h1{font:800 clamp(32px,4vw,54px)/1.08 var(--f);letter-spacing:-.02em;margin:0}
.h2{font:800 clamp(24px,2.6vw,34px)/1.15 var(--f);letter-spacing:-.015em;margin:0}
.h3{font:700 18px/1.3 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border-radius:8px;background:var(--accent);color:var(--on);font:700 15px var(--f);text-decoration:none;border:0;cursor:pointer;transition:filter .2s}
.btn:hover{filter:brightness(.92)}.btn.out{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}.btn.out:hover{background:var(--soft);filter:none}.btn.dark{background:var(--ink);color:#fff}
/* header */
.hd{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:30}
.hd .w{display:flex;align-items:center;gap:28px;height:72px}
.logo{font:800 22px var(--f);letter-spacing:-.02em;text-decoration:none;flex:none}.logo img{max-height:44px;width:auto}
.hd nav{display:flex;gap:24px;font:600 15px var(--f);flex:1;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none;padding:24px 0;border-bottom:3px solid transparent}.hd nav a:hover{border-color:var(--accent)}
.hd .btn{height:42px;padding:0 18px;font-size:14px;margin-left:auto}
.burger{display:none;cursor:pointer;font:600 15px var(--f)}#nav{display:none}
.drawer{display:none;border-bottom:1px solid var(--line);background:#fff}#nav:checked~.drawer{display:block}.drawer .w{padding-block:12px 18px}.drawer a{display:block;padding:12px 0;border-bottom:1px solid var(--line);font-weight:600;text-decoration:none}
/* hero */
.hero{position:relative;margin-top:20px;border-radius:var(--r);overflow:hidden;background:var(--soft);min-height:min(560px,72vh);display:flex;align-items:flex-end}
.hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero.prod{display:grid;grid-template-columns:1fr 1fr;align-items:stretch}.hero.prod>img{position:static}
.hero .card{position:relative;background:#fff;border-radius:var(--r);padding:clamp(22px,3vw,40px);margin:clamp(16px,3vw,36px);max-width:560px;box-shadow:0 20px 50px -30px rgba(0,0,0,.4)}
.hero.prod .card{align-self:center;box-shadow:none;background:transparent;margin:clamp(16px,3vw,48px)}
.hero .card p{margin:12px 0 22px;color:var(--muted);font-size:17px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.kick{display:inline-block;font:700 13px var(--f);color:var(--accent);margin:0 0 10px;letter-spacing:.02em}
/* finder */
.finder{margin-top:20px;border:1px solid var(--line);border-radius:var(--r);padding:clamp(20px,3vw,32px)}
.finder .head{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:20px}
.finder form{display:flex;flex:1;max-width:520px;border:1.5px solid var(--ink);border-radius:8px;overflow:hidden}.finder input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 14px;height:46px}.finder button{border:0;background:var(--ink);color:#fff;font:700 14px var(--f);padding:0 18px;cursor:pointer}
.picks{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}
.pick{display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--line);border-radius:10px;text-decoration:none;transition:border-color .2s,box-shadow .2s}.pick:hover{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.pick .ph{width:56px;height:56px;border-radius:8px;overflow:hidden;background:var(--soft);flex:none}.pick .ph img{width:100%;height:100%;object-fit:cover}
.pick b{display:block;font-size:15px;line-height:1.25}.pick span{font-size:13px;color:var(--muted)}
/* sections */
.sec{padding-top:clamp(44px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:20px}.sec .top a{font-weight:700;color:var(--accent);text-decoration:none}
.why{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}.why div{background:var(--soft);border-radius:var(--r);padding:24px}
.why i{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--on);font:800 15px var(--f);font-style:normal;margin-bottom:14px}.why p{margin:6px 0 0;color:var(--muted);font-size:15px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pc{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#fff;transition:box-shadow .2s}.pc:hover{box-shadow:0 14px 34px -22px rgba(0,0,0,.4)}
.pc .ph{aspect-ratio:1;background:var(--soft);overflow:hidden;display:block}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:16px;display:flex;flex-direction:column;gap:4px;flex:1}.pc .t a{text-decoration:none}
.pc h3{font:700 16px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:14px;color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:10px;font:800 20px var(--f)}.pc .pr small{display:block;font:500 12px var(--f);color:var(--muted)}
.pc .acts{display:flex;gap:8px;margin-top:12px}.pc .acts a{flex:1;height:40px;font-size:14px;padding:0 10px}
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,56px);align-items:center;background:var(--soft);border-radius:var(--r);overflow:hidden}
.split .ph{height:100%;min-height:320px}.split .ph img{width:100%;height:100%;object-fit:cover}.split .t{padding:clamp(24px,4vw,56px)}.split .t div{color:var(--muted);margin:12px 0 22px}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:12px}.qa details{border:1px solid var(--line);border-radius:10px;padding:0 18px}.qa summary{list-style:none;cursor:pointer;padding:16px 0;font-weight:700;display:flex;justify-content:space-between;gap:14px}
.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";color:var(--accent);font-size:20px;line-height:1}.qa details[open] summary:after{content:"–"}.qa details p{margin:0 0 16px;color:var(--muted)}
.cta{margin-top:clamp(44px,5vw,72px);background:var(--accent);color:var(--on);border-radius:var(--r);padding:clamp(28px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.cta p{margin:6px 0 0;opacity:.85}.cta .btn{background:var(--on);color:var(--accent)}
/* listing */
.crumbs{font-size:14px;color:var(--muted);padding-top:18px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:12px 4px}.lh p{margin:8px 0 0;max-width:760px}
.tabs{display:flex;gap:8px;overflow-x:auto;padding-block:16px;scrollbar-width:thin}.tabs a{white-space:nowrap;padding:9px 16px;border:1px solid var(--line);border-radius:999px;font:600 14px var(--f);text-decoration:none}.tabs a:hover{border-color:var(--ink)}.tabs a[aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.tabs a span{color:var(--muted);font-weight:500;margin-left:6px}.tabs a[aria-current] span{color:#ccc}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 16px}.res form{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:40px;width:260px;min-width:0}.res button{border:0;background:var(--soft);font-weight:700;padding:0 14px;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:36px 0 10px}.pages a,.pages span{min-width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;text-decoration:none;font-weight:700;padding:0 12px}.pages a:hover{border-color:var(--ink)}.pages [aria-current]{background:var(--accent);color:var(--on);border-color:var(--accent)}.pages .gap{border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(24px,4vw,56px);padding-top:20px;align-items:start}
.pdp .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);aspect-ratio:1}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:800 clamp(26px,2.6vw,36px)/1.15 var(--f);letter-spacing:-.015em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.box{border:1px solid var(--line);border-radius:var(--r);padding:20px;margin-top:20px}.box .pr{font:800 30px var(--f)}.box .acts{display:grid;gap:10px;margin-top:16px}.box .btn{width:100%}
.checks{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:8px;font-size:15px}.checks li{display:flex;gap:10px}.checks li:before{content:"✓";color:var(--accent);font-weight:800}
.info{margin-top:clamp(32px,4vw,52px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(24px,4vw,56px)}.info h2{font:800 20px var(--f);margin:0 0 12px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}.info tr:nth-child(odd){background:var(--soft)}.info th{width:42%;font-weight:600}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 14px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:12px 14px;border:1px solid #c4c8ce;border-radius:8px;background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 26px;border:0;border-radius:8px;background:var(--accent);color:var(--on);font:700 15px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,64px);padding-block:clamp(28px,4vw,48px)}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
.quote{display:none}
/* footer */
.ft{background:var(--dark);color:#c9ccd1;margin-top:clamp(44px,5vw,72px);padding-block:48px 24px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:32px}.ft .logo{color:#fff}.ft .logo img{filter:brightness(0) invert(1)}.ft h4{color:#fff;font:700 15px var(--f);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}.ft a{text-decoration:none}.ft a:hover{color:#fff}.ft p{max-width:300px}
.ft .base{border-top:1px solid #33373d;margin-top:36px;padding-top:18px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:#8d929a}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.why{grid-template-columns:1fr 1fr}.picks{grid-template-columns:repeat(3,1fr)}.hd nav{display:none}.burger{display:block;margin-left:12px}}
@media(max-width:760px){.hero.prod,.split,.pdp,.two,.info,.qa{grid-template-columns:1fr}.hero.prod>img{max-height:320px}.hero{min-height:0;flex-direction:column;align-items:stretch}.hero>img{position:static;height:260px}.hero .card{margin:0;border-radius:0;box-shadow:none}
.picks{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr 1fr;gap:10px}.ft .cols{grid-template-columns:1fr 1fr}.hd .btn{display:none}
.quote{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:30;background:#fff;border-top:1px solid var(--line);padding:10px 16px;gap:10px}.quote .btn{flex:1}body{padding-bottom:70px}}
@media(max-width:480px){.why,.form,.ft .cols{grid-template-columns:1fr}.pc .acts{flex-direction:column}.res input{width:100%}.res form{flex:1}.pc .d{display:none}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

const quoteLabel = (t: RenderTarget) => (t.doc.productAction === "enquire" ? "Get a quote" : "Contact us");

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Figtree:wght@400;500;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Fleet template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a></nav><a class="btn" href="${href(t, "/contact")}">${quoteLabel(t)}</a><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Products</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Company</h4><ul><li><a href="${href(t, "/about")}">About us</a></li><li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
<div class="quote"><a class="btn out" href="${href(t, "/products")}">Browse</a><a class="btn" href="${href(t, "/contact")}">${quoteLabel(t)}</a></div>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="pr">${esc(money(p)) || '<small>Price on request</small>'}</p><div class="acts"><a class="btn out" href="${to}">View</a>${t.doc.productAction === "enquire" || !money(p) ? `<a class="btn" href="${to}#enquire">Quote</a>` : ""}</div></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const splitImg = large.find((u) => u !== cover) ?? s.featured.find((p) => p.image && p.image !== s.hero.image)?.image ?? null;
  const card = `<div class="card">${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : ""}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">${quoteLabel(t)}</a></div></div>`;
  const hero = cover ? `<section class="hero">${img(cover, s.hero.heading, "", true)}${card}</section>` : `<section class="hero prod">${card}${img(s.hero.image, s.hero.heading, "", true)}</section>`;
  const picks = top.slice(0, 8);
  return `<div class="w">${hero}
<section class="finder"><div class="head"><h2 class="h2">Find what you need</h2><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search by name or part number" aria-label="Search products"><button type="submit">Search</button></form></div>
${picks.length ? `<div class="picks" style="--n:${Math.min(4, picks.length)}">${picks.map((c) => `<a class="pick" href="${href(t, `/collections/${c.slug}`)}"><span class="ph">${img(c.image, c.name)}</span><span><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></span></a>`).join("")}</div>` : `<p class="muted" style="margin:0">Browse <a href="${href(t, "/products")}">all ${s.doc.products.length} products</a> or ask us for anything you can't find.</p>`}</section>
${trust.length >= 2 ? `<section class="sec"><div class="why" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x, i) => `<div><i>${i + 1}</i><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Popular products</h2><a href="${href(t, "/products")}">View all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="split">${splitImg ? `<div class="ph">${img(splitImg, s.story.heading)}</div>` : ""}<div class="t"${splitImg ? "" : ' style="grid-column:1/-1"'}><p class="kick">About ${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn dark" href="${href(t, "/about")}">Learn more</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="top"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="cta"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}</div>`;
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
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Search results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All products</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="h1" style="font-size:clamp(26px,3vw,40px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${tabs.length ? `<nav class="tabs" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All products"))}</a>` : ""}${tabs.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:16px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : ""}</div>`;
  return page(t, s, {
    path: st.page > 1 && !st.q ? `${st.path}?page=${st.page}` : st.path,
    title: metaTitle(`${title}${st.page > 1 ? ` (page ${st.page})` : ""}`, s.brand.name),
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q,
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All products</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>Product details</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--soft);border-radius:var(--r);padding-inline:clamp(20px,4vw,48px)"><div><h2 class="h2">Request a quote</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">Related products</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › About</p>
<section class="sec" style="padding-top:16px"><div class="split">${visual ? `<div class="ph">${img(visual, s.brand.name, "", true)}</div>` : ""}<div class="t"${visual ? "" : ' style="grid-column:1/-1"'}><p class="kick">About ${esc(s.brand.name)}</p><h1 class="h1" style="font-size:clamp(28px,3.4vw,46px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div></div></section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="why">${s.highlights.map((h, i) => `<div><i>${i + 1}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Contact</p>
<section class="two"><div class="facts"><h1 class="h1" style="font-size:clamp(28px,3vw,42px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
