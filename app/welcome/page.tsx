import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";

// After Checkout: once the webhook has created the client, go straight to
// their studio; until then, a short holding page that refreshes itself.

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const id = (await searchParams).session_id ?? "";
  if (/^cs_[A-Za-z0-9_]+$/.test(id) && process.env.DATABASE_URL) {
    const rows = (await neon(process.env.DATABASE_URL)`SELECT token FROM clients WHERE stripe_checkout_session = ${id}`) as { token: string }[];
    if (rows[0]) redirect(`/studio/${rows[0].token}`);
  }
  return (
    <main id="main" className="bg-navy pt-10">
      <meta httpEquiv="refresh" content="4" />
      <section className="mx-auto w-full max-w-[760px] px-6 py-28 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Payment received</p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">Thank you. Setting up your studio…</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          This page moves on by itself in a few seconds. Your studio link is also on its way to your email.
        </p>
      </section>
    </main>
  );
}
