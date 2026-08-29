---
name: business-first-seo
description: >-
  Applies Apereel's SEO philosophy and technical SEO on the Next.js site. Use
  when editing metadata, headings, schema, sitemap, robots, internal links, or
  content strategy.
---

# Business-First SEO

**Principle (verbatim):** “The strongest long-term SEO strategy is often becoming a better answer for the customer.”

Technical SEO is mandatory infrastructure, not the competitive advantage. Content starts from customer intent, business strength, real expertise, product/service depth, competitive advantage, and useful information.

## Always implement

Metadata · semantic HTML · H1/H2 hierarchy · canonical URLs · structured data · internal linking · sitemap · robots.txt · accessibility (`responsive-accessibility`) · performance (`web-performance`) · image optimization · crawlability

On this stack: App Router `metadata` / `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`, JSON-LD. Read `node_modules/next/dist/docs/` when Next.js APIs are involved (`AGENTS.md`).

## Content

- One H1 per page. Headings must describe the business idea, not keyword soup.
- Internal links should help a decision maker (Approach, Work, Contact), not farm PageRank.
- Never create filler to target keywords. Never keyword-stuff.

## Never

- Claim that a correlation from experience is a confirmed Google ranking factor.
- Treat metadata, schema, or H1s as the strategy. They are expected.
- Invent proof to look authoritative — `confidentiality-claims`.
