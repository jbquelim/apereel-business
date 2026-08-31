#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { config } from "./config.mjs";

const file = process.argv[2];
if (!file) {
  console.log("Usage: node import-csv.mjs <file.csv>");
  console.log(
    "\nCSV columns: company, jobTitle, location, website, email, contactName",
  );
  console.log("First row must be headers. Comma-separated.\n");
  console.log("Example:");
  console.log(
    '  company,jobTitle,location,website,email,contactName\n  "Acme Corp","Marketing Director","Toronto, ON","acme.com","","Jane Smith"',
  );
  process.exit(1);
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const raw = readFileSync(file, "utf-8").trim().split("\n");
const headers = parseCsvLine(raw[0]).map((h) => h.toLowerCase().replace(/\s+/g, ""));

const leads = existsSync(config.paths.leads)
  ? JSON.parse(readFileSync(config.paths.leads, "utf-8"))
  : [];

const seen = new Set(leads.map((l) => l.company.toLowerCase()));
const excluded = config.exclude.map((e) => e.toLowerCase());
let added = 0;

for (let i = 1; i < raw.length; i++) {
  const fields = parseCsvLine(raw[i]);
  const row = {};
  headers.forEach((h, j) => (row[h] = fields[j] || ""));

  const company = row.company || "";
  if (!company) continue;

  const key = company.toLowerCase();
  if (seen.has(key)) continue;
  if (excluded.some((ex) => key.includes(ex))) continue;

  seen.add(key);
  added++;

  leads.push({
    id: `lead-${Date.now()}-${added}`,
    company,
    jobTitle: row.jobtitle || row.job_title || row.title || "",
    location: row.location || "",
    source: "csv-import",
    sourceUrl: "",
    query: "",
    scrapedAt: new Date().toISOString(),
    status: "new",
    contactName: row.contactname || row.contact_name || row.contact || "",
    email: row.email || "",
    website: row.website || row.url || "",
    notes: "",
  });
}

writeFileSync(config.paths.leads, JSON.stringify(leads, null, 2));
console.log(`Imported ${added} new companies (${leads.length} total).`);
