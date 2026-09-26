"use client";

// Single entry point for the motion library. Import `m` and MotionProvider
// from here — never `motion` from "motion/react" directly. `m` components
// carry no animation runtime of their own; the runtime loads only where a
// MotionProvider wraps them, so sections that don't use motion pay 0 KB.
//
// CSS keeps owning entrances, reveals, and staggers (globals.css). Reach for
// this only where CSS can't go: interruptible springs, gestures/drag, layout
// animations, exit transitions. Respect reduced motion via useReducedMotion.
//
// Usage:
//   <MotionProvider>
//     <m.div animate={{ ... }} />
//   </MotionProvider>

import { LazyMotion, domAnimation } from "motion/react";

export {
  m,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  animate,
} from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
