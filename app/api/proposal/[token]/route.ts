import { NextResponse } from "next/server";
import { acceptProposal, getProposalByToken } from "@/lib/proposals";

// The customer accepts their proposal. John is emailed to schedule and invoice.

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return NextResponse.json({ ok: false }, { status: 404 });
  const row = await getProposalByToken(token);
  if (!row) return NextResponse.json({ ok: false }, { status: 404 });
  if (row.status === "accepted") return NextResponse.json({ ok: true });
  if (!(await acceptProposal(token))) return NextResponse.json({ ok: false }, { status: 409 });

  if (process.env.RESEND_API_KEY) {
    const p = row.data;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Apereel <noreply@apereel.com>",
        to: [process.env.CONTACT_TO_EMAIL || "john@apereel.com"],
        reply_to: row.email,
        subject: `Proposal accepted: ${row.domain} (${p.tierLabel}, $${Math.max(0, p.price - p.credit).toLocaleString("en-US")})`,
        text: [
          `${row.name ?? "The customer"} <${row.email}> accepted the ${p.tierLabel} proposal for ${row.domain}.`,
          `Price $${p.price.toLocaleString("en-US")}, credit $${p.credit}, due $${Math.max(0, p.price - p.credit).toLocaleString("en-US")}.`,
          "",
          "Next: confirm the start date and send the first invoice.",
        ].join("\n"),
      }),
    }).catch((err) => console.error("Acceptance email failed:", err));
  }
  return NextResponse.json({ ok: true });
}
