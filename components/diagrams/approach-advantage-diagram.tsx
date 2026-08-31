export function ApproachAdvantageDiagram() {
  const blocks = [
    { label: "Pricing", x: 40, y: 32, w: 96 },
    { label: "Selection", x: 160, y: 32, w: 96 },
    { label: "Experience", x: 280, y: 32, w: 96 },
    { label: "Service", x: 100, y: 108, w: 96 },
    { label: "Availability", x: 220, y: 108, w: 96 },
  ];

  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Abstract diagram showing business advantage building blocks converging"
      className="h-auto w-full max-w-md"
    >
      {/* Building blocks */}
      {blocks.map((b, i) => (
        <g key={b.label}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height="56"
            rx="6"
            fill="#132240"
            stroke={i === 0 || i === 3 ? "#3d9eff" : "rgba(244,241,234,0.12)"}
            strokeOpacity={i === 0 || i === 3 ? 0.6 : 1}
          />
          <text
            x={b.x + b.w / 2}
            y={b.y + 32}
            fill={i === 0 || i === 3 ? "#3d9eff" : "#9aa4b8"}
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
          >
            {b.label}
          </text>
        </g>
      ))}
      {/* Converging lines */}
      {blocks.map((b) => (
        <line
          key={`line-${b.label}`}
          x1={b.x + b.w / 2}
          y1={b.y + 56}
          x2={210}
          y2={200}
          stroke="#3d9eff"
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeDasharray="3 3"
        />
      ))}
      {/* Result */}
      <rect x="120" y="200" width="180" height="52" rx="6" fill="rgba(61,158,255,0.15)" stroke="#3d9eff" strokeWidth="1.5" />
      <text x="210" y="222" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">
        COMPETITIVE
      </text>
      <text x="210" y="238" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">
        ADVANTAGE
      </text>
    </svg>
  );
}
