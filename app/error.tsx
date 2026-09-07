"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[APP-ERROR]", error.message, error.stack);
  }, [error]);

  return (
    <div
      style={{
        backgroundColor: "#070e1c",
        color: "#f4f1ea",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Something went wrong
        </h2>
        <p
          style={{
            color: "#9aa4b8",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            wordBreak: "break-word",
          }}
        >
          {error.message}
        </p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: "#3d9eff",
            color: "#070e1c",
            border: "none",
            borderRadius: "9999px",
            padding: "0.625rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
