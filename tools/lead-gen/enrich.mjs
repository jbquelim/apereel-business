#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { config } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadLeads() {
  if (!existsSync(config.paths.leads)) {
    console.log("No leads found. Run `node scrape.mjs` first.");
    process.exit(1);
  }
  return JSON.parse(readFileSync(config.paths.leads, "utf-8"));
}

function saveLeads(leads) {
  writeFileSync(config.paths.leads, JSON.stringify(leads, null, 2));
}

// ── Hunter.io email finder ──────────────────────────────────────────
async function hunterDomainSearch(domain) {
  if (!config.hunterApiKey) return null;
  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${config.hunterApiKey}&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const emails = data?.data?.emails || [];
    // Prefer marketing/business roles
    const preferred = emails.find((e) =>
      /market|business|growth|director|manag|found|ceo|owner/i.test(
        e.position || "",
      ),
    );
    return preferred || emails[0] || null;
  } catch (_e) {
    return null;
  }
}

// ── Website finder via Google ───────────────────────────────────────
async function findWebsite(company, location) {
  const query = `${company} ${location} official website`;
  try {
    const res = await fetch(
      `https://www.google.com/search?q=${encodeURIComponent(query)}&num=3`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
      },
    );
    if (!res.ok) return "";
    const html = await res.text();
    // Extract first non-google/indeed/linkedin URL
    const urls = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter(
        (u) =>
          !u.includes("google.") &&
          !u.includes("indeed.") &&
          !u.includes("linkedin.") &&
          !u.includes("youtube.") &&
          !u.includes("facebook.") &&
          !u.includes("twitter.") &&
          !u.includes("instagram."),
      );
    if (urls.length > 0) {
      const url = new URL(urls[0]);
      return url.hostname.replace(/^www\./, "");
    }
  } catch (_e) {
    /* ignore */
  }
  return "";
}

// ── Generate common email patterns ─────────────────────────────────
function generateEmailPatterns(domain, contactName) {
  const patterns = [
    `info@${domain}`,
    `hello@${domain}`,
    `contact@${domain}`,
    `marketing@${domain}`,
  ];
  if (contactName) {
    const parts = contactName.toLowerCase().split(/\s+/);
    if (parts.length >= 2) {
      const [first, last] = [parts[0], parts[parts.length - 1]];
      patterns.unshift(
        `${first}@${domain}`,
        `${first}.${last}@${domain}`,
        `${first[0]}${last}@${domain}`,
      );
    }
  }
  return patterns;
}

// ── Main enrichment loop ────────────────────────────────────────────
async function enrich() {
  const leads = loadLeads();
  const toEnrich = leads.filter((l) => l.status === "new" && !l.email);

  console.log(`=== Enriching ${toEnrich.length} leads ===\n`);
  let enriched = 0;

  for (const lead of toEnrich) {
    process.stdout.write(`  ${lead.company} ... `);

    // Step 1: find website if missing
    if (!lead.website) {
      lead.website = await findWebsite(lead.company, lead.location);
      await sleep(2000);
    }

    if (!lead.website) {
      console.log("no website found — skip");
      continue;
    }

    // Step 2: try Hunter.io for verified email
    if (config.hunterApiKey) {
      const result = await hunterDomainSearch(lead.website);
      if (result) {
        lead.email = result.value;
        lead.contactName = lead.contactName || [result.first_name, result.last_name].filter(Boolean).join(" ");
        console.log(`${lead.email} (Hunter.io)`);
        enriched++;
        await sleep(1000);
        continue;
      }
    }

    // Step 3: generate email pattern guesses
    const patterns = generateEmailPatterns(lead.website, lead.contactName);
    lead.email = patterns[0]; // best guess
    lead.emailPatterns = patterns.slice(0, 4);
    console.log(`${lead.email} (pattern guess)`);
    enriched++;

    await sleep(1500);
  }

  saveLeads(leads);
  console.log(`\n--- Done ---`);
  console.log(`Enriched: ${enriched}`);
  console.log(`Leads without email: ${leads.filter((l) => !l.email).length}`);
  console.log(`\nReview leads in: ${config.paths.leads}`);
  console.log(
    "Edit emails manually for higher accuracy before running outreach.\n",
  );

  if (!config.hunterApiKey) {
    console.log(
      "Tip: Set HUNTER_API_KEY in .env for verified email addresses.",
    );
    console.log("     Free tier: 25 lookups/month at hunter.io\n");
  }
}

enrich();
