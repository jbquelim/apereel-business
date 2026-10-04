import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, byRank, categoryNav, contactItems, contentPage, esc, extraLinks, filterBar, filteredTitle, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listPath, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Maison": Signature tier. Original design in the language of the great
// jewellers: warm ivory, light wide type in small capitals, hairline rules,
// a two-tier centred header, arch-topped photo frames, generous calm space.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--bg:#faf7f2;--card:#f2ede4;--ink:#1c1a17;--muted:#7a746b;--line:#e4ddd1;--accent:${accent};--on:${onColor(accent)};--f:"Jost",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16.5px/1.65 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1360px;margin:0 auto;padding-inline:clamp(18px,4.5vw,64px)}
.caps{font:500 12px/1.3 var(--f);letter-spacing:.28em;text-transform:uppercase;margin:0}
.display{font:300 clamp(38px,5.4vw,78px)/1.06 var(--f);letter-spacing:.01em;margin:0}
.h2{font:300 clamp(30px,3.4vw,48px)/1.12 var(--f);margin:0}
.h3{font:500 15px/1.35 var(--f);letter-spacing:.14em;text-transform:uppercase;margin:0}
.lead{font-size:clamp(16.5px,1.2vw,19px);color:var(--muted);max-width:600px;font-weight:300}
.link{font:500 12.5px var(--f);letter-spacing:.24em;text-transform:uppercase;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:5px;display:inline-block}
.link:hover{color:var(--accent)}
.btn{display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 34px;background:var(--ink);color:var(--bg);font:500 12.5px var(--f);letter-spacing:.24em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;transition:background .3s}
.btn:hover{background:var(--accent);color:var(--on)}.btn.line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}.btn.line:hover{background:var(--ink);color:var(--bg)}
.rule{height:1px;background:var(--line);border:0;margin:0}
/* header */
.hd{background:var(--bg);position:sticky;top:0;z-index:30;border-bottom:1px solid var(--line)}
.hd .top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:76px}
.logo{font:400 26px var(--f);letter-spacing:.32em;text-transform:uppercase;text-decoration:none;justify-self:center}.logo img{max-height:46px;width:auto}
.hd .l,.hd .r{display:flex;gap:22px;font:500 12px var(--f);letter-spacing:.2em;text-transform:uppercase}.hd .r{justify-self:end}.hd a{text-decoration:none}
.hd nav{display:flex;justify-content:center;gap:clamp(18px,3vw,44px);height:46px;align-items:center;font:500 12px var(--f);letter-spacing:.22em;text-transform:uppercase;white-space:nowrap;overflow-x:auto;scrollbar-width:none}.hd nav::-webkit-scrollbar{display:none}
.hd nav a{padding:14px 0;border-bottom:1px solid transparent}.hd nav a:hover{border-color:var(--ink)}
.hd form{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line)}.hd form input{border:0;background:none;outline:none;font:inherit;font-size:13px;width:140px;padding:4px 0}.hd form button{border:0;background:none;cursor:pointer;font:500 11px var(--f);letter-spacing:.2em;text-transform:uppercase}
/* hero */
.hero{padding-block:clamp(18px,2vw,28px) clamp(50px,6vw,90px);text-align:center}
.hero .media{aspect-ratio:16/7;overflow:hidden;background:var(--card)}.hero .media img,.hero .media video{width:100%;height:100%;object-fit:cover;animation:soft 2.4s ease both}
.hero .arches{display:grid;grid-template-columns:repeat(var(--n,2),minmax(0,360px));justify-content:center;gap:clamp(16px,3vw,48px)}
.arch{border-radius:999px 999px 0 0;overflow:hidden;background:var(--card);aspect-ratio:3/4}.arch img{width:100%;height:100%;object-fit:cover}
.hero .txt{max-width:820px;margin:clamp(30px,4vw,56px) auto 0}.hero .lead{margin:18px auto 30px}
@keyframes soft{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
/* sections */
.sec{padding-block:clamp(56px,7vw,110px)}.head{text-align:center;max-width:760px;margin:0 auto clamp(30px,4vw,56px)}.head .h2{margin-top:14px}
.colls{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:clamp(16px,2.4vw,36px)}
.coll{text-align:center;text-decoration:none}.coll .arch{transition:transform .8s cubic-bezier(.2,.7,.2,1)}.coll:hover .arch{transform:translateY(-6px)}.coll .h3{margin-top:22px}.coll span{display:block;color:var(--muted);font-size:14px;margin-top:6px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,30px) clamp(12px,1.6vw,24px)}
.pc{text-decoration:none;display:block;text-align:center}.pc .ph{aspect-ratio:1;background:var(--card);overflow:hidden}.pc .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.pc:hover .ph img{transform:scale(1.04)}
.pc .h3{margin-top:18px;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pc .d{font-size:14px;color:var(--muted);margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.pc .pr{margin:8px 0 0;font-size:15px}
.quote{text-align:center;max-width:860px;margin:0 auto}.quote .lead{margin:22px auto 32px;max-width:680px}
.wide{aspect-ratio:21/9;overflow:hidden;background:var(--card);margin-top:clamp(40px,5vw,70px)}.wide img{width:100%;height:100%;object-fit:cover}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(24px,4vw,64px);text-align:center}.three p{color:var(--muted);margin:12px 0 0;font-weight:300}
.three .h3:before{content:"";display:block;width:28px;height:1px;background:var(--accent);margin:0 auto 20px}
.faq{max-width:860px;margin:0 auto}.faq details{border-top:1px solid var(--line)}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:400 18px/1.4 var(--f)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font-weight:300;font-size:22px;line-height:1}.faq details[open] summary:after{content:"−"}
.faq details p{margin:0 0 22px;color:var(--muted);font-weight:300}
.closing{text-align:center;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:clamp(56px,7vw,110px)}.closing .lead{margin:18px auto 30px}
/* listing */
.lh{text-align:center;padding-block:clamp(40px,5vw,72px) 10px}.lh .lead{margin:16px auto 0}.crumbs{font:500 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}.crumbs a{text-decoration:none}
.tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 26px;padding-block:22px 26px;font:500 12px var(--f);letter-spacing:.18em;text-transform:uppercase}.tabs a{text-decoration:none;padding:6px 0;border-bottom:1px solid transparent}.tabs a:hover,.tabs a[aria-current]{border-color:var(--ink)}.tabs span{color:var(--muted);margin-left:6px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:18px;margin-bottom:22px}
.bar form{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--ink);min-width:min(320px,100%)}.bar input{flex:1;border:0;background:none;outline:none;font:inherit;padding:8px 0;min-width:0}.bar button{border:0;background:none;cursor:pointer;font:500 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase}
.bar .n{font:500 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.pager{display:flex;gap:18px;justify-content:center;align-items:center;margin-top:56px}.pager span{font:500 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,96px);align-items:center;padding-block:clamp(20px,3vw,40px) clamp(56px,7vw,100px)}
.pdp .ph{aspect-ratio:1;background:var(--card);overflow:hidden}.pdp .ph img{width:100%;height:100%;object-fit:cover}
.pdp .info{text-align:center;max-width:460px;margin:0 auto}.pdp h1{font:300 clamp(28px,2.8vw,42px)/1.15 var(--f);margin:16px 0 0}.pdp .d{color:var(--muted);margin:12px 0 0;font-weight:300}
.pdp .price{font-size:18px;margin:24px 0 30px}.pdp .btn{min-width:260px}
.pdp ul{list-style:none;padding:0;margin:34px 0 0;border-top:1px solid var(--line)}.pdp li{padding:14px 0;border-bottom:1px solid var(--line);font-size:14.5px;color:var(--muted)}
.det{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(28px,5vw,96px);border-top:1px solid var(--line);padding-block:clamp(48px,6vw,90px)}
.det table{width:100%;border-collapse:collapse}.det th,.det td{text-align:left;padding:14px 0;border-bottom:1px solid var(--line);font-weight:300}.det th{font:500 12px var(--f);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);width:42%}
.body p{font-weight:300}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:20px}.form label{display:grid;gap:8px;font:500 11.5px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);background:transparent;border:0;border-bottom:1px solid var(--muted);padding:10px 0;outline:none;letter-spacing:normal;text-transform:none}.form input:focus,.form textarea:focus{border-color:var(--ink)}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 34px;border:0;background:var(--ink);color:var(--bg);font:500 12.5px var(--f);letter-spacing:.24em;text-transform:uppercase;cursor:pointer}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(28px,5vw,96px);padding-block:clamp(48px,6vw,90px)}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
/* footer */
.ft{border-top:1px solid var(--line);padding-block:64px 30px;margin-top:clamp(40px,5vw,80px);text-align:center}
.ft .logo{display:inline-block;margin-bottom:36px}.ft .cols{display:grid;grid-template-columns:repeat(3,minmax(0,240px));justify-content:center;gap:clamp(24px,5vw,80px);text-align:left}
.ft h4{font:500 12px var(--f);letter-spacing:.24em;text-transform:uppercase;margin:0 0 14px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:14.5px;color:var(--muted)}.ft a{text-decoration:none}.ft a:hover{color:var(--ink)}
.ft .base{margin-top:50px;font:500 11px var(--f);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.note{background:var(--ink);color:var(--bg);text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(16px);transition:opacity 1.2s ease,transform 1.2s ease}[data-r].in{opacity:1;transform:none}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}.hd .l{display:none}.hd form{display:none}}
@media(max-width:760px){.colls,.three,.pdp,.det,.two{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr;text-align:center}.hero .media{aspect-ratio:4/5}.hero .arches{grid-template-columns:minmax(0,320px)}.hero .arches .arch+.arch{display:none}.hd .top{grid-template-columns:auto 1fr auto}.hd nav{justify-content:flex-start}}
@media(max-width:520px){.form{grid-template-columns:1fr}.pc .d{display:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*120+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#faf7f2">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Jost:wght@300;400;500"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Maison template · built by Apereel</div>' : ""}
<header class="hd"><div class="w"><div class="top"><div class="l"><a href="${href(t, "/about")}">The house</a></div>${logo(s, t)}<div class="r"><form role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search" aria-label="Search products"><button type="submit">Find</button></form><a href="${href(t, "/contact")}">Contact</a></div></div></div>
<hr class="rule"><nav class="w" aria-label="Collections"><a href="${href(t, "/products")}">All</a>${top.slice(0, 7).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav></header>
<main>${o.body}</main>
<footer class="ft"><div class="w">${logo(s, t)}<div class="cols">
<div><h4>Collections</h4><ul><li><a href="${href(t, "/products")}">All</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>The house</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Write to us</a></li>`}</ul></div></div>
<p class="base">© ${new Date().getFullYear()} ${esc(s.brand.name)} · ${esc(s.brand.tagline)}</p></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><h3 class="h3">${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${money(p) ? `<p class="pr">${esc(money(p))}</p>` : ""}</a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const pics = s.featured.filter((p) => p.image);
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const arches = pics.slice(0, 2);
  const media = s.hero.video
    ? `<div class="media"><video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video></div>`
    : cover
      ? `<div class="media">${img(cover, s.hero.heading, "", true)}</div>`
      : `<div class="arches" style="--n:${Math.max(1, arches.length)}">${(arches.length ? arches : [{ image: s.hero.image, title: s.hero.heading }]).map((p, i) => `<div class="arch">${img(p.image, p.title, "", i === 0)}</div>`).join("")}</div>`;
  const wide = large.find((u) => u !== cover) ?? null;
  const colls = top.slice(0, 3);
  return `<section class="w hero">${media}<div class="txt" data-r>${s.hero.eyebrow ? `<p class="caps">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display" style="margin-top:16px">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : '<div style="height:28px"></div>'}<a class="link" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></section>
${colls.length >= 2 ? `<section class="w sec" style="padding-top:0"><div class="head"><p class="caps">The collections</p></div><div class="colls" style="--n:${colls.length}">${colls.map((c) => `<a class="coll" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="arch">${img(c.image, c.name)}</div><h3 class="h3">${esc(shortName(c.name))}</h3><span>${c.count.toLocaleString("en-US")} pieces</span></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="quote" data-r><p class="caps">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:16px">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="link" href="${href(t, "/about")}">Discover the house</a></div>${wide ? `<div class="wide" data-r>${img(wide, s.story.heading)}</div>` : ""}</section>` : ""}
${s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="head"><p class="caps">Selected pieces</p><h2 class="h2">${esc(s.doc.catalogTotal && s.doc.catalogTotal > 50 ? `From a collection of ${s.doc.catalogTotal.toLocaleString("en-US")}` : "Our selection")}</h2></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div><p style="text-align:center;margin-top:clamp(36px,4vw,56px)"><a class="btn line" href="${href(t, "/products")}">View all</a></p></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="three">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="head"><p class="caps">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div class="faq">${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><p class="caps">${esc(s.brand.name)}</p><h2 class="h2" style="margin-top:16px">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const tabs = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `“${st.q}”` : st.cat ? shortName(st.cat.name) : "All collections";
  const body = `<section class="w lh"><p class="crumbs"><a href="${href(t, "/")}">${esc(s.brand.name)}</a>${nav.trail.slice(0, -1).map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(34px,4.4vw,62px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
${tabs.length ? `<nav class="tabs" aria-label="Collections">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${tabs.slice(0, 24).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</nav>` : '<div style="height:26px"></div>'}</section>
<section class="w"><div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the collections"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "pieces"}</span></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="text-align:center;margin:40px auto">Nothing matches that yet. <a href="${href(t, "/contact")}">Write to us</a>; we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="link" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="link" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</section>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "All products"}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Explore ${st.scopeTotal.toLocaleString("en-US")} pieces from ${s.brand.name}.`,
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
  const body = `<div class="w"><p class="crumbs" style="padding-top:24px;margin:0"><a href="${href(t, "/products")}">All</a>${trail.map((c) => ` · <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p></div>
<section class="w pdp"><div class="ph">${img(p.image, p.title, "", true)}</div><div class="info">${cat ? `<p class="caps">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul>${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="det"><div><p class="caps">Details</p><h2 class="h2" style="margin-top:14px;font-size:clamp(24px,2.4vw,34px)">About this piece</h2></div><div class="body">${paras(p.description)}${p.specs?.length ? `<table style="margin-top:20px">${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two" style="border-top:1px solid var(--line)"><div><p class="caps">Enquire</p><h2 class="h2" style="margin-top:14px">Ask about this piece</h2><p class="lead" style="margin-top:16px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(30px,4vw,60px)"><div class="head"><p class="caps">You may also like</p></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w lh"><p class="caps">The house of ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,66px);margin-top:16px">${esc(st?.heading ?? s.brand.tagline)}</h1></section>
${visual ? `<section class="w"><div class="wide" style="margin-top:30px">${img(visual, s.brand.name, "", true)}</div></section>` : ""}
${st ? `<section class="w sec"><div class="quote body" style="text-align:left;font-size:18px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="three">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="caps">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(34px,4.6vw,66px);margin-top:16px">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two"><div class="facts"><p class="caps">Write to us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
