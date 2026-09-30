import { neon } from "@neondatabase/serverless";

// One way to call Claude for the AI services. Every call is logged to
// ai_requests with its tokens and cost, so real costs per client and per
// tier are always known, not estimated.

// USD per million tokens (claude.com/pricing, checked 2026-09-30).
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export type AiCall = {
  model?: keyof typeof PRICES;
  system?: string;
  prompt: string;
  maxTokens?: number;
  clientId?: string | null;
  purpose: string;
  /** True when this call is a customer's change request (counts toward their allowance). */
  countsTowardAllowance?: boolean;
};

async function log(c: AiCall, model: string, usage: { input_tokens?: number; output_tokens?: number } | null, ok: boolean, error?: string) {
  if (!process.env.DATABASE_URL) return;
  const price = PRICES[model];
  const cost = usage && price ? ((usage.input_tokens ?? 0) * price.input + (usage.output_tokens ?? 0) * price.output) / 1_000_000 : null;
  try {
    await neon(process.env.DATABASE_URL)`
      INSERT INTO ai_requests (client_id, purpose, counts_toward_allowance, model, input_tokens, output_tokens, cost_usd, ok, error)
      VALUES (${c.clientId ?? null}, ${c.purpose}, ${!!c.countsTowardAllowance}, ${model},
              ${usage?.input_tokens ?? null}, ${usage?.output_tokens ?? null}, ${cost}, ${ok}, ${error?.slice(0, 500) ?? null})
    `;
  } catch (err) {
    console.error("ai_requests log failed:", err);
  }
}

/** Calls Claude and returns the text. Throws on failure (after logging it). */
export async function callClaude(c: AiCall): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const model = c.model ?? "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: c.maxTokens ?? 4000,
      ...(model === "claude-opus-5-5" ? {} : { thinking: { type: "disabled" } }),
      ...(c.system ? { system: c.system } : {}),
      messages: [{ role: "user", content: c.prompt }],
    }),
    signal: AbortSignal.timeout(180_000),
  }).catch((err: unknown) => err as Error);
  if (res instanceof Error) {
    await log(c, model, null, false, res.message);
    throw res;
  }
  const data = (await res.json().catch(() => null)) as {
    content?: { type: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
    error?: { message?: string };
  } | null;
  if (!res.ok || !data) {
    const msg = `${model} ${res.status} ${data?.error?.message ?? ""}`.trim();
    await log(c, model, data?.usage ?? null, false, msg);
    throw new Error(msg);
  }
  await log(c, model, data.usage ?? null, true);
  return data.content?.find((b) => b.type === "text")?.text ?? "";
}

/** The first JSON object or array in a model reply. */
export function parseJson<T>(text: string): T | null {
  const m = text.match(/[[{][\s\S]*[\]}]/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}
