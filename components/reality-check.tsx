"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";

type Slide = {
  num: string;
  tabLabel: string;
  overlayLabel: string;
  image: string;
  thumb: string;
  eyebrow: string;
  title: string;
  body: string;
  chips: string[];
  takeawayKicker: string;
  takeaway: string;
};

const SLIDES: Slide[] = [
  {
    num: "01",
    tabLabel: "Business fundamentals",
    overlayLabel: "Business Fundamentals",
    image: "/images/growth-business-fundamentals.jpg",
    thumb: "/images/growth-business-fundamentals-thumb.jpg",
    eyebrow: "Build a stronger business",
    title: "Growth starts beyond the content calendar.",
    body: "Pricing, product selection, and customer experience shape the buying decision. Your marketing should support those strengths.",
    chips: ["Competitive pricing", "Relevant products", "Easy shopping"],
    takeawayKicker: "The takeaway",
    takeaway: "Fix what limits the buying decision.",
  },
  {
    num: "02",
    tabLabel: "Competitive advantage",
    overlayLabel: "Competitive Advantage",
    image: "/images/growth-competitive-advantage.jpg",
    thumb: "/images/growth-competitive-advantage-thumb.jpg",
    eyebrow: "Give people a reason to choose you",
    title: "Being found matters less than being chosen.",
    body: "Before asking how to rank higher, understand what makes your business the better choice — then make it impossible to miss.",
    chips: ["Clear positioning", "Real differentiation", "A reason to buy"],
    takeawayKicker: "Ask this",
    takeaway: "Why should customers choose us?",
  },
  {
    num: "03",
    tabLabel: "Measurable results",
    overlayLabel: "Measurable Results",
    image: "/images/growth-measurable-results.jpg",
    thumb: "/images/growth-measurable-results-thumb.jpg",
    eyebrow: "Proof that reaches the business",
    title: "Rankings alone don't tell the whole story.",
    body: "Connect search demand and relevant traffic to real outcomes — the numbers that actually reach the P&L.",
    chips: ["Qualified traffic", "Conversions", "Revenue & margin"],
    takeawayKicker: "Measure this",
    takeaway: "Qualified leads, conversions, and sales.",
  },
];

const KICKER = "text-[11px] font-semibold tracking-[0.18em] text-electric-deep uppercase";

function Check() {
  return (
    <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-electric-deep">
      <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
        <path
          d="M5 13l4 4L19 7"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function RealityCheck() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];
  const go = (dir: number) =>
    setActive((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    <section
      id="reality-check"
      aria-labelledby="reality-check-heading"
      className="reveal-section bg-ink py-16 sm:py-20 lg:py-24"
    >
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:items-end md:justify-between">
          <div>
            <p className={KICKER}>The Apereel Perspective</p>
            <h2
              id="reality-check-heading"
              className="font-display mt-3 text-4xl font-normal tracking-[-0.02em] text-navy sm:text-5xl lg:whitespace-nowrap"
            >
              What good digital growth looks like.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-navy/60 sm:text-xl">
              Three things to look for before investing more in marketing.
            </p>
          </div>
          <Link
            href="/approach"
            className="press-scale inline-flex flex-none items-center gap-2 rounded-full border border-electric-deep/30 px-5 py-3 text-sm font-semibold text-electric-deep transition-colors hover:bg-electric-deep hover:text-white"
          >
            Explore our approach
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Feature card */}
        <div className="mt-10 rounded-[24px] border border-navy/8 bg-white p-3 shadow-[0_24px_60px_-30px_rgba(7,14,28,0.30)] sm:mt-14 sm:p-4">
          <div key={active} className="tab-content grid gap-4 lg:grid-cols-2">
            {/* Image */}
            <div className="relative min-h-[280px] overflow-hidden rounded-[18px] lg:min-h-[440px]">
              <Image
                src={slide.image}
                alt={slide.overlayLabel}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority={active === 0}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/70 to-transparent"
                aria-hidden="true"
              />
              <p className="absolute bottom-5 left-5 text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase sm:bottom-6 sm:left-6">
                {slide.num} <span className="text-white/50">/</span>{" "}
                {slide.overlayLabel}
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-4 sm:p-8 lg:p-10">
              <p className={KICKER}>{slide.eyebrow}</p>
              <h3 className="font-display mt-3 text-3xl tracking-[-0.02em] text-navy text-balance sm:text-4xl">
                {slide.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-navy/60 sm:text-lg">
                {slide.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {slide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-full bg-electric/8 px-3.5 py-2 text-sm font-medium text-navy"
                  >
                    <Check />
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-8 border-t border-navy/10 pt-6">
                <p className={KICKER}>{slide.takeawayKicker}</p>
                <p className="mt-2 text-lg font-semibold text-navy">
                  {slide.takeaway}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + pager */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {SLIDES.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  aria-label={`Show ${s.tabLabel}`}
                  className={`press-scale flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    on
                      ? "border-electric-deep bg-white ring-1 ring-electric-deep/25"
                      : "border-navy/10 bg-white/50 hover:border-navy/20 hover:bg-white"
                  }`}
                >
                  <Image
                    src={s.thumb}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 flex-none rounded-lg object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-navy/40 tabular-nums">
                      {s.num}
                    </span>
                    <span className="block text-sm leading-snug font-medium text-navy">
                      {s.tabLabel}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 lg:flex-none">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="press-scale flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:border-electric-deep hover:text-electric-deep"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-navy/60 tabular-nums">
              {slide.num} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="press-scale flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:border-electric-deep hover:text-electric-deep"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
