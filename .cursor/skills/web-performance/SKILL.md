---
name: web-performance
description: >-
  Protects Core Web Vitals and engineering quality on the Next.js Apereel site.
  Use when adding dependencies, images, video, fonts, client JavaScript,
  animation, or investigating performance.
---

# Web Performance & Technical Quality

Marketing pages should feel instant. Do not sacrifice performance for unnecessary visual effects.

## Optimize

Core Web Vitals · image loading · video loading · fonts · JavaScript bundles · hydration · caching · responsive images · lazy loading · code splitting

## Engineering

- Do not add libraries casually. Every dependency needs a reason.
- Prefer Server Components. `"use client"` only for nav, forms, and other genuine interaction.
- Use `next/font`, `next/image` for raster photos, and keep client JS small.
- Before adding motion or video: is there a cheaper CSS or static equivalent?
- Next.js APIs: follow `AGENTS.md` and `node_modules/next/dist/docs/`.

## Combine

SEO plumbing: `business-first-seo`. Motion taste: `premium-art-direction`. A11y of motion: `responsive-accessibility`.
