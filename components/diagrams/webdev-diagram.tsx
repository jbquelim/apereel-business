export function WebdevDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram showing rapid development and deployment"
      className="h-auto w-full max-w-md"
    >
      {/* Browser window frame */}
      <rect x="60" y="28" width="300" height="184" rx="8" fill="#132240" stroke="rgba(244,241,234,0.12)" />
      <rect x="60" y="28" width="300" height="24" rx="8" fill="#132240" />
      <rect x="60" y="44" width="300" height="8" fill="#132240" />
      <circle cx="78" cy="40" r="4" fill="#d45a4e" fillOpacity="0.6" />
      <circle cx="92" cy="40" r="4" fill="rgba(244,241,234,0.2)" />
      <circle cx="106" cy="40" r="4" fill="rgba(244,241,234,0.2)" />
      {/* URL bar */}
      <rect x="124" y="34" width="160" height="12" rx="3" fill="rgba(244,241,234,0.06)" />
      {/* Code lines */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const widths = [180, 140, 200, 120, 160, 100, 180];
        const indents = [0, 16, 16, 32, 16, 16, 0];
        const isHighlight = i === 2 || i === 5;
        return (
          <rect
            key={i}
            x={80 + indents[i]}
            y={64 + i * 20}
            width={widths[i]}
            height="8"
            rx="2"
            fill={isHighlight ? "#3d9eff" : "rgba(244,241,234,0.12)"}
            fillOpacity={isHighlight ? 0.5 : 1}
          />
        );
      })}
      {/* Deploy arrow */}
      <path
        d="M370 120 L396 120"
        stroke="#3d9eff"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#3d9eff" strokeWidth="1" />
        </marker>
      </defs>
      {/* Speed indicator */}
      <text x="374" y="108" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" fillOpacity="0.7">
        LIVE
      </text>
    </svg>
  );
}
