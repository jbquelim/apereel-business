import type { Metadata } from "next";
import { IllustratedApproach } from "@/components/illustrated-approach";
import { Perspectives } from "@/components/insights";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "The Apereel method: fix the business first, then amplify it with digital. Research, build the advantage, translate it online, amplify, and measure what made the business stronger.",
  alternates: { canonical: "/approach" },
  openGraph: {
    title: "Approach | Apereel",
    description:
      "Fix the business first. Then amplify it with digital — the five-step Apereel method.",
  },
};

export default function ApproachPage() {
  return (
    <main id="main" className="pt-10">
      <IllustratedApproach />
      <Perspectives />
    </main>
  );
}
