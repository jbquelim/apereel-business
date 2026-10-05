import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { setDesign } from "@/lib/site-design";

// John sets any site's design (any template, any tier).
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const { siteId, design } = (await request.json().catch(() => ({}))) as { siteId?: string; design?: string };
  if (!siteId || !design) return NextResponse.json({ ok: false, error: "siteId and design required" }, { status: 400 });
  const r = await setDesign(siteId, design);
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
