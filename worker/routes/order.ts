import { getStripe } from "@/lib/stripe";

// Für /danke: nur „bezahlt ja/nein“ und die E-Mail der eigenen Bestellung.
export async function order(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const stripe = getStripe();
  if (!stripe || !sessionId.startsWith("cs_")) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json(
      { email: session.customer_details?.email ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
}
