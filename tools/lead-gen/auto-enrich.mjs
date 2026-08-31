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
  // Google Maps — retail & fashion
  "cozey toronto": "cozey.ca",
  "over the rainbow": "rainbowjean.com",
  "peace collective": "peacecollective.com",
  "gents custom wear": "gentscustomwear.com",
  "posh boutique": "poshboutique.ca",
  "space vintage": "spacevintage.ca",
  "fawn": "fawnto.com",
  "zumel & co.": "zumelandco.com",
  "boutique la muse": "boutiquelamuse.ca",
  // Google Maps — jewelry
  "canadian pmx": "canadianpmx.com",
  "made you look": "madeyoulook.ca",
  "cullen jewellery": "cullenjewellery.com",
  "ftjco fine jewellery": "ftjco.com",
  "anne sportun jewellery": "annesportun.com",
  "jewels of toronto": "jewelsoftoronto.com",
  "bluboho": "bluboho.com",
  // Google Maps — home decor
  "mararamiro home": "mararamiro.com",
  "the tile shoppe": "thetileshoppe.com",
  "juxtapose home": "juxtaposehome.com",
  "kendall & co.": "kendallandco.com",
  "socco living": "soccoliving.com",
  "avenue daughter": "avenuedaughter.com",
  // Google Maps — beauty
  "kiokii and...": "kiokii.com",
  "cosmetic world": "cosmeticworld.ca",
  "lamour beauty & life": "lamourbeauty.ca",
  // Google Maps — wellness & spa
  "the return space": "thereturnspace.com",
  "well focus wellness & spa": "wellfocuswellness.ca",
  "tonic spa": "tonicspa.ca",
  "wellness haus": "wellnesshaus.ca",
  "revive wellness club": "revivewellnessclub.com",
  "luma wellness spa": "lumawellnessspa.com",
  "hygge wellness centre": "hyggewellness.ca",
  // Google Maps — fitness
  "studio fitness": "studiofitness.ca",
  "fit factory downtown": "fitfactory.ca",
  "fitness social studio": "fitnesssocial.ca",
  "loft fitness club": "loftfitnessclub.com",
  // Google Maps — specialty food
  "caviar foodie": "caviarfoodie.com",
  "the mercantile": "themercantile.ca",
  "specialty food shop": "specialtyfoodshop.com",
  "la spesa market": "laspesamarket.com",
  "rise up foods": "riseupfoods.com",
  "the epicure shop": "theepicureshop.com",
  // Google Maps — gift shops
  "shop404": "shop404.ca",
  "spacing store": "spacingstore.ca",
  "outer layer": "outerlayer.ca",
  "i have a crush on you": "ihaveacrushonyou.com",
  "loohoo": "loohoo.ca",
  "red pegasus": "redpegasus.ca",
  // Google Maps — pet stores
  "critter & co. pet outpost": "critterandco.ca",
  "farmfetchpets inc": "farmfetchpets.com",
  "happypets pantry": "happypetspantry.ca",
  // Google Maps — florists
  "416-flowers": "416flowers.com",
  "bloomen flower delivery": "bloomen.ca",
  "tonic blooms": "tonicblooms.com",
  "sweetpea's": "sweetpeas.ca",
  "toronto flower gallery": "torontoflowergallery.com",
  // Google Maps — bakeries
  "maison 118 cafe & bakery": "maison118.com",
  "alice marie bakery & coffee": "alicemariebakery.com",
  "bricolage bakery": "bricolagebakery.com",
  "l'avenue boulangerie": "lavenueboulangerie.com",
  "la la bakeshop": "lalabakeshop.com",
  // Google Maps — yoga/pilates
  "solis movement": "solismovement.com",
  "panda pilates": "pandapilates.ca",
  "reunion yoga & pilates": "reunionyoga.com",
  "enjoy pilates studio": "enjoypilates.ca",
  "ultra pilates toronto": "ultrapilatestoronto.com",
  // Google Maps — salons
  "barber theory toronto": "barbertheory.ca",
  "hiro studio for men": "hirostudio.ca",
  "high altitude barbershop": "highaltitudebarbershop.com",
  "iconic cuts": "iconiccuts.ca",
  "nomad": "nomadtoronto.com",
  "solouk": "solouk.co",
  "ziggy's at home": "ziggysathome.com",
  "korean shop toronto": "koreanshoptoronto.com",
  "fit factory midtown": "fitfactory.ca",
  "petview": "petview.ca",
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
