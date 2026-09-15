export function PricingDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract competitive pricing chart showing a market gap"
      className="h-auto w-full max-w-md"
    >
      <line className="diag-fade" style={{ "--d": "0ms" } as React.CSSProperties} x1="40" y1="200" x2="400" y2="200" stroke="rgba(244,241,234,0.16)" />
      <line className="diag-fade" style={{ "--d": "30ms" } as React.CSSProperties} x1="40" y1="28" x2="40" y2="200" stroke="rgba(244,241,234,0.16)" />
      {[
        { x: 80, h: 70 },
        { x: 140, h: 92 },
        { x: 200, h: 84 },
        { x: 260, h: 110 },
        { x: 320, h: 48 },
      ].map((bar, i) => (
        <rect
          key={bar.x}
          className="diag-grow-y"
          style={{ "--d": `${350 + i * 60}ms` } as React.CSSProperties}
          x={bar.x}
          y={200 - bar.h}
          width="36"
          height={bar.h}
          rx="3"
          fill="rgba(244,241,234,0.16)"
        />
      ))}
      <path
        className="diag-fade"
        style={{ "--d": "700ms" } as React.CSSProperties}
        d="M80 130 C 160 124, 220 118, 300 108"
        fill="none"
        stroke="#d45a4e"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <rect className="diag-grow-y" style={{ "--d": "850ms" } as React.CSSProperties} x="320" y="152" width="36" height="48" rx="3" fill="#3d9eff" />
      <text className="diag-fade" style={{ "--d": "1000ms" } as React.CSSProperties} x="300" y="96" fill="#d45a4e" fontSize="11" fontFamily="ui-sans-serif, system-ui">
        Market gap
      </text>
    </svg>
  );
}
