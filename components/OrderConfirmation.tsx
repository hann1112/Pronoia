"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

// Prüft die Stripe-Session über den Worker; ungültig oder unbezahlt → Startseite.
export function OrderConfirmation() {
  const clear = useCartStore((state) => state.clear);
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      window.location.replace("/");
      return;
    }
    fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("not_found"))))
      .then((data: { email?: string | null }) => {
        clear();
        setEmail(data.email ?? null);
      })
      .catch(() => window.location.replace("/"));
  }, [clear]);

  if (email === undefined) {
    return <p className="text-muted" role="status">Bestellung wird geprüft …</p>;
  }

  return (
    <p>
      Deine Bestellung ist eingegangen.
      {email && (
        <>
          {" "}Die Bestätigung und deine Rechnung gehen an <span className="whitespace-nowrap">{email}</span>.
        </>
      )}
    </p>
  );
}
