import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, contentPage, extraLinks, filterBar, filteredTitle, listPath, byRank, categoryNav, contactItems, esc, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listState, metaTitle, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Apex": Signature tier. Original design in the language of performance
// supercar houses: near-black throughout, condensed uppercase type, angular
// cut corners, a thin accent line, numbered sections, photos framed in
// bright tiles so mixed product photography reads as a set on dark.

const PER_PAGE = 24;
const CUT = "polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px))";

function css(accent: string) {
  return `
:root{--bg:#0b0b0c;--panel:#151517;--panel2:#1d1d20;--ink:#f2f2f0;--muted:#9a9a9f;--line:#2a2a2e;--accent:${accent};--on:${onColor(accent)};--fd:"Barlow Condensed",system-ui,sans-serif;--fb:"Barlow",system-ui,sans-serif;--cut:${CUT}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.55 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1480px;margin:0 auto;padding-inline:clamp(18px,4.5vw,72px)}
.tag{display:flex;align-items:center;gap:14px;font:600 13px/1 var(--fd);letter-spacing:.32em;text-transform:uppercase;color:var(--muted);margin:0 0 22px}.tag:before{content:"";width:34px;height:2px;background:var(--accent)}
.display{font:700 clamp(46px,8vw,128px)/.88 var(--fd);letter-spacing:.01em;text-transform:uppercase;margin:0}
.h2{font:700 clamp(36px,5vw,76px)/.92 var(--fd);text-transform:uppercase;margin:0}
.h3{font:700 clamp(22px,1.9vw,30px)/1 var(--fd);text-transform:uppercase;letter-spacing:.02em;margin:0}
.lead{font-size:clamp(17px,1.3vw,20px);color:var(--muted);max-width:620px;font-weight:300}
.btn{display:inline-flex;align-items:center;gap:14px;height:54px;padding:0 30px;background:var(--accent);color:var(--on);font:700 15px var(--fd);letter-spacing:.2em;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));transition:filter .25s,transform .25s}
.btn:hover{filter:brightness(1.12);transform:translateY(-2px)}.btn.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink);clip-path:none}.btn.ghost:hover{background:rgba(255,255,255,.06)}

/* header */
.hd{position:fixed;top:0;left:0;right:0;z-index:30;transition:background .35s,backdrop-filter .35s}.hd.scrolled{background:rgba(11,11,12,.86);backdrop-filter:blur(14px)}
.hd .w{display:flex;align-items:center;gap:28px;height:80px}
.logo{font:700 26px var(--fd);letter-spacing:.14em;text-transform:uppercase;text-decoration:none}.logo img{max-height:42px;width:auto}
.hd nav{display:flex;gap:30px;margin-left:auto;font:600 14px var(--fd);letter-spacing:.2em;text-transform:uppercase}.hd nav a{text-decoration:none;opacity:.8}.hd nav a:hover{opacity:1;color:var(--accent)}
.burger{display:none;margin-left:auto;font:600 14px var(--fd);letter-spacing:.2em;text-transform:uppercase;cursor:pointer}#nav{display:none}
.drawer{position:fixed;inset:0;z-index:40;background:var(--bg);display:none;padding:28px clamp(18px,4.5vw,72px);overflow:auto}#nav:checked~.drawer{display:block}
.drawer .x{font:600 14px var(--fd);letter-spacing:.2em;text-transform:uppercase;cursor:pointer}.drawer a{display:block;font:700 clamp(34px,8vw,60px)/1.15 var(--fd);text-transform:uppercase;text-decoration:none;padding:6px 0}.drawer a:hover{color:var(--accent)}
/* hero */
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;padding-block:120px clamp(48px,9vh,110px)}
.hero .bg{position:absolute;inset:0}.hero .bg img,.hero .bg video{width:100%;height:100%;object-fit:cover;animation:push 20s ease-out both}
.hero .bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,12,.55),rgba(11,11,12,.1) 35%,rgba(11,11,12,.92))}
.hero .txt{position:relative;z-index:1;width:100%}.hero .lead{margin:24px 0 34px}.hero .acts{display:flex;gap:14px;flex-wrap:wrap}
.hero.plain{align-items:center}.hero.plain .grid{position:relative;z-index:1;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,4vw,72px);align-items:center;width:100%}
.frame{position:relative;background:#ececea;clip-path:var(--cut);aspect-ratio:1;overflow:hidden}.frame img{width:100%;height:100%;object-fit:cover}
.hero.plain .frame{animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}
.hero .scroll{position:absolute;right:clamp(18px,4.5vw,72px);bottom:40px;z-index:1;font:600 12px var(--fd);letter-spacing:.3em;text-transform:uppercase;color:var(--muted);writing-mode:vertical-rl}
@keyframes push{from{transform:scale(1.08)}to{transform:scale(1)}}@keyframes rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
/* sections */
.sec{padding-block:clamp(70px,9vw,140px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:clamp(30px,4vw,56px)}
.more{font:700 14px var(--fd);letter-spacing:.2em;text-transform:uppercase;text-decoration:none;white-space:nowrap;border-bottom:2px solid var(--accent);padding-bottom:4px}
.lines{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.line{position:relative;display:block;background:var(--panel);text-decoration:none;overflow:hidden;transition:background .3s}.line:hover{background:var(--panel2)}
.line .frame{clip-path:none;aspect-ratio:4/3}.line .frame img{transition:transform 1.1s cubic-bezier(.2,.7,.2,1)}.line:hover .frame img{transform:scale(1.05)}
.line .t{padding:26px 28px 30px;display:flex;justify-content:space-between;align-items:end;gap:16px}.line .n{font:600 13px var(--fd);letter-spacing:.24em;color:var(--accent)}
.line .t span{color:var(--muted);font-size:14px;white-space:nowrap}
.feature{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,90px);align-items:center}.feature .lead{margin:22px 0 32px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
.pc{display:flex;flex-direction:column;background:var(--panel);text-decoration:none;transition:background .3s}.pc:hover{background:var(--panel2)}
.pc .frame{clip-path:none}.pc .t{padding:20px 22px 24px;display:flex;flex-direction:column;gap:6px;flex:1}
.pc h3{font:700 19px/1.1 var(--fd);text-transform:uppercase;letter-spacing:.02em;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .d{font-size:14px;color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc .pr{margin-top:auto;padding-top:10px;font:700 18px var(--fd);letter-spacing:.06em;color:var(--accent)}
.nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.nums div{padding:clamp(28px,4vw,52px) 0;border-right:1px solid var(--line);padding-inline:24px}.nums div:last-child{border-right:0}
.nums b{display:block;font:700 clamp(48px,6vw,96px)/.9 var(--fd)}.nums span{font:600 13px var(--fd);letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(24px,3vw,48px)}.pillars div{border-top:2px solid var(--accent);padding-top:26px}.pillars p{color:var(--muted);margin:12px 0 0}
.faq{display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(30px,6vw,110px)}
.faq details{border-bottom:1px solid var(--line)}.faq summary{list-style:none;cursor:pointer;padding:24px 0;display:flex;justify-content:space-between;gap:20px;font:600 22px/1.15 var(--fd);text-transform:uppercase;letter-spacing:.02em}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";color:var(--accent);font-size:28px;line-height:.8;transition:transform .3s}.faq details[open] summary:after{transform:rotate(45deg)}.faq details p{color:var(--muted);margin:0 0 24px;max-width:700px}
.closing{position:relative;background:var(--panel);clip-path:var(--cut);padding:clamp(56px,8vw,120px) clamp(24px,6vw,100px);overflow:hidden}
.closing:before{content:"";position:absolute;right:-8%;top:-30%;width:46%;aspect-ratio:1;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 45%,transparent),transparent 65%);filter:blur(10px)}
.closing>*{position:relative}.closing .lead{margin:20px 0 34px}
/* listing */
.lh{padding-block:150px 30px}.crumbs{font:600 13px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:0 0 20px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
.lh .lead{margin:20px 0 0}
.bar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:18px;margin:34px 0 2px}
.bar form{display:flex;flex:1;max-width:520px;border-bottom:1px solid var(--muted)}.bar input{flex:1;min-width:0;background:none;border:0;outline:none;color:var(--ink);font:inherit;padding:10px 0}
.bar button{background:none;border:0;color:var(--accent);font:700 14px var(--fd);letter-spacing:.2em;text-transform:uppercase;cursor:pointer}.bar .n{font:600 13px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.chips{display:flex;gap:2px;flex-wrap:wrap;margin:2px 0}.chips a{background:var(--panel);padding:14px 18px;text-decoration:none;font:600 14px var(--fd);letter-spacing:.14em;text-transform:uppercase}.chips a:hover,.chips a[aria-current]{background:var(--accent);color:var(--on)}.chips a span{opacity:.6;margin-left:8px}
.pager{display:flex;gap:14px;justify-content:center;align-items:center;margin:54px 0 0}.pager span{font:600 13px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
/* product */
.pdp{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,90px);align-items:start;padding-block:130px clamp(60px,8vw,110px)}
.pdp .info{position:sticky;top:110px}.pdp h1{font:700 clamp(38px,4.4vw,70px)/.92 var(--fd);text-transform:uppercase;margin:0}
.pdp .d{color:var(--muted);margin:16px 0 0;font-size:18px;font-weight:300}.pdp .price{font:700 34px var(--fd);letter-spacing:.04em;color:var(--accent);margin:26px 0}
.promise{list-style:none;padding:0;margin:30px 0 0;border-top:1px solid var(--line)}.promise li{padding:14px 0;border-bottom:1px solid var(--line);font:600 15px var(--fd);letter-spacing:.14em;text-transform:uppercase;display:flex;gap:14px}.promise li:before{content:"";width:8px;height:8px;background:var(--accent);flex:none;margin-top:5px;transform:rotate(45deg)}
.spec{display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(30px,6vw,110px);border-top:1px solid var(--line);padding-block:clamp(56px,7vw,100px)}
.spec table{width:100%;border-collapse:collapse}.spec th,.spec td{text-align:left;padding:16px 0;border-bottom:1px solid var(--line)}.spec th{font:600 13px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);width:42%}
.body p{color:#c9c9cc}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label{display:grid;gap:8px;font:600 12px var(--fd);letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);background:transparent;border:0;border-bottom:1px solid var(--muted);padding:12px 0;outline:none}.form input:focus,.form textarea:focus{border-color:var(--accent)}
.form button{grid-column:1/-1;justify-self:start;height:54px;padding:0 30px;border:0;background:var(--accent);color:var(--on);font:700 15px var(--fd);letter-spacing:.2em;text-transform:uppercase;cursor:pointer;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))}
.two{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(30px,6vw,110px);padding-block:clamp(56px,7vw,100px);border-top:1px solid var(--line)}
.facts ul{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:12px;font-size:18px}.facts a{text-decoration:none;border-bottom:1px solid var(--accent)}
/* footer */
.ft{border-top:1px solid var(--line);padding-block:70px 30px;margin-top:clamp(40px,6vw,90px)}
.ft .cols{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:40px}.ft p{color:var(--muted);max-width:320px;margin:16px 0 0}
.ft h4{font:600 13px var(--fd);letter-spacing:.26em;text-transform:uppercase;color:var(--muted);margin:0 0 16px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}.ft a{text-decoration:none}.ft a:hover{color:var(--accent)}
.ft .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:56px;padding-top:24px;border-top:1px solid var(--line);font:600 12px var(--fd);letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.note{position:relative;z-index:50;background:var(--accent);color:var(--on);text-align:center;font:13px system-ui;padding:8px}
.note~.hd{top:33px}
[data-r]{opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.2,.7,.2,1),transform 1s cubic-bezier(.2,.7,.2,1)}[data-r].in{opacity:1;transform:none}
@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.hd nav{display:none}.burger{display:block}}
@media(max-width:860px){.lines,.pillars{grid-template-columns:1fr}.feature,.faq,.pdp,.spec,.two,.hero.plain .grid{grid-template-columns:1fr}.pdp .info{position:static}.grid{grid-template-columns:1fr 1fr}.ft .cols{grid-template-columns:1fr 1fr}.hero .scroll{display:none}.nums div{border-right:0;border-bottom:1px solid var(--line)}}
@media(max-width:560px){.form,.ft .cols{grid-template-columns:1fr}.pc .t{padding:14px}.pc .d{display:none}.line .t{padding:20px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var h=document.querySelector(".hd");function f(){h&&h.classList.toggle("scrolled",scrollY>30)}f();addEventListener("scroll",f,{passive:true});var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*90+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#0b0b0c">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Barlow+Condensed:wght@600;700", "Barlow:wght@300;400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Apex template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Range</a>${top.slice(0, 3).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></nav><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer" role="dialog" aria-label="Menu"><label class="x" for="nav">Close ✕</label><div style="margin-top:40px"><a href="${href(t, "/products")}">All products</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Range</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function pc(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="pc"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="frame">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<span class="pr">${esc(money(p)) || "On request"}</span></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const cover = s.hero.video ?? large[0] ?? null;
  const top = s.categories.filter((c) => !c.parent && c.count > 0 && c.image).sort(byRank);
  const lead = s.featured.find((p) => p.image);
  const hero = cover
    ? `<section class="hero"><div class="bg">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(cover, s.hero.heading, "", true)}</div><div class="w txt" data-r>${s.hero.eyebrow ? `<p class="tag">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : ""}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div><span class="scroll">Scroll</span></section>`
    : `<section class="hero plain"><div class="w grid"><div data-r>${s.hero.eyebrow ? `<p class="tag">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead">${esc(s.hero.sub)}</p>` : ""}<div class="acts"><a class="btn" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Contact</a></div></div>${lead || s.hero.image ? `<div class="frame">${img(s.hero.image ?? lead?.image, s.hero.heading, "", true)}</div>` : ""}</div></section>`;
  const featureImg = large.find((u) => u !== cover) ?? null;
  const lines = top.slice(0, 6);
  return `${hero}
${s.stats.length ? `<section class="w" style="padding-top:clamp(40px,5vw,70px)"><div class="nums">${s.stats.slice(0, 4).map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></section>` : ""}
${lines.length >= 3 ? `<section class="w sec"><div class="top"><div><p class="tag">The range</p><h2 class="h2" data-r>Choose your line</h2></div><a class="more" href="${href(t, "/products")}">All products</a></div><div class="lines">${lines.map((c, i) => `<a class="line" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="frame">${img(c.image, c.name)}</div><div class="t"><div><p class="n">${String(i + 1).padStart(2, "0")}</p><h3 class="h3">${esc(shortName(c.name))}</h3></div><span>${c.count.toLocaleString("en-US")} products</span></div></a>`).join("")}</div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="feature"><div data-r><p class="tag">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ghost" href="${href(t, "/about")}">Our story</a></div>${featureImg || s.story.image || s.featured[1]?.image ? `<div class="frame" data-r style="aspect-ratio:5/4">${img(featureImg ?? s.story.image ?? s.featured[1]?.image, s.story.heading)}</div>` : ""}</div></section>` : ""}
${s.featured.length ? `<section class="w sec" style="padding-top:0"><div class="top"><div><p class="tag">Selected</p><h2 class="h2" data-r>Featured</h2></div><a class="more" href="${href(t, "/products")}">View all</a></div><div class="grid">${s.featured.slice(0, 8).map((p) => pc(t, p)).join("")}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><p class="tag">Why ${esc(s.brand.name)}</p><div class="pillars">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><div><p class="tag">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><p class="tag">${esc(s.brand.name)}</p><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}<a class="btn" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></div></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const kids = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort(byRank);
  const chips = kids.length ? kids : st.cat ? nav.chips : [];
  const title = st.q ? `Results: ${st.q}` : st.cat ? shortName(st.cat.name) : "The range";
  const body = `<section class="w lh"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Range</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(44px,6.4vw,104px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
<div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "the range"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "results" : "products"}</span></div>
${chips.length ? `<div class="chips">${!kids.length && st.cat ? `<a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>` : ""}${chips.slice(0, 30).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a>`).join("")}</div>` : ""}</section>
<section class="w">${filterBar(t, st)}<div class="grid">${st.shown.map((p) => pc(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:40px 0">Nothing matches that. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn ghost" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} / ${st.pages}</span>${st.page < st.pages ? `<a class="btn" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</section>`;
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
  const body = `<section class="w pdp"><div class="frame">${img(p.image, p.title, "", true)}</div><div class="info"><p class="crumbs"><a href="${href(t, "/products")}">Range</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}${s.promise.length ? `<ul class="promise">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></section>
<section class="w"><div class="spec"><div><p class="tag">Details</p><h2 class="h3">About this ${cat ? esc(shortName(cat.name).toLowerCase()) : "product"}</h2></div><div class="body">${paras(p.description)}${p.specs?.length ? `<table style="margin-top:24px">${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="two"><div><p class="tag">Enquire</p><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:18px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec" style="padding-top:clamp(40px,5vw,70px)"><div class="top"><h2 class="h2">Also in the range</h2></div><div class="grid">${related.map((r) => pc(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w lh"><p class="tag">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(44px,6.4vw,104px)">${esc(st?.heading ?? s.brand.tagline)}</h1></section>
${visual ? `<section class="w"><div class="frame" style="aspect-ratio:16/7">${img(visual, s.brand.name, "", true)}</div></section>` : ""}
${st ? `<section class="w"><div class="two" style="border-top:0"><p class="tag">Our story</p><div class="body" style="font-size:19px">${paras(st.body)}</div></div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="pillars">${s.highlights.map((h) => `<div data-r><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w lh"><p class="tag">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(44px,6.4vw,104px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="two"><div class="facts"><p class="tag">Reach us</p>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
  if (cp) return html(page(t, s, { path: joined, title: cp.metaTitle || metaTitle(cp.title, s.brand.name), description: cp.metaDescription, body: `<section class="w" style="padding-top:90px">${articleBody(t, cp)}</section>` }));
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
