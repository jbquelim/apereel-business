import { isBlockedPage } from "./site-fetch";

// Marketing technology detection from a site's homepage HTML and headers.
// Our own focused fingerprint list (not the Wappalyzer ruleset): only tools
// that change marketing advice — platform, email/SMS, reviews, ad pixels,
// analytics, chat, onsite search, payments, loyalty.
//
// Detection is evidence of PRESENCE only. Many tags load later through a tag
// manager, so "not detected" never means "not used".

export type TechCategory =
  | "Platform"
  | "Email & SMS"
  | "Reviews"
  | "Ad pixels"
  | "Analytics"
  | "Chat & support"
  | "Search & merchandising"
  | "Payments & BNPL"
  | "Loyalty";

export const TECH_CATEGORY_ORDER: TechCategory[] = [
  "Platform",
  "Email & SMS",
  "Reviews",
  "Ad pixels",
  "Analytics",
  "Chat & support",
  "Search & merchandising",
  "Payments & BNPL",
  "Loyalty",
];

export type Technology = { name: string; category: TechCategory };

type Fingerprint = {
  name: string;
  category: TechCategory;
  html?: RegExp;
  header?: [string, RegExp];
  // A more specific tool that makes this one redundant (e.g. WooCommerce ⊃ WordPress)
  impliedBy?: string;
};

const FINGERPRINTS: Fingerprint[] = [
  // Platform
  { name: "Shopify", category: "Platform", html: /cdn\.shopify\.com|Shopify\.theme/, header: ["x-shopid", /./] },
  { name: "WooCommerce", category: "Platform", html: /wp-content\/plugins\/woocommerce|woocommerce-(?:page|no-js)/ },
  { name: "WordPress", category: "Platform", html: /wp-content\/|wp-includes\//, impliedBy: "WooCommerce" },
  { name: "Magento", category: "Platform", html: /Magento_|mage\/cookies|\/static\/version\d+\// },
  { name: "BigCommerce", category: "Platform", html: /cdn\d*\.bigcommerce\.com/ },
  { name: "Salesforce Commerce Cloud", category: "Platform", html: /demandware\.(?:static|store)|\/on\/demandware/ },
  { name: "Wix", category: "Platform", html: /static\.wixstatic\.com|wix-bolt|X-Wix-/ },
  { name: "Squarespace", category: "Platform", html: /static1\.squarespace\.com|squarespace-cdn/ },
  { name: "Webflow", category: "Platform", html: /data-wf-site=|webflow\.js/ },

  // Email & SMS
  { name: "Klaviyo", category: "Email & SMS", html: /klaviyo\.com/ },
  { name: "Mailchimp", category: "Email & SMS", html: /chimpstatic\.com|list-manage\.com/ },
  { name: "Omnisend", category: "Email & SMS", html: /omnisnippet|omnisend\.com/ },
  { name: "Attentive", category: "Email & SMS", html: /attn\.tv|attentivemobile\.com/ },
  { name: "Postscript", category: "Email & SMS", html: /postscript\.io/ },
  { name: "HubSpot", category: "Email & SMS", html: /js\.hs-scripts\.com|js\.hsforms\.net|js\.hs-analytics\.net/ },

  // Reviews
  { name: "Yotpo", category: "Reviews", html: /yotpo\.com/ },
  { name: "Okendo", category: "Reviews", html: /okendo\.io/ },
  { name: "Judge.me", category: "Reviews", html: /judge\.me/ },
  { name: "Trustpilot", category: "Reviews", html: /widget\.trustpilot\.com/ },
  { name: "Bazaarvoice", category: "Reviews", html: /bazaarvoice\.com/ },
  { name: "Stamped", category: "Reviews", html: /stamped\.io/ },
  { name: "REVIEWS.io", category: "Reviews", html: /reviews\.io\/|reviews\.co\.uk/ },

  // Ad pixels
  { name: "Meta Pixel", category: "Ad pixels", html: /connect\.facebook\.net\/[^"']*fbevents|fbq\(\s*['"]init/ },
  { name: "Google Ads", category: "Ad pixels", html: /googleadservices\.com|['"]AW-\d{6,}/ },
  { name: "TikTok Pixel", category: "Ad pixels", html: /analytics\.tiktok\.com/ },
  { name: "Pinterest Tag", category: "Ad pixels", html: /s\.pinimg\.com\/ct\/|pintrk\(/ },
  { name: "LinkedIn Insight", category: "Ad pixels", html: /snap\.licdn\.com/ },
  { name: "Snapchat Pixel", category: "Ad pixels", html: /sc-static\.net\/scevent/ },
  { name: "Microsoft Ads", category: "Ad pixels", html: /bat\.bing\.com/ },

  // Analytics
  { name: "Google Analytics", category: "Analytics", html: /gtag\/js\?id=G-|google-analytics\.com\/(?:analytics|ga)\.js|['"]G-[A-Z0-9]{6,}['"]/ },
  { name: "Google Tag Manager", category: "Analytics", html: /googletagmanager\.com\/gtm\.js|['"]GTM-[A-Z0-9]{4,}/ },
  { name: "Hotjar", category: "Analytics", html: /static\.hotjar\.com/ },
  { name: "Microsoft Clarity", category: "Analytics", html: /clarity\.ms\/tag/ },
  { name: "Segment", category: "Analytics", html: /cdn\.segment\.com/ },
  { name: "Heap", category: "Analytics", html: /heapanalytics\.com|heap-\d+\.js/ },

  // Chat & support
  { name: "Intercom", category: "Chat & support", html: /widget\.intercom\.io|intercomcdn\.com/ },
  { name: "Zendesk", category: "Chat & support", html: /static\.zdassets\.com/ },
  { name: "Gorgias", category: "Chat & support", html: /gorgias\.chat|config\.gorgias\.io/ },
  { name: "Tidio", category: "Chat & support", html: /code\.tidio\.co/ },
  { name: "Drift", category: "Chat & support", html: /js\.driftt\.com/ },
  { name: "LiveChat", category: "Chat & support", html: /cdn\.livechatinc\.com/ },

  // Search & merchandising
  { name: "Algolia", category: "Search & merchandising", html: /algolia(?:net)?\.(?:com|net)|algoliasearch/ },
  { name: "Searchspring", category: "Search & merchandising", html: /searchspring\.(?:net|io)/ },
  { name: "Klevu", category: "Search & merchandising", html: /klevu\.com/ },
  { name: "Nosto", category: "Search & merchandising", html: /nosto\.com/ },
  { name: "Rebuy", category: "Search & merchandising", html: /rebuyengine\.com/ },
  { name: "Bloomreach", category: "Search & merchandising", html: /bloomreach|brcdn\.com/ },

  // Payments & BNPL
  { name: "Shop Pay", category: "Payments & BNPL", html: /shop-pay|shopify-payment-button/ },
  { name: "Afterpay", category: "Payments & BNPL", html: /afterpay\.com|afterpay-/ },
  { name: "Klarna", category: "Payments & BNPL", html: /klarna(?:services)?\.(?:com|net)|klarna-/ },
  { name: "Affirm", category: "Payments & BNPL", html: /cdn\d*\.affirm\.com|affirm\.js/ },
  { name: "PayPal", category: "Payments & BNPL", html: /paypal\.com\/sdk|paypalobjects\.com/ },

  // Loyalty
  { name: "Smile.io", category: "Loyalty", html: /smile\.io|cdn\.sweettooth\.io/ },
  { name: "LoyaltyLion", category: "Loyalty", html: /loyaltylion\.(?:com|net)/ },
];

export function detectTechnologies(html: string, headers?: Headers): Technology[] {
  const found = FINGERPRINTS.filter(
    (f) =>
      (f.html && f.html.test(html)) ||
      (f.header && headers && f.header[1].test(headers.get(f.header[0]) ?? "")),
  );
  const names = new Set(found.map((f) => f.name));
  return found
    .filter((f) => !f.impliedBy || !names.has(f.impliedBy))
    .map((f) => ({ name: f.name, category: f.category }));
}

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  // Some firewalls 403 a desktop-Chrome agent without client hints.
  "Mozilla/5.0",
];

export type SiteStack = { name: string; domain: string; technologies: Technology[] };

/** Homepage stack for a site; null when the homepage couldn't be fetched. */
export async function fetchSiteStack(name: string, domain: string): Promise<SiteStack | null> {
  for (const ua of USER_AGENTS) {
    try {
      const res = await fetch(`https://${domain}/`, {
        headers: { "User-Agent": ua, Accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        if ([401, 403, 406, 429].includes(res.status)) continue;
        return null;
      }
      const html = (await res.text()).slice(0, 1_500_000);
      if (html.length < 500 || isBlockedPage(html)) return null;
      return { name, domain, technologies: detectTechnologies(html, res.headers) };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Tools most competitors show on their homepage that the client's homepage
 * doesn't. Deterministic — no model involved. "Most" = at least 2 and at
 * least half of the competitors we could read.
 */
export function stackGaps(client: SiteStack, competitors: SiteStack[]) {
  if (competitors.length < 2) return [];
  const clientCats = new Set(client.technologies.map((t) => t.category));
  // Pixels and analytics are usually injected by a tag manager after load,
  // invisible to a homepage read — so with one present, absence proves nothing.
  const hasTagLoader = client.technologies.some((t) =>
    ["Google Tag Manager", "Segment", "Google Ads", "Google Analytics"].includes(t.name),
  );
  if (hasTagLoader) {
    clientCats.add("Ad pixels");
    clientCats.add("Analytics");
  }
  const gaps: { category: TechCategory; examples: string[]; competitorCount: number }[] = [];
  for (const category of TECH_CATEGORY_ORDER) {
    if (category === "Platform" || clientCats.has(category)) continue;
    const users = competitors.filter((c) => c.technologies.some((t) => t.category === category));
    if (users.length >= 2 && users.length >= competitors.length / 2) {
      const examples = [
        ...new Set(users.flatMap((c) => c.technologies.filter((t) => t.category === category).map((t) => t.name))),
      ].slice(0, 3);
      gaps.push({ category, examples, competitorCount: users.length });
    }
  }
  return gaps;
}
