export function InventoryDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract diagram of a product catalog filling in over time"
      className="h-auto w-full max-w-md"
    >
      <rect width="420" height="240" fill="transparent" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) => {
          const filled = row * 6 + col < 22;
          const delay = row * 6 + col;
          return (
            <rect
              key={`${row}-${col}`}
              x={24 + col * 64}
              y={28 + row * 40}
              width="48"
              height="28"
              rx="4"
              fill={filled ? "#3d9eff" : "transparent"}
              fillOpacity={filled ? 0.18 + (delay % 5) * 0.08 : 0}
              stroke={filled ? "#3d9eff" : "rgba(244,241,234,0.18)"}
              strokeWidth="1"
            />
          );
        }),
      )}
    </svg>
  );
}
