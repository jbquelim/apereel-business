import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { categoryNav, shortName, esc, fontsLink, href, jsonLdTags, leadForm, listState, money, paras, productAction, productJsonLd, slots, splitTitle, type Slots } from "./kit";

// "Crown": Signature tier. Original design in the language of the great
// luxury houses: products on a soft spotlit stage, very large bold type,
// calm white space, a dark band of tall collection cards, tile catalogs.
// Photos with white or grey backgrounds blend into the stage, so mixed
// product photography reads as one set.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#1d1d1f;--muted:#6e6e73;--tile:#f4f4f4;--line:#e6e6e6;--dark:#121212;--accent:${accent};--fd:"Inter Tight",system-ui,sans-serif;--fb:"Inter",system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 17px/1.55 var(--fb);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1440px;margin:0 auto;padding:0 clamp(20px,5vw,80px)}
.over{font:500 12px/1.2 var(--fb);letter-spacing:.22em;text-transform:uppercase;margin:0 0 14px}
.display{font:700 clamp(40px,6.6vw,92px)/.96 var(--fd);letter-spacing:-.025em;margin:0}
.h2{font:700 clamp(32px,4.4vw,64px)/1 var(--fd);letter-spacing:-.02em;margin:0}
.h3{font:700 clamp(22px,2vw,30px)/1.1 var(--fd);letter-spacing:-.01em;margin:0}
.lead{font-size:clamp(17px,1.4vw,21px);color:var(--muted);max-width:640px}
.pill{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 22px;border-radius:999px;background:rgba(0,0,0,.07);color:var(--ink);font:600 14px var(--fb);text-decoration:none;border:0;cursor:pointer;transition:background .25s}
.pill:hover{background:rgba(0,0,0,.13)}.pill.dark{background:var(--ink);color:#fff}.pill.dark:hover{background:#000}.pill.light{background:rgba(255,255,255,.18);color:#fff;backdrop-filter:blur(8px)}
/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:saturate(1.6) blur(14px);transition:box-shadow .3s}
.hd.scrolled{box-shadow:0 1px 0 var(--line)}
.hd .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:76px}
.hd .logo{justify-self:center;font:700 22px var(--fd);letter-spacing:-.01em;text-decoration:none}.hd .logo img{max-height:44px;width:auto}
.hd nav{display:flex;gap:28px;justify-self:end;font-size:15px}.hd nav a{text-decoration:none}
.menu{display:flex;align-items:center;gap:10px;font:500 15px var(--fb);cursor:pointer;background:none;border:0;padding:0;color:inherit}
.menu i{display:block;width:18px;height:1.5px;background:currentColor;box-shadow:0 5px 0 currentColor;transform:translateY(-2.5px)}
#nav{display:none}#nav:checked~.ov{opacity:1;visibility:visible}
.ov{position:fixed;inset:0;z-index:40;background:#fff;opacity:0;visibility:hidden;transition:opacity .35s;overflow:auto}
.ov .w{padding-top:26px}.ov .x{font:500 15px var(--fb);cursor:pointer}
.ov ul{list-style:none;padding:0;margin:56px 0;display:grid;gap:6px}.ov li a{font:700 clamp(30px,4vw,52px)/1.15 var(--fd);letter-spacing:-.02em;text-decoration:none}.ov li a:hover{color:var(--accent)}
.ov .sub{color:var(--muted);font-size:15px;margin-top:40px}
/* stage: the soft spotlit backdrop products sit on */
.stage{background:radial-gradient(120% 90% at 50% 38%,#fff 0%,#f3f3f4 55%,#e7e8ea 100%)}
.stage img.p,.tile img,.card img.p{mix-blend-mode:multiply}
/* hero */
.hero{position:relative;min-height:calc(100svh - 76px);display:grid;place-items:end center;text-align:center;overflow:hidden;padding-bottom:clamp(48px,8vh,96px)}
.hero .media{position:absolute;inset:0;display:grid;place-items:center}
.hero .media img.p{max-height:62%;max-width:70%;object-fit:contain;animation:rise 1.6s cubic-bezier(.2,.7,.2,1) both}
.hero .media.cover img,.hero .media video{width:100%;height:100%;object-fit:cover;animation:settle 18s ease-out both}
.hero .media.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.55))}
.hero .txt{position:relative;z-index:1;max-width:980px;padding:0 20px}
.hero.on-dark{color:#fff}.hero .sub{margin:18px auto 26px;color:inherit;opacity:.75;max-width:620px}
@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
@keyframes settle{from{transform:scale(1.07)}to{transform:scale(1)}}
/* dark collection band */
.band{background:var(--dark);color:#fff;padding:clamp(56px,8vw,120px) 0}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.card{position:relative;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;text-decoration:none;color:var(--ink)}
.card{background:#f4f4f4}
.card .ph{position:relative;aspect-ratio:1;overflow:hidden;background:#fff}
.card .ph img{width:100%;height:100%;object-fit:cover;mix-blend-mode:normal;transition:transform 1s cubic-bezier(.2,.7,.2,1)}
.card:hover .ph img{transform:scale(1.04)}
.card .cap{padding:26px 26px 30px;text-align:center;flex:1;display:grid;align-content:center}
.card .cap .h3{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .cap .over{color:var(--muted)}
.band .more{text-align:center;margin-top:40px}
/* statement */
.statement{padding:clamp(80px,11vw,170px) 0 clamp(48px,6vw,90px);text-align:center}
.statement .lead{margin:22px auto 30px}
.wide{border-radius:16px;overflow:hidden;aspect-ratio:16/8;display:grid;place-items:center}
.wide img.cover{width:100%;height:100%;object-fit:cover}.wide img.p{max-height:78%;object-fit:contain}
/* tiles */
.coll{padding:clamp(70px,9vw,140px) 0}.coll .head{text-align:center;margin-bottom:46px}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.tile{position:relative;display:grid;grid-template-columns:1fr 44%;align-items:center;gap:16px;min-height:380px;padding:36px;background:var(--tile);text-decoration:none;transition:background .3s}
.tile:hover{background:#ededee}
.tile h3{font:700 clamp(20px,1.6vw,26px)/1.15 var(--fd);margin:0}
.tile .d{color:#555;font-size:16px;line-height:1.45;margin:10px 0 0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.tile .pr{margin-top:16px;font-size:16px}
.tile .im{display:grid;place-items:center}
.tile .im img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;background:#fff;mix-blend-mode:normal;box-shadow:0 1px 0 rgba(0,0,0,.04)}
.tile.ed{grid-template-columns:1fr;padding:0;overflow:hidden;color:#fff}
.tile.ed img{position:absolute;inset:0;width:100%;height:100%;max-height:none;object-fit:cover;mix-blend-mode:normal}
.tile.ed .t{position:relative;align-self:end;padding:36px;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent)}
.coll .more{text-align:center;margin-top:44px}
/* highlights, stats */
.hl{border-top:1px solid var(--line);padding:clamp(70px,9vw,130px) 0}
.hl .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(28px,4vw,64px);margin-top:46px}
.hl .n{font:600 13px var(--fb);color:var(--accent);letter-spacing:.12em}.hl h3{margin:12px 0 10px}.hl p{color:var(--muted);margin:0}
.stats{display:flex;gap:clamp(30px,6vw,96px);justify-content:center;flex-wrap:wrap;padding:0 0 clamp(60px,8vw,110px);text-align:center}
.stats b{display:block;font:700 clamp(40px,5vw,72px)/1 var(--fd);letter-spacing:-.03em}.stats span{color:var(--muted);font-size:15px}
/* faq */
.faq{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(30px,6vw,110px);padding:clamp(70px,9vw,130px) 0;border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line);padding:22px 0}.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;font:600 19px/1.35 var(--fb)}
.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";font:300 26px/1 var(--fb);color:var(--muted);transition:transform .3s}
.faq details[open] summary:after{transform:rotate(45deg)}.faq details p{color:var(--muted);margin:14px 0 0;max-width:680px}
/* closing */
.closing{text-align:center;padding:clamp(90px,12vw,180px) 20px}.closing .lead{margin:20px auto 30px}
/* listing */
.lh{text-align:center;padding:clamp(56px,8vw,110px) 0 34px}.lh .lead{margin:18px auto 0}
.search{display:flex;max-width:520px;margin:30px auto 0;background:var(--tile);border-radius:999px;padding:6px 6px 6px 22px}
.search input{flex:1;border:0;background:none;font:inherit;outline:none;min-width:0}
.chips{display:flex;gap:8px;overflow-x:auto;justify-content:center;flex-wrap:wrap;padding:24px 0 34px}
.chips a{white-space:nowrap;padding:9px 16px;border-radius:999px;background:var(--tile);text-decoration:none;font-size:14px}.chips a[aria-current]{background:var(--ink);color:#fff}
.count{text-align:center;color:var(--muted);font-size:14px;margin:-14px 0 22px}
.cgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:6px 0 26px}
.cg{display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:var(--tile);text-decoration:none}
.cg .ph{aspect-ratio:4/3;background:#fff;overflow:hidden}.cg .ph img{width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.cg:hover .ph img{transform:scale(1.04)}
.cg .t{padding:16px 18px 18px;display:flex;justify-content:space-between;gap:12px;align-items:baseline}.cg b{font:700 17px/1.2 var(--fd)}.cg span{color:var(--muted);font-size:13px;white-space:nowrap}
.index{margin:0 0 46px;border-top:1px solid var(--line)}.index summary{cursor:pointer;list-style:none;padding:18px 0;font:600 15px var(--fb);text-align:center}.index summary::-webkit-details-marker{display:none}
.index ul{list-style:none;padding:0 0 24px;margin:0;columns:4 200px;column-gap:32px}.index li{break-inside:avoid;padding:5px 0;font-size:14.5px}.index a{text-decoration:none}.index a:hover{color:var(--accent)}.index span{color:var(--muted);font-size:12.5px;margin-left:6px}
@media(max-width:1000px){.cgrid{grid-template-columns:repeat(3,1fr)}}@media(max-width:640px){.cgrid{grid-template-columns:1fr 1fr}}
.pager{display:flex;gap:14px;align-items:center;justify-content:center;margin:46px 0 90px}
/* product */
.pdp{display:grid;grid-template-columns:minmax(260px,1fr) 1.5fr minmax(0,.6fr);align-items:center;min-height:min(84svh,920px);gap:24px}
.pdp .info .over{color:var(--accent)}.pdp h1{font:700 clamp(30px,3.2vw,46px)/1.05 var(--fd);letter-spacing:-.02em;margin:0}
.pdp .d{font-size:clamp(17px,1.3vw,20px);color:#444;font-weight:300;margin:14px 0 0;line-height:1.4}
.pdp .price{font-size:20px;margin:18px 0 26px}
.pdp .img{display:grid;place-items:center;height:100%}.pdp .img img{max-height:72vh;width:auto;max-width:100%;object-fit:contain;animation:rise 1.2s cubic-bezier(.2,.7,.2,1) both}
.promise{list-style:none;padding:0;margin:28px 0 0;display:grid;gap:8px;font-size:15px;color:#444}
.promise li:before{content:"";display:inline-block;width:10px;height:5px;border-left:2px solid var(--accent);border-bottom:2px solid var(--accent);transform:rotate(-45deg) translateY(-3px);margin-right:12px}
.crumbs{font-size:14px;color:var(--muted);padding-top:24px}.crumbs a{text-decoration:none}
.specs{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(30px,6vw,110px);padding:clamp(60px,8vw,110px) 0;border-top:1px solid var(--line)}
.specs table{width:100%;border-collapse:collapse}.specs th,.specs td{text-align:left;padding:16px 0;border-bottom:1px solid var(--line);vertical-align:top}.specs th{color:var(--muted);font-weight:400;width:42%}
.about-p{color:var(--muted);max-width:680px}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-content:start}.form label{display:grid;gap:6px;font-size:14px;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:#fff}
.form button{grid-column:1/-1;justify-self:start;height:48px;padding:0 28px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:600 15px var(--fb);cursor:pointer}
.contact{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(30px,6vw,110px);padding:clamp(60px,8vw,110px) 0}
.facts p{margin:0 0 6px}.facts a{text-decoration:none;border-bottom:1px solid var(--line)}
/* footer */
.ft{background:var(--tile);padding:70px 0 34px;margin-top:0}.ft .logo{display:block;text-align:center;font:700 24px var(--fd);text-decoration:none;margin-bottom:48px}.ft .logo img{max-height:52px;margin:0 auto}
.ft .cols{display:grid;grid-template-columns:repeat(3,minmax(0,220px));justify-content:center;gap:clamp(30px,6vw,90px)}
.ft h4{font:700 17px var(--fd);margin:0 0 12px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:7px;font-size:14.5px}.ft a{text-decoration:none;color:#444}
.ft .base{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-top:1px solid #ddd;margin-top:56px;padding-top:22px;font-size:13px;color:var(--muted)}
.note{background:#111;color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(26px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}[data-r].in{opacity:1;transform:none}
@media(max-width:1000px){.cards,.tiles,.hl .grid{grid-template-columns:1fr 1fr}.pdp{grid-template-columns:1fr;padding:30px 0}.pdp .img{order:-1}.pdp .img img{max-height:52vh}.faq,.specs,.contact{grid-template-columns:1fr}.hd nav a.t{display:none}}
@media(max-width:640px){.cards,.tiles,.hl .grid,.ft .cols{grid-template-columns:1fr}.tile{min-height:300px}.form{grid-template-columns:1fr}.hd nav{gap:16px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var h=document.querySelector(".hd");addEventListener("scroll",function(){h&&h.classList.toggle("scrolled",scrollY>8)},{passive:true});var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%3)*90+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

/** Platform thumbnails are small; rendered visuals and video are large enough to fill the screen. */
const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function img(src: string | null, alt: string, cls = "p", eager = false) {
  return src ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} onerror="this.remove()">` : "";
}

function logo(s: Slots, t: RenderTarget, cls: string) {
  return `<a class="${cls}" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const topCats = s.categories.filter((c) => !c.parent).sort((a, b) => b.count - a.count).slice(0, 6);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["Inter+Tight:wght@600;700", "Inter:wght@300;400;500;600"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Crown template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w"><label class="menu" for="nav"><i></i>Menu</label>${logo(s, t, "logo")}<nav aria-label="Main"><a class="t" href="${href(t, "/products")}">Collection</a><a href="${href(t, "/contact")}">Contact</a></nav></div></header>
<div class="ov" role="dialog" aria-label="Menu"><div class="w"><label class="x" for="nav">Close ✕</label><ul>
<li><a href="${href(t, "/products")}">All products</a></li>${topCats.map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(c.name)}</a></li>`).join("")}
<li><a href="${href(t, "/about")}">About</a></li><li><a href="${href(t, "/contact")}">Contact</a></li></ul>
<p class="sub">${esc(s.brand.tagline)}</p></div></div>
<main>${o.body}</main>
<footer class="ft"><div class="w">${logo(s, t, "logo")}<div class="cols">
<div><h4>Collection</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${topCats.map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(c.name)}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li><li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul>${[s.brand.email && `<li><a href="mailto:${esc(s.brand.email)}">${esc(s.brand.email)}</a></li>`, s.brand.phone && `<li><a href="tel:${esc(s.brand.phone)}">${esc(s.brand.phone)}</a></li>`, s.brand.address && `<li>${esc(s.brand.address)}</li>`].filter(Boolean).join("") || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div>
</div><div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function tile(t: RenderTarget, p: SiteProduct) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="tile" data-r href="${href(t, `/products/${p.slug}`)}"><div><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${p.price != null ? `<p class="pr">${esc(money(p))}</p>` : ""}</div><div class="im">${img(p.image, p.title)}</div></a>`;
}

function editorialTile(t: RenderTarget, src: string, title: string, label: string, to: string) {
  return `<a class="tile ed" data-r href="${href(t, to)}"><img src="${esc(src)}" alt="${esc(title)}" loading="lazy" onerror="this.remove()"><div class="t"><p class="over">${esc(label)}</p><h3>${esc(title)}</h3></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const heroVisual = s.hero.video ?? large[0] ?? null;
  // Each editorial moment gets its own image: hero, then the wide story image, then a tile.
  const nextLarge = large.filter((u) => u !== heroVisual);
  const hero = heroVisual
    ? `<section class="hero on-dark"><div class="media cover">${s.hero.video ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>` : img(heroVisual, s.hero.heading, "cover", true)}</div>`
    : `<section class="hero stage"><div class="media">${img(s.hero.image, s.hero.heading, "p", true)}</div>`;
  const cardsFrom = s.categories.filter((c) => c.count > 0 && !c.parent && c.image).sort((a, b) => b.count - a.count).slice(0, 3);
  const cards =
    cardsFrom.length >= 3
      ? cardsFrom.map((c) => ({ to: `/collections/${c.slug}`, img: c.image, over: `${c.count} products`, title: c.name }))
      : [...s.featured].filter((p) => p.image).sort((a, b) => (b.price ?? 0) - (a.price ?? 0)).slice(0, 3).map((p) => ({ to: `/products/${p.slug}`, img: p.image, over: money(p), title: p.title }));
  const grid = s.featured.slice(0, 8);
  const tiles = grid.map((p) => tile(t, p));
  const wideSrc = nextLarge[0] ?? (s.story?.image && s.story.image !== heroVisual ? s.story.image : null) ?? s.featured.find((p) => p.image && p.image !== s.hero.image)?.image ?? null;
  const ed = nextLarge.find((u) => u !== wideSrc) ?? null;
  if (ed && tiles.length >= 4) tiles.splice(4, 0, editorialTile(t, ed, s.story?.heading ?? s.brand.name, s.hero.eyebrow || "Our story", "/about"));
  return `${hero}<div class="txt" data-r>${s.hero.eyebrow ? `<p class="over">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead sub">${esc(s.hero.sub)}</p>` : ""}<a class="pill${heroVisual ? " light" : ""}" href="${href(t, "/products")}">${esc(s.hero.cta)}</a></div></section>
${cards.length ? `<section class="band"><div class="w"><div class="cards">${cards.map((c) => `<a class="card" data-r href="${href(t, c.to)}"><div class="ph">${img(c.img, c.title, "")}</div><div class="cap">${c.over ? `<p class="over">${esc(c.over)}</p>` : ""}<h3 class="h3">${esc(c.title)}</h3></div></a>`).join("")}</div>${cardsFrom.length >= 3 ? `<p class="more"><a class="pill light" href="${href(t, "/products")}">All collections</a></p>` : ""}</div></section>` : ""}
${s.story ? `<section class="statement"><div class="w"><p class="over" data-r>${esc(s.brand.name)}</p><h2 class="h2" data-r>${esc(s.story.heading)}</h2><div class="lead" data-r>${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="pill" data-r href="${href(t, "/about")}">Our story</a>${wideSrc ? `<div class="wide${isLarge(wideSrc) ? "" : " stage"}" data-r style="margin-top:clamp(48px,6vw,90px)">${img(wideSrc, s.story.heading, isLarge(wideSrc) ? "cover" : "p")}</div>` : ""}</div></section>` : ""}
${tiles.length ? `<section class="coll"><div class="w"><div class="head"><p class="over" data-r>The collection</p><h2 class="h2" data-r>${esc(s.doc.catalogTotal && s.doc.catalogTotal > 12 ? `${s.doc.catalogTotal.toLocaleString("en-US")} pieces, one standard` : "Selected pieces")}</h2></div><div class="tiles">${tiles.join("")}</div><p class="more"><a class="pill dark" href="${href(t, "/products")}">View the collection</a></p></div></section>` : ""}
${s.highlights.length ? `<section class="hl"><div class="w"><p class="over">Why ${esc(s.brand.name)}</p><div class="grid">${s.highlights.map((h, i) => `<div data-r><p class="n">${String(i + 1).padStart(2, "0")}</p><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></div></section>` : ""}
${s.stats.length ? `<div class="stats w">${s.stats.map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}
${s.faq?.items.length ? `<section class="w"><div class="faq"><div><p class="over">Questions</p><h2 class="h2">${esc(s.faq.heading)}</h2></div><div>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${s.closing ? `<section class="closing stage"><p class="over" data-r>${esc(s.brand.name)}</p><h2 class="h2" data-r>${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead" data-r>${esc(s.closing.body)}</p>` : ""}<a class="pill dark" data-r href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)}</a></section>` : ""}`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const nav = categoryNav(t.doc, st.cat);
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "The collection";
  const tiles = st.shown.map((p) => tile(t, p));
  const ed = s.editorial.find((u) => isLarge(u));
  if (ed && !st.q && st.page === 1 && !st.cat && tiles.length > 6) tiles.splice(4, 0, editorialTile(t, ed, s.brand.tagline || s.brand.name, s.brand.name, "/about"));
  const crumbs = st.cat ? `<p class="crumbs" style="padding:0 0 18px"><a href="${href(t, "/products")}">Collection</a>${nav.trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(c.name)}</a>`).join("")}</p>` : `<p class="over">${esc(s.brand.name)}</p>`;
  // Categories as photo cards (the biggest), the rest in a compact index; siblings as chips at a leaf.
  const children = st.q ? [] : t.doc.categories.filter((c) => (c.parent ?? null) === (st.cat?.slug ?? null)).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const cardList = children.filter((c) => c.image).slice(0, 8);
  const restList = children.filter((c) => !cardList.includes(c));
  const catCards = children.length
    ? `<div class="cgrid">${cardList.map((c) => `<a class="cg" data-r href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image ?? null, c.name, "")}</div><div class="t"><b>${esc(shortName(c.name))}</b><span>${(c.count ?? 0).toLocaleString("en-US")}</span></div></a>`).join("")}</div>${
        restList.length
          ? `<details class="index"><summary>All ${children.length} ${st.cat ? `${esc(shortName(st.cat.name).toLowerCase())} categories` : "categories"} ↓</summary><ul>${children.map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a><span>${(c.count ?? 0).toLocaleString("en-US")}</span></li>`).join("")}</ul></details>`
          : ""
      }`
    : "";
  const siblings = !children.length && st.cat ? nav.chips : [];
  const chips = siblings.length
    ? `<div class="chips"><a href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All"))}</a>${siblings
        .slice(0, 24)
        .map((c) => `<a href="${href(t, `/collections/${c.slug}`)}"${st.cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}</a>`)
        .join("")}</div>`
    : '<div style="height:26px"></div>';
  const body = `<section class="lh"><div class="w">${crumbs}<h1 class="display">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}
<form class="search" role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(st.cat.name.toLowerCase()) : "by name or part number"}" aria-label="Search"><button class="pill dark" type="submit">Search</button></form>
${chips}</div></section>
${catCards ? `<section class="w">${catCards}</section>` : ""}
<div class="w"><p class="count" style="margin:0 0 22px">${st.total.toLocaleString("en-US")} ${st.q ? "matches" : st.cat ? `products in ${esc(shortName(st.cat.name).toLowerCase())}` : "products"}</p></div>
<div class="w"><div class="tiles">${tiles.join("")}</div>${st.total === 0 ? `<p class="lead" style="text-align:center;margin:40px auto">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="pill" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span style="color:var(--muted)">Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="pill" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : '<div style="height:90px"></div>'}</div>`;
  return page(t, s, {
    path: st.page > 1 && !st.q ? `${st.path}?page=${st.page}` : st.path,
    title: `${title}${st.page > 1 ? ` (page ${st.page})` : ""} | ${s.brand.name}`,
    description: st.cat?.description || `Browse ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q,
    body,
  });
}

function product(t: RenderTarget, s: Slots, p: SiteProduct): string {
  const url = `${t.origin}/products/${p.slug}`;
  const cat = t.doc.categories.find((c) => c.slug === p.category) ?? null;
  const { name, detail } = splitTitle(p.title);
  const action = productAction(t, p, url, "pill dark");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 3);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w crumbs"><a href="${href(t, "/products")}">Collection</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(c.name)}</a>`).join("")}</div>
<section class="stage"><div class="w pdp"><div class="info" data-r>${cat ? `<p class="over">${esc(cat.name)}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}${p.price != null ? `<p class="price">${esc(money(p))}</p>` : '<div style="height:22px"></div>'}${action.html}${s.promise.length ? `<ul class="promise">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div><div class="img">${img(p.image, p.title, "p", true)}</div><div></div></div></section>
<section class="w"><div class="specs"><div><p class="over">Details</p><h2 class="h3" style="margin-bottom:16px">About this ${cat ? esc(cat.name.toLowerCase()) : "piece"}</h2><div class="about-p">${paras(p.description)}</div></div><div>${p.specs?.length ? `<table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="contact"><div><p class="over">Enquire</p><h2 class="h2">Ask about this piece</h2><p class="about-p">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="coll" style="padding-top:20px"><div class="w"><div class="head"><p class="over">You may also like</p></div><div class="tiles">${related.map((r) => tile(t, r)).join("")}</div></div></section>` : ""}`;
  return page(t, s, {
    path: `/products/${p.slug}`,
    title: `${p.title} | ${s.brand.name}`,
    description: p.description.slice(0, 155),
    body,
    jsonLd: productJsonLd(t, p, url, cat?.name ?? null),
  });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="statement"><div class="w"><p class="over">About ${esc(s.brand.name)}</p><h1 class="display" data-r>${esc(st?.heading ?? s.brand.tagline)}</h1>${visual ? `<div class="wide${isLarge(visual) ? "" : " stage"}" data-r style="margin-top:clamp(48px,6vw,90px)">${img(visual, st?.heading ?? s.brand.name, isLarge(visual) ? "cover" : "p")}</div>` : ""}</div></section>
${st ? `<section class="w"><div class="specs"><div><p class="over">Our story</p></div><div class="about-p" style="font-size:19px">${paras(st.body)}</div></div></section>` : ""}
${s.highlights.length ? `<section class="hl"><div class="w"><div class="grid" style="margin-top:0">${s.highlights.map((h, i) => `<div data-r><p class="n">${String(i + 1).padStart(2, "0")}</p><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></div></section>` : ""}
${s.stats.length ? `<div class="stats w">${s.stats.map((x) => `<div data-r><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const facts = [
    s.brand.email && `<p><a href="mailto:${esc(s.brand.email)}">${esc(s.brand.email)}</a></p>`,
    s.brand.phone && `<p><a href="tel:${esc(s.brand.phone)}">${esc(s.brand.phone)}</a></p>`,
    s.brand.address && `<p>${esc(s.brand.address)}</p>`,
  ].filter(Boolean).join("");
  const body = `<section class="closing stage" style="padding-bottom:clamp(60px,8vw,110px)"><p class="over">${esc(s.brand.name)}</p><h1 class="display">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="contact"><div class="facts"><p class="over">Reach us</p>${facts || `<p class="about-p">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
