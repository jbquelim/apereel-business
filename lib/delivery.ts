import { randomBytes } from "node:crypto";
import { markSent } from "./orders";
import { tierById } from "./analysis-tiers";

// Delivers a finished report: issues the private access token, marks the
// order sent and emails the customer their link. Used by John's "Approve &
// send" and by the automatic Teardown delivery.

export async function deliverReport(orderId: string, base: string): Promise<{ link: string; emailed: boolean } | null> {
  const token = randomBytes(24).toString("base64url");
  const sent = await markSent(orderId, token);
  if (!sent) return null;
  const link = `${base}/report/${token}`;
  return { link, emailed: await emailCustomer(sent, link) };
}

async function emailCustomer(
  o: { domain: string; email: string; name: string | null; livemode: boolean | null; tier: string },
  link: string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const tier = tierById(o.tier);
  const first = o.name?.split(/\s+/)[0];
  const reviewed = tier.reviewed
    ? `Your ${tier.name} for ${o.domain} is ready. I've reviewed it personally.`
    : `Your ${tier.name} for ${o.domain} is ready. It's generated automatically from live data on your site and your competitors'.`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "John Lim at Apereel <noreply@apereel.com>",
      reply_to: "john@apereel.com",
      to: [o.email],
      subject: `${o.livemode === false ? "[TEST] " : ""}Your ${tier.name} for ${o.domain} is ready`,
      text: [
        first ? `Hi ${first},` : "Hi,",
        "",
        reviewed,
        "",
        `Read it here: ${link}`,
        "",
        "The link is private to you.",
        "",
        "If you'd like help putting any of it into action, just reply to this email.",
        "",
        "John Lim",
        "Founder, Apereel",
      ].join("\n"),
    }),
  }).catch(() => null);
  return !!res?.ok;
}
