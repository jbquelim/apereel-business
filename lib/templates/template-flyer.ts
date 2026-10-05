import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Flyer": Template tier. Original design in the language of the weekly
// retail flyer: bright white with a bold accent, a banner grid beside a
// department list, product cards with round price stickers, a big "this
// week" headline band, simple chunky type. Fast: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#151515;--muted:#5e5e5e;--soft:#f5f5f2;--line:#e4e4df;--sun:#ffd23f;--accent:${accent};--on:${onColor(accent)};--f:"Archivo Narrow",system-ui,sans-serif;--b:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 15.5px/1.5 var(--b);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(14px,3vw,36px)}
.loud{font:700 clamp(36px,5vw,72px)/.95 var(--f);text-transform:uppercase;letter-spacing:-.01em;margin:0}
.h2{font:700 clamp(26px,2.8vw,40px)/1 var(--f);text-transform:uppercase;margin:0}
.h3{font:700 19px/1.15 var(--f);text-transform:uppercase;margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 22px;border-radius:6px;background:var(--accent);color:var(--on);font:700 15px var(--f);text-transform:uppercase;letter-spacing:.04em;text-decoration:none;border:0;cursor:pointer;transition:transform .15s}
.btn:hover{transform:translateY(-1px)}.btn.ink{background:var(--ink);color:#fff}.btn.out{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}.btn.sm{height:36px;padding:0 14px;font-size:13.5px}
/* header */
.top{background:var(--sun);color:var(--ink);font:700 13.5px var(--b);text-align:center;padding:8px 14px}
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:4px solid var(--accent)}
.hd .w{display:flex;align-items:center;gap:20px;height:70px}
.logo{font:700 30px var(--f);text-transform:uppercase;text-decoration:none;flex:none;color:var(--accent)}.logo img{max-height:44px;width:auto}
.hd form{flex:1;display:flex;max-width:620px;border:2px solid var(--ink);border-radius:6px;overflow:hidden}.hd form input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 14px;height:42px}.hd form button{border:0;background:var(--ink);color:#fff;font:700 14px var(--f);text-transform:uppercase;letter-spacing:.04em;padding:0 18px;cursor:pointer}
.hd .links{display:flex;gap:18px;margin-left:auto;font:700 15px var(--f);text-transform:uppercase}.hd .links a{text-decoration:none}.hd .links a:hover{color:var(--accent)}
/* hero: departments + banners */
.front{display:grid;grid-template-columns:260px 1fr;gap:14px;margin-top:16px}.front>*{min-width:0}
.front.solo,.shop.solo{grid-template-columns:1fr}.banners.solo{grid-template-columns:1fr;grid-template-rows:auto;min-height:0}.banners.solo .ban.main{grid-row:auto;grid-template-rows:none;grid-template-columns:1fr 1fr;min-height:420px}.banners.solo .ban.main .t{align-self:center}
.dlist{border:2px solid var(--ink);border-radius:8px;overflow:hidden;align-self:start}.dlist h2{background:var(--ink);color:#fff;font:700 17px var(--f);text-transform:uppercase;margin:0;padding:12px 16px}
.dlist a{display:flex;justify-content:space-between;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);text-decoration:none;font-weight:600;font-size:14.5px}.dlist a:last-child{border-bottom:0}.dlist a:hover{background:var(--soft);color:var(--accent)}.dlist span{color:var(--muted);font-weight:400;font-size:13px}
.banners{display:grid;grid-template-columns:1.6fr 1fr;grid-template-rows:1fr 1fr;gap:14px;min-height:460px}
.ban{position:relative;border-radius:8px;overflow:hidden;background:var(--soft);display:block;text-decoration:none}.ban img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ban.main{grid-row:1/3;background:var(--accent);color:var(--on);display:grid;grid-template-rows:1fr auto}.ban.main .im{position:relative}.ban.main .t{position:relative;padding:clamp(20px,3vw,36px)}.ban.main .t p{margin:12px 0 18px;opacity:.9;max-width:520px}
.ban .tag{position:absolute;left:14px;bottom:14px;z-index:1;background:#fff;border-radius:6px;padding:10px 14px;font:700 17px/1.1 var(--f);text-transform:uppercase}.ban .tag span{display:block;font:500 12.5px var(--b);color:var(--muted);text-transform:none}
.sticker{position:absolute;right:14px;top:14px;z-index:2;width:86px;height:86px;border-radius:50%;background:var(--sun);color:var(--ink);display:grid;place-items:center;text-align:center;font:700 15px/1.05 var(--f);text-transform:uppercase;transform:rotate(-8deg);box-shadow:0 8px 18px -8px rgba(0,0,0,.4)}
/* sections */
.sec{padding-top:clamp(36px,5vw,64px)}.sec .head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:16px}.sec .head a{font:700 14.5px var(--f);text-transform:uppercase;text-decoration:none;color:var(--accent)}
.week{background:var(--ink);color:#fff;border-radius:8px;padding:clamp(18px,2.6vw,28px) clamp(20px,3vw,36px);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.week b{color:var(--sun)}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.pc{position:relative;display:flex;flex-direction:column;border:2px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}.pc:hover{border-color:var(--ink)}
.pc .ph{position:relative;display:block;aspect-ratio:1;background:var(--soft);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .price{position:absolute;right:8px;bottom:8px;z-index:1;min-width:64px;height:64px;padding:0 8px;border-radius:999px;background:var(--sun);color:var(--ink);display:grid;place-items:center;font:700 18px/1 var(--f);transform:rotate(-6deg);box-shadow:0 6px 14px -6px rgba(0,0,0,.35)}
.pc .price.ask{font-size:12.5px;line-height:1.05;text-transform:uppercase;width:64px;text-align:center}
.pc .t{padding:12px 12px 14px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:600 14.5px/1.3 var(--b);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .btn{margin-top:auto;align-self:stretch;margin-top:10px}
.depts{display:grid;grid-template-columns:repeat(var(--n,6),1fr);gap:12px}.depts a{display:block;text-align:center;text-decoration:none}.depts .ph{aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--soft);border:2px solid var(--line)}.depts .ph img{width:100%;height:100%;object-fit:cover}.depts a:hover .ph{border-color:var(--accent)}
.depts b{display:block;font:700 15.5px/1.2 var(--f);text-transform:uppercase;margin-top:8px}.depts span{font-size:12.5px;color:var(--muted)}
.perks{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}.perks div{background:var(--soft);border-radius:8px;padding:18px 20px;border-top:4px solid var(--accent)}.perks b{display:block;font:700 18px var(--f);text-transform:uppercase}.perks p{margin:6px 0 0;color:var(--muted);font-size:14px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:stretch}.about .ph{border-radius:8px;overflow:hidden;min-height:300px;background:var(--soft)}.about .ph img{width:100%;height:100%;object-fit:cover}.about .t{background:var(--soft);border-radius:8px;padding:clamp(22px,3.6vw,48px)}.about .t div{color:var(--muted);margin:12px 0 20px}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qa>*{min-width:0}.qa details{border:2px solid var(--line);border-radius:8px;padding:0 16px}.qa summary{list-style:none;cursor:pointer;padding:14px 0;font:600 15.5px/1.4 var(--b);display:flex;justify-content:space-between;gap:14px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";font:700 22px/1 var(--f);color:var(--accent);flex:none}.qa details[open] summary:after{content:"−"}.qa details p{margin:0 0 14px;color:var(--muted)}
.cta{margin-top:clamp(36px,5vw,64px);background:var(--accent);color:var(--on);border-radius:8px;padding:clamp(24px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{margin:8px 0 0;opacity:.9}.cta .btn{background:var(--sun);color:var(--ink)}
/* listing */
.crumbs{font-size:13.5px;color:var(--muted);padding-top:14px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.shop{display:grid;grid-template-columns:240px 1fr;gap:16px;margin-top:12px;align-items:start}.shop>*{min-width:0}.shop .dlist{position:sticky;top:96px}
.lh{padding-block:2px 6px}.lh p{margin:6px 0 0;max-width:760px}
.res{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0 12px}.res form{display:flex;border:2px solid var(--ink);border-radius:6px;overflow:hidden}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:38px;width:240px;min-width:0}.res button{border:0;background:var(--ink);color:#fff;font:700 13.5px var(--f);text-transform:uppercase;padding:0 14px;cursor:pointer}
.shop .grid{grid-template-columns:repeat(4,1fr)}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:28px 0 6px}.pages a,.pages span{min-width:40px;height:40px;display:grid;place-items:center;border:2px solid var(--ink);border-radius:6px;text-decoration:none;font:700 16px var(--f);padding:0 12px}.pages a:hover{background:var(--soft)}.pages [aria-current]{background:var(--ink);color:#fff}.pages .gap{border:0}
.dlist details summary{display:none}
/* product */
.pdp{display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(18px,4vw,48px);padding-top:14px;align-items:start}.pdp>*{min-width:0}
.pdp .ph{position:relative;aspect-ratio:1;background:var(--soft);border-radius:8px;overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}.pdp .ph .sticker{width:110px;height:110px;font-size:22px}
.pdp h1{font:700 clamp(28px,3vw,42px)/1.02 var(--f);text-transform:uppercase;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.box{border:2px solid var(--ink);border-radius:8px;padding:20px;margin-top:18px}.box .pr{font:700 40px var(--f)}.box .acts{display:grid;gap:8px;margin-top:12px}.box .btn{width:100%;height:52px}
.checks{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:7px;font-size:14.5px}.checks li:before{content:"✓";color:var(--accent);font-weight:800;margin-right:10px}
.info{margin-top:clamp(24px,4vw,40px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(18px,4vw,48px);border-top:4px solid var(--accent);padding-top:20px}.info>*{min-width:0}.info h2{font:700 24px var(--f);text-transform:uppercase;margin:0 0 10px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}.info tr:nth-child(odd){background:var(--soft)}.info th{width:42%;font-weight:700}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:5px;font:700 14px var(--b)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:11px 13px;border:2px solid var(--line);border-radius:6px;background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:46px;padding:0 22px;border:0;border-radius:6px;background:var(--accent);color:var(--on);font:700 15px var(--f);text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(18px,5vw,56px);padding-block:clamp(24px,4vw,44px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:7px}
/* footer */
.ft{background:var(--ink);color:#c8c8c8;margin-top:clamp(36px,5vw,64px);padding-block:42px 20px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:28px}.ft .logo{color:var(--sun)}.ft h4{color:#fff;font:700 18px var(--f);text-transform:uppercase;margin:0 0 10px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ft a{text-decoration:none}.ft a:hover{color:var(--sun)}
.ft .base{border-top:1px solid #333;margin-top:30px;padding-top:14px;font-size:12.5px;color:#8e8e8e}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1200px){.grid{grid-template-columns:repeat(4,1fr)}.shop .grid{grid-template-columns:repeat(3,1fr)}.hd .links{display:none}}
@media(max-width:900px){.banners.solo .ban.main{grid-template-columns:1fr}.front,.shop{grid-template-columns:1fr}.front .dlist{display:none}.shop .dlist{position:static}.dlist details summary{display:flex;justify-content:space-between;cursor:pointer;list-style:none;background:var(--ink);color:#fff;font:700 17px var(--f);text-transform:uppercase;padding:12px 16px}.dlist details summary::-webkit-details-marker{display:none}.dlist details h2{display:none}
.banners{grid-template-columns:1fr 1fr;grid-template-rows:auto;min-height:0}.ban.main{grid-column:1/-1;grid-row:auto}.ban.main .im{min-height:240px}.ban{min-height:200px}.about,.pdp,.two,.info,.qa{grid-template-columns:1fr}.grid,.shop .grid{grid-template-columns:repeat(3,1fr)}.depts{grid-template-columns:repeat(3,1fr)}.perks{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}
.hd .w{flex-wrap:wrap;height:auto;padding-block:10px;gap:10px}.hd form{order:3;flex-basis:100%;max-width:none}}
@media(max-width:560px){.grid,.shop .grid{grid-template-columns:1fr 1fr;gap:8px}.perks,.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}.pc .price{min-width:54px;height:54px;font-size:15px}.pc .price.ask{width:54px;font-size:11px}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; q?: string }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Archivo+Narrow:wght@600;700", "Inter:wght@400;500;600;700"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Flyer template · built by Apereel</div>' : ""}
${s.promise[0] ? `<div class="top">${esc(s.promise[0])}</div>` : ""}
<header class="hd"><div class="w">${logo(s, t)}<form role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="What are you looking for?" aria-label="Search products"><button type="submit">Search</button></form><nav class="links" aria-label="Company"><a href="${href(t, "/products")}">Shop</a><a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></nav></div></header>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${s.categories.filter((c) => !c.parent).sort(byRank).slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</p></div></footer>
${JS}</body></html>`;
}

function deptList(t: RenderTarget, cats: Slots["doc"]["categories"], current: string | null, title: string, up?: { to: string; name: string } | null) {
  if (!cats.length) return "";
  return `<aside class="dlist"><details open><summary>${esc(title)} ▾</summary><h2>${esc(title)}</h2>${up ? `<a href="${href(t, up.to)}" style="font-weight:700">‹ ${esc(up.name)}</a>` : ""}${cats.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${current === c.slug ? ' aria-current="page" style="color:var(--accent)"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</details></aside>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}${money(p) ? `<span class="price">${esc(money(p))}</span>` : `<span class="price ask">Ask for price</span>`}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<a class="btn sm${action.enquire ? " ink" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const withImg = top.filter((c) => c.image);
  const side = withImg.slice(0, 2);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  const dl = deptList(t, top, null, "Departments");
  return `<div class="w"><section class="front${dl ? "" : " solo"}">${dl}<div class="banners${side.length === 2 ? "" : " solo"}"><a class="ban main" href="${href(t, "/products")}"><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}${s.hero.eyebrow ? `<span class="sticker">${esc(s.hero.eyebrow)}</span>` : ""}</div><div class="t"><h1 class="loud">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:16px"></div>'}<span class="btn ink">${esc(s.hero.cta)}</span></div></a>
${(side.length === 2 ? side : []).map((c) => `<a class="ban" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<span class="tag">${esc(shortName(c.name))}<span>${c.count.toLocaleString("en-US")} products →</span></span></a>`).join("")}</div></section>
${s.featured.length ? `<section class="sec"><div class="week"><h2 class="h2">This week at <b>${esc(s.brand.name)}</b></h2><a class="btn" href="${href(t, "/products")}">Shop everything</a></div><div class="grid" style="margin-top:14px">${s.featured.slice(0, 10).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${withImg.length >= 3 ? `<section class="sec"><div class="head"><h2 class="h2">Shop by department</h2><a href="${href(t, "/products")}">See all →</a></div><div class="depts" style="--n:${Math.min(6, withImg.length)}">${withImg.slice(0, 6).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} items</span></a>`).join("")}</div></section>` : ""}
${trust.length >= 2 ? `<section class="sec"><div class="perks" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x) => `<div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="about">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ink" href="${href(t, "/about")}">About us</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="head"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
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
  const list = kids.length ? kids : st.cat ? nav.chips : t.doc.categories.filter((c) => !c.parent).sort(byRank);
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const up = st.cat ? { to: nav.parent ? `/collections/${nav.parent.slug}` : "/products", name: shortName(nav.parent?.name ?? "All products") } : null;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
${(() => { const dl = deptList(t, list, st.cat?.slug ?? null, st.cat ? shortName(st.cat.name) : "Departments", up); return `<div class="shop${dl ? "" : " solo"}">${dl}`; })()}<div><div class="lh"><h1 class="loud" style="font-size:clamp(28px,3.4vw,48px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "items"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span>${st.cat ? `<form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search in ${esc(shortName(st.cat.name).toLowerCase())}" aria-label="Search in this department"><button type="submit">Go</button></form>` : ""}</div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : ""}</div></div></div>`;
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
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 5);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}${money(p) ? `<span class="sticker">${esc(money(p))}</span>` : ""}</div><div>${cat ? `<p style="margin:0 0 8px;font:700 15px var(--f);text-transform:uppercase;color:var(--accent)">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>Details</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specs</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--soft);border-radius:8px;padding-inline:clamp(18px,4vw,44px)"><div><h2 class="h2">Get a quote</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="head"><h2 class="h2">More like this</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › About</p><section class="sec" style="padding-top:12px"><div class="about">${visual ? `<div class="ph">${img(visual, s.brand.name, "", true)}</div>` : ""}<div class="t"${visual ? "" : ' style="grid-column:1/-1"'}><h1 class="loud" style="font-size:clamp(30px,3.8vw,54px)">${esc(st?.heading ?? s.brand.tagline)}</h1>${st ? `<div style="color:var(--ink);font-size:16px">${paras(st.body)}</div>` : ""}</div></div></section>
${s.highlights.length ? `<section class="sec"><div class="perks" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h) => `<div><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Contact</p><section class="two"><div class="facts"><h1 class="loud" style="font-size:clamp(30px,3.6vw,50px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
