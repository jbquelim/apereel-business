import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require("google-trends-api");

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function normalizeUrl(input: string): string | null {
  let url = input.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

type Competitor = {
  name: string;
  domain: string;
  strength: string;
};

type Channel = {
  name: string;
  percentage: number;
};

type Keyword = {
  keyword: string;
  intent: "N" | "C" | "I" | "T";
  position: number;
  volume: string;
  cpc: number;
  traffic: number;
};

type IndustryAnalysis = {
  industry: string;
  subIndustry: string;
  competitors: Competitor[];
  insight: string;
  channels: Channel[];
  topPlayer: string;
  keywords: Keyword[];
  totalKeywords: number;
} | null;

type TrendPoint = {
  date: string;
  values: number[];
};

type TrendsData = {
  keywords: string[];
  timeline: TrendPoint[];
} | null;

type AuditResult = {
  url: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  vitals: {
    lcp: string | null;
    cls: string | null;
    fcp: string | null;
    si: string | null;
    tbt: string | null;
    tti: string | null;
  };
  meta: {
    title: string | null;
    titleLength: number;
    description: string | null;
    descriptionLength: number;
    h1: string | null;
    h1Count: number;
    hasCanonical: boolean;
    hasOgTags: boolean;
    hasTwitterCards: boolean;
    hasSchemaMarkup: boolean;
    hasViewport: boolean;
    isHttps: boolean;
    robotsMeta: string | null;
    imageCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
  };
  industry: IndustryAnalysis;
  trends: TrendsData;
};

async function fetchPageMeta(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    let res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 10000);
      res = await fetch(url, {
        signal: controller2.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
        redirect: "follow",
      });
      clearTimeout(timeout2);
    }
    clearTimeout(timeout);

    if (!res.ok) {
      console.error("fetchPageMeta: both attempts failed for", url, "status:", res.status);
      return null;
    }

    const html = await res.text();
    const maxLen = 200000;
    const doc = html.slice(0, maxLen);

    const extract = (pattern: RegExp): string | null => {
      const m = doc.match(pattern);
      return m?.[1]?.trim() ?? null;
    };

    const extractAll = (pattern: RegExp): string[] => {
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      while ((m = re.exec(doc)) !== null) {
        if (m[1]) matches.push(m[1].trim());
      }
      return matches;
    };

    const title =
      extract(/<title[^>]*>([^<]+)<\/title>/i) ?? null;
    const description =
      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ??
      extract(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ??
      null;

    const h1s = extractAll(/<h1[^>]*>([^<]*(?:<[^/][^>]*>[^<]*)*)<\/h1>/gi).map(
      (h) => h.replace(/<[^>]+>/g, "").trim(),
    );

    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(doc);
    const hasOgTags = /<meta[^>]*property=["']og:/i.test(doc);
    const hasTwitterCards = /<meta[^>]*name=["']twitter:/i.test(doc);
    const hasSchemaMarkup =
      /<script[^>]*type=["']application\/ld\+json["']/i.test(doc) ||
      /itemtype=["']https?:\/\/schema\.org/i.test(doc);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(doc);

    const robotsMeta =
      extract(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ?? null;

    const imgTags = doc.match(/<img[^>]*>/gi) ?? [];
    const imagesWithAlt = imgTags.filter((tag) =>
      /alt=["'][^"']+["']/i.test(tag),
    ).length;
    const imagesWithoutAlt = imgTags.length - imagesWithAlt;

    const bodyText = doc
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    const jsonLdBlocks = extractAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );
    const structuredData = jsonLdBlocks.length > 0 ? jsonLdBlocks.join("\n") : null;

    return {
      title,
      titleLength: title?.length ?? 0,
      description,
      descriptionLength: description?.length ?? 0,
      h1: h1s[0] ?? null,
      h1Count: h1s.length,
      hasCanonical,
      hasOgTags,
      hasTwitterCards,
      hasSchemaMarkup,
      hasViewport,
      isHttps: url.startsWith("https"),
      robotsMeta,
      imageCount: imgTags.length,
      imagesWithAlt,
      imagesWithoutAlt,
      bodyText,
      structuredData,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchViaJinaReader(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 8000);
  } catch {
    return null;
  }
}

async function fetchViaWaybackMachine(url: string): Promise<string | null> {
  try {
    const domain = new URL(url).hostname;
    const availRes = await fetch(
      `https://archive.org/wayback/available?url=${domain}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!availRes.ok) return null;
    const availData = await availRes.json();
    const snapshotUrl = availData?.archived_snapshots?.closest?.url;
    if (!snapshotUrl) return null;

    const pageRes = await fetch(snapshotUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "text/html" },
    });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch {
    return null;
  }
}

async function fetchGoogleSearchResults(domain: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return null;

  try {
    const query = encodeURIComponent(domain);
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&num=10`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) {
      console.error("Google Custom Search error:", res.status);
      return null;
    }
    const data = await res.json();
    const items = data.items ?? [];
    if (items.length === 0) return null;

    const results = items
      .map(
        (item: { title?: string; snippet?: string; link?: string }) =>
          `Title: ${item.title ?? ""}\nSnippet: ${item.snippet ?? ""}\nURL: ${item.link ?? ""}`,
      )
      .join("\n\n");

    return `Google search results for "${domain}":\n\n${results}`;
  } catch (err) {
    console.error("Google Custom Search failed:", err);
    return null;
  }
}

async function fetchSiteClues(url: string): Promise<string | null> {
  const origin = new URL(url).origin;
  const targets = [`${origin}/sitemap.xml`, `${origin}/robots.txt`];
  const results: string[] = [];

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      });
      if (res.ok) {
        const text = await res.text();
        results.push(`--- ${target} ---\n${text.slice(0, 4000)}`);
      }
    } catch {}
  }

  return results.length > 0 ? results.join("\n\n") : null;
}

async function fetchPageSpeed(url: string) {
  const categories = [
    "performance",
    "seo",
    "accessibility",
    "best-practices",
  ];
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
  });
  for (const cat of categories) params.append("category", cat);

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error("PageSpeed API error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();

    const cats = data.lighthouseResult?.categories ?? {};
    const audits = data.lighthouseResult?.audits ?? {};

    return {
      scores: {
        performance: cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
        seo: cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
        accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
        bestPractices: cats["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null,
      },
      vitals: {
        lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
        cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
        fcp: audits["first-contentful-paint"]?.displayValue ?? null,
        si: audits["speed-index"]?.displayValue ?? null,
        tbt: audits["total-blocking-time"]?.displayValue ?? null,
        tti: audits["interactive"]?.displayValue ?? null,
      },
    };
  } catch {
    return null;
  }
}

async function fetchIndustryAnalysis(
  url: string,
  title: string | null,
  description: string | null,
  h1: string | null,
  bodyText?: string | null,
  structuredData?: string | null,
  googleSearchData?: string | null,
): Promise<IndustryAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const domain = new URL(url).hostname;
  const pageSignals = [
    title && `Title: ${title}`,
    description && `Description: ${description}`,
    h1 && `H1: ${h1}`,
    `Domain: ${domain}`,
    bodyText && `Page content (excerpt):\n${bodyText}`,
    structuredData && `Structured data (JSON-LD):\n${structuredData}`,
    googleSearchData && `\nVERIFIED DATA FROM GOOGLE SEARCH (use this as factual information):\n${googleSearchData}`,
  ].filter(Boolean);

  const hasPageContent = !!(title || description || h1 || bodyText);

  const models = [
    "claude-sonnet-4-20250514",
    "claude-haiku-4-5-20251001",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
  ];

  const prompt = `Analyze this website and identify its industry, then provide competitive intelligence including top 5 direct competitors and market traffic channel estimates.

Website signals:
${pageSignals.join("\n")}
${!hasPageContent ? `\nIMPORTANT: The main page content could not be retrieved directly. However, you may have received VERIFIED DATA FROM GOOGLE SEARCH above. If Google search results are present, treat them as FACTUAL information about this business. Base your industry classification, competitors, and analysis on these verified results.

If Google search data IS available above:
- Use the search result titles and snippets to determine what this business actually does
- Identify real competitors mentioned in or implied by the search results
- Base your analysis on facts from the search results, not guesses

If NO verified data is available at all:
- State clearly that the website could not be accessed and no external data was available
- Do not fabricate an analysis` : ""}

CRITICAL: Competitors must be DIRECT competitors — businesses of the same type that compete for the same customers. NOT brands, suppliers, or parent companies they may carry.

Examples of correct competitor identification:
- A jewelry RETAILER's competitors are other jewelry RETAILERS (e.g. Birks, Knar Jewellery, Mejuri), NOT jewelry brands they sell (NOT Cartier, Rolex, Tiffany)
- A shoe STORE's competitors are other shoe STORES, NOT shoe manufacturers
- A restaurant's competitors are other restaurants, NOT food suppliers
- A clothing BOUTIQUE's competitors are other boutiques, NOT fashion brands like Gucci

Respond with ONLY valid JSON, no markdown formatting:
{
  "industry": "broad industry name",
  "subIndustry": "specific niche or sub-category",
  "competitors": [
    { "name": "Company Name", "domain": "example.com", "strength": "What they do well that makes them a strong competitor" }
  ],
  "insight": "2-3 sentences analyzing the competitive landscape. What do the top competitors have in common? Where are customers potentially underserved? Where does this business have an opportunity to differentiate and win?",
  "channels": [
    { "name": "Direct", "percentage": 40 },
    { "name": "Organic Search", "percentage": 25 },
    { "name": "Paid Search", "percentage": 15 },
    { "name": "Social", "percentage": 10 },
    { "name": "Referral", "percentage": 5 },
    { "name": "Email", "percentage": 3 },
    { "name": "Display", "percentage": 2 }
  ],
  "topPlayer": "Name of the dominant competitor in this market",
  "keywords": [
    { "keyword": "example keyword", "intent": "C", "position": 1, "volume": "3.6K", "cpc": 0.28, "traffic": 5.16 }
  ],
  "totalKeywords": 8311
}

Rules:
- Do NOT include the analyzed website itself in the competitors list
- Competitors must be the same TYPE of business (retailer vs retailer, service vs service)
- Prefer competitors in the same geographic market when the business is local/regional
- Be specific with the sub-industry (e.g. "Fine Jewelry Retail" not just "Retail")
- Keep each "strength" under 15 words
- The "insight" should read like strategic consulting advice, not generic filler
- For "channels": estimate the typical traffic channel distribution for this specific industry/niche. Percentages must sum to 100. Use your knowledge of how businesses in this industry typically acquire traffic. Include channels like Direct, Organic Search, Paid Search, Social, Referral, Email, Display, AI Traffic as relevant. Only include channels with >= 2%.
- "topPlayer": name the single strongest competitor (the market leader) in this space
- For "keywords": estimate the top 8 organic keywords this website likely ranks for, based on its content, industry, and domain. For each keyword provide: "keyword" (the search term), "intent" (N=Navigational, C=Commercial, I=Informational, T=Transactional), "position" (estimated Google rank 1-100), "volume" (monthly search volume as string like "3.6K" or "22.2K"), "cpc" (estimated cost per click in USD), "traffic" (estimated monthly traffic percentage from this keyword). Sort by traffic descending.
- "totalKeywords": estimate the total number of organic keywords this domain likely ranks for`;

  try {
    let res: Response | null = null;

    for (const model of models) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        console.log("Anthropic model used:", model);
        break;
      }

      const errText = await res.text().catch(() => "");
      console.error(`Anthropic model ${model} failed:`, res.status, errText.slice(0, 200));

      if (res.status !== 404) break;
    }

    if (!res || !res.ok) return null;

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Anthropic response not JSON:", text.slice(0, 200));
      return null;
    }
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.industry || !Array.isArray(parsed.competitors)) return null;

    return {
      industry: parsed.industry,
      subIndustry: parsed.subIndustry ?? parsed.industry,
      competitors: parsed.competitors.slice(0, 5).map((c: { name: string; domain: string; strength: string }) => ({
        name: c.name,
        domain: c.domain,
        strength: c.strength,
      })),
      insight: parsed.insight ?? "",
      channels: Array.isArray(parsed.channels)
        ? parsed.channels.map((ch: { name: string; percentage: number }) => ({
            name: ch.name,
            percentage: ch.percentage,
          }))
        : [],
      topPlayer: parsed.topPlayer ?? "",
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.slice(0, 8).map((kw: Keyword) => ({
            keyword: kw.keyword,
            intent: kw.intent,
            position: kw.position,
            volume: kw.volume,
            cpc: kw.cpc,
            traffic: kw.traffic,
          }))
        : [],
      totalKeywords: parsed.totalKeywords ?? 0,
    };
  } catch (err) {
    console.error("Industry analysis failed:", err);
    return null;
  }
}

async function fetchGoogleTrends(
  brandName: string,
  competitors: Competitor[],
): Promise<TrendsData> {
  try {
    const topCompetitors = competitors.slice(0, 3).map((c) => c.name);
    const keywords = [brandName, ...topCompetitors];

    const raw = await googleTrends.interestOverTime({
      keyword: keywords,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      geo: "",
    });

    const data = JSON.parse(raw);
    const timelineData = data.default?.timelineData ?? [];

    if (timelineData.length === 0) return null;

    const timeline: TrendPoint[] = timelineData.map(
      (point: { formattedTime: string; value: number[] }) => ({
        date: point.formattedTime,
        values: point.value,
      }),
    );

    return { keywords, timeline };
  } catch (err) {
    console.error("Google Trends failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const { url: rawUrl, name, email } = body as {
    url?: string;
    name?: string;
    email?: string;
  };
  const url = normalizeUrl(rawUrl ?? "");

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid website URL." },
      { status: 400 },
    );
  }

  const [meta, pageSpeed] = await Promise.all([
    fetchPageMeta(url),
    fetchPageSpeed(url),
  ]);

  const domain = new URL(url).hostname;
  let fallbackContent: string | null = null;
  let googleSearchData: string | null = null;
  if (!meta) {
    console.log("Direct fetch failed, trying fallbacks for", url);
    const [jina, wayback, siteClues, googleResults] = await Promise.all([
      fetchViaJinaReader(url),
      fetchViaWaybackMachine(url),
      fetchSiteClues(url),
      fetchGoogleSearchResults(domain),
    ]);
    fallbackContent = jina ?? wayback ?? siteClues;
    googleSearchData = googleResults;
    if (fallbackContent) console.log("Fallback content:", fallbackContent.length, "chars");
    if (googleSearchData) console.log("Google Search data:", googleSearchData.length, "chars");
  }

  const hasAnyData = meta || pageSpeed || fallbackContent;
  const canRunAI = !!process.env.ANTHROPIC_API_KEY;

  if (!hasAnyData && !canRunAI) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to analyze this website. Please check the URL and make sure the site is accessible.",
      },
      { status: 422 },
    );
  }

  const scores = pageSpeed?.scores ?? {
    performance: null,
    seo: null,
    accessibility: null,
    bestPractices: null,
  };

  const vitals = pageSpeed?.vitals ?? {
    lcp: null,
    cls: null,
    fcp: null,
    si: null,
    tbt: null,
    tti: null,
  };

  const metaData = meta ?? {
    title: null,
    titleLength: 0,
    description: null,
    descriptionLength: 0,
    h1: null,
    h1Count: 0,
    hasCanonical: false,
    hasOgTags: false,
    hasTwitterCards: false,
    hasSchemaMarkup: false,
    hasViewport: false,
    isHttps: url.startsWith("https"),
    robotsMeta: null,
    imageCount: 0,
    imagesWithAlt: 0,
    imagesWithoutAlt: 0,
  };

  const industry = await fetchIndustryAnalysis(
    url,
    meta?.title ?? null,
    meta?.description ?? null,
    meta?.h1 ?? null,
    meta?.bodyText ?? fallbackContent,
    meta?.structuredData ?? null,
    googleSearchData,
  );

  const brandName =
    meta?.title?.split(/[|\-–—]/)[0]?.trim() ??
    new URL(url).hostname.replace(/^www\./, "").split(".")[0];

  const trends =
    industry && industry.competitors.length > 0
      ? await fetchGoogleTrends(brandName, industry.competitors)
      : null;

  const result: AuditResult = {
    url,
    scores,
    vitals,
    meta: metaData,
    industry,
    trends,
  };

  if (name && email && process.env.RESEND_API_KEY) {
    const to = process.env.CONTACT_TO_EMAIL || "john@apereel.com";
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [to],
        subject: `Audit lead: ${name} — ${url}`,
        text: [
          `New audit lead`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Website: ${url}`,
          ``,
          `Industry: ${industry?.industry ?? "N/A"}`,
          `Sub-industry: ${industry?.subIndustry ?? "N/A"}`,
          `Top competitor: ${industry?.topPlayer ?? "N/A"}`,
          ``,
          `Performance: ${scores.performance ?? "N/A"}`,
          `SEO: ${scores.seo ?? "N/A"}`,
          `Accessibility: ${scores.accessibility ?? "N/A"}`,
        ].join("\n"),
      }),
    }).catch((err) => console.error("Audit notification email failed:", err));
  }

  return NextResponse.json({ ok: true, data: result });
}
