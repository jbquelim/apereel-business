// Emails from the platform: alerts to John, and notes to clients.

async function send(body: object) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
}

/** An alert to John. */
export async function notifyJohn(subject: string, text: string) {
  await send({ from: "Apereel <noreply@apereel.com>", to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"], subject, text });
}

/** A note to a client, from John (replies go to him). */
export async function emailClient(to: string, subject: string, text: string) {
  await send({ from: "John Lim at Apereel <noreply@apereel.com>", reply_to: "john@apereel.com", to: [to], subject, text });
}
