#!/usr/bin/env node
import { load } from "cheerio";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { config } from "./config.mjs";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8",
  "Accept-Encoding": "identity",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

function loadLeads() {
  if (existsSync(config.paths.leads)) {
    return JSON.parse(readFileSync(config.paths.leads, "utf-8"));
  }
  return [];
}

function saveLeads(leads) {
  writeFileSync(config.paths.leads, JSON.stringify(leads, null, 2));
}

function isExcluded(name) {
  const lower = name.toLowerCase();
  return config.exclude.some((ex) => lower.includes(ex));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Indeed HTML parser ──────────────────────────────────────────────
function parseIndeedPage(html) {
  const jobs = [];
  const $ = load(html);

  // Strategy 1 — embedded JSON (most reliable)
  $("script").each((_i, script) => {
    const text = $(script).html() || "";
    const match = text.match(
      /window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{.+?\});\s*$/ms,
    );
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const results =
          data?.metaData?.mosaicProviderJobCardsModel?.results || [];
        for (const r of results) {
          if (r.company) {
            jobs.push({
              company: r.company.trim(),
              title: (r.title || r.displayTitle || "").trim(),
              location: (r.formattedLocation || "").trim(),
              url: r.link
                ? `${config.indeed.baseUrl}${r.link}`
                : "",
            });
          }
        }
      } catch (_e) {
        /* parse failure — fall through */
      }
    }
  });

  if (jobs.length > 0) return jobs;

  // Strategy 2 — DOM selectors (fallback)
  const selectorSets = [
    {
      card: ".job_seen_beacon",
      company: '[data-testid="company-name"]',
      title: ".jobTitle",
      location: '[data-testid="text-location"]',
    },
    {
      card: ".resultContent",
      company: ".companyName",
      title: ".jobTitle",
      location: ".companyLocation",
    },
    {
      card: ".result",
      company: ".company",
      title: ".jobtitle",
      location: ".location",
    },
  ];

  for (const sel of selectorSets) {
    $(sel.card).each((_i, el) => {
      const company = $(el).find(sel.company).text().trim();
      const title = $(el).find(sel.title).text().trim();
      const location = $(el).find(sel.location).text().trim();
      if (company) {
        jobs.push({ company, title, location, url: "" });
      }
    });
    if (jobs.length > 0) break;
  }

  if (jobs.length > 0) return jobs;

  // Strategy 3 — regex fallback
  const rx = /data-testid="company-name"[^>]*>([^<]+)</g;
  for (const m of html.matchAll(rx)) {
    const company = m[1].trim();
    if (company.length > 1 && company.length < 120) {
      jobs.push({ company, title: "", location: "", url: "" });
    }
  }

  return jobs;
}

// ── Main scraper ────────────────────────────────────────────────────
async function scrapeIndeed() {
  console.log("=== Apereel Lead Gen — Indeed Scraper ===\n");

  const leads = loadLeads();
  const seen = new Set(leads.map((l) => l.company.toLowerCase()));
  let added = 0;
  let blocked = false;

  for (const query of config.indeed.queries) {
    if (blocked) break;

    for (const location of config.indeed.locations) {
      if (blocked) break;

      for (let page = 0; page < config.indeed.maxPages; page++) {
        const start = page * 10;
        const url = `${config.indeed.baseUrl}/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&start=${start}`;

        process.stdout.write(
          `  ${query} / ${location} p${page + 1} ... `,
        );

        try {
          const res = await fetch(url, { headers: HEADERS, redirect: "follow" });

          if (res.status === 403 || res.status === 429) {
            console.log("BLOCKED (rate limited)");
            blocked = true;
            break;
          }
          if (!res.ok) {
            console.log(`HTTP ${res.status}`);
            continue;
          }

          const html = await res.text();

          if (html.includes("captcha") || html.includes("unusual traffic")) {
            console.log("CAPTCHA detected — stopping");
            blocked = true;
            break;
          }

          const jobs = parseIndeedPage(html);
          let pageNew = 0;

          for (const job of jobs) {
            const key = job.company.toLowerCase();
            if (seen.has(key) || isExcluded(key)) continue;
            seen.add(key);
            pageNew++;
            added++;

            leads.push({
              id: `lead-${Date.now()}-${added}`,
              company: job.company,
              jobTitle: job.title,
              location: job.location,
              source: "indeed",
              sourceUrl: job.url,
              query,
              scrapedAt: new Date().toISOString(),
              status: "new",
              contactName: "",
              email: "",
              website: "",
              notes: "",
            });
          }

          console.log(`${jobs.length} listings, +${pageNew} new`);
        } catch (err) {
          console.log(`error: ${err.message}`);
        }

        await sleep(config.indeed.delayMs + Math.random() * 2000);
      }
    }
  }

  saveLeads(leads);

  console.log(`\n--- Results ---`);
  console.log(`New companies added: ${added}`);
  console.log(`Total leads: ${leads.length}`);
  console.log(`Saved to: ${config.paths.leads}`);

  if (blocked) {
    console.log(
      "\n⚠  Indeed blocked further requests. Wait 15-30 min before retrying.",
    );
    console.log(
      "   You can also import leads manually — see CSV import below.\n",
    );
  }

  // Always print LinkedIn URLs for manual prospecting
  printLinkedInUrls();
}

// ── LinkedIn URL generator ──────────────────────────────────────────
function printLinkedInUrls() {
  console.log("\n=== LinkedIn — Open these to prospect manually ===\n");
  for (const query of config.linkedin.queries) {
    for (const [label, geoId] of Object.entries(config.linkedin.geoIds)) {
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&geoId=${geoId}&f_TPR=r604800`;
      console.log(`  ${query} (${label}):`);
      console.log(`  ${url}\n`);
    }
  }
  console.log(
    "Tip: On LinkedIn, note the company names and add them to data/leads.json",
  );
  console.log(
    '     or run: node import-csv.mjs to import from a spreadsheet.\n',
  );
}

// ── CSV import helper ───────────────────────────────────────────────
function printImportHelp() {
  console.log("=== Manual Import ===");
  console.log(
    "Create a CSV with columns: company, jobTitle, location, website, email",
  );
  console.log("Then run: node import-csv.mjs yourfile.csv\n");
}

// ── Run ─────────────────────────────────────────────────────────────
const cmd = process.argv[2];
if (cmd === "linkedin") {
  printLinkedInUrls();
} else if (cmd === "help") {
  printImportHelp();
} else {
  scrapeIndeed();
}
