import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Arena": Template tier. Original design in the language of sneaker and
// sport retailers: high energy, black and white with the brand colour as a
// hard accent, italic condensed headlines, a promo bar, a hero with slanted
// panels, a swipeable "new in" row, bold category blocks and a big list of
// every category. Fast: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#0b0b0b;--muted:#6b6b6b;--soft:#f2f2f2;--line:#e1e1e1;--accent:${accent};--on:${onColor(accent)};--fd:"Saira Condensed",Impact,sans-serif;--fb:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 15.5px/1.55 var(--fb);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(14px,3vw,40px)}
.loud{font:800 italic clamp(44px,7vw,110px)/.9 var(--fd);text-transform:uppercase;letter-spacing:-.01em;margin:0}
.h2{font:800 italic clamp(30px,3.4vw,52px)/.95 var(--fd);text-transform:uppercase;margin:0}
.h3{font:700 italic 22px/1 var(--fd);text-transform:uppercase;margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 26px;background:var(--ink);color:#fff;font:700 15px var(--fb);text-transform:uppercase;letter-spacing:.04em;text-decoration:none;border:0;cursor:pointer;transition:transform .15s}
.btn:hover{transform:translateY(-2px)}.btn.acc{background:var(--accent);color:var(--on)}.btn.white{background:#fff;color:var(--ink)}.btn.out{background:transparent;color:inherit;box-shadow:inset 0 0 0 2px currentColor}.btn.sm{height:38px;padding:0 14px;font-size:13px}
/* header */
.promo{background:var(--ink);color:#fff;text-align:center;font:700 13px var(--fb);letter-spacing:.06em;text-transform:uppercase;padding:9px 14px}.promo b{color:var(--accent)}
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:2px solid var(--ink)}
.hd .w{display:flex;align-items:center;gap:22px;height:66px}
.logo{font:800 italic 30px var(--fd);text-transform:uppercase;text-decoration:none;flex:none}.logo img{max-height:40px;width:auto}
.hd nav{display:flex;gap:20px;flex:1;white-space:nowrap;overflow:hidden;font:700 14px var(--fb);text-transform:uppercase;letter-spacing:.02em}.hd nav a{text-decoration:none}.hd nav a:hover{color:var(--accent)}
.hd form{display:flex;align-items:center;background:var(--soft);height:40px;padding:0 4px 0 14px;width:min(300px,28vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:14.5px}.hd form button{border:0;background:var(--ink);color:#fff;height:32px;padding:0 12px;font:700 12.5px var(--fb);text-transform:uppercase;cursor:pointer}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 14px var(--fb);text-transform:uppercase}#nav{display:none}.drawer{display:none;border-bottom:2px solid var(--ink)}#nav:checked~.drawer{display:block}.drawer .w{padding-block:8px 14px}.drawer a{display:block;padding:12px 0;border-bottom:1px solid var(--line);font:800 italic 24px var(--fd);text-transform:uppercase;text-decoration:none}
.drawer form{display:flex;background:var(--soft);padding:4px 4px 4px 14px;margin:6px 0 8px}.drawer input{flex:1;border:0;background:none;outline:none;font:inherit;min-width:0}.drawer button{border:0;background:var(--ink);color:#fff;height:36px;padding:0 14px;font-weight:700}
/* hero */
.hero{display:grid;grid-template-columns:1.1fr 1fr;align-items:stretch;background:var(--ink);color:#fff;margin-top:16px;overflow:hidden;min-height:min(560px,72vh)}
.hero .t{padding:clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1}.hero .t p{color:#cfcfcf;margin:18px 0 26px;font-size:17px;max-width:520px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero .im{position:relative;background:#1d1d1d;clip-path:polygon(14% 0,100% 0,100% 100%,0 100%)}.hero .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tag{display:inline-block;align-self:flex-start;background:var(--accent);color:var(--on);font:800 italic 18px var(--fd);text-transform:uppercase;padding:4px 12px;transform:skewX(-8deg);margin-bottom:16px}
/* rows */
.sec{padding-top:clamp(40px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.sec .top a{font:700 14px var(--fb);text-transform:uppercase;text-decoration:none;border-bottom:2px solid var(--accent)}
.row{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 36px) / 4);gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin;padding-bottom:8px}.row>*{scroll-snap-align:start}
.pc{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line)}.pc:hover{border-color:var(--ink)}
.pc .ph{position:relative;display:block;aspect-ratio:1;background:var(--soft);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.pc:hover .ph img{transform:scale(1.04)}
.pc .ph .flag{position:absolute;left:10px;top:10px;background:var(--ink);color:#fff;font:800 italic 13px var(--fd);text-transform:uppercase;padding:3px 8px}
.pc .t{padding:12px 14px 14px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:600 15px/1.3 var(--fb);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13.5px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:8px;font:800 italic 24px var(--fd)}.pc .pr small{font:500 13px var(--fb);color:var(--muted);font-style:normal}
.pc .btn{margin-top:10px;width:100%}
.blocks{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}
.block{position:relative;display:block;aspect-ratio:3/4;background:var(--soft);overflow:hidden;text-decoration:none}.block img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.block:hover img{transform:scale(1.05)}
.block span{position:absolute;left:12px;bottom:12px;right:12px;background:var(--ink);color:#fff;font:800 italic 24px/1 var(--fd);text-transform:uppercase;padding:10px 14px;transform:skewX(-6deg)}.block span i{display:block;font:600 12.5px var(--fb);font-style:normal;color:var(--accent);margin-top:4px;text-transform:none}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.why{display:grid;grid-template-columns:repeat(var(--n,4),1fr);border:2px solid var(--ink)}.why div{padding:20px 22px;border-right:2px solid var(--ink)}.why div:last-child{border-right:0}.why b{display:block;font:800 italic 22px var(--fd);text-transform:uppercase}.why p{margin:6px 0 0;color:var(--muted);font-size:14.5px}
.index{columns:4 220px;column-gap:32px;background:var(--soft);padding:clamp(20px,3vw,36px)}.index a{display:flex;justify-content:space-between;gap:10px;break-inside:avoid;padding:7px 0;border-bottom:1px solid var(--line);text-decoration:none;font-weight:600}.index a:hover{color:var(--accent)}.index span{color:var(--muted);font-weight:400}
.story{display:grid;grid-template-columns:1fr 1fr;background:var(--accent);color:var(--on)}.story .ph{min-height:340px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{padding:clamp(24px,4vw,56px)}.story .t div{margin:12px 0 22px;opacity:.9}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qa details{border:2px solid var(--ink);padding:0 16px}.qa summary{list-style:none;cursor:pointer;padding:14px 0;font:700 15.5px/1.4 var(--fb);display:flex;justify-content:space-between;gap:14px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";font:800 22px/1 var(--fd)}.qa details[open] summary:after{content:"−"}.qa details p{margin:0 0 14px;color:var(--muted)}
.cta{margin-top:clamp(40px,5vw,72px);background:var(--ink);color:#fff;padding:clamp(28px,4vw,56px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{color:#bdbdbd;margin:8px 0 0}
/* listing */
.crumbs{font-size:13.5px;color:var(--muted);padding-top:16px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:8px 6px}.lh p{margin:8px 0 0;max-width:760px}
.chips{display:flex;gap:6px;flex-wrap:wrap;padding-block:14px}.chips a{padding:8px 14px;border:2px solid var(--ink);font:700 13.5px var(--fb);text-transform:uppercase;text-decoration:none}.chips a:hover,.chips a[aria-current]{background:var(--ink);color:#fff}.chips span{opacity:.6;margin-left:6px;font-weight:600}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 14px}.res form{display:flex;background:var(--soft);padding:4px 4px 4px 14px}.res input{border:0;background:none;outline:none;font:inherit;width:260px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;height:36px;padding:0 14px;font:700 13px var(--fb);text-transform:uppercase;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:32px 0 6px}.pages a,.pages span{min-width:42px;height:42px;display:grid;place-items:center;border:2px solid var(--ink);text-decoration:none;font:800 italic 18px var(--fd);padding:0 12px}.pages a:hover{background:var(--soft)}.pages [aria-current]{background:var(--ink);color:#fff}.pages .gap{border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,56px);padding-top:16px;align-items:start}
.pdp .ph{aspect-ratio:1;background:var(--soft);overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:800 italic clamp(30px,3.4vw,48px)/.95 var(--fd);text-transform:uppercase;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{font:800 italic 40px var(--fd);margin:18px 0}.pdp .acts{display:grid;gap:8px}.pdp .btn{width:100%;height:54px}
.checks{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:8px;font-size:14.5px}.checks li{display:flex;gap:10px}.checks li:before{content:"";flex:none;width:10px;height:10px;margin-top:6px;background:var(--accent);transform:skewX(-10deg)}
.info{margin-top:clamp(28px,4vw,48px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,56px);border-top:2px solid var(--ink);padding-top:22px}.info h2{font:800 italic 26px var(--fd);text-transform:uppercase;margin:0 0 10px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}.info tr:nth-child(odd){background:var(--soft)}.info th{width:42%;font-weight:600}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:6px;font:700 13px var(--fb);text-transform:uppercase}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:12px 14px;border:2px solid var(--ink);background:#fff;text-transform:none}.form input:focus,.form textarea:focus{outline:3px solid var(--accent);outline-offset:-2px}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 26px;border:0;background:var(--ink);color:#fff;font:700 15px var(--fb);text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(20px,5vw,64px);padding-block:clamp(28px,4vw,48px)}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--ink);color:#bdbdbd;margin-top:clamp(40px,5vw,72px);padding-block:46px 22px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:30px}.ft .logo{color:#fff}.ft h4{color:#fff;font:800 italic 20px var(--fd);text-transform:uppercase;margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}.ft a{text-decoration:none}.ft a:hover{color:var(--accent)}
.ft .base{border-top:1px solid #2a2a2a;margin-top:34px;padding-top:16px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:12.5px;color:#8a8a8a}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.row{grid-auto-columns:calc((100% - 24px) / 3)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:780px){.hero,.story,.pdp,.two,.info,.qa{grid-template-columns:1fr}.hero .im{min-height:280px;clip-path:polygon(0 8%,100% 0,100% 100%,0 100%);order:-1}.blocks{grid-template-columns:1fr 1fr}.why{grid-template-columns:1fr 1fr}.why div{border-right:0;border-bottom:2px solid var(--ink)}.grid{grid-template-columns:1fr 1fr;gap:8px}.row{grid-auto-columns:70%}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.form,.why,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  const search = `<form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search products" aria-label="Search products"><button type="submit">Search</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#0b0b0b">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Saira+Condensed:ital,wght@1,700;1,800", "Inter:wght@400;500;600;700"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Arena template · built by Apereel</div>' : ""}
${s.promise[0] ? `<div class="promo"><b>●</b> ${esc(s.promise[0])}</div>` : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">New &amp; all</a>${top.slice(0, 5).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav>${search}<label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w">${search}<a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, flag = "") {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}${flag ? `<span class="flag">${esc(flag)}</span>` : ""}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="pr">${esc(money(p)) || "<small>Price on request</small>"}</p><a class="btn sm" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Enquire" : "Shop now"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const withImg = top.filter((c) => c.image);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const storyImg = large.find((u) => u !== cover) ?? pics[3]?.image ?? null;
  return `<div class="w"><section class="hero"><div class="t">${s.hero.eyebrow ? `<span class="tag">${esc(s.hero.eyebrow)}</span>` : ""}<h1 class="loud">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div class="acts"><a class="btn acc" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">Contact us</a></div></div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>
${pics.length >= 4 ? `<section class="sec"><div class="top"><h2 class="h2">New in</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="row">${pics.slice(0, 10).map((p, i) => pc(t, p, i < 3 ? "New" : "")).join("")}</div></section>` : ""}
${withImg.length >= 2 ? `<section class="sec"><div class="top"><h2 class="h2">Shop by category</h2></div><div class="blocks" style="--n:${Math.min(4, withImg.length)}">${withImg.slice(0, 4).map((c) => `<a class="block" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span>${esc(shortName(c.name))}<i>${c.count.toLocaleString("en-US")} products →</i></span></a>`).join("")}</div></section>` : ""}
${trust.length >= 2 ? `<section class="sec"><div class="why" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x) => `<div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.featured.length >= 18 ? `<section class="sec"><div class="top"><h2 class="h2">Top picks</h2><a href="${href(t, "/products")}">View all</a></div><div class="grid">${s.featured.slice(10, 18).map((p) => pc(t, p)).join("")}</div></section>` : pics.length < 4 && s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Top picks</h2></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn" href="${href(t, "/about")}">Our story</a></div></div></section>` : ""}
${top.length >= 6 ? `<section class="sec"><div class="top"><h2 class="h2">Every category</h2></div><nav class="index" aria-label="All categories">${top.map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}<span>${c.count.toLocaleString("en-US")}</span></a>`).join("")}</nav></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="top"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="cta"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn acc" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}</div>`;
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
  const title = st.q ? `Results: ${st.q}` : st.cat ? shortName(st.cat.name) : "All products";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Shop</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="loud" style="font-size:clamp(34px,4.6vw,64px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:14px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : ""}</div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products"}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<span class="tag">${esc(shortName(cat.name))}</span>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="info"><div><h2>Details</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specs</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="border:2px solid var(--ink);padding-inline:clamp(20px,4vw,48px)"><div><h2 class="h2">Ask about this product</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You might also like</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><section class="hero" style="min-height:min(460px,60vh)"><div class="t"><span class="tag">About ${esc(s.brand.name)}</span><h1 class="loud" style="font-size:clamp(36px,5vw,72px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:16.5px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="why" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h) => `<div><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / Contact</p><section class="two"><div class="facts"><h1 class="loud" style="font-size:clamp(34px,4.4vw,60px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
