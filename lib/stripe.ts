import Stripe from "stripe";
import { EDITION_SIZE, getProduct, type ProductSlug } from "@/lib/products";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

// Einzelbände, deren Bestand gezählt wird. Ein Set zählt für jeden seiner Bände.
const VOLUMES: ProductSlug[] = ["body", "mind"];

export function volumeQuantities(items: { slug: string; quantity: number }[]): Map<ProductSlug, number> {
  const quantities = new Map<ProductSlug, number>();
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    for (const slug of product.bundleOf ?? [product.slug]) {
      quantities.set(slug, (quantities.get(slug) ?? 0) + item.quantity);
    }
  }
  return quantities;
}

// Der Verkaufsstand liegt als Metadata „sold“ am Stripe-Produkt des jeweiligen Bandes.
async function volumeProduct(stripe: Stripe, slug: ProductSlug): Promise<Stripe.Product> {
  const priceId = getProduct(slug)?.stripePriceId;
  if (!priceId) throw new Error(`Keine Stripe-Preis-ID für ${slug}.`);
  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
  return price.product as Stripe.Product;
}

export async function remainingStock(stripe: Stripe): Promise<Map<ProductSlug, number>> {
  const remaining = new Map<ProductSlug, number>();
  for (const slug of VOLUMES) {
    const product = await volumeProduct(stripe, slug);
    remaining.set(slug, EDITION_SIZE - Number(product.metadata.sold ?? 0));
  }
  return remaining;
}

export async function recordSold(stripe: Stripe, quantities: Map<ProductSlug, number>) {
  for (const [slug, quantity] of quantities) {
    if (!VOLUMES.includes(slug) || quantity <= 0) continue;
    const product = await volumeProduct(stripe, slug);
    const sold = Number(product.metadata.sold ?? 0) + quantity;
    await stripe.products.update(product.id, { metadata: { sold: String(sold) } });
  }
}
