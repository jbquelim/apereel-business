import { renderPath } from "@/lib/site-render";
import { getSiteByDomain, getSiteBySlug } from "@/lib/site-builder";

// Serves customer websites as complete HTML documents (outside Apereel's own
// layout). Two ways in:
//   /sites/<slug>/...        preview on apereel.com (noindex, never cached)
//   /sites/_host/<host>/...  the customer's own domain (rewritten by proxy.ts)

const API_ORIGIN = "https://www.apereel.com";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [first, ...rest] = (await params).path.map((p) => decodeURIComponent(p));
  const onDomain = first === "_host";
  const host = onDomain ? rest.shift() ?? "" : "";
  const site = onDomain ? await getSiteByDomain(host) : await getSiteBySlug(first ?? "");
  if (!site) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain" } });

  const origin = onDomain ? `https://${host}` : new URL(request.url).origin + `/sites/${site.slug}`;
  const result = renderPath(
    {
      siteId: site.id,
      doc: site.doc,
      base: onDomain ? "" : `/sites/${site.slug}`,
      origin,
      apiOrigin: API_ORIGIN,
      preview: !onDomain,
    },
    rest,
    new URL(request.url).searchParams,
  );
  const cache = onDomain ? "public, s-maxage=60, stale-while-revalidate=600" : "private, no-store";
  if (result.kind === "redirect") return new Response(null, { status: 308, headers: { location: result.location } });
  if (result.kind === "text") return new Response(result.body, { status: result.status, headers: { "content-type": result.contentType, "cache-control": cache } });
  return new Response(result.body, { status: result.status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": cache } });
}
