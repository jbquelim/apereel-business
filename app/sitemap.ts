import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { servicePages } from "@/lib/service-pages";
import { insights } from "@/lib/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    ...["work", "approach", "services", "contact"].map((path) => ({
      url: `${base}/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...servicePages.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${base}/insights`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...insights.map((i) => ({
      url: `${base}/insights/${i.slug}`,
      lastModified: new Date(i.datePublished),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
