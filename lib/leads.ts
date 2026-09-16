import { neon } from "@neondatabase/serverless";

// Every audit that leaves an email becomes a lead: stored with the evidence
// its audit produced, then sent one follow-up email built from that evidence.
// One email per (email, domain) pair — re-running an audit refreshes the
// stored findings but never re-sends.

export type LeadInput = {
  email: string;
  name: string | null;
  domain: string;
  url: string;
  industry: string | null;
  subIndustry: string | null;
  businessModel: string | null;
  headline: string | null;
  insights: string[];
  competitors: { name: string; domain: string }[];
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildProspectEmail(lead: LeadInput): { subject: string; html: string; text: string } {
  const first = lead.name?.trim().split(/\s+/)[0] || "there";
  const bullets =
    lead.insights.length > 0
      ? lead.insights.slice(0, 3)
      : lead.headline
        ? [lead.headline]
        : [];
  const compNames = lead.competitors.slice(0, 3).map((c) => c.name);

  const subject = `Your ${lead.domain} audit — the findings that matter`;

  const bulletText = bullets.map((b) => `• ${b}`).join("\n\n");
  const crawledLine =
    compNames.length > 0
      ? `These are not template checks. While you waited, we pulled live market data on ${compNames.join(", ")} and compared it against ${lead.domain}.`
      : `These are not template checks. They come from live data about your market, pulled while you waited.`;

  const text = `Hi ${first},

Thanks for running an audit on ${lead.domain}. The findings worth your attention:

${bulletText}

${crawledLine}

Most agencies would turn this into a proposal for more content or more ads. We would rather talk about what is actually limiting revenue first.

If one finding above surprised you, reply and tell me which. I will tell you what we would do about it. No deck, no discovery script.

John Lim
Apereel — a digital growth consultancy for e-commerce businesses
https://www.apereel.com`;

  const html = `<div style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2233; line-height: 1.6; font-size: 15px;">
  <p>Hi ${esc(first)},</p>
  <p>Thanks for running an audit on <strong>${esc(lead.domain)}</strong>. The findings worth your attention:</p>
  <ul style="padding-left: 20px;">
    ${bullets.map((b) => `<li style="margin-bottom: 10px;">${esc(b)}</li>`).join("\n    ")}
  </ul>
  <p>${esc(crawledLine)}</p>
  <p>Most agencies would turn this into a proposal for more content or more ads. We would rather talk about what is actually limiting revenue first.</p>
  <p><strong>If one finding above surprised you, reply and tell me which.</strong> I will tell you what we would do about it. No deck, no discovery script.</p>
  <p style="margin-top: 28px;">John Lim<br/>
  <span style="color: #5a6478;">Apereel — a digital growth consultancy for e-commerce businesses</span><br/>
  <a href="https://www.apereel.com" style="color: #1d6fd4;">apereel.com</a></p>
</div>`;

  return { subject, html, text };
}

export async function recordLeadAndSendEmail(lead: LeadInput): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) return;
    const sql = neon(process.env.DATABASE_URL);

    const rows = (await sql`
      INSERT INTO leads (email, name, domain, url, industry, sub_industry, business_model, headline, insights, competitors)
      VALUES (${lead.email}, ${lead.name}, ${lead.domain}, ${lead.url}, ${lead.industry}, ${lead.subIndustry}, ${lead.businessModel}, ${lead.headline}, ${JSON.stringify(lead.insights)}, ${JSON.stringify(lead.competitors)})
      ON CONFLICT (email, domain) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, leads.name),
        industry = COALESCE(EXCLUDED.industry, leads.industry),
        sub_industry = COALESCE(EXCLUDED.sub_industry, leads.sub_industry),
        business_model = COALESCE(EXCLUDED.business_model, leads.business_model),
        headline = COALESCE(EXCLUDED.headline, leads.headline),
        insights = EXCLUDED.insights,
        competitors = EXCLUDED.competitors
      RETURNING id, emailed_at
    `) as { id: number; emailed_at: string | null }[];

    const row = rows[0];
    if (!row) return;
    if (row.emailed_at) return; // already followed up on this domain

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const { subject, html, text } = buildProspectEmail(lead);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "John at Apereel <noreply@apereel.com>",
        to: [lead.email],
        reply_to: process.env.CONTACT_TO_EMAIL || "john@apereel.com",
        subject,
        html,
        text,
      }),
    });

    await sql`
      UPDATE leads
      SET status = ${res.ok ? "emailed" : "email_failed"},
          emailed_at = ${res.ok ? new Date().toISOString() : null}
      WHERE id = ${row.id}
    `;
    if (!res.ok) {
      console.error("Lead email failed:", res.status, (await res.text()).slice(0, 200));
    } else {
      console.log("Lead follow-up sent to", lead.email, "for", lead.domain);
    }
  } catch (err) {
    console.error("recordLeadAndSendEmail failed:", err);
  }
}
