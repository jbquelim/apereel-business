"use client";

import { useEffect, useRef, useState } from "react";

// Cinematic replacement for the vector HeroGraph, in two acts: the entrance
// clip plays once (bars rise left-to-right, arrow draws to the top right),
// then hands off to an ambient loop whose boundary frames match the entrance's
// final frame — continuous motion with no visible jump. Static image under
// prefers-reduced-motion.
export function HeroGraphVideo() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entered, setEntered] = useState(false);
  const loopRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden sm:block"
    >
      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/hero-growth.jpg"
          alt=""
          className="h-full w-full object-cover object-[75%_100%]"
        />
      ) : (
        <>
          {/* Entrance — no poster: the clip opens on the empty scene, so a
              final-frame poster would flash the full graph before it plays. */}
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              loopRef.current?.play();
              setEntered(true);
            }}
            className={`absolute inset-0 h-full w-full object-cover object-[75%_100%] ${
              entered ? "invisible" : ""
            }`}
          >
            <source src="/videos/hero-growth.mp4" type="video/mp4" />
          </video>
          <video
            ref={loopRef}
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 h-full w-full object-cover object-[75%_100%] ${
              entered ? "" : "invisible"
            }`}
          >
            <source src="/videos/hero-growth-loop.mp4" type="video/mp4" />
          </video>
        </>
      )}
    </div>
  );
}
