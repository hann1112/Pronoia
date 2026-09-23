"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { EmailForm } from "@/components/EmailForm";
import { Glass } from "@/components/Glass";
import { getProduct } from "@/lib/products";
import { hasPanelForm } from "@/lib/shop";
import { useUiStore } from "@/lib/ui-store";

type Flash = "confirmed" | "expired" | "error";

const NOTICES: Record<Exclude<Flash, "confirmed">, string> = {
  expired: "LINK ABGELAUFEN. BITTE NEU EINTRAGEN.",
  error: "DAS HAT NICHT GEKLAPPT. BITTE NOCHMAL VERSUCHEN.",
};

export function EmailBar() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion() === true;
  const dismissedUntil = useUiStore((state) => state.emailBarDismissedUntil);
  const subscribed = useUiStore((state) => state.subscribed);
  const dismissEmailBar = useUiStore((state) => state.dismissEmailBar);
  const setSubscribed = useUiStore((state) => state.setSubscribed);
  const [hydrated, setHydrated] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Rückkehr aus der Bestätigungsmail: /?subscribed=1 | expired | error
  useEffect(() => {
    setHydrated(true);
    const params = new URLSearchParams(window.location.search);
    const result = params.get("subscribed");
    if (!result) return;
    params.delete("subscribed");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    if (result === "1") {
      setSubscribed(true);
      setFlash("confirmed");
    } else {
      setFlash(result === "expired" ? "expired" : "error");
    }
  }, [setSubscribed]);

  useEffect(() => {
    if (flash !== "confirmed") return;
    const timeout = window.setTimeout(() => setFlash(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  const product = getProduct(pathname.slice(1));
  const formInPanel = product ? hasPanelForm(product) : false;
  const dismissed = dismissedUntil !== null && dismissedUntil > Date.now();
  const visible = hydrated && !formInPanel && (flash !== null || keepOpen || (!subscribed && !dismissed));

  // Footer und Startseite weichen über --email-bar-space nach oben aus.
  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!visible || !bar) {
      root.style.removeProperty("--email-bar-space");
      return;
    }
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--email-bar-space", `${bar.offsetHeight + 16}px`);
    });
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--email-bar-space");
    };
  }, [visible]);

  if (!visible) return null;

  function close() {
    dismissEmailBar();
    setKeepOpen(false);
    setFlash(null);
  }

  return (
    <div ref={barRef} className="fixed inset-x-4 bottom-4 z-40 md:inset-x-6">
      <Glass
        strength="strong"
        role="region"
        aria-label="E-Mail-Updates"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
        className="flex items-start gap-3 px-4 py-2 md:min-h-[52px] md:items-center md:px-5"
      >
        <div className="min-w-0 flex-1">
          {flash === "confirmed" ? (
            <p role="status" className="flex min-h-9 items-center font-ui text-[11px] uppercase tracking-[0.2em] md:min-h-10">
              Du bist dabei.
            </p>
          ) : (
            <EmailForm
              key={flash ?? "form"}
              label="Updates"
              variant="bar"
              notice={flash ? NOTICES[flash] : undefined}
              onSuccess={() => setKeepOpen(true)}
            />
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="E-Mail-Leiste schließen"
          className="flex h-9 w-6 shrink-0 items-center justify-center font-ui text-lg font-light leading-none text-muted hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ink md:h-10"
        >
          ×
        </button>
      </Glass>
    </div>
  );
}
