import type { Metadata } from "next";
import Link from "next/link";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { PROTOTYPE_BENEFIT } from "@/lib/products";

export const metadata: Metadata = {
  title: "danke — pronoia",
  robots: { index: false, follow: false },
};

export default function DankePage() {
  return (
    <main className="mx-auto min-h-svh max-w-[640px] px-4 pb-24 pt-32 md:px-6">
      <h1 className="font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">danke.</h1>
      <div className="mt-10 space-y-4 text-[13px] leading-[1.7]">
        <OrderConfirmation />
        <p>Dein Exemplar ist eines von 50, von Hand nummeriert. Wir melden uns, sobald es unterwegs ist.</p>
        <p className="text-muted">{PROTOTYPE_BENEFIT}</p>
      </div>
      <Link
        href="/"
        className="mt-16 inline-block font-ui text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        ← zurück
      </Link>
    </main>
  );
}
