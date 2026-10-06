import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Rendered site visuals (full-size PNGs) are served resized and compressed (lib/site-render optimizeImages).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "d3u0tzju9qaucj.cloudfront.net" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    formats: ["image/webp"],
  },
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Customer sites are previewed inside the studio, so apereel.com itself may frame them.
      { source: "/((?!sites/).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
      { source: "/sites/:path*", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
    ];
  },
};

export default nextConfig;
