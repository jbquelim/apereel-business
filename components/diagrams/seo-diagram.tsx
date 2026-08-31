export function SeoDiagram() {
  const bars = [
    { x: 56, h: 40, highlight: false },
    { x: 120, h: 65, highlight: false },
    { x: 184, h: 90, highlight: false },
    { x: 248, h: 130, highlight: true },
    { x: 312, h: 155, highlight: true },
  ];

  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract chart showing search rankings rising over time"
      className="h-auto w-full max-w-md"
    >
      {/* Axis */}
      <line x1="40" y1="200" x2="400" y2="200" stroke="rgba(244,241,234,0.16)" />
      <line x1="40" y1="28" x2="40" y2="200" stroke="rgba(244,241,234,0.16)" />
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="40"
          y1={56 + i * 40}
          x2="400"
          y2={56 + i * 40}
          stroke="rgba(244,241,234,0.06)"
        />
      ))}
      {/* Bars */}
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={200 - bar.h}
          width="44"
          height={bar.h}
          rx="4"
          fill={bar.highlight ? "#3d9eff" : "rgba(244,241,234,0.12)"}
          fillOpacity={bar.highlight ? 0.6 : 1}
        />
      ))}
      {/* Trend line */}
      <path
        d="M78 160 L142 135 L206 110 L270 70 L334 45"
        fill="none"
        stroke="#3d9eff"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <circle cx="334" cy="45" r="4" fill="#3d9eff" />
    </svg>
  );
}
