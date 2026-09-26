"use client";

import { useSyncExternalStore } from "react";

// The user's reduced-motion preference as a subscribed value. The server (and
// the hydration pass) always sees `false`, so markup matches; the real value
// takes over right after hydration and updates live if the setting changes.
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
