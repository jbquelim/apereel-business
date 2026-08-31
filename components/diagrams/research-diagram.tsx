export function ResearchDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram of competitive research with data analysis"
      className="h-auto w-full max-w-md"
    >
      {/* Grid of data points */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const active = (row + col) % 3 !== 0;
          return (
            <circle
              key={`${row}-${col}`}
              cx={80 + col * 68}
              cy={48 + row * 50}
              r={active ? 6 : 4}
              fill={active ? "#3d9eff" : "transparent"}
              fillOpacity={active ? 0.2 + ((row * 5 + col) % 4) * 0.15 : 0}
              stroke={active ? "#3d9eff" : "rgba(244,241,234,0.15)"}
              strokeWidth="1"
            />
          );
        }),
      )}
      {/* Connection lines between key data points */}
      <path
        d="M80 48 L148 98 L216 48 L284 98 L352 48"
        fill="none"
        stroke="#3d9eff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <path
        d="M80 148 L148 198 L216 148 L284 198 L352 148"
        fill="none"
        stroke="#3d9eff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      {/* Magnifying glass */}
      <circle cx="210" cy="130" r="36" fill="none" stroke="#3d9eff" strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1="236" y1="156" x2="260" y2="180" stroke="#3d9eff" strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Highlighted insight */}
      <circle cx="210" cy="130" r="6" fill="#3d9eff" fillOpacity="0.6" />
    </svg>
  );
}
