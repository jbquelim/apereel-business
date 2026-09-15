export function ApproachAmplifyDiagram() {
  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Abstract diagram showing amplification of business strength through marketing channels"
      className="h-auto w-full max-w-md"
    >
      {/* Center signal */}
      <circle className="diag-pop" style={{ "--d": "0ms" } as React.CSSProperties} cx="210" cy="140" r="16" fill="#3d9eff" fillOpacity="0.3" />
      <circle className="diag-pop" style={{ "--d": "60ms" } as React.CSSProperties} cx="210" cy="140" r="8" fill="#3d9eff" fillOpacity="0.6" />
      {/* Expanding rings */}
      <circle className="diag-fade" style={{ "--d": "300ms" } as React.CSSProperties} cx="210" cy="140" r="40" fill="none" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.25" />
      <circle className="diag-fade" style={{ "--d": "400ms" } as React.CSSProperties} cx="210" cy="140" r="72" fill="none" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.15" />
      <circle className="diag-fade" style={{ "--d": "500ms" } as React.CSSProperties} cx="210" cy="140" r="108" fill="none" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.08" />
      {/* Channel labels on the rings */}
      {[
        { label: "SEO", x: 210, y: 68 },
        { label: "ADS", x: 282, y: 140 },
        { label: "CONTENT", x: 210, y: 212 },
        { label: "CREATIVE", x: 138, y: 140 },
      ].map((ch, i) => (
        <g key={ch.label} className="diag-pop" style={{ "--d": `${620 + i * 60}ms` } as React.CSSProperties}>
          <rect
            x={ch.x - 30}
            y={ch.y - 10}
            width="60"
            height="20"
            rx="10"
            fill="#132240"
            stroke="#3d9eff"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <text
            x={ch.x}
            y={ch.y + 4}
            fill="#3d9eff"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
            fillOpacity="0.7"
          >
            {ch.label}
          </text>
        </g>
      ))}
      {/* Reach indicators */}
      <text className="diag-fade" style={{ "--d": "920ms" } as React.CSSProperties} x="210" y="270" fill="rgba(244,241,234,0.3)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        AMPLIFIED REACH
      </text>
    </svg>
  );
}
