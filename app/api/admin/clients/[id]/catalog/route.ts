import { NextResponse, after } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { saveUpload } from "@/lib/catalog-upload";
import { claimRun, runAndContinue } from "@/lib/ai-services";
import { getSiteForClient } from "@/lib/site-builder";

// John uploads a client's product file on their behalf (their site blocked
// our reader and they authorized us to get it ourselves; lib/crawl-access).
// Same as the studio upload, then the build or month runs again.

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const client = await getClient((await params).id);
  if (!client) return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 8_000_000) return NextResponse.json({ ok: false, error: "Choose a CSV under 8 MB." }, { status: 400 });
  const r = await saveUpload(client.domain, await file.text());
  if (!r.products) return NextResponse.json({ ok: false, error: "No products found in that file (it needs a name or title column)." }, { status: 400 });
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  if (await claimRun(client.id)) {
    const step = client.service === "web-development" ? ((await getSiteForClient(client.id)) ? "catalog" : "build") : undefined;
    after(() => runAndContinue(client, step, base));
  }
  return NextResponse.json({ ok: true, ...r });
}
