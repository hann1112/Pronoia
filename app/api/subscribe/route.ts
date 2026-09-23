import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { getResend, sendConfirmationEmail } from "@/lib/resend";
import { SITE_URL } from "@/lib/site";
import { createConfirmToken } from "@/lib/tokens";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  company: z.string().max(200).optional(),
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const secret = process.env.NEWSLETTER_SECRET;
  if (!resend || !from || !secret || secret.length < 32) {
    console.error("Newsletter: RESEND_API_KEY, RESEND_FROM oder NEWSLETTER_SECRET (min. 32 Zeichen) fehlt.");
    return NextResponse.json({ error: "newsletter_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const { email, company } = parsed.data;

  // Honeypot: Bots bekommen eine normale Antwort, es passiert aber nichts.
  if (company) return NextResponse.json({ ok: true });

  // Pro IP 5/h laut Spec; pro Adresse 3/h, damit niemand fremde Postfächer zuschüttet.
  const allowed =
    (await allowRequest(`subscribe:ip:${hash(clientIp(request))}`, 5)) &&
    (await allowRequest(`subscribe:mail:${hash(email)}`, 3));
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const confirmUrl = new URL("/api/subscribe/confirm", SITE_URL);
  confirmUrl.searchParams.set("token", createConfirmToken(email, secret));

  try {
    await sendConfirmationEmail(resend, { from, to: email, confirmUrl: confirmUrl.toString() });
  } catch (error) {
    console.error("Newsletter: Bestätigungsmail fehlgeschlagen.", error);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // Immer gleiche Antwort, auch für bereits eingetragene Adressen.
  return NextResponse.json({ ok: true });
}
