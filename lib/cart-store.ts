"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, type ProductSlug } from "@/lib/products";
import { isPurchasable } from "@/lib/shop";

export type CartItem = {
  slug: ProductSlug;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (slug: ProductSlug) => boolean;
  setQuantity: (slug: ProductSlug, quantity: number) => void;
  remove: (slug: ProductSlug) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  syncOpenFromUrl: (open: boolean) => void;
};

function updateCartQuery(open: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (open) url.searchParams.set("cart", "open");
  else url.searchParams.delete("cart");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<ProductSlug, number>();

  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { slug, quantity } = item as Record<string, unknown>;
    if (typeof slug !== "string") continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue;
    const product = getProduct(slug);
    if (!product || !isPurchasable(product)) continue;
    quantities.set(product.slug, Math.min(10, (quantities.get(product.slug) ?? 0) + quantity));
  }

  return Array.from(quantities, ([slug, quantity]) => ({ slug, quantity }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (slug) => {
        const product = getProduct(slug);
        if (!product || !isPurchasable(product)) return false;

        const existing = get().items.find((item) => item.slug === slug);
        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.slug === slug ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item,
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { slug, quantity: 1 }] }));
        }
        return true;
      },
      setQuantity: (slug, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return;
        set((state) => ({
          items: state.items.map((item) => item.slug === slug ? { ...item, quantity } : item),
        }));
      },
      remove: (slug) => set((state) => ({ items: state.items.filter((item) => item.slug !== slug) })),
      clear: () => set({ items: [] }),
      openCart: () => {
        updateCartQuery(true);
        set({ isOpen: true });
      },
      closeCart: () => {
        updateCartQuery(false);
        set({ isOpen: false });
      },
      syncOpenFromUrl: (open) => set({ isOpen: open }),
    }),
    {
      name: "pronoia-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const stored = persisted as { items?: unknown } | null;
        return { ...current, items: sanitizeItems(stored?.items) };
      },
    },
  ),
);
