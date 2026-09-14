// Credibility signals for B2B benchmarking. B2B buyers shortlist suppliers
// from website evidence — case studies, certifications, a findable quote path —
// long before talking to sales. Prices are usually absent, so these counts are
// the comparable dimension. Everything here is deterministic (URL patterns and
// page text), so every number in an audit is verifiable against the site.

export type ProofSignals = {
  caseStudies: number;
  resources: number;
  certifications: number;
  industriesServed: number;
  hasQuotePath: boolean;
  hasLiveChat: boolean;
  hasPublishedPricing: boolean;
};

const SITEMAP_PATTERNS: [keyof Pick<
  ProofSignals,
  "caseStudies" | "resources" | "certifications" | "industriesServed"
>, RegExp][] = [
  ["caseStudies", /\/(case-stud|success-stor|customer-stor|portfolio|our-work|projects)\b/i],
  ["resources", /\/(resources?|whitepapers?|guides?|downloads?|spec-sheets?|datasheets?|technical-)/i],
  ["certifications", /\/(certifications?|accreditations?|compliance|quality-assurance|iso-)/i],
  ["industriesServed", /\/(industries|markets|sectors|applications|solutions)\//i],
];

const QUOTE_RE = /(request|get|instant|free|custom)[\s-]*(a[\s-]*)?quote|\brfq\b|request pricing|talk to sales|speak (to|with) (an? )?(expert|specialist)/i;
const CHAT_RE = /intercom|drift\.com|livechat|zendesk|tawk\.to|hubspot.*conversations|crisp\.chat|live chat/i;
const PRICE_RE = /\$\s?\d[\d,]*(\.\d{2})?(\s?(CAD|USD))?\b/;

async function fetchText(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(domain: string): Promise<string[]> {
  const xml = await fetchText(`https://${domain}/sitemap.xml`, 8000);
  if (!xml) return [];
  let locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
  // Sitemap index: follow a few child sitemaps, skip obvious product/image ones
  if (/<sitemapindex/i.test(xml)) {
    const children = locs
      .filter((u) => !/product|image|video/i.test(u))
      .slice(0, 5);
    const childXmls = await Promise.all(children.map((u) => fetchText(u, 8000)));
    locs = childXmls
      .filter((x): x is string => !!x)
      .flatMap((x) => [...x.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]));
  }
  return locs.slice(0, 5000);
}

export async function fetchProofSignals(
  domain: string,
  homepageHtml?: string | null,
): Promise<ProofSignals | null> {
  const [urls, html] = await Promise.all([
    fetchSitemapUrls(domain),
    homepageHtml ? Promise.resolve(homepageHtml) : fetchText(`https://${domain}`, 10000),
  ]);
  if (urls.length === 0 && !html) return null;

  const signals: ProofSignals = {
    caseStudies: 0,
    resources: 0,
    certifications: 0,
    industriesServed: 0,
    hasQuotePath: false,
    hasLiveChat: false,
    hasPublishedPricing: false,
  };

  for (const [key, re] of SITEMAP_PATTERNS) {
    signals[key] = urls.filter((u) => re.test(u)).length;
  }
  if (html) {
    signals.hasQuotePath = QUOTE_RE.test(html);
    signals.hasLiveChat = CHAT_RE.test(html);
    signals.hasPublishedPricing = PRICE_RE.test(html);
  }
  return signals;
}
