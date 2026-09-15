"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-triggered count-up for marketing metrics. Renders the final value
// for SSR, no-JS, and prefers-reduced-motion; animates once on first
// intersection. Numbers are tweened, surrounding text ("+", "%", "Top")
// stays static.
const DURATION_MS = 1100;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const match = value.match(/([\d,]+(?:\.\d+)?)/);
    if (!match) return;
    const target = parseFloat(match[1].replace(/,/g, ""));
    const decimals = (match[1].split(".")[1] ?? "").length;
    const grouped = match[1].includes(",");
    const fmt = (n: number) =>
      grouped
        ? n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : n.toFixed(decimals);

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          setDisplay(value.replace(match[1], fmt(target * easeOut(t))));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className ? `tabular-nums ${className}` : "tabular-nums"}>
      {display}
    </span>
  );
}
