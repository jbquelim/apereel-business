export function LuxuryDiagram() {
  const elements = [
    { label: "Brand Standards", x: 30, y: 28 },
    { label: "UX Guidelines", x: 220, y: 28 },
    { label: "Technical Specs", x: 30, y: 98 },
    { label: "Commercial Goals", x: 220, y: 98 },
    { label: "E-commerce Execution", x: 125, y: 168 },
  ];

  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Diagram showing five balanced requirements converging into a single execution"
      className="h-auto w-full max-w-md"
    >
      {elements.map((el, i) => {
        const isCenter = i === 4;
        const w = isCenter ? 170 : 160;
        return (
          <g key={el.label}>
            <rect
              x={el.x}
              y={el.y}
              width={w}
              height="52"
              rx="6"
              fill={isCenter ? "rgba(61,158,255,0.15)" : "#132240"}
              stroke={isCenter ? "#3d9eff" : "rgba(244,241,234,0.12)"}
              strokeWidth={isCenter ? 1.5 : 1}
            />
            <text
              x={el.x + w / 2}
              y={el.y + 30}
              fill={isCenter ? "#3d9eff" : "#9aa4b8"}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
            >
              {el.label}
            </text>
          </g>
        );
      })}
      <line
        x1="110"
        y1="80"
        x2="180"
        y2="168"
        stroke="rgba(61,158,255,0.3)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="300"
        y1="80"
        x2="240"
        y2="168"
        stroke="rgba(61,158,255,0.3)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="110"
        y1="150"
        x2="180"
        y2="168"
        stroke="rgba(61,158,255,0.3)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="300"
        y1="150"
        x2="240"
        y2="168"
        stroke="rgba(61,158,255,0.3)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
    </svg>
  );
}
