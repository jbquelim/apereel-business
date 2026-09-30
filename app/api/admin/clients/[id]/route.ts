import { NextResponse, after } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { generateMonth } from "@/lib/content-engine";

// Starts this month's content for a client. Runs after the response
// (crawl if needed, then posts, guides and newsletters): a few minutes.

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const client = await getClient((await params).id);
  if (!client) return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  if (client.service !== "premium-creative") {
    return NextResponse.json({ ok: false, error: "Automatic generation is live for Content so far; Ads and Website come next." }, { status: 409 });
  }
  after(async () => {
    try {
      const r = await generateMonth(client);
      console.log(`Content generated for ${client.domain}:`, r);
    } catch (err) {
      console.error(`Content generation failed for ${client.domain}:`, err instanceof Error ? err.message : err);
    }
  });
  return NextResponse.json({ ok: true });
}
