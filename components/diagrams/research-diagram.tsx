export function ResearchDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram of competitive research with data analysis"
      className="h-auto w-full max-w-md"
    >
      {/* Grid of data points */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const active = (row + col) % 3 !== 0;
          const idx = row * 5 + col;
          // Empty outlines sweep in fast; live data points arrive one by one.
          const delay = active ? 350 + idx * 25 : idx * 18;
          return (
            <circle
              key={`${row}-${col}`}
              className="diag-pop"
              style={{ "--d": `${delay}ms` } as React.CSSProperties}
              cx={80 + col * 68}
              cy={48 + row * 50}
              r={active ? 6 : 4}
              fill={active ? "#3d9eff" : "transparent"}
              fillOpacity={active ? 0.2 + ((row * 5 + col) % 4) * 0.15 : 0}
              stroke={active ? "#3d9eff" : "rgba(244,241,234,0.15)"}
              strokeWidth="1"
            />
          );
        }),
      )}
      {/* Connection lines between key data points */}
      <path
        className="diag-fade"
        style={{ "--d": "850ms" } as React.CSSProperties}
        d="M80 48 L148 98 L216 48 L284 98 L352 48"
        fill="none"
        stroke="#3d9eff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <path
        className="diag-fade"
        style={{ "--d": "890ms" } as React.CSSProperties}
        d="M80 148 L148 198 L216 148 L284 198 L352 148"
        fill="none"
        stroke="#3d9eff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      {/* Magnifying glass */}
      <circle className="diag-pop" style={{ "--d": "960ms" } as React.CSSProperties} cx="210" cy="130" r="36" fill="none" stroke="#3d9eff" strokeWidth="1.5" strokeOpacity="0.5" />
      <line className="diag-fade" style={{ "--d": "1010ms" } as React.CSSProperties} x1="236" y1="156" x2="260" y2="180" stroke="#3d9eff" strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Highlighted insight */}
      <circle className="diag-pop" style={{ "--d": "1090ms" } as React.CSSProperties} cx="210" cy="130" r="6" fill="#3d9eff" fillOpacity="0.6" />
    </svg>
  );
}
