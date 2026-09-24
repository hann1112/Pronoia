import { createHash } from "node:crypto";
import { z } from "zod";
import { allowRequest, type CounterStore } from "@/lib/rate-limit";
import { getResend, sendConfirmationEmail } from "@/lib/resend";
import { siteUrl } from "@/lib/site";
import { createConfirmToken } from "@/lib/tokens";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  company: z.string().max(200).optional(),
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function subscribe(request: Request, store?: CounterStore): Promise<Response> {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const secret = process.env.NEWSLETTER_SECRET;
  if (!resend || !from || !secret || secret.length < 32) {
    console.error("Newsletter: RESEND_API_KEY, RESEND_FROM oder NEWSLETTER_SECRET (min. 32 Zeichen) fehlt.");
    return Response.json({ error: "newsletter_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }
  const { email, company } = parsed.data;

  // Honeypot: Bots bekommen eine normale Antwort, es passiert aber nichts.
  if (company) return Response.json({ ok: true });

  // Pro IP 5/h laut Spec; pro Adresse 3/h, damit niemand fremde Postfächer zuschüttet.
  const allowed =
    (await allowRequest(`subscribe:ip:${hash(clientIp(request))}`, 5, store)) &&
    (await allowRequest(`subscribe:mail:${hash(email)}`, 3, store));
  if (!allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const confirmUrl = new URL("/api/subscribe/confirm", siteUrl());
  confirmUrl.searchParams.set("token", createConfirmToken(email, secret));

  try {
    await sendConfirmationEmail(resend, { from, to: email, confirmUrl: confirmUrl.toString() });
  } catch (error) {
    console.error("Newsletter: Bestätigungsmail fehlgeschlagen.", error);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  // Immer gleiche Antwort, auch für bereits eingetragene Adressen.
  return Response.json({ ok: true });
}
