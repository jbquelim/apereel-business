import { ImageResponse } from "next/og";

export const alt = "Apereel — Business-First Digital Growth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070e1c",
          color: "#f4f1ea",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "2px solid #f4f1ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#3d9eff",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 8,
              fontWeight: 600,
            }}
          >
            APEREEL
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 18, letterSpacing: 4, color: "#3d9eff" }}>
            BUSINESS-FIRST DIGITAL GROWTH
          </div>
          <div
            style={{
              fontSize: 54,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            Digital marketing is about growing businesses, not chasing algorithms.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
