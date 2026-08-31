#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { config } from "./config.mjs";

const leads = JSON.parse(readFileSync(config.paths.leads, "utf-8"));

// Known domain mappings for common companies
const KNOWN = {
  "staples": "staples.ca",
  "tangerine bank": "tangerine.ca",
  "bmo financial group": "bmo.com",
  "sun life": "sunlife.ca",
  "fidelity investments": "fidelity.ca",
  "moneris solutions": "moneris.com",
  "intact": "intact.ca",
  "bc hydro": "bchydro.com",
  "nespresso": "nespresso.com",
  "accenture": "accenture.com",
  "kpmg": "kpmg.ca",
  "expedia": "expedia.ca",
  "marriott international, inc": "marriott.com",
  "arc'teryx": "arcteryx.com",
  "7-eleven": "7-eleven.com",
  "opentext": "opentext.com",
  "brother canada": "brother.ca",
  "vancouver airport authority": "yvr.ca",
  "gowling wlg": "gowlingwlg.com",
  "qnap inc.": "qnap.com",
  "blundstone canada / tin shack ltd.": "blundstone.ca",
  "dash social": "dashsocial.com",
  "pakfactory": "pakfactory.com",
  "gentec international": "gentec-intl.com",
  "motion recruitment": "motionrecruitment.com",
  "directive": "directiveconsulting.com",
  "tp canada": "teleperformance.com",
  "accuenergy canada inc": "accuenergy.com",
  "onecore media": "onecoremedia.com",
  "eventmobi": "eventmobi.com",
  "organika health products inc": "organika.com",
  "midnight marketing": "midnightmarketing.co",
  "wellwise": "wellwise.ca",
  "fitness world": "fitnessworld.ca",
  "fill it forward": "fillitforward.com",
  "swoon group": "swoongroup.com",
  "dot & company": "dotandcompany.co",
  "let's get moving": "letsgetmoving.ca",
  "soneil spark": "soneilspark.com",
  "centra install pros": "centrainstallpros.com",
  "raute canada ltd": "raute.com",
  "canada weather gear": "canadaweathergear.com",
  "tea squared inc": "teasquared.ca",
  "vgw canada": "vgw.co",
  "alphapay": "alphapay.ca",
  "medianv": "medianv.com",
  "supreme optimization": "supremeoptimization.com",
  "pressure washing marketing pros": "pressurewashingmarketingpros.com",
  "meitou inc.": "meitou.ca",
  "clinicgrower": "clinicgrower.com",
  "vancouver city savings credit union": "vancity.com",
  "manitoulin group of companies": "manitoulingroup.com",
  "big boys with cool toys": "bigboyswithcooltoys.com",
  "figure skating boutique": "figureskatingboutique.com",
  "a1 global college of health, business & technology": "a1global.ca",
  "jrs college of business and health care inc.": "jrscollege.com",
  "the travel agent next door": "thetravelagentnextdoor.com",
  "allied technical solutions": "alliedtechnicalsolutions.com",
  "software analyst cyber research": "softwareanalyst.ca",
};

let enriched = 0;

for (const lead of leads) {
  const key = lead.company.toLowerCase();

  // Skip already enriched
  if (lead.website && lead.email) continue;

  const domain = KNOWN[key];
  if (domain) {
    lead.website = domain;
    lead.email = `info@${domain}`;
    enriched++;
  }
}

writeFileSync(config.paths.leads, JSON.stringify(leads, null, 2));
console.log(`Auto-enriched ${enriched}/${leads.length} leads with domain + info@ email.`);
console.log(`\nRemaining without email: ${leads.filter(l => !l.email).length}`);
console.log(`\nNext steps:`);
console.log(`  1. Review data/leads.json — verify domains are correct`);
console.log(`  2. Replace info@ with actual contact emails where possible`);
console.log(`  3. Set HUNTER_API_KEY in .env for verified email lookup`);
console.log(`  4. Run: node outreach.mjs dry   (preview emails)`);
console.log(`  5. Run: node outreach.mjs send  (send emails)\n`);
