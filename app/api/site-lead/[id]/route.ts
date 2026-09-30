import { neon } from "@neondatabase/serverless";
import { getSiteById } from "@/lib/site-builder";
import { getClient } from "@/lib/clients";

// Enquiry and quote forms on customer sites post here (a plain HTML form, so
// no script is needed on their site). Saved to site_leads, emailed to the
// business, then the visitor is sent back to the page with a thank-you.

const hits = new Map<string, number[]>();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const site = await getSiteById((await params).id);
  const back = request.headers.get("referer") ?? "/";
  if (!site || !process.env.DATABASE_URL) return new Response("Not found", { status: 404 });
  const form = await request.formData().catch(() => null);
  const get = (k: string, n: number) => String(form?.get(k) ?? "").trim().slice(0, n);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  hits.set(ip, [...recent, now]);
  // Honeypot filled, or too many from one address: accept silently, save nothing.
  if (get("website", 200) || recent.length >= 10) return Response.redirect(back, 303);

  const lead = { name: get("name", 120), email: get("email", 200), phone: get("phone", 60), message: get("message", 4000), page: get("page", 200) };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.message) return Response.redirect(back, 303);
  await neon(process.env.DATABASE_URL)`
    INSERT INTO site_leads (site_id, name, email, phone, message, page)
    VALUES (${site.id}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.message}, ${lead.page})
  `;
  const client = await getClient(site.client_id);
  if (client && process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${site.doc.brand.name} website <noreply@apereel.com>`,
        to: [site.doc.brand.email || client.email],
        reply_to: lead.email,
        subject: `New ${lead.page.startsWith("product:") ? "product enquiry" : "enquiry"} from your website`,
        text: [`From: ${lead.name} <${lead.email}>${lead.phone ? `, ${lead.phone}` : ""}`, `Page: ${lead.page}`, "", lead.message].join("\n"),
      }),
    }).catch(() => null);
  }
  const url = new URL(back);
  url.searchParams.set("sent", "1");
  return Response.redirect(url.toString(), 303);
}
