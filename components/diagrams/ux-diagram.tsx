export function UxDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram of product discovery filters and navigation"
      className="h-auto w-full max-w-md"
    >
      <rect className="diag-pop" style={{ "--d": "0ms" } as React.CSSProperties} x="24" y="28" width="372" height="36" rx="6" fill="#132240" stroke="rgba(244,241,234,0.12)" />
      <rect className="diag-pop" style={{ "--d": "30ms" } as React.CSSProperties} x="36" y="38" width="88" height="16" rx="3" fill="#3d9eff" fillOpacity="0.35" />
      <rect className="diag-pop" style={{ "--d": "60ms" } as React.CSSProperties} x="136" y="38" width="64" height="16" rx="3" fill="rgba(244,241,234,0.12)" />
      <rect className="diag-pop" style={{ "--d": "90ms" } as React.CSSProperties} x="212" y="38" width="64" height="16" rx="3" fill="rgba(244,241,234,0.12)" />
      <rect className="diag-pop" style={{ "--d": "120ms" } as React.CSSProperties} x="24" y="80" width="110" height="132" rx="6" fill="#132240" stroke="rgba(244,241,234,0.12)" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="diag-pop" style={{ "--d": `${350 + i * 50}ms` } as React.CSSProperties}>
          <circle cx="44" cy={104 + i * 26} r="5" fill="none" stroke="#3d9eff" />
          <rect x="56" y={98 + i * 26} width="60" height="12" rx="2" fill="rgba(244,241,234,0.16)" />
        </g>
      ))}
      {[0, 1].map((col) =>
        [0, 1].map((row) => {
          const card = col * 2 + row;
          return (
            <g key={`${col}-${row}`}>
              <rect
                className="diag-pop"
                style={{ "--d": `${560 + card * 55}ms` } as React.CSSProperties}
                x={150 + col * 128}
                y={80 + row * 70}
                width="116"
                height="60"
                rx="6"
                fill="#132240"
                stroke="rgba(244,241,234,0.12)"
              />
              <circle className="diag-pop" style={{ "--d": `${800 + card * 60}ms` } as React.CSSProperties} cx={168 + col * 128} cy={104 + row * 70} r="8" fill="#d45a4e" fillOpacity="0.85" />
              <circle className="diag-pop" style={{ "--d": `${825 + card * 60}ms` } as React.CSSProperties} cx={188 + col * 128} cy={104 + row * 70} r="8" fill="#3d9eff" fillOpacity="0.7" />
              <circle className="diag-pop" style={{ "--d": `${850 + card * 60}ms` } as React.CSSProperties} cx={208 + col * 128} cy={104 + row * 70} r="8" fill="rgba(244,241,234,0.35)" />
            </g>
          );
        }),
      )}
    </svg>
  );
}
