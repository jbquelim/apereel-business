// Branded HTML email template. Email clients (Gmail, Outlook) strip <style>
// blocks and ignore flexbox/grid, so everything is tables + inline styles.
// Colors mirror app/globals.css: navy #070e1c, electric #3d9eff.

const NAVY = "#070e1c";
const INK = "#1a1a1a";
const MUTED = "#5b6472";
const ELECTRIC = "#1d6fd4"; // electric-deep — darker for legible links on white
const BORDER = "#e4e7ec";
const SITE = "https://www.apereel.com";

type EmailOptions = {
  /** Preheader: the grey preview text after the subject in an inbox list. */
  preheader?: string;
  /** Inner HTML for the message body (paragraphs, etc.). */
  bodyHtml: string;
};

/**
 * Wrap message content in the Apereel-branded shell: navy header wordmark,
 * white body card, and a consistent signature + footer.
 */
export function renderEmail({ preheader, bodyHtml }: EmailOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Apereel</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;">
${
  preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f5f7;font-size:1px;line-height:1px;">${preheader}</div>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">

<!-- Header -->
<tr>
<td style="background-color:${NAVY};padding:24px 40px;">
<a href="${SITE}" style="text-decoration:none;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:600;letter-spacing:-0.02em;">
Apereel<span style="color:${ELECTRIC};">.</span>
</a>
<div style="margin-top:2px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a94a6;">
Business-First Digital Growth
</div>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:36px 40px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${INK};">
${bodyHtml}
</td>
</tr>

<!-- Signature -->
<tr>
<td style="padding:8px 40px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};width:100%;">
<tr><td style="padding-top:24px;">
<div style="font-size:15px;font-weight:600;color:${INK};">John Lim</div>
<div style="font-size:14px;color:${MUTED};">Founder, Apereel</div>
<div style="margin-top:8px;font-size:14px;">
<a href="${SITE}" style="color:${ELECTRIC};text-decoration:none;">apereel.com</a>
<span style="color:${BORDER};">&nbsp;·&nbsp;</span>
<a href="mailto:john@apereel.com" style="color:${ELECTRIC};text-decoration:none;">john@apereel.com</a>
</div>
</td></tr>
</table>
</td>
</tr>

</table>

<!-- Footer -->
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;">
<tr>
<td style="padding:20px 40px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#98a2b3;">
Apereel — Business-First Digital Growth<br>
<a href="${SITE}" style="color:#98a2b3;text-decoration:underline;">apereel.com</a>
</td>
</tr>
</table>

</td>
</tr>
</table>
</body>
</html>`;
}
