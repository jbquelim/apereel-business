import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Depot": Template tier. Original design in the language of everyday
// mass retailers: a header bar in the brand colour with a big search, a
// departments grid, compact deal banners, a dense five-column product grid
// with clear prices and an add / enquire button, a department sidebar in the
// shop. Built for speed and big catalogs; no scroll animation.

const PER_PAGE = 30;

function css(accent: string) {
  return `
:root{--ink:#1a1a1a;--muted:#5d5d5d;--soft:#f2f4f6;--line:#e1e4e8;--accent:${accent};--on:${onColor(accent)};--f:"Nunito Sans",system-ui,sans-serif;--r:10px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--soft);color:var(--ink);font:400 15px/1.5 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1500px;margin:0 auto;padding-inline:clamp(12px,2.4vw,32px)}
.h1{font:800 clamp(28px,3.4vw,46px)/1.1 var(--f);letter-spacing:-.015em;margin:0}
.h2{font:800 clamp(20px,1.9vw,26px)/1.2 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 20px;border-radius:999px;background:var(--accent);color:var(--on);font:700 14.5px var(--f);text-decoration:none;border:0;cursor:pointer;transition:filter .15s}
.btn:hover{filter:brightness(.92)}.btn.ink{background:var(--ink);color:#fff}.btn.out{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}.btn.out:hover{background:var(--soft);filter:none}.btn.sm{height:34px;padding:0 14px;font-size:13.5px}
.card{background:#fff;border-radius:var(--r)}
/* header */
.hd{background:var(--accent);color:var(--on);position:sticky;top:0;z-index:30}
.hd .w{display:flex;align-items:center;gap:20px;height:70px}
.logo{font:800 23px var(--f);letter-spacing:-.02em;text-decoration:none;flex:none;background:#fff;color:var(--ink);border-radius:999px;padding:6px 16px}.logo img{max-height:34px;width:auto}
.hd form{flex:1;display:flex;background:#fff;border-radius:999px;height:46px;padding:4px 4px 4px 20px;max-width:760px}.hd form input{flex:1;min-width:0;border:0;outline:none;font:inherit;font-size:15.5px;background:none;color:var(--ink)}.hd form button{border:0;border-radius:999px;background:var(--ink);color:#fff;font:700 14px var(--f);padding:0 18px;cursor:pointer}
.hd .r{display:flex;gap:18px;font:700 14px var(--f);margin-left:auto;white-space:nowrap}.hd .r a{text-decoration:none}
.depts{background:#fff;border-bottom:1px solid var(--line)}.depts .w{display:flex;gap:4px;overflow-x:auto;height:46px;align-items:center;scrollbar-width:none}.depts .w::-webkit-scrollbar{display:none}
.depts a{white-space:nowrap;padding:8px 12px;border-radius:999px;font:600 14px var(--f);text-decoration:none}.depts a:hover{background:var(--soft)}
/* hero */
.hero{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-top:16px}
.main{position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:center;overflow:hidden;min-height:360px}.main .t{padding:clamp(22px,3.6vw,48px)}.main .t p{color:var(--muted);margin:12px 0 20px;font-size:16.5px}
.main .im{height:100%;min-height:300px}.main .im img{width:100%;height:100%;object-fit:cover}
.side{display:grid;grid-template-rows:1fr 1fr;gap:14px}.deal{display:grid;grid-template-columns:1fr 120px;align-items:center;gap:12px;padding:18px;text-decoration:none}.deal b{display:block;font:800 18px/1.2 var(--f)}.deal span{font-size:13.5px;color:var(--muted)}.deal .im{aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--soft)}.deal .im img{width:100%;height:100%;object-fit:cover}
.deal em{display:inline-block;font-style:normal;font:800 12px var(--f);background:var(--accent);color:var(--on);border-radius:999px;padding:3px 10px;margin-bottom:8px}
/* sections */
.sec{margin-top:16px;padding:clamp(16px,2.4vw,28px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:14px}.sec .top a{font-weight:700;text-decoration:underline;text-underline-offset:3px}
.dgrid{display:grid;grid-template-columns:repeat(var(--n,8),1fr);gap:12px}.dgrid a{text-align:center;text-decoration:none;font:700 14px/1.25 var(--f)}.dgrid .ph{aspect-ratio:1;border-radius:50%;overflow:hidden;background:var(--soft);margin-bottom:8px}.dgrid .ph img{width:100%;height:100%;object-fit:cover}.dgrid span{display:block;font-weight:500;font-size:12.5px;color:var(--muted)}
.pgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.pc{display:flex;flex-direction:column;background:#fff;border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}.pc:hover{box-shadow:0 8px 24px -16px rgba(0,0,0,.4)}
.pc .ph{display:block;aspect-ratio:1;background:#fff;overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:10px 12px 12px;display:flex;flex-direction:column;flex:1}.pc .pr{font:800 19px var(--f)}.pc .pr small{font:600 13px var(--f);color:var(--muted)}
.pc .t>a{text-decoration:none}.pc h3{font:500 14px/1.35 var(--f);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:12.5px;color:var(--muted);margin:2px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.pc .btn{margin-top:auto;align-self:flex-start;margin-top:10px}
.perks{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px}.perks div{background:#fff;border-radius:var(--r);padding:16px 18px;display:flex;gap:12px}.perks i{flex:none;width:34px;height:34px;border-radius:50%;background:var(--accent);color:var(--on);display:grid;place-items:center;font:800 14px var(--f);font-style:normal}.perks b{display:block;font-size:15px}.perks p{margin:2px 0 0;color:var(--muted);font-size:13.5px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,3vw,36px);align-items:center}.about .ph{border-radius:var(--r);overflow:hidden;min-height:260px;background:var(--soft)}.about .ph img{width:100%;height:100%;object-fit:cover}.about .t div{color:var(--muted);margin:10px 0 18px}
.qa details{border-bottom:1px solid var(--line)}.qa summary{list-style:none;cursor:pointer;padding:14px 0;font:700 15.5px/1.4 var(--f);display:flex;justify-content:space-between;gap:14px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";color:var(--accent);font-size:20px;line-height:1;flex:none}.qa details[open] summary:after{content:"–"}.qa details p{margin:0 0 14px;color:var(--muted)}
.cta{margin-top:16px;background:var(--ink);color:#fff;border-radius:var(--r);padding:clamp(20px,3vw,36px);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.cta p{color:#c6c6c6;margin:6px 0 0}
/* listing */
.crumbs{font-size:13.5px;color:var(--muted);padding-top:14px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.shop{display:grid;grid-template-columns:240px 1fr;gap:16px;margin-top:12px;align-items:start}.shop>*{min-width:0}
.dept{position:sticky;top:132px;padding:16px;max-height:calc(100vh - 150px);overflow:auto}.dept h2{font:800 16px var(--f);margin:0 0 10px}.dept a{display:flex;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:8px;text-decoration:none;font-size:14px}.dept a:hover{background:var(--soft)}.dept a[aria-current]{background:var(--ink);color:#fff}.dept span{color:var(--muted);font-size:12.5px}.dept a[aria-current] span{color:#bbb}.dept .up{font-weight:700}
.dept details summary{display:none}
.lh{padding:16px 18px;margin-bottom:12px}.lh p{margin:6px 0 0}
.res{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}.res form{display:flex;background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 3px 3px 14px}.res input{border:0;background:none;outline:none;font:inherit;width:240px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:34px;padding:0 14px;font-weight:700;cursor:pointer}
.shop .pgrid{grid-template-columns:repeat(4,1fr)}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:24px 0 6px}.pages a,.pages span{min-width:40px;height:40px;display:grid;place-items:center;border-radius:999px;background:#fff;border:1px solid var(--line);text-decoration:none;font-weight:700;padding:0 12px}.pages a:hover{border-color:var(--ink)}.pages [aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.pages .gap{background:none;border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:16px;margin-top:12px;align-items:start}.pdp>*{min-width:0}
.pdp .ph{border-radius:var(--r);overflow:hidden;background:#fff;aspect-ratio:1}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{padding:clamp(18px,2.6vw,30px)}.pdp h1{font:800 clamp(22px,2.2vw,30px)/1.2 var(--f);margin:0}.pdp .d{color:var(--muted);margin:6px 0 0}
.pdp .price{font:800 32px var(--f);margin:16px 0}.pdp .acts{display:grid;gap:8px}.pdp .btn{width:100%;height:48px;font-size:15.5px}
.checks{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:7px;font-size:14px}.checks li:before{content:"✓";color:var(--accent);font-weight:800;margin-right:8px}
.info2{margin-top:16px;padding:clamp(18px,2.6vw,30px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(16px,3vw,40px)}.info2>*{min-width:0}.info2 h2{font:800 18px var(--f);margin:0 0 10px}
.info2 table{width:100%;border-collapse:collapse;font-size:14.5px}.info2 th,.info2 td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line)}.info2 tr:nth-child(odd){background:var(--soft)}.info2 th{width:42%;font-weight:700}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:5px;font:700 13.5px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:11px 14px;border:1px solid #c3c8ce;border-radius:8px;background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:44px;padding:0 22px;border:0;border-radius:999px;background:var(--accent);color:var(--on);font:700 14.5px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(16px,4vw,48px);padding:clamp(18px,3vw,36px);margin-top:16px}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:7px}
/* footer */
.ft{background:var(--ink);color:#c9c9c9;margin-top:clamp(24px,3vw,40px);padding-block:40px 20px;font-size:14px}
.ft .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:26px}.ft h4{color:#fff;font:800 15px var(--f);margin:0 0 10px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ft a{text-decoration:none}.ft a:hover{color:#fff;text-decoration:underline}.ft p{margin:0}
.ft .base{border-top:1px solid #333;margin-top:28px;padding-top:14px;font-size:12.5px;color:#8f8f8f}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1200px){.pgrid{grid-template-columns:repeat(4,1fr)}.shop .pgrid{grid-template-columns:repeat(3,1fr)}.dgrid{grid-template-columns:repeat(4,1fr)}}
@media(max-width:900px){.hero,.main,.about,.pdp,.info2,.two{grid-template-columns:1fr}.main .im{order:-1;max-height:260px}.side{grid-template-rows:none;grid-template-columns:1fr 1fr}.shop{grid-template-columns:1fr}.dept{position:static;max-height:none}.hd .r{display:none}
.dept details summary{display:flex;justify-content:space-between;cursor:pointer;list-style:none;font-weight:800}.dept details summary::-webkit-details-marker{display:none}.dept details:not([open]) h2{display:none}
.pgrid,.shop .pgrid{grid-template-columns:repeat(3,1fr)}.perks{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.hd .w{flex-wrap:wrap;height:auto;padding-block:10px;gap:10px}.hd form{order:3;flex-basis:100%;max-width:none}.side{grid-template-columns:1fr}.pgrid,.shop .pgrid{grid-template-columns:1fr 1fr;gap:8px}.dgrid{grid-template-columns:repeat(3,1fr)}.perks,.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; q?: string }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="${esc(t.doc.tokens.palette.accent)}">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Nunito+Sans:wght@400;500;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Depot template · built by Apereel</div>' : ""}
<header class="hd"><div class="w">${logo(s, t)}<form role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="Search everything at ${esc(s.brand.name)}" aria-label="Search products"><button type="submit">Search</button></form><div class="r"><a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">${t.doc.productAction === "enquire" ? "Get a quote" : "Help"}</a></div></div></header>
${top.length ? `<nav class="depts" aria-label="Departments"><div class="w"><a href="${href(t, "/products")}">All departments</a>${top.slice(0, 14).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</div></nav>` : ""}
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols">
<div><h4>Departments</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Customer service</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div>
<div><h4>Company</h4><ul><li><a href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></li>${extraLinks(t)}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><p>${esc(s.brand.tagline)}</p></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><span class="pr">${esc(money(p)) || "<small>Price on request</small>"}</span><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<a class="btn sm${action.enquire ? " out" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const deals = top.slice(0, 2);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<div class="w"><section class="hero"><div class="card main"><div class="t">${s.hero.eyebrow ? `<p style="margin:0 0 8px;font-weight:800;color:var(--accent)">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:18px"></div>'}<a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></div>
${deals.length === 2 ? `<div class="side">${deals.map((c) => `<a class="card deal" href="${href(t, `/collections/${c.slug}`)}"><div><em>${c.count.toLocaleString("en-US")} items</em><b>${esc(shortName(c.name))}</b><span>Shop the department →</span></div><div class="im">${img(c.image, c.name)}</div></a>`).join("")}</div>` : ""}</section>
${top.length >= 4 ? `<section class="card sec"><div class="top"><h2 class="h2">Shop by department</h2><a href="${href(t, "/products")}">See all</a></div><div class="dgrid" style="--n:${Math.min(8, top.length)}">${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div>${esc(shortName(c.name))}<span>${c.count.toLocaleString("en-US")}</span></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="card sec"><div class="top"><h2 class="h2">Popular right now</h2><a href="${href(t, "/products")}">View all</a></div><div class="pgrid">${s.featured.slice(0, 10).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${trust.length >= 2 ? `<section style="margin-top:16px"><div class="perks" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x, i) => `<div><i>${i + 1}</i><div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="card sec"><div class="about">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ink" href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="card sec"><div class="top"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
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
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All departments";
  const side = list.length ? `<aside class="card dept"><details open><summary>Departments ▾</summary><h2>${st.cat ? esc(shortName(st.cat.name)) : "Departments"}</h2>${st.cat ? `<a class="up" href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All departments"))}</a>` : ""}${list.slice(0, 60).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</details></aside>` : "<div></div>";
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All departments</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="shop">${side}<div><div class="card lh"><h1 class="h1" style="font-size:clamp(22px,2.4vw,32px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "items"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span>${st.cat ? `<form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search in ${esc(shortName(st.cat.name).toLowerCase())}" aria-label="Search in this department"><button type="submit">Search</button></form>` : ""}</div>
${filterBar(t, st)}<div class="pgrid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p class="card" style="padding:20px">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All departments</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="card info">${cat ? `<p style="margin:0 0 6px;font-weight:700;color:var(--accent)">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="card info2"><div><h2>About this item</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="card two" id="enquire"><div><h2 class="h2">Request a quote</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</section>` : ""}
${related.length ? `<section class="card sec"><div class="top"><h2 class="h2">Related items</h2></div><div class="pgrid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › About</p><section class="card sec"><div class="about">${visual ? `<div class="ph">${img(visual, s.brand.name, "", true)}</div>` : ""}<div class="t"${visual ? "" : ' style="grid-column:1/-1"'}><h1 class="h1">${esc(st?.heading ?? s.brand.tagline)}</h1>${st ? `<div style="color:var(--ink);font-size:16px">${paras(st.body)}</div>` : ""}</div></div></section>
${s.highlights.length ? `<section style="margin-top:16px"><div class="perks" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h, i) => `<div><i>${i + 1}</i><div><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div></div>`).join("")}</div></section>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Contact</p><section class="card two"><div class="facts"><h1 class="h1" style="font-size:clamp(24px,2.6vw,36px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
  if (cp) return html(page(t, s, { path: joined, title: cp.metaTitle || metaTitle(cp.title, s.brand.name), description: cp.metaDescription, body: `<section class="w"><div class="card" style="margin-top:16px">${articleBody(t, cp)}</div></section>` }));
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
