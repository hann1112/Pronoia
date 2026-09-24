"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { SHOP_ENABLED } from "@/lib/shop";
import { useUiStore } from "@/lib/ui-store";

function HeaderCartButton() {
  const [hydrated, setHydrated] = useState(false);
  const count = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => setHydrated(true), []);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Warenkorb öffnen, ${hydrated ? count : 0} Artikel`}
      className="whitespace-nowrap font-ui text-[11px] uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink md:tracking-[0.2em]"
    >
      Warenkorb ({hydrated ? count : 0})
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const isProduct = pathname === "/body" || pathname === "/mind";
  const zoom = useUiStore((state) => state.zoom);
  const toggleZoom = useUiStore((state) => state.toggleZoom);

  return (
    <header className="fixed inset-x-0 top-0 z-50 grid h-12 grid-cols-[1fr_auto_1fr] items-center px-4 text-ink md:px-6">
      <button
        type="button"
        aria-label={zoom ? "Zoom ausschalten" : "Zoom einschalten"}
        aria-pressed={zoom}
        onClick={toggleZoom}
        className="w-8 justify-self-start text-left font-ui text-2xl font-light leading-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ink"
      >
        {zoom ? "−" : "+"}
      </button>

      {isProduct ? (
        <nav aria-label="Produkt wechseln" className="flex items-center gap-5 font-ui text-[11px] uppercase tracking-[0.2em]">
          <Link href="/body" aria-current={pathname === "/body" ? "page" : undefined} className={pathname === "/body" ? "text-ink" : "text-faint"}>
            body
          </Link>
          <Link href="/mind" aria-current={pathname === "/mind" ? "page" : undefined} className={pathname === "/mind" ? "text-ink" : "text-faint"}>
            mind
          </Link>
        </nav>
      ) : (
        <Link href="/" aria-label="pronoia – zur Startseite" tabIndex={pathname === "/" ? -1 : undefined} className="flex h-10 w-10 items-center justify-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ink">
          <Image src="/brand/mark.svg" alt="" width={32} height={32} priority />
        </Link>
      )}

      <div className="flex items-center justify-self-end gap-5">
        <Link
          href="/gedanken"
          aria-current={pathname.startsWith("/gedanken") ? "page" : undefined}
          className={`${isProduct && SHOP_ENABLED ? "hidden md:inline" : ""} font-ui text-[11px] uppercase tracking-[0.2em] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink ${pathname.startsWith("/gedanken") ? "text-ink" : "text-muted"}`}
        >
          Gedanken
        </Link>
        {SHOP_ENABLED && <HeaderCartButton />}
      </div>
    </header>
  );
}
