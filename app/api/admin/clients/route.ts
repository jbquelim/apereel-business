import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { createClient, type AiService } from "@/lib/clients";

// Creates a client of the AI services. Payment is outside this for now;
// John creates clients by hand until checkout for these tiers is live.

const SERVICES: AiService[] = ["premium-creative", "advertising", "web-development"];

export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const raw = typeof b.domain === "string" ? b.domain.trim() : "";
  let domain = "";
  try {
    domain = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    /* invalid */
  }
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const service = SERVICES.find((s) => s === b.service);
  const tier = b.tier === "fix" || b.tier === "build" || b.tier === "grow" ? b.tier : null;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) return NextResponse.json({ ok: false, error: "Enter a valid website." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  if (!service || !tier) return NextResponse.json({ ok: false, error: "Choose a service and tier." }, { status: 400 });
  // John ticks that the client authorized us to access their site on their behalf (they said so by email or in person).
  const client = await createClient({ domain, email, name: typeof b.name === "string" && b.name.trim() ? b.name.trim().slice(0, 120) : null, service, tier, authorized: b.authorized === true });
  return NextResponse.json({ ok: true, id: client.id });
}
