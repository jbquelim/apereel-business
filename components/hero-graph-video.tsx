"use client";

import { useEffect, useState } from "react";

// Cinematic replacement for the vector HeroGraph: one seamlessly looping
// cycle — bars rise left-to-right, the arrow draws to the top right, the
// scene holds, then gracefully resets to the empty stage and rebuilds.
// Static image under prefers-reduced-motion.
export function HeroGraphVideo() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/hero-growth.jpg"
          alt=""
          className="h-full w-full object-cover object-[75%_50%]"
        />
      ) : (
        // No poster: the cycle opens on the empty scene, so a final-frame
        // poster would flash the full graph before the build-up plays.
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-[75%_50%]"
        >
          <source src="/videos/hero-growth.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
