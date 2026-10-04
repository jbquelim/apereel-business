import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { byRank, categoryNav, contactItems, esc, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listState, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Ledger": Template tier. Original design in the language of established
// retail catalogues: a utility bar, a wide search box in the header, a
// category bar, a compact banner hero, round category tiles, dense bordered
// product cards, numbered pages. Fast and plain: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#111;--muted:#666;--line:#e3e3e3;--soft:#f4f4f4;--accent:${accent};--on:${onColor(accent)};--f:"Archivo",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 16px/1.5 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,32px)}
.kicker{font:700 12px/1 var(--f);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 12px}
.h1{font:800 clamp(30px,3.6vw,50px)/1.05 var(--f);letter-spacing:-.02em;margin:0}
.h2{font:800 clamp(22px,2.2vw,30px)/1.15 var(--f);letter-spacing:-.01em;margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 26px;background:var(--ink);color:#fff;font:700 14px var(--f);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:background .2s}
.btn:hover{background:#333}.btn.acc{background:var(--accent);color:var(--on)}.btn.acc:hover{filter:brightness(.92)}.btn.line{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}.btn.line:hover{background:var(--soft)}
/* header */
.util{background:var(--ink);color:#fff;font-size:13px}.util .w{display:flex;justify-content:space-between;gap:20px;height:36px;align-items:center}.util a{text-decoration:none}.util .r{display:flex;gap:22px}
.hd{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:30}
.hd .row{display:flex;align-items:center;gap:clamp(16px,3vw,40px);height:80px}
.logo{font:800 22px var(--f);letter-spacing:-.02em;text-decoration:none;flex:none}.logo img{max-height:46px;width:auto}
.find{flex:1;display:flex;max-width:640px;border:2px solid var(--ink)}
.find input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 16px;height:44px}.find button{border:0;background:var(--ink);color:#fff;font:700 13px var(--f);letter-spacing:.06em;text-transform:uppercase;padding:0 20px;cursor:pointer}
.hd .links{display:flex;gap:20px;font:600 14px var(--f);margin-left:auto}.hd .links a{text-decoration:none}
.cats{border-top:1px solid var(--line)}.cats .w{display:flex;gap:26px;overflow-x:auto;scrollbar-width:none;height:48px;align-items:center}.cats .w::-webkit-scrollbar{display:none}
.cats a{white-space:nowrap;font:700 13px var(--f);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:14px 0;border-bottom:3px solid transparent}.cats a:hover,.cats a[aria-current]{border-color:var(--accent)}
/* hero */
.banner{background:var(--soft);display:grid;grid-template-columns:1fr 1fr;align-items:center;min-height:440px;margin-top:24px;overflow:hidden}
.banner .t{padding:clamp(28px,5vw,64px)}.banner .t p{font-size:18px;color:#444;margin:16px 0 28px;max-width:520px}
.banner .im{height:100%;display:grid;place-items:center;padding:28px;background:#fff}.banner .im img{max-height:400px;object-fit:contain}
.banner .im img.cover{width:100%;height:100%;max-height:none;object-fit:cover}.banner .im.full{padding:0}
/* trust */
.trust{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);margin-top:24px}
.trust div{padding:22px 24px;border-right:1px solid var(--line)}.trust div:last-child{border-right:0}
.trust b{display:block;font-size:15px;margin-bottom:4px}.trust b:before{content:"";display:block;width:28px;height:3px;background:var(--accent);margin-bottom:12px}.trust span{font-size:14px;color:var(--muted)}
/* sections */
.sec{padding:clamp(44px,5vw,72px) 0 0}.sec .head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px;border-bottom:1px solid var(--line);padding-bottom:14px}
.sec .head a{font:700 13px var(--f);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;white-space:nowrap}
.round{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:26px 18px}
.round a{text-align:center;text-decoration:none}.round .ph{aspect-ratio:1;border-radius:50%;background:var(--soft);display:grid;place-items:center;overflow:hidden;transition:box-shadow .2s}
.round .ph img{width:72%;height:72%;object-fit:contain;mix-blend-mode:multiply}.round a:hover .ph{box-shadow:0 0 0 3px var(--accent)}
.round b{display:block;font:700 14.5px/1.25 var(--f);margin-top:12px}.round span{font-size:13px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pc{display:flex;flex-direction:column;border:1px solid var(--line);text-decoration:none;background:#fff;transition:border-color .2s}
.pc:hover{border-color:var(--ink)}.pc .ph{aspect-ratio:1;display:grid;place-items:center;padding:16px;border-bottom:1px solid var(--line)}.pc .ph img{max-height:100%;object-fit:contain}
.pc .t{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.pc h3{font:600 15px/1.35 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13px;color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:6px;font:800 18px var(--f)}.pc .go{font:700 12px var(--f);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.promo{display:grid;grid-template-columns:1fr 1fr;background:var(--ink);color:#fff}.promo .t{padding:clamp(28px,5vw,64px)}.promo .t div{color:rgba(255,255,255,.75);margin:14px 0 26px}
.promo .im{background:#fff;display:grid;place-items:center;min-height:320px}.promo .im img{max-height:340px;object-fit:contain}.promo .im img.cover{width:100%;height:100%;max-height:none;object-fit:cover}
.promo .btn{background:#fff;color:var(--ink)}
.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.feat div{background:var(--soft);padding:26px}.feat h3{font:800 18px var(--f);margin:0 0 8px}.feat p{margin:0;color:#555;font-size:15px}
.qa{display:grid;grid-template-columns:repeat(2,1fr);gap:0 40px}.qa div{border-top:1px solid var(--line);padding:20px 0}.qa h3{font:700 16px/1.35 var(--f);margin:0 0 8px}.qa p{margin:0;color:#555;font-size:15px}
.band{background:var(--accent);color:var(--on);margin-top:clamp(44px,5vw,72px)}.band .w{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding-top:40px;padding-bottom:40px}
.band p{margin:8px 0 0;opacity:.85}.band .btn{background:var(--on);color:var(--accent)}
/* listing */
.crumbs{font-size:13.5px;color:var(--muted);padding:18px 0 0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding:14px 0 18px;display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
.lh p{margin:8px 0 0;max-width:720px}
.chips{display:flex;gap:8px;flex-wrap:wrap;padding:18px 0}.chips a{border:1px solid var(--line);padding:8px 14px;font-size:14px;text-decoration:none}.chips a:hover{border-color:var(--ink)}.chips a[aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.chips a span{color:var(--muted);margin-left:6px;font-size:12.5px}
.chips .more{display:none}
.res{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:4px 0 16px;font-size:14px;color:var(--muted);flex-wrap:wrap}
.res form{display:flex;border:1px solid var(--line)}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:38px;min-width:0;width:240px}.res button{border:0;background:var(--soft);font:700 12px var(--f);text-transform:uppercase;letter-spacing:.06em;padding:0 14px;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:36px 0 64px}.pages a,.pages span{min-width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--line);text-decoration:none;font-weight:600;padding:0 12px}.pages a:hover{border-color:var(--ink)}.pages [aria-current]{background:var(--ink);color:#fff;border-color:var(--ink)}.pages .gap{border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(24px,4vw,56px);padding:20px 0 0;align-items:start}
.pdp .im{border:1px solid var(--line);aspect-ratio:1;display:grid;place-items:center;padding:clamp(20px,4vw,48px)}.pdp .im img{max-height:100%;object-fit:contain}
.pdp h1{font:800 clamp(26px,2.6vw,36px)/1.15 var(--f);margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.pdp .price{font:800 30px var(--f);margin:20px 0 4px}.pdp .sku{font-size:13px;color:var(--muted);margin:0 0 22px}
.pdp .btn{width:100%}
.checks{list-style:none;padding:18px 0 0;margin:22px 0 0;border-top:1px solid var(--line);display:grid;gap:10px;font-size:15px}.checks li:before{content:"✓";color:var(--accent);font-weight:800;margin-right:10px}
.tabs{margin-top:clamp(36px,4vw,56px);border-top:2px solid var(--ink)}.tabs h2{font:800 16px var(--f);letter-spacing:.06em;text-transform:uppercase;margin:22px 0 14px}
.tabs .cols{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(24px,4vw,56px)}.tabs table{width:100%;border-collapse:collapse;font-size:15px}.tabs th,.tabs td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}.tabs tr:nth-child(odd){background:var(--soft)}.tabs th{font-weight:600;width:42%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font:600 13px var(--f)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:12px 14px;border:1px solid #bbb;background:#fff}.form input:focus,.form textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 28px;border:0;background:var(--ink);color:#fff;font:700 14px var(--f);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,5vw,72px);padding:clamp(28px,4vw,48px) 0}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--soft);margin-top:clamp(44px,5vw,72px);padding:48px 0 24px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:32px}.ft h4{font:800 13px var(--f);letter-spacing:.08em;text-transform:uppercase;margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ft a{text-decoration:none;color:#333}.ft a:hover{text-decoration:underline}.ft p{color:#555;max-width:300px}
.ft .base{border-top:1px solid #ddd;margin-top:36px;padding-top:18px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.trust{grid-template-columns:1fr 1fr}.trust div:nth-child(2){border-right:0}.trust div:nth-child(-n+2){border-bottom:1px solid var(--line)}.hd .links{display:none}}
@media(max-width:800px){.banner,.promo,.pdp,.two,.tabs .cols,.qa{grid-template-columns:1fr}.banner .im{order:-1;max-height:300px}.feat{grid-template-columns:1fr}.ft .cols{grid-template-columns:1fr 1fr}.util .l{display:none}
.hd .row{flex-wrap:wrap;height:auto;padding:12px 0;gap:12px}.find{order:3;flex-basis:100%;max-width:none}}
@media(max-width:560px){.grid{grid-template-columns:1fr 1fr;gap:10px}.pc .t{padding:12px}.trust{grid-template-columns:1fr}.trust div{border-right:0;border-bottom:1px solid var(--line)}.form{grid-template-columns:1fr}.ft .cols{grid-template-columns:1fr}.res input{width:100%}.res form{flex:1}}`;
}

const JS = `<script>(function(){if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean; current?: string | null; q?: string }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#111111">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Archivo:wght@400;600;700;800"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Ledger template · built by Apereel</div>' : ""}
<div class="util"><div class="w"><span class="l">${esc(s.brand.tagline)}</span><span class="r">${s.brand.phone ? `<a href="tel:${esc(s.brand.phone)}">${esc(s.brand.phone)}</a>` : ""}${s.brand.email ? `<a href="mailto:${esc(s.brand.email)}">${esc(s.brand.email)}</a>` : ""}<a href="${href(t, "/contact")}">Contact us</a></span></div></div>
<header class="hd"><div class="w row">${logo(s, t)}<form class="find" role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="Search by product name or part number" aria-label="Search products"><button type="submit">Search</button></form><nav class="links" aria-label="Company"><a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></nav></div>
${top.length ? `<nav class="cats" aria-label="Categories"><div class="w"><a href="${href(t, "/products")}"${o.current === "" ? ' aria-current="page"' : ""}>All products</a>${top.slice(0, 12).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${o.current === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}</a>`).join("")}</div></nav>` : ""}</header>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>Company</h4><ul><li><a href="${href(t, "/about")}">About us</a></li><li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Customer service</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</span><span>${esc(s.brand.name)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc" href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "&nbsp;"}</span><span class="go">${money(p) ? "View details" : "Ask for price"}</span></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const trust = s.trust.length ? s.trust.map((x) => ({ title: x.title, body: x.body })) : s.highlights.map((h) => ({ title: h.title, body: h.body }));
  const promoImg = large.find((u) => u !== cover) ?? s.featured.find((p) => p.image && p.image !== s.hero.image)?.image ?? null;
  return `<section class="w"><div class="banner"><div class="t">${s.hero.eyebrow ? `<p class="kicker">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="h1">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:24px"></div>'}<a class="btn acc" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div><div class="im${cover ? " full" : ""}">${cover ? img(cover, s.hero.heading, "cover", true) : img(s.hero.image, s.hero.heading, "", true)}</div></div>
${trust.length >= 2 ? `<div class="trust">${trust.slice(0, 4).map((x) => `<div><b>${esc(x.title)}</b><span>${esc(x.body)}</span></div>`).join("")}</div>` : ""}</section>
${top.length >= 3 ? `<section class="w sec"><div class="head"><h2 class="h2">Shop by category</h2><a href="${href(t, "/products")}">View all</a></div><div class="round">${top.slice(0, 12).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} items</span></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="w sec"><div class="head"><h2 class="h2">Featured products</h2><a href="${href(t, "/products")}">Shop all</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec"><div class="promo"><div class="t"><p class="kicker" style="color:#fff;opacity:.7">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn" href="${href(t, "/about")}">About us</a></div><div class="im">${img(promoImg, s.story.heading, promoImg && isLarge(promoImg) ? "cover" : "")}</div></div></section>` : ""}
${s.trust.length && s.highlights.length ? `<section class="w sec"><div class="head"><h2 class="h2">Why shop with ${esc(s.brand.name)}</h2></div><div class="feat">${s.highlights.map((h) => `<div><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec"><div class="head"><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="qa">${s.faq.items.map((f) => `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="band"><div class="w"><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p>${esc(s.closing.body)}</p>` : ""}</div><a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

/** Page numbers with gaps: 1 … 4 5 6 … 20. */
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
  const title = st.q ? `Search results for “${st.q}”` : st.cat ? st.cat.name : "All products";
  const top = nav.trail[0]?.slug ?? (st.cat ? null : "");
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All products</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}${st.cat ? ` › ${esc(shortName(st.cat.name))}` : ""}</p>
<div class="lh"><div><h1 class="h1" style="font-size:clamp(26px,3vw,40px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div></div>
${chips.length ? `<div class="chips">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All products"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</div>` : '<div style="height:18px"></div>'}
<div class="res"><span>${st.total.toLocaleString("en-US")} ${st.q ? "results" : "items"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span>${st.cat ? `<form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search in ${esc(shortName(st.cat.name).toLowerCase())}" aria-label="Search in this category"><button type="submit">Go</button></form>` : ""}</div>
<div class="grid">${st.shown.map((p) => pc(t, p)).join("")}</div>${st.total === 0 ? `<p style="margin:30px 0">No products match that. <a href="${href(t, "/contact")}">Contact us</a> and we'll check for you.</p>` : ""}
${st.pages > 1 ? `<nav class="pages" aria-label="Pages">${pageLinks(st.pages, st.page, st.pageHref)}</nav>` : '<div style="height:48px"></div>'}</div>`;
  return page(t, s, {
    path: st.page > 1 && !st.q ? `${st.path}?page=${st.page}` : st.path,
    title: `${title}${st.page > 1 ? ` (page ${st.page})` : ""} | ${s.brand.name}`,
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q,
    current: top,
    q: st.q,
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">All products</a>${trail.map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<section class="pdp"><div class="im">${img(p.image, p.title, "", true)}</div><div>${cat ? `<p class="kicker">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p><p class="sku">Item: ${esc(p.slug)}</p>${action.html}
${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="tabs"><div class="cols"><div><h2>Product details</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</div></section>
${action.enquire ? `<section class="tabs" id="enquire"><div class="two" style="padding-top:0"><div><h2>Ask about this product</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="head"><h2 class="h2">Related products</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: `${p.title} | ${s.brand.name}`, description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null), current: trail[0]?.slug ?? null });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › About</p>
<section class="banner"><div class="t"><p class="kicker">About ${esc(s.brand.name)}</p><h1 class="h1">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im${visual && isLarge(visual) ? " full" : ""}">${img(visual, s.brand.name, visual && isLarge(visual) ? "cover" : "", true)}</div></section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="feat">${s.highlights.map((h) => `<div><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
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
