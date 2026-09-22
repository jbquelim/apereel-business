"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
  // Re-scan on every route change: client-side navigations mount fresh
  // .reveal-section nodes that the previous observer never saw, which left
  // them stuck at opacity 0 until a hard refresh.
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sections = document.querySelectorAll(".reveal-section");

    if (prefersReducedMotion) {
      sections.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" },
    );

    sections.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
