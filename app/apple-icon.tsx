import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070e1c",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 999,
            border: "6px solid #F4F1EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "#3D9EFF",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
