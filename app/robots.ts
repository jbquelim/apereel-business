import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private: admin review and customers' Growth Plan reports
      disallow: ["/admin", "/report/", "/proposal/", "/growth-plan/thanks"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
