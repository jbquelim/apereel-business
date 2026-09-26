import type { Metadata } from "next";
import { CoffeeWorktable } from "@/components/coffee-worktable";
import { CreativeFilm } from "@/components/creative-film";
import { LivingBusinessMachine } from "@/components/living-business-machine";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Each capability solves a specific growth constraint: research and competitive analysis, SEO, advertising, conversion optimization, web development, and AI-powered creative production.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | Apereel",
    description:
      "Capabilities matched to growth constraints — from competitive research to creative production without the six-figure budget.",
  },
};

export default function ServicesPage() {
  return (
    <main id="main" className="pt-10">
      <LivingBusinessMachine />
      <CreativeFilm />
      <CoffeeWorktable />
    </main>
  );
}
