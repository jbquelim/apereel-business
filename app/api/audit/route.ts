import { NextResponse } from "next/server";

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

type IndustryAnalysis = {
  industry: string;
  subIndustry: string;
  competitors: Competitor[];
  insight: string;
  channels: Channel[];
  topPlayer: string;
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
  findings: { type: "pass" | "warn" | "fail"; message: string }[];
  industry: IndustryAnalysis;
};

async function fetchPageMeta(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ApereelAudit/1.0; +https://apereel.com)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

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
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
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
): Promise<IndustryAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const domain = new URL(url).hostname;
  const signals = [
    title && `Title: ${title}`,
    description && `Description: ${description}`,
    h1 && `H1: ${h1}`,
    `Domain: ${domain}`,
  ]
    .filter(Boolean)
    .join("\n");

  const models = [
    "claude-sonnet-4-20250514",
    "claude-haiku-4-5-20251001",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
  ];

  const prompt = `Analyze this website and identify its industry, then provide competitive intelligence including top 5 direct competitors and market traffic channel estimates.

Website signals:
${signals}

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
  "topPlayer": "Name of the dominant competitor in this market"
}

Rules:
- Do NOT include the analyzed website itself in the competitors list
- Competitors must be the same TYPE of business (retailer vs retailer, service vs service)
- Prefer competitors in the same geographic market when the business is local/regional
- Be specific with the sub-industry (e.g. "Fine Jewelry Retail" not just "Retail")
- Keep each "strength" under 15 words
- The "insight" should read like strategic consulting advice, not generic filler
- For "channels": estimate the typical traffic channel distribution for this specific industry/niche. Percentages must sum to 100. Use your knowledge of how businesses in this industry typically acquire traffic. Include channels like Direct, Organic Search, Paid Search, Social, Referral, Email, Display, AI Traffic as relevant. Only include channels with >= 2%.
- "topPlayer": name the single strongest competitor (the market leader) in this space`;

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
          max_tokens: 900,
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
    };
  } catch (err) {
    console.error("Industry analysis failed:", err);
    return null;
  }
}

function generateFindings(meta: AuditResult["meta"], scores: AuditResult["scores"]): AuditResult["findings"] {
  const findings: AuditResult["findings"] = [];

  if (meta.isHttps) {
    findings.push({ type: "pass", message: "Site uses HTTPS" });
  } else {
    findings.push({ type: "fail", message: "Site does not use HTTPS — critical for SEO and trust" });
  }

  if (meta.title) {
    if (meta.titleLength >= 30 && meta.titleLength <= 60) {
      findings.push({ type: "pass", message: `Title tag is well-optimized (${meta.titleLength} chars)` });
    } else if (meta.titleLength < 30) {
      findings.push({ type: "warn", message: `Title tag is too short (${meta.titleLength} chars) — aim for 30-60` });
    } else {
      findings.push({ type: "warn", message: `Title tag is too long (${meta.titleLength} chars) — may be truncated in search results` });
    }
  } else {
    findings.push({ type: "fail", message: "Missing title tag — critical for search rankings" });
  }

  if (meta.description) {
    if (meta.descriptionLength >= 120 && meta.descriptionLength <= 160) {
      findings.push({ type: "pass", message: `Meta description is well-optimized (${meta.descriptionLength} chars)` });
    } else if (meta.descriptionLength < 120) {
      findings.push({ type: "warn", message: `Meta description is short (${meta.descriptionLength} chars) — aim for 120-160` });
    } else {
      findings.push({ type: "warn", message: `Meta description is long (${meta.descriptionLength} chars) — may be truncated` });
    }
  } else {
    findings.push({ type: "fail", message: "Missing meta description — hurts click-through rates from search" });
  }

  if (meta.h1Count === 1) {
    findings.push({ type: "pass", message: "Page has exactly one H1 tag" });
  } else if (meta.h1Count === 0) {
    findings.push({ type: "fail", message: "Missing H1 tag — important for page structure and SEO" });
  } else {
    findings.push({ type: "warn", message: `Page has ${meta.h1Count} H1 tags — best practice is exactly one` });
  }

  if (meta.hasCanonical) {
    findings.push({ type: "pass", message: "Canonical URL is set" });
  } else {
    findings.push({ type: "warn", message: "Missing canonical tag — risk of duplicate content issues" });
  }

  if (meta.hasViewport) {
    findings.push({ type: "pass", message: "Viewport meta tag is set (mobile-friendly)" });
  } else {
    findings.push({ type: "fail", message: "Missing viewport meta tag — site may not be mobile-friendly" });
  }

  if (meta.hasOgTags) {
    findings.push({ type: "pass", message: "Open Graph tags found (social sharing optimized)" });
  } else {
    findings.push({ type: "warn", message: "Missing Open Graph tags — social shares will look plain" });
  }

  if (meta.hasSchemaMarkup) {
    findings.push({ type: "pass", message: "Structured data (Schema.org) detected" });
  } else {
    findings.push({ type: "warn", message: "No structured data found — missing rich snippet opportunities" });
  }

  if (meta.imageCount > 0) {
    if (meta.imagesWithoutAlt === 0) {
      findings.push({ type: "pass", message: `All ${meta.imageCount} images have alt text` });
    } else {
      findings.push({
        type: "warn",
        message: `${meta.imagesWithoutAlt} of ${meta.imageCount} images missing alt text — hurts accessibility and image SEO`,
      });
    }
  }

  if (meta.robotsMeta && /noindex/i.test(meta.robotsMeta)) {
    findings.push({ type: "fail", message: "Page is set to noindex — it will not appear in search results" });
  }

  if (scores.performance !== null) {
    if (scores.performance >= 90) {
      findings.push({ type: "pass", message: `Performance score: ${scores.performance}/100` });
    } else if (scores.performance >= 50) {
      findings.push({ type: "warn", message: `Performance score: ${scores.performance}/100 — room for improvement` });
    } else {
      findings.push({ type: "fail", message: `Performance score: ${scores.performance}/100 — significantly impacting user experience` });
    }
  }

  return findings;
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

  const { url: rawUrl } = body as { url?: string };
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

  if (!meta && !pageSpeed) {
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

  const findings = generateFindings(metaData, scores);

  const industry = meta
    ? await fetchIndustryAnalysis(url, meta.title, meta.description, meta.h1)
    : null;

  const result: AuditResult = {
    url,
    scores,
    vitals,
    meta: metaData,
    findings,
    industry,
  };

  return NextResponse.json({ ok: true, data: result });
}
