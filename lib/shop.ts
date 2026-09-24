import type { Product } from "@/lib/products";

export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";

// Für den Worker: zur Laufzeit statt beim Laden der Datei lesen.
export function shopEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
}

// Läuft auch im Browser; ob eine Stripe-Preis-ID existiert, prüft erst /api/checkout.
export function isPurchasable(product: Pick<Product, "status">): boolean {
  return SHOP_ENABLED && product.status === "available";
}

// Seiten, deren Info-Panel schon ein E-Mail-Formular zeigt (dort keine EmailBar).
export function hasPanelForm(product: Pick<Product, "status">): boolean {
  return product.status !== "available" || !SHOP_ENABLED;
}

// EU-Lieferländer für Stripe Checkout.
export const SHIPPING_COUNTRIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
] as const;

// Versand ist im Preis enthalten; Lieferzeit wie auf der Produktseite angegeben.
export const DELIVERY = {
  label: "Versand inklusive",
  minBusinessDays: 8,
  maxBusinessDays: 12,
} as const;

export const DELIVERY_NOTE = `Versand inklusive. Lieferung voraussichtlich in ${DELIVERY.minBusinessDays}–${DELIVERY.maxBusinessDays} Werktagen.`;
