"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// While renders are pending, nudges the render queue once a minute and
// refreshes the page when something finishes. Renders nothing.
export function MediaNudger({ pending }: { pending: number }) {
  const router = useRouter();
  useEffect(() => {
    if (pending <= 0) return;
    let last = pending;
    const id = setInterval(async () => {
      const res = await fetch("/api/media/nudge", { method: "POST" }).catch(() => null);
      const json = (await res?.json().catch(() => null)) as { pending?: number } | null;
      if (json?.pending != null && json.pending !== last) {
        last = json.pending;
        router.refresh();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [pending, router]);
  return null;
}
