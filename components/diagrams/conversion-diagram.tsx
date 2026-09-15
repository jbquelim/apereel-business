export function ConversionDiagram() {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Abstract funnel diagram showing conversion optimization"
      className="h-auto w-full max-w-md"
    >
      {/* Funnel shape */}
      <path
        className="diag-fade"
        style={{ "--d": "0ms" } as React.CSSProperties}
        d="M60 32 L360 32 L290 100 L290 180 L130 180 L130 100 Z"
        fill="none"
        stroke="rgba(244,241,234,0.12)"
        strokeWidth="1"
      />
      {/* Funnel stages */}
      <rect className="diag-fade" style={{ "--d": "40ms" } as React.CSSProperties} x="80" y="40" width="260" height="20" rx="3" fill="rgba(244,241,234,0.08)" />
      <rect className="diag-grow-x" style={{ "--d": "350ms" } as React.CSSProperties} x="80" y="40" width="260" height="20" rx="3" fill="#3d9eff" fillOpacity="0.1" />
      <rect className="diag-fade" style={{ "--d": "70ms" } as React.CSSProperties} x="120" y="72" width="180" height="20" rx="3" fill="rgba(244,241,234,0.08)" />
      <rect className="diag-grow-x" style={{ "--d": "410ms" } as React.CSSProperties} x="120" y="72" width="180" height="20" rx="3" fill="#3d9eff" fillOpacity="0.15" />
      <rect className="diag-fade" style={{ "--d": "100ms" } as React.CSSProperties} x="140" y="104" width="140" height="20" rx="3" fill="rgba(244,241,234,0.08)" />
      <rect className="diag-grow-x" style={{ "--d": "470ms" } as React.CSSProperties} x="140" y="104" width="140" height="20" rx="3" fill="#3d9eff" fillOpacity="0.25" />
      <rect className="diag-fade" style={{ "--d": "130ms" } as React.CSSProperties} x="140" y="136" width="140" height="20" rx="3" fill="rgba(244,241,234,0.08)" />
      <rect className="diag-grow-x" style={{ "--d": "530ms" } as React.CSSProperties} x="140" y="136" width="140" height="20" rx="3" fill="#3d9eff" fillOpacity="0.4" />
      <rect className="diag-grow-x" style={{ "--d": "700ms" } as React.CSSProperties} x="140" y="168" width="140" height="20" rx="3" fill="#3d9eff" fillOpacity="0.6" />
      {/* Labels */}
      <text className="diag-fade" style={{ "--d": "430ms" } as React.CSSProperties} x="210" y="54" fill="rgba(244,241,234,0.5)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        VISITORS
      </text>
      <text className="diag-fade" style={{ "--d": "490ms" } as React.CSSProperties} x="210" y="86" fill="rgba(244,241,234,0.5)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        DISCOVERY
      </text>
      <text className="diag-fade" style={{ "--d": "550ms" } as React.CSSProperties} x="210" y="118" fill="rgba(244,241,234,0.5)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        CONSIDERATION
      </text>
      <text className="diag-fade" style={{ "--d": "610ms" } as React.CSSProperties} x="210" y="150" fill="rgba(244,241,234,0.6)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        INTENT
      </text>
      <text className="diag-fade" style={{ "--d": "800ms" } as React.CSSProperties} x="210" y="182" fill="#3d9eff" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
        CONVERSION
      </text>
      {/* Improvement arrow */}
      <path className="diag-fade" style={{ "--d": "900ms" } as React.CSSProperties} d="M320 180 L340 180 L340 40 L336 48 M340 40 L344 48" fill="none" stroke="#3d9eff" strokeWidth="1" strokeOpacity="0.4" />
      <text className="diag-fade" style={{ "--d": "950ms" } as React.CSSProperties} x="348" y="114" fill="#3d9eff" fontSize="9" fontFamily="ui-monospace, monospace" fillOpacity="0.5" transform="rotate(90, 348, 114)">
        OPTIMIZE
      </text>
    </svg>
  );
}
