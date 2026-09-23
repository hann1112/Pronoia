import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { recordSold, volumeQuantities } from "@/lib/stripe";

export const runtime = "nodejs";

function euro(amount: number | null): string {
  return amount === null
    ? "—"
    : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount / 100);
}

function shippingAddress(session: Stripe.Checkout.Session): string {
  const shipping = session.collected_information?.shipping_details;
  if (!shipping) return "Keine Versandadresse übermittelt";
  const address = shipping.address;
  return [
    shipping.name,
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.state,
    address.country,
  ].filter(Boolean).join("\n");
}

async function notifyPaidOrder(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    throw new Error(`Checkout Session ${sessionId} ist nicht bezahlt.`);
  }
  if (session.currency !== "eur") {
    throw new Error(`Checkout Session ${sessionId} hat eine unerwartete Währung.`);
  }

  const intentRef = session.payment_intent;
  const intentId = typeof intentRef === "string" ? intentRef : intentRef?.id;
  if (!intentId) throw new Error(`Checkout Session ${sessionId} hat keinen PaymentIntent.`);

  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.status !== "succeeded") {
    throw new Error(`PaymentIntent ${intentId} ist noch nicht erfolgreich.`);
  }
  if (intent.metadata.fulfilled === "true") return;

  // Bestand zählen und Käufer für den Drop-Rabatt markieren (einmalig, auch bei Neuversuchen).
  if (intent.metadata.counted !== "true") {
    const cart = (intent.metadata.cart ?? session.metadata?.cart ?? "")
      .split(",")
      .map((entry) => entry.split(":"))
      .filter(([slug, quantity]) => slug && Number(quantity) > 0)
      .map(([slug, quantity]) => ({ slug, quantity: Number(quantity) }));
    await recordSold(stripe, volumeQuantities(cart));
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (customerId) {
      await stripe.customers.update(customerId, { metadata: { prototype_v2_buyer: "true" } });
    }
    await stripe.paymentIntents.update(intent.id, { metadata: { counted: "true" } });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!resendKey || !from || !to) {
    throw new Error("Resend-Bestellmail ist nicht konfiguriert.");
  }

  const items = await stripe.checkout.sessions
    .listLineItems(sessionId, { limit: 100 })
    .autoPagingToArray({ limit: 1000 });
  if (items.length === 0) {
    throw new Error(`Checkout Session ${sessionId} enthält keine Artikel.`);
  }
  const itemLines = items.map((item) =>
    `- ${item.description ?? "Artikel"} · ${item.quantity ?? 1} × · ${euro(item.amount_total)}`,
  );
  const text = [
    "Neue bezahlte Bestellung — pronoia",
    "",
    `Checkout Session: ${session.id}`,
    `PaymentIntent: ${intent.id}`,
    `Kunde: ${session.customer_details?.name ?? "—"}`,
    `E-Mail: ${session.customer_details?.email ?? session.customer_email ?? "—"}`,
    "",
    "Artikel:",
    ...itemLines,
    "",
    `Zwischensumme: ${euro(session.amount_subtotal)}`,
    `Versand: ${euro(session.shipping_cost?.amount_total ?? null)}`,
    `Gesamtbetrag: ${euro(session.amount_total)}`,
    "",
    "Versandadresse:",
    shippingAddress(session),
  ].join("\n");

  const { data, error } = await new Resend(resendKey).emails.send(
    {
      from,
      to,
      subject: `Neue Bestellung · ${session.id}`,
      text,
    },
    { idempotencyKey: `pronoia-order/${intent.id}` },
  );
  if (error || !data?.id) {
    throw new Error(`Resend-Bestellmail fehlgeschlagen: ${error?.message ?? "keine Mail-ID"}`);
  }

  await stripe.paymentIntents.update(intent.id, { metadata: { fulfilled: "true" } });
}

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    console.error("Stripe-Webhook: STRIPE_SECRET_KEY oder STRIPE_WEBHOOK_SECRET fehlt.");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.object !== "checkout.session" || !session.id) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    console.warn(`Stripe-Webhook: asynchrone Zahlung fehlgeschlagen (${session.id}).`);
    return NextResponse.json({ received: true });
  }
  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  try {
    await notifyPaidOrder(stripe, session.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Stripe-Webhook ${event.id}: Verarbeitung fehlgeschlagen.`, error);
    return NextResponse.json({ error: "fulfillment_failed" }, { status: 500 });
  }
}
