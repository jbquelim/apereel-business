export function ApproachResearchDiagram() {
  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Abstract diagram of market research and competitor analysis"
      className="h-auto w-full max-w-md"
    >
      {/* Competitor cards */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 120}
            y={24}
            width="100"
            height="64"
            rx="6"
            fill="#132240"
            stroke={i === 1 ? "#3d9eff" : "rgba(244,241,234,0.12)"}
            strokeWidth={i === 1 ? 1.5 : 1}
          />
          <rect x={52 + i * 120} y={38} width="56" height="8" rx="2" fill={i === 1 ? "#3d9eff" : "rgba(244,241,234,0.15)"} fillOpacity={i === 1 ? 0.4 : 1} />
          <rect x={52 + i * 120} y={52} width="76" height="6" rx="2" fill="rgba(244,241,234,0.08)" />
          <rect x={52 + i * 120} y={64} width="40" height="6" rx="2" fill="rgba(244,241,234,0.08)" />
        </g>
      ))}
      {/* Arrow down */}
      <line x1="210" y1="96" x2="210" y2="130" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
      {/* Analysis layer */}
      <rect x="80" y="130" width="260" height="48" rx="6" fill="rgba(61,158,255,0.08)" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.3" />
      <text x="210" y="158" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fillOpacity="0.7">
        MARKET ANALYSIS
      </text>
      {/* Arrow down */}
      <line x1="210" y1="186" x2="210" y2="210" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
      {/* Insight output */}
      <rect x="120" y="210" width="180" height="48" rx="6" fill="rgba(61,158,255,0.15)" stroke="#3d9eff" strokeWidth="1.5" />
      <text x="210" y="238" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">
        OPPORTUNITY MAP
      </text>
    </svg>
  );
}
