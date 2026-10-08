import type { Metadata } from "next";
import { Container } from "@/components/container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our crawler",
  description: "What Apereel's crawler reads, how it behaves, and how to allow it or ask us to stop.",
};

// What our crawler is, for site owners and their hosts (lib/polite-fetch).
export default function BotPage() {
  return (
    <main id="main" className="pt-28 pb-24">
      <Container className="max-w-3xl">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-electric uppercase">Crawler</p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">Apereel&apos;s crawler</h1>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted">
          <p>
            Apereel builds websites, content and ads for businesses from their own products. To do that, our crawler
            reads the public pages and product feeds of our clients&apos; sites, and the public catalogs of the stores
            they compete with, the same pages any visitor&apos;s browser loads.
          </p>
          <h2 className="pt-4 text-xl text-ink">How it behaves</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>At most two requests at a time to any site, spaced out, and slower whenever a site asks.</li>
            <li>When a site answers &ldquo;too many requests&rdquo; or &ldquo;busy&rdquo;, it waits as long as the site says before trying again.</li>
            <li>Every request carries <code>From: {site.email}</code>, so you can reach us.</li>
            <li>It never works around a block. If your site refuses it, it stops.</li>
          </ul>
          <h2 className="pt-4 text-xl text-ink">For our clients: letting it through your firewall</h2>
          <p>
            Each client has a private token, shown in their studio. Our crawler sends it as the header{" "}
            <code>X-Apereel-Verify</code> on requests to that client&apos;s site only. Allow requests that carry your
            token (in Cloudflare: Security → WAF → Custom rules, action <em>Skip</em>) and everything else stays
            blocked. Or upload your product file in your studio instead.
          </p>
          <h2 className="pt-4 text-xl text-ink">Ask us to stop</h2>
          <p>
            Email <a className="text-electric underline underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a> with your
            domain and we&apos;ll stop reading it.
          </p>
        </div>
      </Container>
    </main>
  );
}
