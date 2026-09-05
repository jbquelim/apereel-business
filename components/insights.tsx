"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import { perspectives } from "@/lib/site";

export function Perspectives() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="perspectives"
      aria-labelledby="perspectives-heading"
      className="reveal-section bg-ink py-24 sm:py-32"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
            Before We Start
          </p>
          <h2
            id="perspectives-heading"
            className="font-display mt-4 text-3xl text-navy sm:text-4xl"
          >
            The questions your current agency isn&apos;t asking.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy/60">
            These should come up before any marketing plan.
          </p>
        </div>
        <ul className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
          {perspectives.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.title}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start gap-4 py-6 text-left sm:py-8"
                  aria-expanded={isOpen}
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric/60"
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <p className="font-display text-lg text-navy sm:text-xl">
                      {item.title}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] tracking-[0.18em] text-navy/60 uppercase sm:mt-1.5">
                      {item.category}
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={`mt-1.5 h-5 w-5 shrink-0 text-navy/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 pl-5.5 sm:pb-8">
                      {item.answer.split("\n\n").map((p, j) => (
                        <p key={j} className="mt-2 text-base leading-relaxed text-navy/60">{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
