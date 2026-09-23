import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClearCart } from "@/components/ClearCart";
import { PROTOTYPE_BENEFIT } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "danke — pronoia",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

async function paidSessionEmail(sessionId: string | undefined): Promise<string | null | undefined> {
  const stripe = getStripe();
  if (!stripe || !sessionId?.startsWith("cs_")) return undefined;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return undefined;
    return session.customer_details?.email ?? null;
  } catch {
    return undefined;
  }
}

export default async function DankePage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const email = await paidSessionEmail(session_id);
  if (email === undefined) redirect("/");

  return (
    <main className="mx-auto min-h-svh max-w-[640px] px-4 pb-24 pt-32 md:px-6">
      <ClearCart />
      <h1 className="font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">danke.</h1>
      <div className="mt-10 space-y-4 text-[13px] leading-[1.7]">
        <p>
          Deine Bestellung ist eingegangen.
          {email && (
            <>
              {" "}Die Bestätigung und deine Rechnung gehen an <span className="whitespace-nowrap">{email}</span>.
            </>
          )}
        </p>
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
