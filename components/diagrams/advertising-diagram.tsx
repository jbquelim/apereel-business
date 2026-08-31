export function AdvertisingDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram of targeted advertising campaigns"
      className="h-auto w-full max-w-md"
    >
      {/* Central target */}
      <circle cx="210" cy="120" r="80" fill="none" stroke="rgba(244,241,234,0.08)" strokeWidth="1" />
      <circle cx="210" cy="120" r="56" fill="none" stroke="rgba(244,241,234,0.12)" strokeWidth="1" />
      <circle cx="210" cy="120" r="32" fill="none" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="210" cy="120" r="10" fill="#3d9eff" fillOpacity="0.5" />
      {/* Audience segments */}
      {[
        { x: 48, y: 44, w: 80 },
        { x: 48, y: 104, w: 64 },
        { x: 48, y: 164, w: 72 },
        { x: 300, y: 44, w: 76 },
        { x: 300, y: 104, w: 84 },
        { x: 300, y: 164, w: 68 },
      ].map((seg, i) => (
        <g key={i}>
          <rect
            x={seg.x}
            y={seg.y}
            width={seg.w}
            height="32"
            rx="4"
            fill="#132240"
            stroke={i === 1 || i === 4 ? "#3d9eff" : "rgba(244,241,234,0.12)"}
            strokeOpacity={i === 1 || i === 4 ? 0.6 : 1}
          />
          <rect
            x={seg.x + 8}
            y={seg.y + 12}
            width={seg.w - 16}
            height="8"
            rx="2"
            fill={i === 1 || i === 4 ? "#3d9eff" : "rgba(244,241,234,0.15)"}
            fillOpacity={i === 1 || i === 4 ? 0.4 : 1}
          />
        </g>
      ))}
      {/* Connecting lines from segments to target */}
      <line x1="128" y1="60" x2="178" y2="100" stroke="rgba(244,241,234,0.1)" strokeWidth="1" />
      <line x1="112" y1="120" x2="178" y2="120" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="120" y1="180" x2="178" y2="140" stroke="rgba(244,241,234,0.1)" strokeWidth="1" />
      <line x1="300" y1="60" x2="242" y2="100" stroke="rgba(244,241,234,0.1)" strokeWidth="1" />
      <line x1="300" y1="120" x2="242" y2="120" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="300" y1="180" x2="242" y2="140" stroke="rgba(244,241,234,0.1)" strokeWidth="1" />
    </svg>
  );
}
