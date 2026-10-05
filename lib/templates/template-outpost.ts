import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Outpost": Template tier. Original design in the language of big outdoor
// and sporting outfitters: forest green and canvas tan, sturdy condensed
// headings, a header with a call-us strip, large department tiles, an
// "expert advice" strip that links the site's own guides, solid cards with a
// clear price. Fast: no scroll animation.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--forest:#1f3326;--pine:#2c4535;--canvas:#efe7d8;--tan:#d9cbb0;--ink:#1a1d1a;--muted:#5f645d;--line:#d6cdbd;--paper:#fbf8f2;--accent:${accent};--on:${onColor(accent)};--fd:"Oswald",Impact,sans-serif;--fb:"Source Sans 3",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:400 16px/1.55 var(--fb);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding-inline:clamp(14px,3vw,40px)}
.big{font:700 clamp(38px,5.4vw,80px)/.98 var(--fd);text-transform:uppercase;letter-spacing:.005em;margin:0}
.h2{font:700 clamp(26px,2.8vw,40px)/1.05 var(--fd);text-transform:uppercase;margin:0}
.h3{font:600 20px/1.15 var(--fd);text-transform:uppercase;margin:0}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 24px;border-radius:4px;background:var(--accent);color:var(--on);font:600 15px var(--fd);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:filter .15s}
.btn:hover{filter:brightness(.92)}.btn.forest{background:var(--forest);color:var(--canvas)}.btn.out{background:transparent;color:inherit;box-shadow:inset 0 0 0 2px currentColor}.btn.out:hover{filter:none;background:rgba(127,127,127,.12)}.btn.sm{height:38px;padding:0 14px;font-size:13.5px}
/* header */
.strip{background:var(--forest);color:var(--canvas);font:600 13.5px var(--fb)}.strip .w{display:flex;justify-content:space-between;gap:16px;height:36px;align-items:center}.strip a{text-decoration:none}.strip .r{display:flex;gap:20px}
.hd{background:var(--paper);border-bottom:3px solid var(--forest);position:sticky;top:0;z-index:30}
.hd .w{display:flex;align-items:center;gap:22px;height:76px}
.logo{font:700 28px var(--fd);text-transform:uppercase;text-decoration:none;flex:none;color:var(--forest)}.logo img{max-height:48px;width:auto}
.hd form{flex:1;display:flex;max-width:640px;border:2px solid var(--forest);border-radius:4px;overflow:hidden;background:#fff}.hd form input{flex:1;min-width:0;border:0;outline:none;font:inherit;padding:0 14px;height:42px}.hd form button{border:0;background:var(--forest);color:var(--canvas);font:600 14px var(--fd);letter-spacing:.06em;text-transform:uppercase;padding:0 18px;cursor:pointer}
.hd .links{display:flex;gap:18px;margin-left:auto;font:600 15px var(--fd);text-transform:uppercase;letter-spacing:.04em}.hd .links a{text-decoration:none}
.depts{background:var(--canvas);border-bottom:1px solid var(--line)}.depts .w{display:flex;gap:24px;overflow-x:auto;height:48px;align-items:center;scrollbar-width:none}.depts .w::-webkit-scrollbar{display:none}
.depts a{white-space:nowrap;font:600 14.5px var(--fd);letter-spacing:.05em;text-transform:uppercase;text-decoration:none;padding:12px 0;border-bottom:3px solid transparent}.depts a:hover{border-color:var(--accent)}
/* hero */
.hero{position:relative;margin-top:18px;background:var(--forest);color:var(--canvas);display:grid;grid-template-columns:1fr 1fr;min-height:min(520px,70vh);overflow:hidden;border-radius:6px}
.hero .t{padding:clamp(26px,5vw,64px);display:flex;flex-direction:column;justify-content:center}.hero .t p{color:#cfd8cf;margin:16px 0 26px;font-size:17.5px;max-width:520px}.hero .acts{display:flex;gap:10px;flex-wrap:wrap}
.hero .im{position:relative;background:var(--pine)}.hero .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.badge{display:inline-flex;align-self:flex-start;gap:8px;align-items:center;font:600 13px var(--fd);letter-spacing:.12em;text-transform:uppercase;background:var(--canvas);color:var(--forest);padding:6px 12px;border-radius:3px;margin-bottom:16px}
/* sections */
.sec{padding-top:clamp(40px,5vw,72px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px;border-bottom:2px solid var(--forest);padding-bottom:10px}.sec .top a{font:600 14px var(--fd);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;color:var(--forest)}
.tiles{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:14px}
.tile{position:relative;display:block;aspect-ratio:4/5;border-radius:6px;overflow:hidden;background:var(--canvas);text-decoration:none}.tile img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.tile:hover img{transform:scale(1.05)}
.tile .t{position:absolute;left:0;right:0;bottom:0;background:var(--forest);color:var(--canvas);padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px}.tile .t b{font:600 18px/1.1 var(--fd);text-transform:uppercase}.tile .t span{font-size:13px;opacity:.8;white-space:nowrap}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pc{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden}.pc:hover{border-color:var(--forest)}
.pc .ph{display:block;aspect-ratio:1;background:var(--canvas);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover}
.pc .t{padding:14px 16px 16px;display:flex;flex-direction:column;flex:1}.pc .t>a{text-decoration:none}.pc h3{font:600 16px/1.3 var(--fb);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:13.5px;color:var(--muted);margin:3px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin-top:auto;padding-top:10px;font:700 24px var(--fd)}.pc .pr small{font:500 14px var(--fb);color:var(--muted)}.pc .btn{margin-top:10px}
.advice{background:var(--canvas);border-radius:6px;padding:clamp(20px,3vw,36px)}.advice .list{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:12px;margin-top:18px}
.advice a{display:block;background:var(--paper);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:4px;padding:16px 18px;text-decoration:none}.advice a:hover{border-color:var(--forest);border-left-color:var(--accent)}.advice b{display:block;font:600 18px/1.2 var(--fd);text-transform:uppercase}.advice span{display:block;font-size:14px;color:var(--muted);margin-top:6px}
.why{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:14px}.why div{background:var(--forest);color:var(--canvas);border-radius:6px;padding:22px}.why b{display:block;font:600 19px var(--fd);text-transform:uppercase}.why p{margin:6px 0 0;color:#cfd8cf;font-size:14.5px}
.story{display:grid;grid-template-columns:1fr 1fr;background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden}.story .ph{min-height:320px}.story .ph img{width:100%;height:100%;object-fit:cover}.story .t{padding:clamp(24px,4vw,56px)}.story .t div{color:var(--muted);margin:12px 0 22px}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qa>*{min-width:0}.qa details{background:#fff;border:1px solid var(--line);border-radius:6px;padding:0 16px}.qa summary{list-style:none;cursor:pointer;padding:14px 0;font:600 16px/1.4 var(--fb);display:flex;justify-content:space-between;gap:14px}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";font:700 22px/1 var(--fd);color:var(--accent);flex:none}.qa details[open] summary:after{content:"−"}.qa details p{margin:0 0 14px;color:var(--muted)}
.cta{margin-top:clamp(40px,5vw,72px);background:var(--forest);color:var(--canvas);border-radius:6px;padding:clamp(26px,4vw,52px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.cta p{color:#cfd8cf;margin:8px 0 0}
/* listing */
.crumbs{font-size:14px;color:var(--muted);padding-top:16px;margin:0}.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
.lh{padding-block:8px 6px}.lh p{margin:8px 0 0;max-width:760px}
.chips{display:flex;gap:6px;flex-wrap:wrap;padding-block:14px}.chips a{padding:8px 14px;border:2px solid var(--forest);border-radius:4px;font:600 14px var(--fd);letter-spacing:.04em;text-transform:uppercase;text-decoration:none;color:var(--forest)}.chips a:hover,.chips a[aria-current]{background:var(--forest);color:var(--canvas)}.chips span{opacity:.7;margin-left:6px}
.res{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:4px 0 14px}.res form{display:flex;border:2px solid var(--forest);border-radius:4px;overflow:hidden;background:#fff}.res input{border:0;outline:none;font:inherit;padding:0 12px;height:38px;width:260px;min-width:0}.res button{border:0;background:var(--forest);color:var(--canvas);font:600 13px var(--fd);text-transform:uppercase;letter-spacing:.06em;padding:0 14px;cursor:pointer}
.pages{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:32px 0 6px}.pages a,.pages span{min-width:42px;height:42px;display:grid;place-items:center;border:2px solid var(--forest);border-radius:4px;text-decoration:none;font:600 16px var(--fd);padding:0 12px;color:var(--forest)}.pages a:hover{background:var(--canvas)}.pages [aria-current]{background:var(--forest);color:var(--canvas)}.pages .gap{border:0}
/* product */
.pdp{display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(20px,4vw,56px);padding-top:16px;align-items:start}.pdp>*{min-width:0}
.pdp .ph{aspect-ratio:1;background:var(--canvas);border-radius:6px;overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp h1{font:700 clamp(28px,3vw,42px)/1.05 var(--fd);text-transform:uppercase;margin:0}.pdp .d{color:var(--muted);margin:10px 0 0}
.box{background:#fff;border:1px solid var(--line);border-radius:6px;padding:20px;margin-top:18px}.box .pr{font:700 36px var(--fd)}.box .acts{display:grid;gap:8px;margin-top:14px}.box .btn{width:100%;height:52px}
.checks{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:8px;font-size:15px}.checks li:before{content:"✓";color:var(--accent);font-weight:800;margin-right:10px}
.info{margin-top:clamp(28px,4vw,48px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,4vw,56px);border-top:3px solid var(--forest);padding-top:22px}.info>*{min-width:0}.info h2{font:700 24px var(--fd);text-transform:uppercase;margin:0 0 10px}
.info table{width:100%;border-collapse:collapse;font-size:15px}.info th,.info td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}.info tr:nth-child(odd){background:var(--canvas)}.info th{width:42%;font-weight:600}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form label{display:grid;gap:6px;font:600 14px var(--fb)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;padding:12px 14px;border:2px solid var(--line);border-radius:4px;background:#fff}.form input:focus,.form textarea:focus{outline:none;border-color:var(--forest)}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 24px;border:0;border-radius:4px;background:var(--accent);color:var(--on);font:600 15px var(--fd);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(20px,5vw,64px);padding-block:clamp(28px,4vw,48px)}.two>*{min-width:0}
.facts ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}
/* footer */
.ft{background:var(--forest);color:#cfd8cf;margin-top:clamp(40px,5vw,72px);padding-block:46px 22px;font-size:14.5px}
.ft .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:30px}.ft .logo{color:var(--canvas)}.ft h4{color:var(--canvas);font:600 18px var(--fd);text-transform:uppercase;margin:0 0 12px}
.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}.ft a{text-decoration:none}.ft a:hover{color:var(--canvas);text-decoration:underline}
.ft .base{border-top:1px solid #36503f;margin-top:34px;padding-top:16px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:12.5px;color:#9db0a1}
.note{background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd .links{display:none}}
@media(max-width:780px){.hero,.story,.pdp,.two,.info,.qa{grid-template-columns:1fr}.hero .im{min-height:260px;order:-1}.tiles{grid-template-columns:1fr 1fr}.advice .list{grid-template-columns:1fr}.why{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr 1fr;gap:10px}.ft .cols{grid-template-columns:1fr 1fr}.strip .l{display:none}
.hd .w{flex-wrap:wrap;height:auto;padding-block:12px;gap:12px}.hd form{order:3;flex-basis:100%;max-width:none}}
@media(max-width:480px){.form,.why,.ft .cols{grid-template-columns:1fr}.pc .d{display:none}.res input{width:100%}.res form{flex:1}}`;
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
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#1f3326">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Oswald:wght@600;700", "Source+Sans+3:wght@400;500;600;700"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Outpost template · built by Apereel</div>' : ""}
<div class="strip"><div class="w"><span class="l">${esc(s.promise[0] ?? s.brand.tagline)}</span><span class="r">${s.brand.phone ? `<a href="tel:${esc(s.brand.phone)}">Call ${esc(s.brand.phone)}</a>` : ""}${s.brand.email ? `<a href="mailto:${esc(s.brand.email)}">${esc(s.brand.email)}</a>` : `<a href="${href(t, "/contact")}">Contact us</a>`}</span></div></div>
<header class="hd"><div class="w">${logo(s, t)}<form role="search" method="get" action="${t.base}/products"><input name="q" value="${esc(o.q ?? "")}" placeholder="Search by product, size or part number" aria-label="Search products"><button type="submit">Search</button></form><nav class="links" aria-label="Company"><a href="${href(t, "/about")}">About</a>${t.doc.pages.some((p) => p.slug === "guides") ? `<a href="${href(t, "/guides")}">Advice</a>` : ""}<a href="${href(t, "/contact")}">Contact</a></nav></div></header>
${top.length ? `<nav class="depts" aria-label="Departments"><div class="w"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 12).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</div></nav>` : ""}
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About us</a></li>${extraLinks(t)}</ul></div>
<div><h4>Help</h4><ul><li><a href="${href(t, "/contact")}">Contact us</a></li>${contactItems(s.brand)}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}. All rights reserved.</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  const to = href(t, `/products/${p.slug}`);
  const action = productAction(t, p, `${t.origin}/products/${p.slug}`, "btn sm");
  return `<div class="pc"><a class="ph" href="${to}" tabindex="-1" aria-hidden="true">${img(p.image, p.title)}</a><div class="t"><a href="${to}"><h3>${esc(name)}</h3></a>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "<small>Price on request</small>"}</span><a class="btn sm${action.enquire ? " forest" : ""}" href="${action.enquire ? `${to}#enquire` : to}">${action.enquire ? "Get a quote" : "View item"}</a></div></div>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const trust = s.trust.length >= 2 ? s.trust : s.highlights;
  // Expert advice: the site's own guide pages (written from the analysis), else the FAQ's first answers.
  const guides = t.doc.pages.filter((p) => p.slug.startsWith("guides/")).slice(0, 6);
  const storyImg = large.find((u) => u !== cover) ?? pics[2]?.image ?? null;
  return `<div class="w"><section class="hero"><div class="t">${s.hero.eyebrow ? `<span class="badge">${esc(s.hero.eyebrow)}</span>` : ""}<h1 class="big">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p>${esc(s.hero.sub)}</p>` : '<div style="height:22px"></div>'}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn out" href="${href(t, "/contact")}">${t.doc.productAction === "enquire" ? "Get a quote" : "Contact us"}</a></div></div><div class="im">${img(cover ?? s.hero.image ?? pics[0]?.image, s.hero.heading, "", true)}</div></section>
${top.length >= 3 ? `<section class="sec"><div class="top"><h2 class="h2">Shop by department</h2><a href="${href(t, "/products")}">Shop all →</a></div><div class="tiles" style="--n:${Math.min(4, top.length)}">${top.slice(0, 8).map((c) => `<a class="tile" href="${href(t, `/collections/${c.slug}`)}">${img(c.image, c.name)}<div class="t"><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} items</span></div></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="sec"><div class="top"><h2 class="h2">Popular products</h2><a href="${href(t, "/products")}">View all →</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${guides.length ? `<section class="sec"><div class="advice"><h2 class="h2">Expert advice</h2><p class="muted" style="margin:6px 0 0">Guides from our team to help you choose the right product and get the job done.</p><div class="list" style="--n:${Math.min(3, guides.length)}">${guides.map((g) => `<a href="${href(t, `/${g.slug}`)}"><b>${esc(g.title)}</b><span>${esc((g.metaDescription || "").slice(0, 110))}</span></a>`).join("")}</div></div></section>` : ""}
${trust.length >= 2 ? `<section class="sec"><div class="why" style="--n:${Math.min(4, trust.length)}">${trust.slice(0, 4).map((x) => `<div><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.story ? `<section class="sec"><div class="story">${storyImg ? `<div class="ph">${img(storyImg, s.story.heading)}</div>` : ""}<div class="t"${storyImg ? "" : ' style="grid-column:1/-1"'}><h2 class="h2">${esc(s.story.heading)}</h2><div>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn forest" href="${href(t, "/about")}">Our story</a></div></div></section>` : ""}
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
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › <a href="${href(t, "/products")}">Shop</a>${nav.trail.slice(0, -1).map((c) => ` › <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p>
<div class="lh"><h1 class="big" style="font-size:clamp(30px,3.6vw,50px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="muted">${esc(st.cat.description)}</p>` : ""}</div>
${chips.length ? `<nav class="chips" aria-label="Categories">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">‹ ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 40).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:14px"></div>'}
<div class="res"><span class="muted">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "items"}${st.pages > 1 ? ` · page ${st.page} of ${st.pages}` : ""}</span>${st.cat ? `<form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search in ${esc(shortName(st.cat.name).toLowerCase())}" aria-label="Search in this department"><button type="submit">Go</button></form>` : ""}</div>
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
<section class="pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div>${cat ? `<span class="badge" style="background:var(--forest);color:var(--canvas)">${esc(shortName(cat.name))}</span>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}
<div class="box"><div class="pr">${esc(money(p)) || "Price on request"}</div><div class="acts">${action.html}${action.enquire ? "" : `<a class="btn out" href="${href(t, "/contact")}">Ask an expert</a>`}</div>${s.promise.length ? `<ul class="checks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="info"><div><h2>Details</h2>${paras(p.description)}</div>${p.specs?.length ? `<div><h2>Specifications</h2><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>` : ""}</section>
${action.enquire ? `<section class="sec" id="enquire"><div class="two" style="background:var(--canvas);border-radius:6px;padding-inline:clamp(20px,4vw,48px)"><div><h2 class="h2">Get a quote</h2><p class="muted">Part numbers, quantities or fit questions. We reply within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send request", true)}</div></section>` : ""}
${related.length ? `<section class="sec"><div class="top"><h2 class="h2">You might also need</h2></div><div class="grid">${related.map((r) => pc(t, r)).join("")}</div></section>` : ""}</div>`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<div class="w"><section class="hero" style="min-height:min(440px,60vh)"><div class="t"><span class="badge">About ${esc(s.brand.name)}</span><h1 class="big" style="font-size:clamp(32px,4.4vw,60px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="im">${img(visual, s.brand.name, "", true)}</div></section>
${st ? `<section class="two"><h2 class="h2">Our story</h2><div style="font-size:17px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<div class="why" style="--n:${Math.min(4, s.highlights.length)}">${s.highlights.map((h) => `<div><b>${esc(h.title)}</b><p>${esc(h.body)}</p></div>`).join("")}</div>` : ""}</div>`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<div class="w"><p class="crumbs"><a href="${href(t, "/")}">Home</a> › Contact</p><section class="two"><div class="facts"><h1 class="big" style="font-size:clamp(30px,3.6vw,50px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="muted">${esc(s.contact.body)}</p>` : ""}${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : ""}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</section></div>`;
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
