import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Pop": Template tier. Original design in the language of friendly
// home-appliance brands: soft white, big round corners, each category on its
// own pastel card, a cheerful hero with a round product cut-out, chunky
// rounded type, benefit pills, best-seller cards with a clear button. Fast:
// no scroll animation.

const PER_PAGE = 24;
const PASTELS = ["#fde9df", "#e3f0fb", "#e8f6e9", "#f6e8fb", "#fff3cf", "#e6f4f4", "#fde4ea", "#ecebfb"];

function css(accent: string) {
  return `
:root{--ink:#202124;--muted:#62656b;--soft:#f6f5f2;--line:#e6e4df;--accent:${accent};--on:${onColor(accent)};--f:"Nunito",system-ui,sans-serif;--r:26px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:500 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1360px;margin:0 auto;padding-inline:clamp(14px,3vw,40px)}
.h1{font:900 clamp(36px,4.8vw,66px)/1.02 var(--f);letter-spacing:-.025em;margin:0}
.h2{font:900 clamp(26px,2.8vw,38px)/1.1 var(--f);letter-spacing:-.02em;margin:0}
.h3{font:800 18px/1.25 var(--f);margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:50px;padding:0 26px;border-radius:999px;background:var(--accent);color:var(--on);font:800 15.5px var(--f);text-decoration:none;border:0;cursor:pointer;transition:transform .15s}
.btn:hover{transform:translateY(-2px)}.btn.ink{background:var(--ink);color:#fff}.btn.white{background:#fff;color:var(--ink)}.btn.out{background:transparent;color:inherit;box-shadow:inset 0 0 0 2px currentColor}.btn.sm{height:40px;padding:0 18px;font-size:14.5px}
/* header */
.hd{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line)}
.hd .w{display:flex;align-items:center;gap:24px;height:72px}
.logo{font:900 26px var(--f);letter-spacing:-.03em;text-decoration:none;flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;color:var(--accent)}.logo img{max-height:44px;width:auto}
.hd nav{display:flex;gap:4px;flex:1;white-space:nowrap;overflow:hidden}.hd nav a{text-decoration:none;font:800 15px var(--f);padding:9px 14px;border-radius:999px}.hd nav a:hover{background:var(--soft)}
.hd form{display:flex;align-items:center;background:var(--soft);border-radius:999px;height:44px;padding:0 6px 0 18px;width:min(280px,26vw)}.hd form input{flex:1;min-width:0;border:0;background:none;outline:none;font:inherit;font-size:15px}.hd form button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:34px;padding:0 14px;font:800 13px var(--f);cursor:pointer}
.burger{display:none;margin-left:auto;cursor:pointer;font:800 15px var(--f)}#nav{display:none}.drawer{display:none;border-bottom:1px solid var(--line)}#nav:checked~.drawer{display:block}.drawer .w{padding-block:8px 16px}.drawer a{display:block;padding:12px 6px;border-bottom:1px solid var(--line);font:800 19px var(--f);text-decoration:none}
.drawer form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 16px;margin:6px 0 8px}.drawer input{flex:1;border:0;background:none;outline:none;font:inherit;min-width:0}.drawer button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:38px;padding:0 16px;font-weight:800}
/* hero */
.hero{display:grid;grid-template-columns:1.05fr 1fr;align-items:center;gap:clamp(20px,4vw,56px);background:var(--soft);border-radius:var(--r);margin-top:16px;padding:clamp(24px,4vw,64px);overflow:hidden}
.hero p{color:var(--muted);margin:16px 0 26px;font-size:18px;max-width:520px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero .disc{aspect-ratio:1;border-radius:50%;overflow:hidden;background:#fff;box-shadow:0 30px 60px -36px rgba(0,0,0,.35);max-width:520px;width:100%;justify-self:center}.hero .disc img{width:100%;height:100%;object-fit:cover}
.hero.cover{display:block;position:relative;padding:0;min-height:min(560px,72vh);color:#fff}.hero.cover>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55),transparent 70%)}.hero.cover .t{position:relative;z-index:1;padding:clamp(28px,5vw,72px);max-width:680px}.hero.cover p{color:#eee}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.pills span{background:#fff;border-radius:999px;padding:8px 14px;font:800 13.5px var(--f);box-shadow:0 1px 0 var(--line)}
.hero.cover .pills span{background:rgba(255,255,255,.2);color:#fff;box-shadow:none}
/* sections */
.sec{padding-top:clamp(44px,5.5vw,80px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.sec .top a{font-weight:800;color:var(--accent);text-decoration:none}.sec .top a:hover{text-decoration:underline}
.cats{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:14px}
.cat{display:flex;flex-direction:column;justify-content:space-between;border-radius:var(--r);padding:22px;min-height:260px;text-decoration:none;position:relative;overflow:hidden;transition:transform .2s}.cat:hover{transform:translateY(-3px)}
.cat .ph{width:62%;aspect-ratio:1;border-radius:50%;overflow:hidden;background:#fff;align-self:flex-end;box-shadow:0 18px 30px -22px rgba(0,0,0,.35)}.cat .ph img{width:100%;height:100%;object-fit:cover}
.cat b{font:900 21px/1.15 var(--f)}.cat span{display:block;font-size:14px;color:var(--muted);margin-top:4px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pc{display:flex;flex-direction:column;background:#fff;border:1.5px solid var(--line);border-radius:var(--r);overflow:hidden;transition:box-shadow .2s}.pc:hover{box-shadow:0 18px 40px -26px rgba(0,0,0,.35)}
.pc .ph{display:block;aspect-ratio:1;background:var(--soft);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:16px 18px 18px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:800 16px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:14px;color:var(--muted);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:10px;font:900 21px var(--f)}.pc .pr small{font:700 14px var(--f);color:var(--muted)}.pc .btn{margin-top:12px}
.perks{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:14px}.perks>div{display:flex;gap:14px;align-items:flex-start;background:var(--soft);border-radius:var(--r);padding:22px}.perks i{flex:none;width:44px;height:44px;border-radius:50%;background:var(--accent);color:var(--on);display:grid;place-items:center;font:900 18px var(--f);font-style:normal}.perks p{margin:4px 0 0;color:var(--muted);font-size:15px}
.story{display:grid;grid-template-columns:1fr 1fr;gap:14px}.story .ph{border-radius:var(--r);overflow:hidden;background:var(--soft);min-height:340px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{border-radius:var(--r);background:var(--soft);padding:clamp(24px,4vw,56px);display:flex;flex-direction:column;justify-content:center}.story .t div{color:var(--muted);margin:12px 0 22px}
.qa{max-width:900px;margin:0 auto}.qa details{background:var(--soft);border-radius:18px;margin-bottom:10px;padding:0 20px}.qa summary{list-style:none;cursor:pointer;padding:18px 0;font:800 17px/1.4 var(--f);display:flex;justify-content:space-between;gap:16px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";flex:none;font-size:24px;line-height:1;color:var(--accent)}.qa details[open] summary:after{content:"−"}.qa details p{margin:0 0 18px;color:var(--muted)}
.cta{margin-top:clamp(44px,5.5vw,80px);background:var(--accent);color:var(--on);border-radius:var(--r);padding:clamp(28px,4vw,56px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{margin:8px 0 0;opacity:.9}.cta .btn{background:var(--on);color:var(--accent)}
/* listing */
.crumbs{font-size:14px;color:var(--muted);padding-top:16px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:8px 4px}.lh p{margin:8px 0 0;max-width:760px}
.chips{display:flex;gap:8px;overflow-x:auto;padding-block:16px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}.chips a{white-space:nowrap;padding:10px 18px;border-radius:999px;font:800 14.5px var(--f);text-decoration:none}.chips a:hover{filter:brightness(.96)}.chips a[aria-current]{background:var(--ink)!important;color:#fff}.chips span{opacity:.6;margin-left:6px}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 14px}.res form{display:flex;background:var(--soft);border-radius:999px;padding:4px 4px 4px 16px}.res input{border:0;background:none;outline:none;font:inherit;width:260px;min-width:0}.res button{border:0;border-radius:999px;background:var(--ink);color:#fff;height:38px;padding:0 16px;font-weight:800;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:32px 0 6px}.pages a,.pages span{min-width:44px;height:44px;display:grid;place-items:center;border-radius:999px;background:var(--soft);text-decoration:none;font-weight:800;padding:0 14px}.pages a:hover{background:#ecebe6}.pages [aria-current]{background:var(--accent);color:var(--on)}.pages .gap{background:none}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(20px,4vw,56px);padding-top:16px;align-items:start}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--soft)}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:900 clamp(28px,2.8vw,40px)/1.1 var(--f);letter-spacing:-.02em;margin:0}.pdp .d{color:var(--muted);margin:8px 0 0}
.box{background:var(--soft);border-radius:var(--r);padding:22px;margin-top:18px}.box .pr{font:900 34px var(--f)}.box .acts{display:grid;gap:10px;margin-top:14px}.box .btn{width:100%;height:54px}
.checks{list-style:none;padding:0;margin:16px 0 0;display:flex;gap:8px;flex-wrap:wrap}.checks li{background:#fff;border-radius:999px;padding:8px 14px;font:800 13.5px var(--f)}
.info{margin-top:clamp(28px,4vw,48px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,56px)}.info>*{min-width:0}.info h2{font:900 22px var(--f);margin:0 0 10px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}.info th{width:42%;font-weight:800}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:800 14px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:14px 18px;border:0;border-radius:18px;background:var(--soft)}.form input:focus,.form textarea:focus{outline:2px solid var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:50px;padding:0 26px;border:0;border-radius:999px;background:var(--accent);color:var(--on);font:800 15.5px var(--f);cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(20px,5vw,64px);padding-block:clamp(28px,4vw,48px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--soft);margin-top:clamp(44px,5.5vw,80px);padding-block:48px 24px;font-size:15px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:30px}.ft p{color:var(--muted)}.ft h4{font:900 16px var(--f);margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;color:#45474c}.ft a{text-decoration:none}.ft a:hover{text-decoration:underline}
.ft .base{border-top:1px solid var(--line);margin-top:36px;padding-top:18px;font-size:13px;color:var(--muted)}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.cats{grid-template-columns:repeat(3,1fr)}.hd nav,.hd form{display:none}.burger{display:block}}
@media(max-width:780px){.hero,.story,.pdp,.two,.info{grid-template-columns:1fr}.hero .disc{max-width:320px;order:-1}.cats{grid-template-columns:1fr 1fr}.perks{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr;gap:10px}.ft .cols{grid-template-columns:1fr 1fr}.cat{min-height:220px}}
@media(max-width:480px){.form,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}.pc .t{padding:12px}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; q?: string }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  const search = `<form role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="Search products" aria-label="Search products"><button type="submit">Search</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#ffffff">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Nunito:wght@500;700;800;900"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Pop template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Shop</a>${top.slice(0, 4).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/contact")}">Help</a></nav>${search}<label class="burger" for="nav">Menu</label></div></header>
<div class="drawer"><div class="w">${search}<a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Help</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "<small>Price on request</small>"}</span><a class="btn sm${action.enquire ? " ink" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const pills = s.promise.slice(0, 3);
  const txt = `${s.hero.eyebrow ? `<p style="margin:0 0 10px;font-weight:900;color:${cover ? "#fff" : "var(--accent)"}">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ${cover ? "white" : "out"}" href="${href(t, "/contact")}">Contact us</a></div>${pills.length ? `<div class="pills">${pills.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""}`;
  const hero = cover
    ? `<section class="hero cover">${img(cover, s.hero.heading, "", true)}<div class="t">${txt}</div></section>`
    : `<section class="hero"><div>${txt}</div><div class="disc">${img(s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>`;
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<div class="w">${hero}
${top.length >= 3 ? `<section class="sec"><div class="top"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">See all →</a></div><div class="cats" style="--n:${Math.min(4, top.length)}">${top.slice(0, 8).map((c, i) => `<a class="cat" href="${href(t, `/collections/${c.slug}`)}" style="background:${PASTELS[i % PASTELS.length]}"><div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></div><div class="ph">${img(c.image, c.name)}</div></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Best sellers</h2><a href="${href(t, "/products")}">Shop all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${trust.length >= 2 ? `<section class="sec"><div class="perks" style="--n:${Math.min(3, trust.length)}">${trust.slice(0, 3).map((x, i) => `<div><i>${i + 1}</i><div><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><p style="margin:0 0 8px;font-weight:900;color:var(--accent)">Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><div><a class="btn ink" href="${href(t, "/about")}">About ${esc(s.brand.name)}</a></div></div></div></section>` : ""}
${s.faq?.items.length ? `<section class="sec"><div class="top" style="justify-content:center"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="h1" style="font-size:clamp(28px,3.2vw,44px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}" style="background:var(--soft)">‹ ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 40).map((c, i) => `<a href="${href(t, `/collections/${c.slug}`)}" style="background:${PASTELS[i % PASTELS.length]}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:16px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "all products"}" aria-label="Search"><button type="submit">Search</button></form></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<p style="margin:0 0 8px;font-weight:900;color:var(--accent)">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask a question</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>About this product</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--soft);border-radius:var(--r);padding-inline:clamp(20px,4vw,48px)"><div><h2 class="h2">Ask about this product</h2><p class="muted">Product codes, quantities or questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You might also like</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><section class="hero"><div><p style="margin:0 0 10px;font-weight:900;color:var(--accent)">About ${esc(s.brand.name)}</p><h1 class="h1" style="font-size:clamp(30px,3.8vw,52px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div>${visual ? `<div class="disc">${img(visual, s.brand.name, "", true)}</div>` : ""}</section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="perks" style="--n:${Math.min(3, s.highlights.length)}">${s.highlights.slice(0, 3).map((h, i) => `<div><i>${i + 1}</i><div><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Help</p><section class="two"><div class="facts"><h1 class="h1" style="font-size:clamp(28px,3.2vw,44px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
