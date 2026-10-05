import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { readFacets } from "../facets";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Field": Template tier. Original design in the language of equipment and
// parts makers: practical white and deep green with a bright second colour,
// a "find your part" selector, help blocks (parts, advice, contact), and a
// shop shown as a parts-catalog list: photo, name, key specs, price and an
// action on one row. Built for big technical catalogs; no scroll animation.

const PER_PAGE = 30;

function css(accent: string) {
  return `
:root{--ink:#17201a;--muted:#5d665f;--soft:#f2f4f1;--line:#dde2dc;--deep:#22382a;--accent:${accent};--on:${onColor(accent)};--f:"Barlow Semi Condensed",system-ui,sans-serif;--b:"Barlow",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.55 var(--b);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1400px;margin:0 auto;padding-inline:clamp(14px,3vw,36px)}
.h1{font:700 clamp(34px,4.4vw,62px)/1.02 var(--f);margin:0}
.h2{font:700 clamp(24px,2.6vw,36px)/1.1 var(--f);margin:0}
.h3{font:700 19px/1.2 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 22px;border-radius:4px;background:var(--accent);color:var(--on);font:700 15.5px var(--f);text-decoration:none;border:0;cursor:pointer;transition:filter .15s}
.btn:hover{filter:brightness(.92)}.btn.deep{background:var(--deep);color:#fff}.btn.out{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px var(--deep)}.btn.out:hover{filter:none;background:var(--soft)}.btn.sm{height:36px;padding:0 14px;font-size:14px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:var(--deep);color:#fff}
.hd .w{display:flex;align-items:center;gap:22px;height:68px}
.logo{font:700 26px var(--f);text-decoration:none;flex:none}.logo img{max-height:42px;width:auto}
.hd nav{display:flex;gap:4px;flex:1;white-space:nowrap;overflow:hidden;font:600 15.5px var(--f)}.hd nav a{text-decoration:none;padding:8px 12px;border-radius:4px}.hd nav a:hover{background:rgba(255,255,255,.1)}
.hd form{display:flex;background:#fff;border-radius:4px;overflow:hidden;width:min(320px,30vw)}.hd form input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 12px;height:40px;color:var(--ink)}.hd form button{border:0;background:var(--accent);color:var(--on);font:700 14px var(--f);padding:0 14px;cursor:pointer}
.burger{display:none;margin-left:auto;cursor:pointer;font:700 15px var(--f)}#nav{display:none}.drawer{display:none;background:var(--deep);color:#fff}#nav:checked~.drawer{display:block}.drawer .w{padding-block:6px 14px}.drawer a{display:block;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.12);font:600 18px var(--f);text-decoration:none}
.drawer form{display:flex;background:#fff;border-radius:4px;overflow:hidden;margin:8px 0}.drawer input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 12px;height:42px}.drawer button{border:0;background:var(--accent);color:var(--on);font-weight:700;padding:0 14px}
/* hero */
.hero{display:grid;grid-template-columns:1fr 1fr;align-items:stretch;background:var(--soft);min-height:min(520px,70vh)}
.hero .t{padding:clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:center}.hero .t p{color:var(--muted);margin:16px 0 26px;font-size:18px;max-width:540px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero .im{position:relative;min-height:320px}.hero .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.kick{font:700 14px var(--f);letter-spacing:.06em;text-transform:uppercase;color:var(--deep);margin:0 0 10px}
/* finder */
.finder{background:var(--deep);color:#fff;border-radius:6px;margin-top:-40px;position:relative;z-index:2;padding:clamp(20px,3vw,32px)}
.finder .row{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.finder form{display:flex;flex:1;max-width:620px;background:#fff;border-radius:4px;overflow:hidden}.finder input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 14px;height:48px}.finder button{border:0;background:var(--accent);color:var(--on);font:700 15px var(--f);padding:0 20px;cursor:pointer}
.picks{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:10px}.picks a{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:4px;padding:10px;text-decoration:none;transition:background .15s}.picks a:hover{background:rgba(255,255,255,.16)}
.picks .ph{width:52px;height:52px;flex:none;border-radius:3px;overflow:hidden;background:#fff}.picks .ph img{width:100%;height:100%;object-fit:cover}.picks b{display:block;font:700 16px/1.15 var(--f)}.picks span{font-size:13px;opacity:.75}
/* sections */
.sec{padding-top:clamp(40px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:16px}.sec .top a{font:700 15px var(--f);color:var(--deep);text-decoration:none}.sec .top a:hover{text-decoration:underline}
.help{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:14px}.help a,.help div{display:block;border:2px solid var(--line);border-radius:6px;padding:22px;text-decoration:none}.help a:hover{border-color:var(--deep)}.help i{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--accent);color:var(--on);font:700 17px var(--f);font-style:normal;margin-bottom:12px}.help p{margin:6px 0 0;color:var(--muted);font-size:15px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pc{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#fff}.pc:hover{border-color:var(--deep)}.pc .ph{display:block;aspect-ratio:1;background:var(--soft);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:14px 16px 16px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:700 16.5px/1.25 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:13.5px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:10px;font:700 22px var(--f)}.pc .pr small{font:500 14px var(--b);color:var(--muted)}.pc .btn{margin-top:10px}
.story{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:6px;overflow:hidden}.story .ph{min-height:320px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{padding:clamp(24px,4vw,56px)}.story .t div{color:var(--muted);margin:12px 0 22px}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qa>*{min-width:0}.qa details{border:1px solid var(--line);border-radius:6px;padding:0 16px}.qa summary{list-style:none;cursor:pointer;padding:15px 0;font:700 16.5px/1.35 var(--f);display:flex;justify-content:space-between;gap:14px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";color:var(--deep);font-size:22px;line-height:1;flex:none}.qa details[open] summary:after{content:"−"}.qa details p{margin:0 0 14px;color:var(--muted)}
.cta{margin-top:clamp(40px,5vw,72px);background:var(--accent);color:var(--on);border-radius:6px;padding:clamp(24px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{margin:8px 0 0;opacity:.9}.cta .btn{background:var(--deep);color:#fff}
/* catalog list */
.crumbs{font-size:14px;color:var(--muted);padding-top:16px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:6px 4px}.lh p{margin:8px 0 0;max-width:760px}
.chips{display:flex;gap:6px;flex-wrap:wrap;padding-block:14px}.chips a{padding:8px 14px;border:1px solid var(--line);border-radius:4px;font:600 15px var(--f);text-decoration:none;background:#fff}.chips a:hover{border-color:var(--deep)}.chips a[aria-current]{background:var(--deep);color:#fff;border-color:var(--deep)}.chips span{color:var(--muted);margin-left:6px;font-size:13px}.chips a[aria-current] span{color:#b9c8bc}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 12px}.res form{display:flex;border:2px solid var(--deep);border-radius:4px;overflow:hidden}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:40px;width:280px;min-width:0}.res button{border:0;background:var(--deep);color:#fff;font:700 14px var(--f);padding:0 14px;cursor:pointer}
.list{border:1px solid var(--line);border-radius:6px;overflow:hidden}
.item{display:grid;grid-template-columns:92px minmax(0,1fr) minmax(0,.9fr) 140px;gap:18px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);background:#fff}.item:nth-child(even){background:#fafbfa}.item:last-child{border-bottom:0}.item:hover{background:var(--soft)}
.item .ph{width:92px;height:92px;border-radius:4px;overflow:hidden;background:var(--soft)}.item .ph img{width:100%;height:100%;object-fit:cover}
.item h3{font:700 17px/1.25 var(--f);margin:0}.item h3 a{text-decoration:none}.item h3 a:hover{text-decoration:underline}.item .d{font-size:14px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.item dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:13.5px}.item dt{color:var(--muted)}.item dd{margin:0;font-weight:600}
.item .buy{text-align:right}.item .pr{font:700 22px var(--f);display:block;margin-bottom:6px}.item .pr small{font:500 13px var(--b);color:var(--muted)}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:26px 0 6px}.pages a,.pages span{min-width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:4px;text-decoration:none;font:700 15px var(--f);padding:0 12px}.pages a:hover{border-color:var(--deep)}.pages [aria-current]{background:var(--deep);color:#fff;border-color:var(--deep)}.pages .gap{border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(20px,4vw,52px);padding-top:16px;align-items:start}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:1;background:var(--soft);border-radius:6px;overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:700 clamp(28px,3vw,42px)/1.08 var(--f);margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.box{border:2px solid var(--deep);border-radius:6px;padding:20px;margin-top:18px}.box .pr{font:700 36px var(--f)}.box .acts{display:grid;gap:8px;margin-top:14px}.box .btn{width:100%;height:50px}
.spec{width:100%;border-collapse:collapse;font-size:15px;margin-top:18px}.spec th,.spec td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}.spec tr:nth-child(odd){background:var(--soft)}.spec th{width:42%;font-weight:600}
.checks{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:7px;font-size:14.5px}.checks li:before{content:"✓";color:var(--deep);font-weight:800;margin-right:10px}
.info{margin-top:clamp(24px,4vw,44px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,52px);border-top:3px solid var(--deep);padding-top:20px}.info>*{min-width:0}.info h2{font:700 24px var(--f);margin:0 0 10px}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:5px;font:600 14px var(--b)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:11px 13px;border:1px solid #bcc5bd;border-radius:4px;background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--deep);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:46px;padding:0 22px;border:0;border-radius:4px;background:var(--accent);color:var(--on);font:700 15.5px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(18px,5vw,56px);padding-block:clamp(24px,4vw,44px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:7px}
/* footer */
.ft{background:var(--deep);color:#c3cec6;margin-top:clamp(40px,5vw,72px);padding-block:44px 20px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:28px}.ft .logo{color:#fff}.ft h4{color:#fff;font:700 17px var(--f);margin:0 0 10px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ft a{text-decoration:none}.ft a:hover{color:#fff;text-decoration:underline}
.ft .base{border-top:1px solid rgba(255,255,255,.12);margin-top:30px;padding-top:14px;font-size:12.5px;color:#93a497}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1100px){.cards{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}.item{grid-template-columns:80px minmax(0,1fr) 130px}.item dl{display:none}.item .ph{width:80px;height:80px}}
@media(max-width:780px){.hero,.story,.pdp,.two,.info,.qa{grid-template-columns:1fr}.hero .im{order:-1;min-height:240px}.finder{margin-top:16px}.picks{grid-template-columns:1fr 1fr}.help{grid-template-columns:1fr}.cards{grid-template-columns:1fr 1fr;gap:10px}.ft .cols{grid-template-columns:1fr 1fr}
.item{grid-template-columns:72px minmax(0,1fr);gap:12px}.item .ph{width:72px;height:72px}.item .buy{grid-column:2;text-align:left;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.item .pr{margin:0}}
@media(max-width:480px){.form,.ft .cols,.picks{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

/** The product's key specs in the shop's own filter labels. */
function specs(t: RenderTarget, p: SiteProduct, max = 3): [string, string][] {
  if (!t.doc.facets?.length) return [];
  const f = readFacets(p.title);
  return t.doc.facets.filter((x) => f[x.key]).slice(0, max).map((x) => [x.label, f[x.key]]);
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; q?: string }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  const search = `<form role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="Name or product code" aria-label="Search products"><button type="submit">Search</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#22382a">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Barlow+Semi+Condensed:wght@600;700", "Barlow:wght@400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Field template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Products</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/contact")}">Support</a></nav>${search}<label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w">${search}<a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Support</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Products</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Company</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><h4>Support</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "<small>Price on request</small>"}</span><a class="btn sm${action.enquire ? " deep" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View"}</a></div></div>`;
}

/** One row of the parts-catalog list. */
function item(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  const rows = specs(t, p);
  return `<div class="item"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div><h3><a href="${to}">${esc(name)}</a></h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}</div>${rows.length ? `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : "<div></div>"}<div class="buy"><span class="pr">${esc(money(p)) || "<small>Price on request</small>"}</span><a class="btn sm${action.enquire ? " deep" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const guides = t.doc.pages.find((p) => p.slug === "guides");
  const trade = t.doc.pages.find((p) => p.slug === "trade");
  const help = [
    { i: "1", title: "Find a product", body: `Search ${(s.doc.catalogSize ?? s.doc.products.length).toLocaleString("en-US")} products by name, size or product code.`, to: "/products" },
    ...(guides ? [{ i: "2", title: guides.navLabel ?? "Guides", body: guides.metaDescription || "How-to guides from our team.", to: "/guides" }] : []),
    ...(trade ? [{ i: "3", title: trade.navLabel ?? "Trade accounts", body: trade.metaDescription || "Ordering in quantity.", to: "/trade" }] : []),
    { i: guides && trade ? "4" : guides || trade ? "3" : "2", title: "Talk to us", body: s.brand.phone ? `Call ${s.brand.phone} or send a message.` : "Send a message and we'll reply within a working day.", to: "/contact" },
  ].slice(0, 4);
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<section class="hero"><div class="t">${s.hero.eyebrow ? `<p class="kick">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">${t.doc.productAction === "enquire" ? "Get a quote" : "Contact us"}</a></div></div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>
<div class="w"><section class="finder"><div class="row"><h2 class="h2">Find what you need</h2><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Name, size or product code" aria-label="Search products"><button type="submit">Search</button></form></div>${top.length ? `<div class="picks" style="--n:${Math.min(4, top.length)}">${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><span class="ph">${img(c.image, c.name)}</span><span><b>${esc(shortName(c.name))}</b><span>${(c.count ?? 0).toLocaleString("en-US")} items</span></span></a>`).join("")}</div>` : ""}</section>
<section class="sec"><div class="help" style="--n:${Math.min(4, help.length)}">${help.map((h) => `<a href="${href(t, h.to)}"><i>${h.i}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body.slice(0, 140))}</p></a>`).join("")}</div></section>
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Popular items</h2><a href="${href(t, "/products")}">View all →</a></div><div class="cards">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><p class="kick">About ${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn deep" href="${href(t, "/about")}">Learn more</a></div></div></section>` : ""}
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
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Products</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="h1" style="font-size:clamp(28px,3.2vw,44px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All products"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:14px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "items"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}${st.shown.length ? `<div class="list">${st.shown.map((p) => item(t, p)).join("")}</div>` : `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>`}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : ""}</div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${title}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q || Object.keys(st.chosen).length > 1,
    body,
    q: st.q,
  });
}

function product(t: RenderTarget, s: Slots, p: SiteProduct): string {
  const url = `${t.origin}/products/${p.slug}`;
  const cat = t.doc.categories.find((c) => c.slug === p.category) ?? null;
  const { name, detail } = splitTitle(p.title);
  const action = productAction(t, p, url, "btn");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const rows = [...specs(t, p, 8), ...(p.specs ?? []).map((r) => [r.label, r.value] as [string, string])];
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Products</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<p class="kick">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${rows.length ? `<table class="spec">${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>Product details</h2>${paras(p.description)}</div><div><h2>Need help?</h2><p class="muted">Tell us what you need and we'll help you choose the right product.</p><a class="btn deep" href="${href(t, action.enquire ? "#enquire" : "/contact")}">Ask us</a></div></section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--soft);border-radius:6px;padding-inline:clamp(18px,4vw,44px)"><div><h2 class="h2">Request a quote</h2><p class="muted">Product codes, quantities or questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">Related products</h2></div><div class="cards">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="hero" style="min-height:min(420px,56vh)"><div class="t"><p class="kick">About ${esc(s.brand.name)}</p><h1 class="h1" style="font-size:clamp(30px,3.8vw,52px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
<div class="w">${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="help" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div><i>${i + 1}</i><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Support</p><section class="two"><div class="facts"><h1 class="h1" style="font-size:clamp(28px,3.2vw,44px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
