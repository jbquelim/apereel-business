import { NextResponse, after } from "next/server";
import { getClientByToken } from "@/lib/clients";
import { saveUpload } from "@/lib/catalog-upload";
import { claimRun, runAndContinue } from "@/lib/ai-services";
import { getSiteForClient } from "@/lib/site-builder";

// A client uploads their product file (Shopify or WooCommerce export, or a
// spreadsheet) when their site can't be read. It's saved as their catalog
// and their build or month is run again from the step that needs it.

export const maxDuration = 300;
const MAX_BYTES = 8_000_000;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const client = await getClientByToken((await params).token);
  if (!client || client.status !== "active") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ ok: false, error: "Choose your product file (CSV)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "That file is over 8 MB. Export products only, without images embedded." }, { status: 400 });
  const r = await saveUpload(client.domain, await file.text());
  if (!r.products) return NextResponse.json({ ok: false, error: "We couldn't find products in that file. Use your store's product export (CSV) with a name or title column." }, { status: 400 });

  // Run again from where the products are needed: the catalog step for a built site, the build or the month otherwise.
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  if (await claimRun(client.id)) {
    const step = client.service === "web-development" ? ((await getSiteForClient(client.id)) ? "catalog" : "build") : undefined;
    after(() => runAndContinue(client, step, base));
  }
  return NextResponse.json({ ok: true, ...r });
}
