import { getSiteById } from "@/lib/site-builder";
import { productCheckout } from "@/lib/connect";

// "Buy now" on a customer's site: a plain form post (no script on their
// site) that opens Stripe Checkout on the business's own Stripe account.
// The price always comes from the site document, never from the form.

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const site = await getSiteById((await params).id);
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("product") ?? "");
  const back = String(form?.get("url") ?? request.headers.get("referer") ?? "");
  const product = site?.doc.products.find((p) => p.slug === slug);
  if (!site || !product || site.doc.productAction !== "checkout" || !site.stripe_account_id || site.payments_status !== "active") {
    return new Response("This product can't be bought online right now.", { status: 409 });
  }
  // Return to the page the buyer was on, on the site's own host only.
  let productUrl = back;
  try {
    const u = new URL(back);
    const own = site.custom_domain ? [site.custom_domain, `www.${site.custom_domain}`] : [];
    if (!own.includes(u.hostname) && !/(^|\.)apereel\.com$/.test(u.hostname)) throw new Error("foreign");
    productUrl = `${u.origin}${u.pathname}`;
  } catch {
    productUrl = site.custom_domain ? `https://${site.custom_domain}/products/${product.slug}` : `https://www.apereel.com/sites/${site.slug}/products/${product.slug}`;
  }
  try {
    return Response.redirect(await productCheckout({ account: site.stripe_account_id, product, productUrl }), 303);
  } catch (err) {
    console.error("Site checkout failed:", err instanceof Error ? err.message : err);
    return new Response("Checkout couldn't open. Please try again in a moment.", { status: 502 });
  }
}
