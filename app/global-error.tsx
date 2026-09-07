"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#070e1c",
          color: "#f4f1ea",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#9aa4b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            {error.message}
          </p>
          {error.digest && (
            <p style={{ color: "#9aa4b8", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
              Digest: {error.digest}
            </p>
          )}
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
      </body>
    </html>
  );
}
