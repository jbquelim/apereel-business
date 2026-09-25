import type { Metadata } from "next";
import { PanoramicJourney } from "@/components/panoramic-journey";
import { MeasureStatement } from "@/components/proof-section";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Real business problems and the fixes that moved revenue: inventory-led SEO, product discovery UX, pricing intelligence, development transformation, and brand-compliant e-commerce.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Work | Apereel",
    description:
      "What we found and what we changed — case studies in business-first digital growth.",
  },
};

export default function WorkPage() {
  return (
    <main id="main" className="pt-10">
      <PanoramicJourney />
      <MeasureStatement />
    </main>
  );
}
