#!/usr/bin/env node
import { createTransport } from "nodemailer";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Data helpers ────────────────────────────────────────────────────
function loadLeads() {
  if (!existsSync(config.paths.leads)) return [];
  return JSON.parse(readFileSync(config.paths.leads, "utf-8"));
}

function saveLeads(leads) {
  writeFileSync(config.paths.leads, JSON.stringify(leads, null, 2));
}

function loadSent() {
  if (!existsSync(config.paths.sent)) return [];
  return JSON.parse(readFileSync(config.paths.sent, "utf-8"));
}

function saveSent(sent) {
  writeFileSync(config.paths.sent, JSON.stringify(sent, null, 2));
}

// ── Template engine ─────────────────────────────────────────────────
function loadTemplate(name) {
  const path = join(config.paths.templates, `${name}.html`);
  if (!existsSync(path)) {
    console.error(`Template not found: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, "utf-8");
}

function renderTemplate(template, vars) {
  let html = template;
  // Conditional blocks: {{#key}}content{{/key}} — shown only if key is truthy
  html = html.replace(
    /\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs,
    (_match, key, content) => (vars[key] ? content : ""),
  );
  // Variable substitution: {{key}}
  html = html.replace(/\{\{(\w+)\}\}/g, (_match, key) => vars[key] || "");
  return html;
}

function subjectLine(lead, step) {
  const company = lead.company;
  const title = lead.jobTitle || "marketing hire";

  if (step === "initial") {
    return lead.source === "indeed" || lead.jobTitle
      ? `Before you hire a ${title}`
      : `Quick question about ${company}'s growth`;
  }
  if (step === "followup-1") return `Re: ${company}`;
  if (step === "followup-2") return `Last note — ${company}`;
  return `${company} — growth opportunity`;
}

function templateForStep(lead, step) {
  if (step === "initial") {
    return lead.jobTitle ? "initial" : "general";
  }
  return step;
}

// ── Resend API ─────────────────────────────────────────────────────
async function sendViaResend(to, subject, html, lead) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${config.outreach.from.name} <noreply@apereel.com>`,
      to: [to.trim()],
      reply_to: config.outreach.replyTo,
      subject,
      html,
      headers: { "X-Lead-Id": lead.id },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend ${res.status}: ${err}`);
  }
}

// ── SMTP (fallback) ────────────────────────────────────────────────
function createMailer() {
  if (!config.outreach.smtp.auth.user || !config.outreach.smtp.auth.pass) {
    console.error(
      "SMTP credentials not set and no RESEND_API_KEY found.\nSet RESEND_API_KEY in .env or fill in SMTP credentials.",
    );
    process.exit(1);
  }
  return createTransport(config.outreach.smtp);
}

async function sendEmail(mailer, to, subject, html, lead) {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(to, subject, html, lead);
  }
  const msg = {
    from: `"${config.outreach.from.name}" <${config.outreach.from.email}>`,
    replyTo: config.outreach.replyTo,
    to,
    subject,
    html,
    headers: {
      "X-Lead-Id": lead.id,
      "List-Unsubscribe": `<mailto:${config.outreach.replyTo}?subject=unsubscribe>`,
    },
  };
  return mailer.sendMail(msg);
}

// ── Commands ────────────────────────────────────────────────────────
async function cmdSend(dryRun = false) {
  const leads = loadLeads();
  const sent = loadSent();
  const sentMap = new Map();
  for (const s of sent) {
    if (!sentMap.has(s.leadId)) sentMap.set(s.leadId, []);
    sentMap.get(s.leadId).push(s);
  }

  // Find leads ready to email
  const ready = leads.filter((l) => {
    if (!l.email || l.status === "unsubscribed" || l.status === "replied")
      return false;

    const history = sentMap.get(l.id) || [];
    if (history.length === 0) return true; // never emailed

    // Check for follow-ups
    const lastSent = new Date(history[history.length - 1].sentAt);
    const daysSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
    const nextFollowUp = config.outreach.followUpDays[history.length - 1];

    return nextFollowUp && daysSince >= nextFollowUp;
  });

  console.log(
    `=== Outreach${dryRun ? " (DRY RUN)" : ""} ===\n`,
  );
  console.log(`Leads with email: ${leads.filter((l) => l.email).length}`);
  console.log(`Ready to send: ${ready.length}`);
  console.log(`Already sent: ${sent.length}\n`);

  if (ready.length === 0) {
    console.log("Nothing to send. Run `node enrich.mjs` to add emails.\n");
    return;
  }

  const mailer = dryRun ? null : (process.env.RESEND_API_KEY ? null : createMailer());
  let sentToday = sent.filter((s) => {
    const d = new Date(s.sentAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  let count = 0;

  for (const lead of ready) {
    if (sentToday >= config.outreach.maxPerDay) {
      console.log(`  Daily limit reached (${config.outreach.maxPerDay}). Resume tomorrow.`);
      break;
    }

    const history = sentMap.get(lead.id) || [];
    const steps = ["initial", "followup-1", "followup-2"];
    const step = steps[history.length] || "initial";
    const tplName = templateForStep(lead, step);
    const template = loadTemplate(tplName);
    const subject = subjectLine(lead, step);

    const vars = {
      company: lead.company,
      jobTitle: lead.jobTitle || "marketing role",
      contactName: lead.contactName,
      location: lead.location,
    };

    const html = renderTemplate(template, vars);

    if (dryRun) {
      console.log(`  [DRY] ${lead.email} — "${subject}" (${step})`);
    } else {
      try {
        await sendEmail(mailer, lead.email, subject, html, lead);
        console.log(`  ✓ ${lead.email} — "${subject}" (${step})`);

        sent.push({
          leadId: lead.id,
          email: lead.email,
          step,
          subject,
          sentAt: new Date().toISOString(),
        });
        sentToday++;
        count++;

        lead.status = step === "initial" ? "contacted" : "followed-up";
      } catch (err) {
        console.log(`  ✗ ${lead.email} — ${err.message}`);
        lead.notes = `Send error: ${err.message}`;
      }
    }

    if (!dryRun) {
      await sleep(config.outreach.delayBetweenMs);
    }
  }

  if (!dryRun) {
    saveSent(sent);
    saveLeads(leads);
    console.log(`\nSent ${count} emails today (${sentToday} total today).`);
  } else {
    console.log(`\nWould send ${ready.length} emails. Run without --dry to send.`);
  }
}

function cmdStatus() {
  const leads = loadLeads();
  const sent = loadSent();

  const byStatus = {};
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
  }

  console.log("=== Lead Status ===\n");
  console.log(`Total leads: ${leads.length}`);
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log(`\nTotal emails sent: ${sent.length}`);

  const today = new Date().toDateString();
  const sentToday = sent.filter(
    (s) => new Date(s.sentAt).toDateString() === today,
  ).length;
  console.log(`Sent today: ${sentToday}/${config.outreach.maxPerDay}`);

  // Show next follow-ups due
  const sentMap = new Map();
  for (const s of sent) {
    if (!sentMap.has(s.leadId)) sentMap.set(s.leadId, []);
    sentMap.get(s.leadId).push(s);
  }

  let followUpsDue = 0;
  for (const lead of leads) {
    const history = sentMap.get(lead.id) || [];
    if (history.length === 0 || history.length > 2) continue;
    const lastSent = new Date(history[history.length - 1].sentAt);
    const daysSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
    const nextFollowUp = config.outreach.followUpDays[history.length - 1];
    if (nextFollowUp && daysSince >= nextFollowUp) followUpsDue++;
  }
  console.log(`Follow-ups due: ${followUpsDue}\n`);
}

function cmdUnsubscribe(email) {
  const leads = loadLeads();
  let found = false;
  for (const lead of leads) {
    if (lead.email && lead.email.toLowerCase() === email.toLowerCase()) {
      lead.status = "unsubscribed";
      found = true;
      console.log(`Unsubscribed: ${lead.company} (${lead.email})`);
    }
  }
  if (!found) {
    console.log(`No lead found with email: ${email}`);
  } else {
    saveLeads(leads);
  }
}

function cmdExportCsv() {
  const leads = loadLeads();
  const header =
    "company,jobTitle,location,email,contactName,website,status,source";
  const rows = leads.map(
    (l) =>
      `"${l.company}","${l.jobTitle}","${l.location}","${l.email}","${l.contactName}","${l.website}","${l.status}","${l.source}"`,
  );
  const csv = [header, ...rows].join("\n");
  const path = config.paths.leads.replace(".json", ".csv");
  writeFileSync(path, csv);
  console.log(`Exported ${leads.length} leads to ${path}`);
}

// ── CLI ─────────────────────────────────────────────────────────────
const cmd = process.argv[2] || "help";

switch (cmd) {
  case "send":
    await cmdSend(false);
    break;
  case "dry":
  case "--dry":
  case "preview":
    await cmdSend(true);
    break;
  case "status":
    cmdStatus();
    break;
  case "unsubscribe":
    cmdUnsubscribe(process.argv[3]);
    break;
  case "export":
    cmdExportCsv();
    break;
  default:
    console.log("Apereel Lead Gen — Outreach\n");
    console.log("Commands:");
    console.log("  node outreach.mjs send        Send emails to ready leads");
    console.log("  node outreach.mjs dry         Preview what would be sent");
    console.log("  node outreach.mjs status      Show pipeline status");
    console.log("  node outreach.mjs unsubscribe <email>");
    console.log("  node outreach.mjs export      Export leads to CSV\n");
    console.log("Setup:");
    console.log("  1. cp .env.example .env");
    console.log("  2. Fill in SMTP credentials");
    console.log("  3. Run `node scrape.mjs` to find leads");
    console.log("  4. Run `node enrich.mjs` to find emails");
    console.log("  5. Run `node outreach.mjs dry` to preview");
    console.log("  6. Run `node outreach.mjs send` to send\n");
}
