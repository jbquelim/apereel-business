import type { SiteProduct } from "../site-types";
import type { RenderResult, RenderTarget } from "../site-render";
import { articleBody, contentPage, extraLinks, filterBar, filteredTitle, listPath, metaTitle, byRank, categoryNav, contactItems, esc, fontsLink, href, imgTag as img, jsonLdTags, leadForm, listState, money, onColor, paras, productAction, productJsonLd, shortName, slots, splitTitle, type Slots } from "./kit";

// "Studio": Custom tier. Original design in the language of design-led
// product makers: warm off-white, products on soft tinted panels, a confident
// brand-colour button, a split hero with the product large, a category rail,
// and a shop with a category sidebar. Calm motion on scroll.

const PER_PAGE = 24;

function css(accent: string) {
  return `
:root{--ink:#1b1a19;--muted:#6b6763;--bg:#faf8f5;--tint:#f0ece6;--line:#e7e2db;--dark:#1f1d1b;--accent:${accent};--on:${onColor(accent)};--f:"DM Sans",system-ui,sans-serif;--r:22px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}a{color:inherit}
.w{max-width:1320px;margin:0 auto;padding:0 clamp(18px,4vw,56px)}
.eyebrow{display:inline-block;font:600 13px/1 var(--f);letter-spacing:.04em;padding:8px 14px;border-radius:999px;background:color-mix(in srgb,var(--accent) 14%,#fff);color:color-mix(in srgb,var(--accent) 70%,#000);margin:0 0 20px}
.display{font:700 clamp(40px,5.6vw,80px)/1.02 var(--f);letter-spacing:-.035em;margin:0}
.h2{font:700 clamp(30px,3.4vw,50px)/1.06 var(--f);letter-spacing:-.03em;margin:0}
.h3{font:700 clamp(19px,1.5vw,23px)/1.2 var(--f);letter-spacing:-.01em;margin:0}
.lead{font-size:clamp(17px,1.3vw,20px);color:var(--muted);max-width:600px}
.btn{display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 26px;border-radius:999px;background:var(--accent);color:var(--on);font:600 15.5px var(--f);text-decoration:none;border:0;cursor:pointer;transition:transform .25s,box-shadow .25s}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px -10px color-mix(in srgb,var(--accent) 70%,transparent)}
.btn.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}.btn.ghost:hover{box-shadow:inset 0 0 0 1.5px var(--ink),0 10px 24px -14px rgba(0,0,0,.4)}
.btn.ink{background:var(--ink);color:#fff}
.arrow:after{content:"→";transition:transform .25s}.arrow:hover:after{transform:translateX(3px)}
/* header */
.hd{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid transparent;transition:border-color .3s}
.hd.scrolled{border-color:var(--line)}
.hd .w{display:flex;align-items:center;gap:28px;height:78px}
.logo{font:700 22px var(--f);letter-spacing:-.02em;text-decoration:none;flex:none}.logo img{max-height:42px;width:auto}
.hd nav{display:flex;gap:24px;font:500 15px var(--f);flex:1;white-space:nowrap}.hd nav a{text-decoration:none;opacity:.8}.hd nav a:hover{opacity:1}
.hd form{display:flex;align-items:center;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 4px 4px 16px;width:min(300px,30vw)}
.hd form input{border:0;outline:none;background:none;font:inherit;font-size:14.5px;flex:1;min-width:0}.hd form button{border:0;background:var(--ink);color:#fff;border-radius:999px;height:34px;padding:0 14px;font:600 13px var(--f);cursor:pointer}
.burger{display:none;cursor:pointer;font:600 15px var(--f)}#nav{display:none}
.drawer{display:none}
/* hero */
.hero{display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(28px,4vw,64px);align-items:center;padding-block:clamp(28px,4vw,56px) clamp(56px,7vw,100px)}
.hero .sub{margin:22px 0 32px}.hero .acts{display:flex;gap:12px;flex-wrap:wrap}
.hero .nums{display:flex;gap:clamp(22px,3vw,44px);margin-top:44px;padding-top:28px;border-top:1px solid var(--line)}
.hero .nums b{display:block;font:700 clamp(26px,2.4vw,36px)/1 var(--f);letter-spacing:-.03em}.hero .nums span{font-size:14px;color:var(--muted)}
.panel{position:relative;border-radius:calc(var(--r) + 8px);background:var(--tint);aspect-ratio:1/1.02;display:grid;place-items:center;overflow:hidden}
.panel img.p{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:lift 1.3s cubic-bezier(.2,.7,.2,1) both}
.panel img.cover,.panel video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.panel .tag{position:absolute;left:18px;bottom:18px;background:#fff;border-radius:16px;padding:12px 16px;font-size:14px;box-shadow:0 10px 30px -14px rgba(0,0,0,.3);max-width:70%}
.panel .tag b{display:block;font-size:15px}
@keyframes lift{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:none}}
/* sections */
.sec{padding-block:clamp(48px,6vw,88px)}.sec .top{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:34px}
.sec .top a{font-weight:600;text-decoration:none;white-space:nowrap}
.rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(200px,1fr);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:thin}
.cat{scroll-snap-align:start;text-decoration:none;display:block}
.cat .ph{aspect-ratio:1;border-radius:var(--r);background:var(--tint);display:grid;place-items:center;overflow:hidden}
.cat .ph img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.cat:hover .ph img{transform:scale(1.06)}
.cat b{display:block;margin-top:14px;font:700 17px/1.25 var(--f)}.cat span{font-size:14px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,1.6vw,22px)}
.card{display:flex;flex-direction:column;text-decoration:none;background:#fff;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);transition:transform .3s,box-shadow .3s}
.card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -24px rgba(0,0,0,.35)}
.card .ph{aspect-ratio:1;background:var(--tint);display:grid;place-items:center;overflow:hidden}.card .ph img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.card:hover .ph img{transform:scale(1.04)}
.card .t{padding:18px 18px 20px;display:flex;flex-direction:column;gap:6px;flex:1}
.card h3{font:600 16.5px/1.3 var(--f);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .d{font-size:14px;color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .pr{margin-top:auto;padding-top:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700}.card .pr i{font-style:normal;color:var(--accent)}
.dark{background:var(--dark);color:#fff;border-radius:calc(var(--r) + 10px);padding:clamp(44px,6vw,90px) clamp(24px,5vw,80px)}
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(24px,4vw,56px);margin-top:44px}
.feats .n{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--accent);color:var(--on);font-weight:700;margin-bottom:18px}
.feats p{color:rgba(255,255,255,.7);margin:10px 0 0}
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,80px);align-items:center}
.split .im{border-radius:calc(var(--r) + 8px);overflow:hidden;background:var(--tint);aspect-ratio:5/4;display:grid;place-items:center}
.split .im img.cover{width:100%;height:100%;object-fit:cover}.split .im img.p{width:100%;height:100%;object-fit:cover}
.split .lead{margin:18px 0 28px}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:38px;counter-reset:s}
.steps div{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:28px}
.steps div:before{counter-increment:s;content:counter(s,decimal-leading-zero);display:block;font:700 14px var(--f);color:var(--accent);margin-bottom:18px}.steps p{color:var(--muted);margin:8px 0 0;font-size:15.5px}
.faq{max-width:860px;margin:0 auto}.faq .h2{text-align:center;margin-bottom:34px}
.faq details{background:#fff;border:1px solid var(--line);border-radius:18px;margin-bottom:10px;padding:0 24px}
.faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;gap:20px;font:600 17.5px/1.35 var(--f)}.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"+";font-size:24px;line-height:1;color:var(--accent);transition:transform .3s}.faq details[open] summary:after{transform:rotate(45deg)}
.faq details p{color:var(--muted);margin:0 0 22px}
.closing{background:var(--accent);color:var(--on);border-radius:calc(var(--r) + 10px);padding:clamp(48px,7vw,100px) clamp(24px,5vw,80px);display:grid;grid-template-columns:1.4fr auto;gap:30px;align-items:center}
.closing .lead{color:inherit;opacity:.82;margin:14px 0 0}.closing .btn{background:var(--on);color:var(--accent)}
/* shop */
.sh{padding-block:clamp(34px,4vw,60px) 28px}.crumbs{font-size:14px;color:var(--muted);margin:0 0 14px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink)}
.sh .lead{margin:14px 0 0}
.shop{display:grid;grid-template-columns:250px 1fr;gap:clamp(24px,3vw,48px);align-items:start;padding-bottom:90px}
.side{position:sticky;top:98px;max-height:calc(100vh - 120px);overflow:auto;padding-right:6px}
.side h4{font:700 13px var(--f);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.side ul{list-style:none;margin:0 0 28px;padding:0;display:grid;gap:2px}
.side li a{display:flex;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:12px;text-decoration:none;font-size:15px}.side li a:hover{background:var(--tint)}
.side li a[aria-current]{background:var(--ink);color:#fff}.side li a span{color:var(--muted);font-size:13px}.side li a[aria-current] span{color:rgba(255,255,255,.7)}
.side .up{font-weight:600}
.bar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.bar form{display:flex;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 4px 4px 18px;flex:1;max-width:460px}
.bar input{border:0;outline:none;background:none;font:inherit;flex:1;min-width:0}.bar button{border:0;background:var(--ink);color:#fff;border-radius:999px;height:40px;padding:0 18px;font:600 14px var(--f);cursor:pointer}
.bar .n{color:var(--muted);font-size:14.5px}
.shop .grid{grid-template-columns:repeat(3,1fr)}
.pager{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:44px}.pager span{color:var(--muted)}
.side details summary{display:none}
/* product */
.pdp{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,80px);align-items:start;padding-block:10px clamp(56px,7vw,100px)}
.pdp .panel{aspect-ratio:1}
.pdp .info{position:sticky;top:100px}.pdp h1{font:700 clamp(30px,3vw,44px)/1.08 var(--f);letter-spacing:-.03em;margin:0}
.pdp .d{color:var(--muted);margin:12px 0 0;font-size:17px}.pdp .price{font:700 26px var(--f);margin:24px 0}
.ticks{list-style:none;padding:0;margin:26px 0 0;display:grid;gap:10px;font-size:15.5px}
.ticks li{display:flex;gap:12px}.ticks li:before{content:"";flex:none;width:20px;height:20px;border-radius:50%;background:color-mix(in srgb,var(--accent) 16%,#fff) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M6 10.5l2.5 2.5L14 7.5' fill='none' stroke='%23333' stroke-width='1.8'/%3E%3C/svg%3E") center/20px no-repeat}
.acc{margin-top:30px;border-top:1px solid var(--line)}.acc details{border-bottom:1px solid var(--line);padding:0}.acc summary{list-style:none;cursor:pointer;padding:18px 0;font:600 16px var(--f);display:flex;justify-content:space-between}.acc summary::-webkit-details-marker{display:none}.acc summary:after{content:"+";color:var(--accent);font-size:20px}.acc details[open] summary:after{content:"–"}
.acc .body{padding:0 0 20px;color:#4a4744}.acc table{width:100%;border-collapse:collapse;font-size:15px}.acc th,.acc td{text-align:left;padding:10px 0;border-bottom:1px solid var(--line)}.acc th{color:var(--muted);font-weight:400;width:45%}
/* forms */
.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form label{display:grid;gap:6px;font-size:14px;color:var(--muted)}.form .full{grid-column:1/-1}
.form input,.form textarea{font:inherit;color:var(--ink);padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:#fff}
.form button{grid-column:1/-1;justify-self:start;height:52px;padding:0 28px;border:0;border-radius:999px;background:var(--accent);color:var(--on);font:600 15.5px var(--f);cursor:pointer}
.box{background:#fff;border:1px solid var(--line);border-radius:calc(var(--r) + 6px);padding:clamp(24px,4vw,56px)}
.facts ul{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}.facts a{text-decoration:none;border-bottom:1px solid var(--line)}
/* footer */
.ft{background:var(--dark);color:rgba(255,255,255,.75);padding:70px 0 30px;margin-top:clamp(56px,7vw,100px)}
.ft .cols{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:40px}.ft .logo{color:#fff}.ft .logo img{}
.ft p{max-width:320px;margin:16px 0 0;font-size:15px}.ft h4{color:#fff;font:700 15px var(--f);margin:0 0 14px}.ft ul{list-style:none;padding:0;margin:0;display:grid;gap:8px;font-size:15px}.ft a{text-decoration:none}.ft a:hover{color:#fff}
.ft .base{border-top:1px solid rgba(255,255,255,.12);margin-top:50px;padding-top:22px;font-size:13.5px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.note{background:var(--ink);color:#fff;text-align:center;font:13px system-ui;padding:8px}
[data-r]{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}[data-r].in{opacity:1;transform:none}
@media(max-width:1240px){.hd nav{display:none}.hd form{margin-left:auto}}@media(max-width:1100px){.grid{grid-template-columns:repeat(3,1fr)}.shop .grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){.hero,.split,.pdp,.closing{grid-template-columns:1fr}.pdp .info{position:static}.feats{grid-template-columns:1fr}.shop{grid-template-columns:1fr}.side{position:static;max-height:none}
.side details summary{display:flex;justify-content:space-between;cursor:pointer;list-style:none;padding:14px 18px;border:1px solid var(--line);border-radius:14px;background:#fff;font-weight:600;margin-bottom:12px}.side details summary::-webkit-details-marker{display:none}
.ft .cols{grid-template-columns:1fr 1fr}.hd form{display:none}.burger{display:block;margin-left:auto}
#nav:checked~.drawer{display:block}.drawer{position:fixed;inset:78px 0 0;z-index:29;background:var(--bg);overflow:auto;padding:24px 20px}.drawer a{display:block;padding:12px 0;font:700 24px var(--f);text-decoration:none;border-bottom:1px solid var(--line)}
.drawer form{display:flex;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 4px 4px 16px;margin-bottom:12px}.drawer input{border:0;outline:none;font:inherit;flex:1;min-width:0}.drawer button{border:0;background:var(--ink);color:#fff;border-radius:999px;height:38px;padding:0 16px;font-weight:600}}
@media(max-width:600px){.grid,.shop .grid{grid-template-columns:1fr 1fr}.card .t{padding:14px}.card .d{display:none}.ft .cols{grid-template-columns:1fr}.form{grid-template-columns:1fr}.hero .nums{flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}[data-r]{opacity:1;transform:none}}`;
}

const JS = `<script>(function(){var h=document.querySelector(".hd");addEventListener("scroll",function(){h&&h.classList.toggle("scrolled",scrollY>8)},{passive:true});var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");o.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});document.querySelectorAll("[data-r]").forEach(function(el,i){el.style.transitionDelay=(i%4)*70+"ms";o.observe(el)});if(/[?&]sent=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you. Your message was sent; we&#39;ll be in touch soon.</div>');if(/[?&]paid=1/.test(location.search))document.body.insertAdjacentHTML("afterbegin",'<div class="note">Thank you for your order. A receipt is on its way to your email.</div>')})();</script>`;

/** Platform thumbnails are small; rendered visuals and video can fill a panel edge to edge. */
const isLarge = (url: string | null) => !!url && !/bigcommerce|cdn\.shopify|\/cdn\/shop\/|wp-content|\.386\.|_\d{2,3}x/i.test(url);

function logo(s: Slots, t: RenderTarget) {
  return `<a class="logo" href="${href(t, "/")}">${s.brand.logo ? `<img src="${esc(s.brand.logo)}" alt="${esc(s.brand.name)}" onerror="this.replaceWith(document.createTextNode(this.alt))">` : esc(s.brand.name)}</a>`;
}

function page(t: RenderTarget, s: Slots, o: { path: string; title: string; description: string; body: string; jsonLd?: object[]; noindex?: boolean }) {
  const canonical = `${t.origin}${o.path === "/" ? "/" : o.path}`;
  const top = s.categories.filter((c) => !c.parent).sort(byRank);
  const search = (cls = "") => `<form${cls ? ` class="${cls}"` : ""} role="search" method="get" action="${t.base}/products"><input name="q" placeholder="Search products" aria-label="Search products"><button type="submit">Search</button></form>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title><meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="theme-color" content="#faf8f5">
${t.preview || o.noindex ? '<meta name="robots" content="noindex">' : ""}<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canonical)}">
${fontsLink(["DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700"])}<style>${css(t.doc.tokens.palette.accent)}</style>${jsonLdTags(o.jsonLd ?? [])}</head><body>
${t.preview ? '<div class="note">Preview · Studio template · built by Apereel</div>' : ""}
<input type="checkbox" id="nav" aria-hidden="true">
<header class="hd"><div class="w">${logo(s, t)}<nav aria-label="Main"><a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 3).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</nav>${search()}<a class="btn" style="height:42px;padding:0 18px;font-size:14.5px" href="${href(t, "/contact")}">Contact</a><label class="burger" for="nav">Menu</label></div></header>
<div class="drawer">${search()}<a href="${href(t, "/products")}">Shop all</a>${top.slice(0, 8).map((c) => `<a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}<a href="${href(t, "/about")}">About</a><a href="${href(t, "/contact")}">Contact</a></div>
<main>${o.body}</main>
<footer class="ft"><div class="w"><div class="cols"><div>${logo(s, t)}<p>${esc(s.brand.tagline)}</p></div>
<div><h4>Shop</h4><ul><li><a href="${href(t, "/products")}">All products</a></li>${top.slice(0, 6).map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a></li>`).join("")}</ul></div>
<div><h4>${esc(s.brand.name)}</h4><ul><li><a href="${href(t, "/about")}">About</a></li>${extraLinks(t)}<li><a href="${href(t, "/contact")}">Contact</a></li></ul></div>
<div><h4>Get in touch</h4><ul>${contactItems(s.brand) || `<li><a href="${href(t, "/contact")}">Send us a message</a></li>`}</ul></div></div>
<div class="base"><span>© ${new Date().getFullYear()} ${esc(s.brand.name)}</span><span>${esc(s.brand.tagline)}</span></div></div></footer>
${JS}</body></html>`;
}

function card(t: RenderTarget, p: SiteProduct, reveal = true) {
  const { name, detail } = splitTitle(p.title);
  return `<a class="card"${reveal ? " data-r" : ""} href="${href(t, `/products/${p.slug}`)}"><div class="ph">${img(p.image, p.title)}</div><div class="t"><h3>${esc(name)}</h3>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<div class="pr"><span>${esc(money(p)) || "Ask for price"}</span><i class="arrow"></i></div></div></a>`;
}

function home(t: RenderTarget, s: Slots): string {
  const large = s.editorial.filter((u) => isLarge(u));
  const heroCover = s.hero.video ?? large[0] ?? null;
  const top = s.categories.filter((c) => !c.parent && c.count > 0).sort(byRank);
  const lead = s.featured.find((p) => p.image);
  const panel = s.hero.video
    ? `<video src="${esc(s.hero.video)}" autoplay muted loop playsinline></video>`
    : heroCover
      ? img(heroCover, s.hero.heading, "cover", true)
      : img(s.hero.image, s.hero.heading, "p", true);
  const tag = !heroCover && lead ? `<a class="tag" href="${href(t, `/products/${lead.slug}`)}"><b>${esc(splitTitle(lead.title).name)}</b>${esc(money(lead))}</a>` : "";
  const storyImg = large.find((u) => u !== heroCover) ?? s.featured.find((p) => p.image && p.image !== s.hero.image)?.image ?? null;
  return `<section class="w hero"><div data-r>${s.hero.eyebrow ? `<p class="eyebrow">${esc(s.hero.eyebrow)}</p>` : ""}<h1 class="display">${esc(s.hero.heading)}</h1>${s.hero.sub ? `<p class="lead sub">${esc(s.hero.sub)}</p>` : ""}
<div class="acts"><a class="btn arrow" href="${href(t, "/products")}">${esc(s.hero.cta)}</a><a class="btn ghost" href="${href(t, "/contact")}">Talk to us</a></div>
${s.stats.length ? `<div class="nums">${s.stats.slice(0, 3).map((x) => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div>` : ""}</div>
<div class="panel" data-r>${panel}${tag}</div></section>
${top.length >= 3 ? `<section class="w sec" style="padding-top:0"><div class="top"><h2 class="h2" data-r>Shop by category</h2><a class="arrow" href="${href(t, "/products")}">See everything </a></div><div class="rail">${top.slice(0, 10).map((c) => `<a class="cat" href="${href(t, `/collections/${c.slug}`)}"><div class="ph">${img(c.image, c.name)}</div><b>${esc(shortName(c.name))}</b><span>${c.count.toLocaleString("en-US")} products</span></a>`).join("")}</div></section>` : ""}
${s.featured.length ? `<section class="w sec" style="padding-top:${top.length >= 3 ? "0" : "inherit"}"><div class="top"><h2 class="h2" data-r>Best of ${esc(s.brand.name)}</h2><a class="arrow" href="${href(t, "/products")}">Shop all </a></div><div class="grid">${s.featured.slice(0, 8).map((p) => card(t, p)).join("")}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="dark"><h2 class="h2" data-r style="max-width:760px">Why ${esc(s.brand.name)}</h2><div class="feats">${s.highlights.map((h, i) => `<div data-r><div class="n">${i + 1}</div><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></div></section>` : ""}
${s.story ? `<section class="w sec" style="padding-top:0"><div class="split"><div class="im" data-r>${img(storyImg, s.story.heading, storyImg && isLarge(storyImg) ? "cover" : "p")}</div><div data-r><p class="eyebrow">Our story</p><h2 class="h2">${esc(s.story.heading)}</h2><div class="lead">${paras(s.story.body.split(/\n{2,}/)[0] ?? "")}</div><a class="btn ghost arrow" href="${href(t, "/about")}">More about us </a></div></div></section>` : ""}
${s.steps?.items.length ? `<section class="w sec" style="padding-top:0"><h2 class="h2" data-r>${esc(s.steps.heading)}</h2><div class="steps">${s.steps.items.map((x) => `<div data-r><h3 class="h3">${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></section>` : ""}
${s.faq?.items.length ? `<section class="w sec" style="padding-top:0"><div class="faq"><h2 class="h2">${esc(s.faq.heading)}</h2>${s.faq.items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>` : ""}
${s.closing ? `<section class="w"><div class="closing" data-r><div><h2 class="h2">${esc(s.closing.heading)}</h2>${s.closing.body ? `<p class="lead">${esc(s.closing.body)}</p>` : ""}</div><a class="btn arrow" href="${href(t, s.closing.href || "/contact")}">${esc(s.closing.cta)} </a></div></section>` : ""}`;
}

function sidebar(t: RenderTarget, cat: Slots["doc"]["categories"][number] | null) {
  const nav = categoryNav(t.doc, cat);
  const kids = t.doc.categories.filter((c) => (c.parent ?? null) === (cat?.slug ?? null)).sort(byRank);
  const list = kids.length ? kids : nav.chips;
  if (!list.length && !cat) return "";
  const up = cat ? `<li><a class="up" href="${href(t, nav.parent ? `/collections/${nav.parent.slug}` : "/products")}">← ${esc(shortName(nav.parent?.name ?? "All products"))}</a></li>` : "";
  return `<aside class="side"><details open><summary>Categories <span>▾</span></summary><h4>${cat ? esc(shortName(cat.name)) : "Categories"}</h4><ul>${up}${list
    .slice(0, 60)
    .map((c) => `<li><a href="${href(t, `/collections/${c.slug}`)}"${cat?.slug === c.slug ? ' aria-current="page"' : ""}>${esc(shortName(c.name))}<span>${(c.count ?? 0).toLocaleString("en-US")}</span></a></li>`)
    .join("")}</ul></details></aside>`;
}

function listing(t: RenderTarget, s: Slots, categorySlug: string | null, query: URLSearchParams): string | null {
  const st = listState(t, categorySlug, query, PER_PAGE);
  if (st.missing) return null;
  const trail = categoryNav(t.doc, st.cat).trail;
  const title = st.q ? `Results for “${st.q}”` : st.cat ? st.cat.name : "Shop all";
  const body = `<section class="w sh"><p class="crumbs"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Shop</a>${trail.slice(0, -1).map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p><h1 class="display" style="font-size:clamp(36px,4.4vw,64px)">${esc(title)}</h1>${st.cat?.description && !st.q ? `<p class="lead">${esc(st.cat.description)}</p>` : ""}</section>
<div class="w shop">${sidebar(t, st.cat) || "<div></div>"}<div><div class="bar"><form role="search" method="get" action="${t.base}${st.path}"><input name="q" value="${esc(st.q)}" placeholder="Search ${st.cat ? esc(shortName(st.cat.name).toLowerCase()) : "products"}" aria-label="Search"><button type="submit">Search</button></form><span class="n">${st.total.toLocaleString("en-US")} ${st.q ? "matches" : "products"}</span></div>
${filterBar(t, st)}<div class="grid">${st.shown.map((p) => card(t, p, false)).join("")}</div>${st.total === 0 ? `<p class="lead" style="margin:30px 0">Nothing matches that yet. <a href="${href(t, "/contact")}">Ask us</a>, we may well have it.</p>` : ""}
${st.pages > 1 ? `<nav class="pager" aria-label="Pages">${st.page > 1 ? `<a class="btn ghost" href="${st.pageHref(st.page - 1)}" rel="prev">Previous</a>` : ""}<span>Page ${st.page} of ${st.pages}</span>${st.page < st.pages ? `<a class="btn ghost" href="${st.pageHref(st.page + 1)}" rel="next">Next</a>` : ""}</nav>` : ""}</div></div>`;
  return page(t, s, {
    path: listPath(st),
    title: metaTitle(filteredTitle(`${title}${st.page > 1 ? ` (page ${st.page})` : ""}`, st), s.brand.name),
    description: st.cat?.description || `Shop ${st.scopeTotal.toLocaleString("en-US")} products from ${s.brand.name}.`,
    noindex: !!st.q || Object.keys(st.chosen).length > 1,
    body,
  });
}

function product(t: RenderTarget, s: Slots, p: SiteProduct): string {
  const url = `${t.origin}/products/${p.slug}`;
  const cat = t.doc.categories.find((c) => c.slug === p.category) ?? null;
  const { name, detail } = splitTitle(p.title);
  const action = productAction(t, p, url, "btn arrow");
  const related = t.catalog?.kind === "product" ? t.catalog.related : t.doc.products.filter((x) => x.slug !== p.slug && x.image && (p.category ? x.category === p.category : true)).slice(0, 4);
  const trail = categoryNav(t.doc, cat).trail;
  const body = `<div class="w sh" style="padding-bottom:18px"><p class="crumbs" style="margin:0"><a href="${href(t, "/")}">Home</a> / <a href="${href(t, "/products")}">Shop</a>${trail.map((c) => ` / <a href="${href(t, `/collections/${c.slug}`)}">${esc(shortName(c.name))}</a>`).join("")}</p></div>
<section class="w pdp"><div class="panel">${img(p.image, p.title, "p", true)}</div><div class="info">${cat ? `<p class="eyebrow">${esc(shortName(cat.name))}</p>` : ""}<h1>${esc(name)}</h1>${detail ? `<p class="d">${esc(detail)}</p>` : ""}<p class="price">${esc(money(p)) || "Price on request"}</p>${action.html}
${s.promise.length ? `<ul class="ticks">${s.promise.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<div class="acc"><details open><summary>Description</summary><div class="body">${paras(p.description)}</div></details>${p.specs?.length ? `<details><summary>Specifications</summary><div class="body"><table>${p.specs.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div></details>` : ""}</div></div></section>
${action.enquire ? `<section class="w" id="enquire"><div class="box split" style="align-items:start"><div><p class="eyebrow">Enquire</p><h2 class="h2">Ask about this product</h2><p class="lead" style="margin-top:14px">We reply personally, usually within a working day.</p></div>${leadForm(t, `product:${p.slug}`, "Send enquiry", true)}</div></section>` : ""}
${related.length ? `<section class="w sec"><div class="top"><h2 class="h2">You might also need</h2></div><div class="grid">${related.map((r) => card(t, r, false)).join("")}</div></section>` : ""}`;
  return page(t, s, { path: `/products/${p.slug}`, title: metaTitle(p.title, s.brand.name), description: p.description.slice(0, 155), body, jsonLd: productJsonLd(t, p, url, cat?.name ?? null) });
}

function about(t: RenderTarget, s: Slots): string {
  const st = s.aboutStory ?? s.story;
  const visual = st?.image ?? s.editorial[0] ?? null;
  const body = `<section class="w hero"><div data-r><p class="eyebrow">About ${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(36px,4.6vw,68px)">${esc(st?.heading ?? s.brand.tagline)}</h1></div><div class="panel" data-r style="aspect-ratio:5/4">${img(visual, st?.heading ?? s.brand.name, visual && isLarge(visual) ? "cover" : "p", true)}</div></section>
${st ? `<section class="w sec" style="padding-top:0"><div class="box" style="max-width:900px;margin:0 auto;font-size:18.5px">${paras(st.body)}</div></section>` : ""}
${s.highlights.length ? `<section class="w sec" style="padding-top:0"><div class="dark"><div class="feats" style="margin-top:0">${s.highlights.map((h, i) => `<div data-r><div class="n">${i + 1}</div><h3 class="h3">${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join("")}</div></div></section>` : ""}`;
  const meta = t.doc.pages.find((x) => x.slug === "about");
  return page(t, s, { path: "/about", title: meta?.metaTitle ?? `About | ${s.brand.name}`, description: meta?.metaDescription ?? s.brand.tagline, body });
}

function contact(t: RenderTarget, s: Slots): string {
  const body = `<section class="w sh"><p class="eyebrow">${esc(s.brand.name)}</p><h1 class="display" style="font-size:clamp(36px,4.6vw,68px)">${esc(s.contact.heading)}</h1>${s.contact.body ? `<p class="lead">${esc(s.contact.body)}</p>` : ""}</section>
<section class="w"><div class="box split" style="align-items:start"><div class="facts"><h2 class="h3">Reach us</h2>${contactItems(s.brand) ? `<ul>${contactItems(s.brand)}</ul>` : `<p class="lead">Send us a message and we'll reply personally.</p>`}</div>${leadForm(t, "contact", s.contact.quote ? "Request a quote" : "Send message", s.contact.quote)}</div></section>`;
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
