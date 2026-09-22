import type { Metadata } from "next";
import { Founder } from "@/components/founder";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Meet John Lim, the founder behind Apereel's business-first approach, and tell us what you sell, who buys it, and what's not working. That's where every engagement starts.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Apereel",
    description:
      "Meet the founder behind Apereel's business-first approach and start the conversation.",
  },
};

// The contact form itself renders globally above the footer, so this page
// pairs the founder story with it.
export default function ContactPage() {
  return (
    <main id="main" className="pt-10">
      <Founder />
    </main>
  );
}
