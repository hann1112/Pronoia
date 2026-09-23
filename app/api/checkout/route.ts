import { NextResponse } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { SHIPPING_COUNTRIES, SHOP_ENABLED } from "@/lib/shop";
import { SITE_URL } from "@/lib/site";
import { getStripe, remainingStock, volumeQuantities } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z
    .array(z.object({ slug: z.string().max(20), quantity: z.number().int().min(1).max(10) }))
    .min(1)
    .max(10),
});

export async function POST(request: Request) {
  if (!SHOP_ENABLED) {
    return NextResponse.json({ error: "shop_closed" }, { status: 403 });
  }

  const stripe = getStripe();
  const shippingRates = (process.env.STRIPE_SHIPPING_RATES ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (!stripe || shippingRates.length === 0) {
    console.error("Checkout: STRIPE_SECRET_KEY oder STRIPE_SHIPPING_RATES fehlt.");
    return NextResponse.json({ error: "checkout_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const lineItems: { price: string; quantity: number }[] = [];
  for (const item of parsed.data.items) {
    const product = getProduct(item.slug);
    if (!product || product.status !== "available" || !product.stripePriceId) {
      return NextResponse.json({ error: "not_available", slug: item.slug }, { status: 409 });
    }
    lineItems.push({ price: product.stripePriceId, quantity: item.quantity });
  }

  try {
    // Auflage je Band ist begrenzt; ein Set zählt für beide Bände.
    const remaining = await remainingStock(stripe);
    for (const [slug, quantity] of volumeQuantities(parsed.data.items)) {
      if (quantity > (remaining.get(slug) ?? 0)) {
        return NextResponse.json({ error: "sold_out", slug }, { status: 409 });
      }
    }

    const cart = parsed.data.items.map(({ slug, quantity }) => `${slug}:${quantity}`).join(",");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      locale: "de",
      submit_type: "pay",
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      shipping_options: shippingRates.map((rate) => ({ shipping_rate: rate })),
      allow_promotion_codes: true,
      invoice_creation: { enabled: true },
      customer_creation: "always",
      consent_collection: { terms_of_service: "required" },
      success_url: `${SITE_URL}/danke?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?cart=open`,
      metadata: { cart, edition: "prototype-v2" },
      payment_intent_data: { metadata: { cart, edition: "prototype-v2" } },
    });
    if (!session.url) throw new Error("Stripe hat keine Checkout-URL geliefert.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout: Session konnte nicht erstellt werden.", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
