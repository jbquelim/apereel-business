import { isAdmin } from "@/lib/admin-auth";
import { renderPath } from "@/lib/site-render";
import { getSiteBySlug } from "@/lib/site-builder";
import { templateById } from "@/lib/templates";

// Admin-only: any template filled with any site's real data.
//   /template-preview/<template>/<site slug>/<page path...>

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await isAdmin())) return new Response("Sign in at /admin first.", { status: 401 });
  const [templateId, slug, ...rest] = (await params).path.map((p) => decodeURIComponent(p));
  const template = templateById(templateId);
  const site = slug ? await getSiteBySlug(slug) : null;
  if (!template || !site) return new Response("Not found", { status: 404 });
  const base = `/template-preview/${template.id}/${site.slug}`;
  const result = renderPath(
    { siteId: site.id, doc: site.doc, base, origin: new URL(request.url).origin + base, apiOrigin: "https://www.apereel.com", preview: true, design: template.id },
    rest,
    new URL(request.url).searchParams,
  );
  if (result.kind === "redirect") return new Response(null, { status: 307, headers: { location: result.location } });
  return new Response(result.body, { status: result.status, headers: { "content-type": result.kind === "text" ? result.contentType : "text/html; charset=utf-8", "cache-control": "private, no-store" } });
}
