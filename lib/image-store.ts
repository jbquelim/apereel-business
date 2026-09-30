import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import { BROWSER_UA } from "./site-fetch";

// Product photos in our own storage. A business's server often blocks
// hotlinking or serves bot checks, and its old site disappears once the new
// one takes over the domain, so every photo we use is copied once to Vercel
// Blob (needs BLOB_READ_WRITE_TOKEN) and served from there. image_cache maps
// the original address to the copy; failures are remembered so they aren't
// retried on every run.

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

async function download(url: string): Promise<{ body: ArrayBuffer; type: string } | null> {
  for (const ua of [BROWSER_UA, "Mozilla/5.0"]) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": ua, Accept: "image/*" }, signal: AbortSignal.timeout(12_000) });
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
      if (res.ok && EXT[type]) {
        const body = await res.arrayBuffer();
        if (body.byteLength > 500 && body.byteLength < 8_000_000) return { body, type };
      }
    } catch {
      /* try the next agent */
    }
  }
  return null;
}

/** Copies photos not yet stored. Returns how many were stored this call. */
export async function storeImages(urls: string[], budgetMs = 60_000): Promise<number> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || urls.length === 0) return 0;
  const unique = [...new Set(urls.filter(Boolean))];
  const known = new Set(((await sql()`SELECT source_url FROM image_cache WHERE source_url = ANY(${unique})`) as { source_url: string }[]).map((r) => r.source_url));
  const todo = unique.filter((u) => !known.has(u));
  const deadline = Date.now() + budgetMs;
  let stored = 0;
  for (let i = 0; i < todo.length && Date.now() < deadline; i += 6) {
    await Promise.all(
      todo.slice(i, i + 6).map(async (url) => {
        const img = await download(url);
        if (!img) {
          await sql()`INSERT INTO image_cache (source_url, status) VALUES (${url}, 'blocked') ON CONFLICT (source_url) DO NOTHING`;
          return;
        }
        const name = `products/${createHash("sha256").update(url).digest("hex").slice(0, 24)}.${EXT[img.type]}`;
        const blob = await put(name, Buffer.from(img.body), { access: "public", contentType: img.type, allowOverwrite: true });
        await sql()`
          INSERT INTO image_cache (source_url, stored_url, status) VALUES (${url}, ${blob.url}, 'stored')
          ON CONFLICT (source_url) DO UPDATE SET stored_url = EXCLUDED.stored_url, status = 'stored'
        `;
        stored++;
      }),
    );
  }
  return stored;
}

/** Stored copies for the given originals (original kept when there's no copy). */
export async function storedUrls(urls: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = (await sql()`SELECT source_url, stored_url FROM image_cache WHERE source_url = ANY(${unique}) AND stored_url IS NOT NULL`) as { source_url: string; stored_url: string }[];
  return new Map(rows.map((r) => [r.source_url, r.stored_url]));
}
