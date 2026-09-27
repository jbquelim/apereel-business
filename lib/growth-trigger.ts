// Starts a Growth Plan generation stage on the internal route. The route
// answers 202 immediately and does the work after responding.
export async function triggerStage(base: string, orderId: string, stage: "collect" | "plan", regenerate = false) {
  const res = await fetch(`${base}/api/growth/generate`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-secret": process.env.CRON_SECRET ?? "" },
    body: JSON.stringify({ orderId, stage, regenerate }),
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status !== 202) throw new Error(`Could not start ${stage} stage (${res.status})`);
}
