"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/cart-store";
import { useCartStore } from "@/lib/cart-store";
import { currentImages, formatPrice, getProduct, PRICE_PLACEHOLDER } from "@/lib/products";

export function CartLine({ item }: { item: CartItem }) {
  const product = getProduct(item.slug);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  if (!product) return null;
  const image = currentImages(product)[0];

  return (
    <li className="grid grid-cols-[80px_1fr] gap-4 border-b border-line py-5">
      <div className="relative h-28 bg-bg/50">
        {image && <Image src={image.src} alt={image.alt} fill sizes="80px" className="object-contain" />}
      </div>
      <div className="min-w-0">
        <p className="font-display text-[15px] leading-tight">{product.name}</p>
        <p className="mt-2 font-ui text-[11px] text-muted">{product.number}{product.work ? ` · ${product.work}` : ""}</p>
        <p className="mt-3 font-ui text-[11px]">{product.priceCents ? formatPrice(product.priceCents * item.quantity) : PRICE_PLACEHOLDER}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex h-9 items-center rounded-[6px] border border-line" aria-label={`Menge für ${product.name}`}>
            <button
              type="button"
              aria-label={`${product.name}: Menge verringern`}
              disabled={item.quantity <= 1}
              onClick={() => setQuantity(item.slug, item.quantity - 1)}
              className="h-9 w-9 text-center disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-6 text-center font-ui text-[11px]" aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              aria-label={`${product.name}: Menge erhöhen`}
              disabled={item.quantity >= 10}
              onClick={() => setQuantity(item.slug, item.quantity + 1)}
              className="h-9 w-9 text-center disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.slug)}
            className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted underline underline-offset-4 hover:text-ink"
          >
            Entfernen
          </button>
        </div>
      </div>
    </li>
  );
}
