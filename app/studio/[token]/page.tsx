import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allowance, getClientByToken, tierFor } from "@/lib/clients";
import { listContent } from "@/lib/content-engine";
import { StudioItems } from "./studio-items";

// A client's studio: this month's content, made by AI from their own
// products, with a change box on every item and their remaining allowance.

export const metadata: Metadata = { title: "Your studio", robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

export default async function StudioPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getClientByToken(token);
  if (!client) notFound();
  const [items, left] = await Promise.all([listContent(client.id), allowance(client)]);
  const tier = tierFor(client);
  const batch = items[0]?.batch ?? null;
  const current = items.filter((i) => i.batch === batch);

  return (
    <main id="main" className="bg-navy pt-10">
      <section className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.24em] text-electric uppercase">Apereel studio · {tier?.label ?? ""}</p>
        <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">{client.domain}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          Made by AI from your own products and what we know of your market. Ask for any change in plain
          words; each change uses one request.
        </p>
        <p className="mt-6 inline-flex rounded-full border border-electric/40 bg-electric/5 px-4 py-2 font-mono text-[13px] text-ink">
          {left.left} of {left.limit} change requests left this month
        </p>
        {current.length === 0 ? (
          <p className="mt-12 text-[15px] text-muted">Your first batch is being prepared. Check back in a few minutes.</p>
        ) : (
          <StudioItems token={token} items={current} left={left.left} />
        )}
      </section>
    </main>
  );
}
