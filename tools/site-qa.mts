// Template QA: renders every template with three kinds of store and checks
// each page for content problems (lib/site-qa) and, in a real browser at phone
// and desktop width, for layout problems: sideways scrolling, text touching
// the screen edge, broken photos. Run it whenever a template changes:
//
//   PLAYWRIGHT_CORE=<path to playwright-core> npx tsx --env-file=.env.local tools/site-qa.mts [template] [--shots]
//
// Stores: grandbrass (large BigCommerce catalog, from the database),
// etlin-daniels (sparse: 24 products, no categories, no logo, from the
// database) and studs (small Shopify store, read live from its public feed
// with placeholder copy; nothing is saved). Costs nothing: no AI calls.

import { mkdirSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { createRequire } from "node:module";
import type { SiteDoc, SiteProduct } from "../lib/site-types";
import { renderPath } from "../lib/site-render";
import { loadCatalogView } from "../lib/site-catalog";
import { TEMPLATES } from "../lib/templates/index";
import { checkDoc, checkPage, visibleText, type QaIssue } from "../lib/site-qa";
import { pagePhotos, pickPhotos, siteLinks } from "../lib/site-services";
import { crawlList } from "../lib/site-crawl";
import { qaPaths } from "../lib/site-qa-run";
import { platformCatalog } from "../lib/platform-catalog";

// playwright-core is not a project dependency; point PLAYWRIGHT_CORE at any installed copy.
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE ?? "playwright-core") as { chromium: { launch(o: object): Promise<Browser> } };
type Page = { setContent(h: string, o: object): Promise<void>; evaluate<T>(f: string | (() => T)): Promise<T>; waitForTimeout(ms: number): Promise<void>; screenshot(o: object): Promise<unknown>; close(): Promise<void> };
type Browser = { newPage(o: object): Promise<Page>; close(): Promise<void> };
const OUT = process.env.QA_OUT ?? "/tmp/site-qa";
const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const shots = process.argv.includes("--shots");
const sql = neon(process.env.DATABASE_URL!);

type Fixture = { name: string; id: string; slug: string; doc: SiteDoc; fromDb: boolean };

async function dbSite(slug: string, name: string): Promise<Fixture> {
  const [s] = (await sql`SELECT id, slug, doc FROM sites WHERE slug = ${slug}`) as { id: string; slug: string; doc: SiteDoc }[];
  return { name, id: s.id, slug: s.slug, doc: s.doc, fromDb: true };
}

/** A small Shopify store with plain copy, so the templates are seen with little data. */
async function studs(): Promise<Fixture> {
  const cat = await platformCatalog("studs.com", 60_000);
  if (!cat) throw new Error("studs.com feed not readable");
  const slugOf = (k: string) => k.replace(/^[ct]:/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const products: SiteProduct[] = cat.products.map((p, i) => ({
    slug: p.url.split("/").pop()!,
    title: p.title,
    price: p.price,
    currency: p.currency ?? "USD",
    image: p.image,
    description: `${p.title}.`,
    category: p.categoryKeys[0] ? slugOf(p.categoryKeys[0]) : null,
    sourceUrl: p.url,
    featured: i < 12,
  }));
  const categories = cat.categories.map((c) => ({ slug: slugOf(c.key), name: c.name, description: "", parent: null, count: products.filter((p) => p.category === slugOf(c.key)).length, image: products.find((p) => p.category === slugOf(c.key) && p.image)?.image ?? null })).filter((c) => c.count > 0);
  const doc: SiteDoc = {
    brand: { name: "Studs", tagline: "Ear piercing and earrings, done right" },
    tokens: { palette: { bg: "#ffffff", surface: "#f6f6f6", text: "#111111", muted: "#666666", accent: "#e8457a", accentText: "#ffffff", line: "#e5e5e5" }, fontHeading: "Inter", fontBody: "Inter", radius: 12, heroStyle: "split", motion: "subtle", headingCase: "normal" },
    pages: [
      { slug: "", title: "Home", metaTitle: "Studs | Ear piercing and earrings", metaDescription: "Earrings and piercing for every ear, from everyday studs to statement pieces.", sections: [
        { type: "hero", eyebrow: "New in", heading: "Earrings for every ear", subheading: "Studs, hoops and piercings, picked to stack.", ctaLabel: "Shop earrings" },
        { type: "features", heading: "Why Studs", items: [{ title: "Hypoallergenic", body: "Implant-grade metals for sensitive ears." }, { title: "Expert piercing", body: "Trained piercers in every studio." }, { title: "Made to stack", body: "Pieces designed to wear together." }] },
        { type: "faq", heading: "Questions", items: [{ q: "Do you pierce with needles?", a: "Yes, always with single-use needles." }, { q: "What metals do you use?", a: "Titanium, solid gold and sterling silver." }] },
        { type: "cta", heading: "Book a piercing", body: "Walk in or book ahead.", ctaLabel: "Contact us", ctaHref: "/contact" },
      ] },
      { slug: "about", title: "About", metaTitle: "About | Studs", metaDescription: "Studs is a piercing studio and earring brand.", sections: [{ type: "story", heading: "Piercing, reimagined", body: "We started Studs to make piercing feel good." }] },
      { slug: "contact", title: "Contact", metaTitle: "Contact | Studs", metaDescription: "Get in touch with Studs.", sections: [{ type: "contact", heading: "Get in touch", body: "We reply within a day." }] },
    ],
    products,
    categories,
    productAction: "link",
    redirects: {},
  };
  return { name: "studs (small Shopify)", id: "qa-studs", slug: "studs", doc, fromDb: false };
}

/**
 * A services business (no products): Mr. Rooter's own service pages and
 * photos, read without AI, with plain copy. Its pages must read as services:
 * no shop wording survives (lib/site-render).
 */
async function rooter(): Promise<Fixture> {
  const base = "https://www.mrrooter.com/";
  const html = await (await fetch(base, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const links = siteLinks(html, base).filter((l) => /^\/residential-services\/[a-z-]+$/.test(l.path)).slice(0, 9);
  const urls = links.map((l) => new URL(l.path, base).toString());
  const pages = await crawlList(urls.map((url) => ({ url, kind: "category" as const })), Date.now() + 60_000);
  const htmls = await Promise.all(urls.map(async (u) => (await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } }).catch(() => null))?.text() ?? ""));
  const photos = pickPhotos(htmls.map((h, i) => pagePhotos(h, urls[i])));
  const products: SiteProduct[] = links.map((l, i) => {
    const page = pages.find((p) => p.url.replace(/\/+$/, "").endsWith(l.path));
    return { slug: l.path.split("/").pop()!, title: l.text, price: null, currency: null, image: photos[i], description: page?.metaDescription && page.metaDescription.length > 60 ? page.metaDescription : `${l.text} from Mr. Rooter Plumbing: licensed local plumbers, upfront quotes and clean, careful work in your home.`, category: null, sourceUrl: new URL(l.path, base).toString(), featured: true };
  });
  const doc: SiteDoc = {
    kind: "services",
    brand: { name: "Mr. Rooter Plumbing", tagline: "Plumbing, drains and water heaters" },
    tokens: { palette: { bg: "#ffffff", surface: "#f4f6f8", text: "#111111", muted: "#5b6470", accent: "#c8102e", accentText: "#ffffff", line: "#e3e7eb" }, fontHeading: "Inter", fontBody: "Inter", radius: 10, heroStyle: "split", motion: "subtle", headingCase: "normal" },
    pages: [
      { slug: "", title: "Home", metaTitle: "Mr. Rooter Plumbing | Drains, pipes and water heaters", metaDescription: "Plumbing repairs, drain cleaning and water heaters from local plumbers.", sections: [
        { type: "hero", eyebrow: "Local plumbers", heading: "Plumbing fixed properly, the first time", subheading: "Drains, leaks, water heaters and sewer lines.", ctaLabel: "See our services" },
        { type: "productGrid", heading: "Our services", products: "featured", limit: 8 },
        { type: "features", heading: "Why Mr. Rooter", items: [{ title: "Upfront quotes", body: "You know the price before we start." }, { title: "Licensed plumbers", body: "Trained and background-checked." }, { title: "Clean work", body: "We leave your home as we found it." }] },
        { type: "faq", heading: "Questions", items: [{ q: "Do you handle emergencies?", a: "Call us and we'll tell you when we can be there." }, { q: "Do you quote before starting?", a: "Yes, always." }] },
        { type: "cta", heading: "Need a plumber?", body: "Tell us what's wrong and where.", ctaLabel: "Get a quote", ctaHref: "/contact" },
      ] },
      { slug: "about", title: "About", metaTitle: "About | Mr. Rooter Plumbing", metaDescription: "Local plumbers for homes and businesses.", sections: [{ type: "story", heading: "Plumbers you can count on", body: "We fix plumbing for homes and businesses." }] },
      { slug: "contact", title: "Contact", metaTitle: "Contact | Mr. Rooter Plumbing", metaDescription: "Get a plumbing quote.", sections: [{ type: "contact", heading: "Get a quote", body: "Tell us what you need done." }] },
    ],
    products,
    categories: [],
    productAction: "enquire",
    redirects: {},
  };
  return { name: "rooter (services, no products)", id: "qa-rooter", slug: "rooter", doc, fromDb: false };
}

/** Shop wording that must not appear on a services site. */
const SHOP_WORDS = /\b(cart|checkout|shop|shopping|products?|add to bag|in stock|out of stock|sku|buy now|collections?|pieces|items?|best sellers|most loved|the edit|the range|browse|price on request|also like|more like this)\b/i;

/** Runs in the page: what's wrong with the layout at this width. */
const LAYOUT = `(() => {
  const W = innerWidth, out = [];
  if (document.documentElement.scrollWidth > W + 1) out.push("page scrolls sideways (" + document.documentElement.scrollWidth + "px wide at " + W + "px)");
  const scrollers = [...document.querySelectorAll("*")].filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowX));
  const inScroller = (e) => scrollers.some((s) => s !== e && s.contains(e));
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    if (!n.textContent.trim() || !n.parentElement || inScroller(n.parentElement)) continue;
    const st = getComputedStyle(n.parentElement);
    if (st.visibility === "hidden" || st.display === "none" || n.parentElement.closest(".ov,.drawer,[aria-hidden=true]")) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const b of r.getClientRects()) {
      if (b.width < 1) continue;
      const edge = W < 600 ? 10 : 0;
      if (b.left < edge - 0.5 || b.right > W - edge + 0.5) {
        const key = n.textContent.trim().slice(0, 40);
        if (!seen.has(key)) { seen.add(key); out.push("text at the screen edge: \\"" + key + "\\" (" + Math.round(b.left) + "–" + Math.round(b.right) + "px)"); }
        break;
      }
    }
  }
  return out.slice(0, 8);
})()`;

// QA_STORE=rooter (or grandbrass, etlin, studs) checks one store only.
const STORE_FIXTURES: Record<string, () => Promise<Fixture>> = {
  grandbrass: () => dbSite("grandbrass-8fa04e", "grandbrass (large catalog)"),
  etlin: () => dbSite("etlin-daniels-b59c3c", "etlin-daniels (sparse)"),
  studs,
  rooter,
};
const fixtures = await Promise.all(Object.entries(STORE_FIXTURES).filter(([k]) => !process.env.QA_STORE || k === process.env.QA_STORE).map(([, f]) => f()));
const browser = await chromium.launch({ executablePath: CHROME });
const report: { template: string; store: string; issues: QaIssue[] }[] = [];

for (const tpl of TEMPLATES.filter((t) => !only || t.id === only)) {
  for (const f of fixtures) {
    const issues: QaIssue[] = checkDoc(f.doc);
    const count = f.doc.catalogSize ?? f.doc.products.length;
    for (const path of qaPaths(f.doc)) {
      const parts = path.split("/").filter(Boolean);
      const query = new URLSearchParams();
      const catalog = f.fromDb ? await loadCatalogView(f.id, f.doc, parts, query, tpl.perPage).catch(() => null) : null;
      const r = renderPath({ catalog, siteId: f.id, doc: f.doc, base: "", origin: `https://example.test`, apiOrigin: "https://www.apereel.com", preview: false, design: tpl.id }, parts, query);
      if (r.kind !== "html") { issues.push({ page: path, check: "render", detail: r.kind }); continue; }
      issues.push(...checkPage(path, r.body, count, (f.doc.categories).map((c) => c.count ?? 0)));
      if (f.doc.kind === "services") {
        const text = visibleText(r.body);
        const hit = text.match(SHOP_WORDS);
        if (hit) issues.push({ page: path, check: "shop-wording", detail: `"${text.slice(Math.max(0, hit.index! - 40), hit.index! + 40).trim()}"` });
        if (/href="\/products/.test(r.body)) issues.push({ page: path, check: "shop-links", detail: "links to /products instead of /services" });
      }
      const imgs = (r.body.match(/<img /g) ?? []).length;
      for (const width of [390, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.setContent(r.body, { waitUntil: "load", timeout: 45_000 }).catch(() => {});
        await page.evaluate(() => document.querySelectorAll("[data-r]").forEach((e) => e.classList.add("in")));
        await page.waitForTimeout(400);
        for (const d of (await page.evaluate(LAYOUT)) as string[]) issues.push({ page: `${path} @${width}`, check: "layout", detail: d });
        if (width === 390) {
          const left = await page.evaluate(() => document.querySelectorAll("img").length);
          if (imgs - left > 0) issues.push({ page: path, check: "broken-photos", detail: `${imgs - left} of ${imgs} photos failed to load` });
        }
        if (shots && (path === "/" || path === "/products")) {
          mkdirSync(`${OUT}/${tpl.id}`, { recursive: true });
          await page.screenshot({ path: `${OUT}/${tpl.id}/${f.slug}${path.replace(/\//g, "_") || "_home"}-${width}.png`, fullPage: true });
        }
        await page.close();
      }
    }
    report.push({ template: tpl.id, store: f.name, issues });
    console.log(`\n${tpl.name} × ${f.name}: ${issues.length ? `${issues.length} issues` : "passed"}`);
    for (const i of issues) console.log(`  ${i.page} · ${i.check} · ${i.detail}`);
  }
}
await browser.close();
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
