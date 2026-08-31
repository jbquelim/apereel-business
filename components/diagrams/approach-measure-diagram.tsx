export function ApproachMeasureDiagram() {
  const metrics = [
    { label: "Traffic", value: 72, color: "rgba(244,241,234,0.15)" },
    { label: "Leads", value: 56, color: "rgba(244,241,234,0.15)" },
    { label: "Sales", value: 88, color: "#3d9eff" },
    { label: "Revenue", value: 110, color: "#3d9eff" },
    { label: "Margin", value: 64, color: "#3d9eff" },
  ];

  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Abstract dashboard showing business metrics being measured and improved"
      className="h-auto w-full max-w-md"
    >
      {/* Dashboard frame */}
      <rect x="40" y="24" width="340" height="220" rx="8" fill="#132240" stroke="rgba(244,241,234,0.08)" />
      {/* Header */}
      <rect x="40" y="24" width="340" height="32" rx="8" fill="#132240" />
      <rect x="40" y="48" width="340" height="8" fill="#132240" />
      <rect x="56" y="34" width="60" height="8" rx="2" fill="rgba(244,241,234,0.12)" />
      <circle cx="360" cy="40" r="4" fill="#3d9eff" fillOpacity="0.4" />
      {/* Metric bars */}
      {metrics.map((m, i) => (
        <g key={m.label}>
          <text
            x="68"
            y={84 + i * 32}
            fill="#9aa4b8"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fillOpacity="0.6"
          >
            {m.label}
          </text>
          <rect
            x="140"
            y={74 + i * 32}
            width="216"
            height="14"
            rx="3"
            fill="rgba(244,241,234,0.04)"
          />
          <rect
            x="140"
            y={74 + i * 32}
            width={m.value * 1.8}
            height="14"
            rx="3"
            fill={m.color}
            fillOpacity={m.color === "#3d9eff" ? 0.4 : 1}
          />
        </g>
      ))}
      {/* Cycle arrow */}
      <path
        d="M390 140 C 400 80, 400 200, 390 140"
        fill="none"
        stroke="none"
      />
      <text x="210" y="268" fill="rgba(244,241,234,0.3)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        MEASURE → LEARN → IMPROVE → REPEAT
      </text>
    </svg>
  );
}
