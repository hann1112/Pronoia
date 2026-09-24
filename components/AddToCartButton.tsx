"use client";

import { useCartStore } from "@/lib/cart-store";
import { getProduct, type ProductSlug } from "@/lib/products";
import { isPurchasable, SHOP_ENABLED } from "@/lib/shop";

type AddToCartButtonProps = {
  slug: ProductSlug;
  disabled?: boolean;
  label?: string;
  variant?: "solid" | "outline" | "link";
};

export function AddToCartButton({
  slug,
  disabled = false,
  label = "In den Warenkorb",
  variant = "solid",
}: AddToCartButtonProps) {
  const add = useCartStore((state) => state.add);
  const openCart = useCartStore((state) => state.openCart);
  const product = getProduct(slug);
  if (!SHOP_ENABLED) return null;

  return (
    <button
      type="button"
      disabled={disabled || !product || !isPurchasable(product)}
      onClick={() => {
        if (add(slug)) openCart();
      }}
      className={
        variant === "link"
          ? "text-[12px] underline underline-offset-4 hover:text-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
          : `h-12 w-full rounded-full px-6 font-ui text-[11px] uppercase tracking-[0.2em] transition-opacity duration-150 hover:opacity-80 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 ${variant === "outline" ? "border border-ink text-ink" : "bg-ink text-bg"}`
      }
    >
      {label}
    </button>
  );
}
