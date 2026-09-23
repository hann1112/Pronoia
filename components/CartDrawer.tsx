"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CartLine } from "@/components/CartLine";
import { Glass } from "@/components/Glass";
import { useCartStore } from "@/lib/cart-store";
import { VAT_NOTE } from "@/lib/legal";
import { formatPrice, getProduct } from "@/lib/products";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const pathname = usePathname();
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const closeCart = useCartStore((state) => state.closeCart);
  const syncOpenFromUrl = useCartStore((state) => state.syncOpenFromUrl);
  const reducedMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subtotal = items.reduce((sum, item) => sum + (getProduct(item.slug)?.priceCents ?? 0) * item.quantity, 0);

  useEffect(() => {
    const sync = () => syncOpenFromUrl(new URLSearchParams(window.location.search).get("cart") === "open");
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [pathname, syncOpenFromUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function focusableElements() {
      return Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
        .filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) {
        closeRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      previousFocus?.focus();
    };
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ slug, quantity }) => ({ slug, quantity })) }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 501) throw new Error("Checkout ist noch nicht eingerichtet.");
        if (response.status === 409) throw new Error("Ein Produkt ist ausverkauft oder nicht mehr verfügbar.");
        throw new Error("Die Kasse ist gerade nicht erreichbar. Bitte versuche es erneut.");
      }
      if (!result || typeof result !== "object" || !("url" in result) || typeof result.url !== "string") {
        throw new Error("Die Weiterleitung zur Kasse fehlt. Bitte versuche es erneut.");
      }
      window.location.assign(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Die Kasse ist gerade nicht erreichbar.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Warenkorb schließen"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.35 }}
            className="absolute inset-0 h-full w-full cursor-default bg-white/40 backdrop-blur-[4px]"
          />
          <Glass
            strength="strong"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.7, 0, 0.2, 1] }}
            className="absolute inset-y-0 right-0 flex h-full w-full max-w-[420px] flex-col overflow-hidden rounded-none border-r-0 sm:rounded-l-[14px]"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 id="cart-title" className="font-ui text-[11px] uppercase tracking-[0.2em]">Warenkorb</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Warenkorb schließen"
                className="h-9 w-9 text-center font-ui text-2xl leading-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center px-6">
                <p className="font-display text-[clamp(22px,4vw,30px)] leading-[1.4]">dein warenkorb ist leer.</p>
                <div className="mt-8 flex gap-6 font-ui text-[11px] uppercase tracking-[0.2em]">
                  <Link href="/body" onClick={closeCart} className="underline underline-offset-4">body →</Link>
                  <Link href="/mind" onClick={closeCart} className="underline underline-offset-4">mind →</Link>
                </div>
              </div>
            ) : (
              <>
                <ul className="min-h-0 flex-1 overflow-y-auto px-5">
                  {items.map((item) => <CartLine key={item.slug} item={item} />)}
                </ul>
                <form onSubmit={handleCheckout} className="shrink-0 border-t border-line px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex items-center justify-between font-ui text-[11px] uppercase tracking-[0.12em]">
                    <span>Zwischensumme</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-3 font-ui text-[10px] text-muted">{VAT_NOTE}, Versand wird an der Kasse berechnet.</p>
                  {error && <p role="alert" className="mt-4 font-ui text-[11px] leading-[1.6] text-ink">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 h-11 w-full rounded-[6px] bg-ink px-4 font-ui text-[11px] uppercase tracking-[0.2em] text-bg disabled:opacity-50"
                  >
                    {loading ? "Weiterleitung…" : "Zur Kasse"}
                  </button>
                </form>
              </>
            )}
          </Glass>
        </div>
      )}
    </AnimatePresence>
  );
}
