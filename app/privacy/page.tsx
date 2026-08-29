import type { Metadata } from "next";
import { Container } from "@/components/container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Apereel handles information submitted through this website.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="pt-28 pb-24">
      <Container className="max-w-3xl">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">
          Privacy
        </p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">
          Privacy
        </h1>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted">
          <p>
            Apereel collects the name, email, company, and message you choose to
            submit through the contact form so we can respond to inquiries. We
            do not sell this information.
          </p>
          <p>
            Messages are delivered to {site.email}. You may also contact us
            there to request that an inquiry be deleted.
          </p>
          <p>
            This site uses only the technical cookies or local storage required
            for the site to function, if any. We do not run advertising pixels
            on this website.
          </p>
        </div>
      </Container>
    </main>
  );
}
