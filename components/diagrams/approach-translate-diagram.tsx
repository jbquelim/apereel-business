export function ApproachTranslateDiagram() {
  const channels = [
    { label: "Website", y: 36 },
    { label: "Product Pages", y: 84 },
    { label: "Creative", y: 132 },
    { label: "Messaging", y: 180 },
  ];

  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Abstract diagram showing business advantage translated across digital channels"
      className="h-auto w-full max-w-md"
    >
      {/* Core advantage */}
      <rect x="40" y="100" width="120" height="72" rx="8" fill="rgba(61,158,255,0.15)" stroke="#3d9eff" strokeWidth="1.5" />
      <text x="100" y="132" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">
        BUSINESS
      </text>
      <text x="100" y="148" fill="#3d9eff" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">
        STRENGTH
      </text>
      {/* Channels */}
      {channels.map((ch, i) => (
        <g key={ch.label}>
          <line
            x1="160"
            y1="136"
            x2="260"
            y2={ch.y + 22}
            stroke="#3d9eff"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
          <rect
            x="260"
            y={ch.y}
            width="120"
            height="44"
            rx="6"
            fill="#132240"
            stroke={i < 2 ? "#3d9eff" : "rgba(244,241,234,0.12)"}
            strokeOpacity={i < 2 ? 0.5 : 1}
          />
          <text
            x="320"
            y={ch.y + 26}
            fill={i < 2 ? "#3d9eff" : "#9aa4b8"}
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
            fillOpacity={i < 2 ? 0.8 : 0.6}
          >
            {ch.label}
          </text>
        </g>
      ))}
      {/* Consistency indicator */}
      <text x="210" y="260" fill="rgba(244,241,234,0.3)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        ONE MESSAGE, EVERY TOUCHPOINT
      </text>
    </svg>
  );
}
