import { neon } from "@neondatabase/serverless";
import type { Client } from "./clients";
import { generateMonth } from "./content-engine";
import { generateAdsMonth } from "./ads-engine";
import { buildSite } from "./site-builder";

// One entry point for every AI service: this month's content, this month's
// ads, or the website build. Used by John's button and the monthly cron.

export async function runService(client: Client): Promise<string> {
  if (client.service === "premium-creative") {
    const r = await generateMonth(client);
    return `${r.posts} posts, ${r.guides} guides, ${r.newsletters} newsletters, ${r.videos} videos, ${r.visuals} visuals, ${r.notes} competitor notes`;
  }
  if (client.service === "advertising") {
    const r = await generateAdsMonth(client);
    return `${r.statics} static ads, ${r.carousels} carousels, ${r.animated} animated, ${r.videos} video ads`;
  }
  const site = await buildSite(client);
  return `site built: /sites/${site.slug}`;
}

/** Active monthly clients (content, ads) with nothing generated this month yet. */
export async function clientsDueThisMonth(limit: number): Promise<Client[]> {
  if (!process.env.DATABASE_URL) return [];
  const batch = new Date().toISOString().slice(0, 7);
  return (await neon(process.env.DATABASE_URL)`
    SELECT c.* FROM clients c
    WHERE c.status = 'active' AND c.service IN ('premium-creative', 'advertising')
      AND NOT EXISTS (SELECT 1 FROM content_items i WHERE i.client_id = c.id AND i.batch = ${batch})
    ORDER BY c.created_at LIMIT ${limit}
  `) as Client[];
}
