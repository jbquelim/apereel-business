import type { Metadata } from "next";
import { Founder } from "@/components/founder";

export const metadata: Metadata = {
  title: "About",
  description:
    "John Lim grew an e-commerce operation 20X in four years by fixing the business before the marketing. Apereel exists to ask the question agencies skip: why should customers choose you?",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Apereel",
    description:
      "The founder and principles behind Apereel's business-first approach to digital growth.",
  },
};

export default function AboutPage() {
  return (
    <main id="main" className="pt-10">
      <Founder />
    </main>
  );
}
