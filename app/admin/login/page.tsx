import type { Metadata } from "next";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[520px] px-6 py-24 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Apereel admin</p>
        <h1 className="font-display mt-4 text-4xl text-ink">Sign in</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Enter your admin email and we&apos;ll send you a one-time sign-in link.
        </p>
        {expired && (
          <p role="alert" className="mt-4 text-[14px] text-signal">
            That link has expired or was already used. Request a new one.
          </p>
        )}
        <AdminLoginForm />
      </section>
    </main>
  );
}
