// Vector recreation of the original hero image — ascending revenue bars with
// a swooping growth arrow — rebuilt as SVG so it can animate: bars rise
// left-to-right, then the arrow draws across their tops. Static final frame
// under prefers-reduced-motion (see globals.css).
const BAR_COUNT = 16;
const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
  const height = Math.round(26 * Math.pow(1.2, i));
  return { x: 40 + i * 48, height, y: 620 - height };
});

export function HeroGraph() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 bottom-0 hidden w-[62%] max-w-[880px] sm:block"
    >
      <svg viewBox="0 0 880 640" className="h-auto w-full">
        <defs>
          <linearGradient id="heroBarGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(19, 34, 64, 0.55)" />
            <stop offset="100%" stopColor="rgba(61, 158, 255, 0.34)" />
          </linearGradient>
          <linearGradient id="heroArrowGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d6fd4" />
            <stop offset="100%" stopColor="#7cc0ff" />
          </linearGradient>
        </defs>
        {bars.map((b, i) => (
          <rect
            key={b.x}
            className="hero-bar"
            style={{ "--d": `${200 + i * 45}ms` } as React.CSSProperties}
            x={b.x}
            y={b.y}
            width="34"
            height={b.height}
            rx="3"
            fill="url(#heroBarGrad)"
          />
        ))}
        <path
          className="hero-arrow-path"
          d="M 60 556 C 320 540, 640 430, 800 150"
          fill="none"
          stroke="url(#heroArrowGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={1}
        />
        <g transform="translate(800, 150) rotate(-60)">
          <polygon className="hero-arrow-head" points="0,-15 28,0 0,15" fill="#7cc0ff" />
        </g>
      </svg>
    </div>
  );
}
