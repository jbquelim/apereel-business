import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[80vh] items-center pt-24">
      <Container>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          404
        </p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-6xl">
          This page is not the best result.
        </h1>
        <p className="mt-5 max-w-lg text-muted">
          The page you requested does not exist. Return to the Apereel homepage
          to continue.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.08em] text-navy uppercase"
        >
          Back to Apereel
        </Link>
      </Container>
    </main>
  );
}
