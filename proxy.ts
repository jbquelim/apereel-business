import { NextResponse, type NextRequest } from "next/server";

// Customer websites on their own domains: any host that isn't Apereel's is
// rewritten to /sites/_host/<host>/<path>, which renders that customer's
// site. Apereel's own hosts pass straight through.

const OWN_HOST = /(^|\.)apereel\.com$|\.vercel\.app$|^localhost$|^127\.0\.0\.1$/;

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!host || OWN_HOST.test(host)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/sites/_host/${host}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico).*)"],
};
