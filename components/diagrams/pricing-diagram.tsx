export function PricingDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract competitive pricing chart showing a market gap"
      className="h-auto w-full max-w-md"
    >
      <line x1="40" y1="200" x2="400" y2="200" stroke="rgba(244,241,234,0.16)" />
      <line x1="40" y1="28" x2="40" y2="200" stroke="rgba(244,241,234,0.16)" />
      {[
        { x: 80, h: 70 },
        { x: 140, h: 92 },
        { x: 200, h: 84 },
        { x: 260, h: 110 },
        { x: 320, h: 48 },
      ].map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={200 - bar.h}
          width="36"
          height={bar.h}
          rx="3"
          fill="rgba(244,241,234,0.16)"
        />
      ))}
      <rect x="320" y="152" width="36" height="48" rx="3" fill="#3d9eff" />
      <path
        d="M80 130 C 160 124, 220 118, 300 108"
        fill="none"
        stroke="#d45a4e"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <text x="300" y="96" fill="#d45a4e" fontSize="11" fontFamily="ui-sans-serif, system-ui">
        Market gap
      </text>
    </svg>
  );
}
