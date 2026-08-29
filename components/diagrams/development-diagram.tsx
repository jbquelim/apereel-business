export function DevelopmentDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram comparing slow external queues with faster in-house development"
      className="h-auto w-full max-w-md"
    >
      <text x="24" y="36" fill="#9aa4b8" fontSize="11" fontFamily="ui-monospace, monospace">
        EXTERNAL QUEUE
      </text>
      <rect x="24" y="48" width="372" height="10" rx="5" fill="rgba(244,241,234,0.08)" />
      <rect x="24" y="48" width="110" height="10" rx="5" fill="#d45a4e" fillOpacity="0.7" />
      <text x="24" y="92" fill="#9aa4b8" fontSize="11" fontFamily="ui-monospace, monospace">
        AI-ASSISTED BUILD
      </text>
      <rect x="24" y="104" width="372" height="10" rx="5" fill="rgba(244,241,234,0.08)" />
      <rect x="24" y="104" width="310" height="10" rx="5" fill="#3d9eff" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={24 + i * 76}
          y="140"
          width="64"
          height="72"
          rx="6"
          fill="#132240"
          stroke={i > 2 ? "#3d9eff" : "rgba(244,241,234,0.12)"}
        />
      ))}
    </svg>
  );
}
