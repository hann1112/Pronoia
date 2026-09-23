import { NextResponse } from "next/server";
import { addNewsletterContact, getResend } from "@/lib/resend";
import { verifyConfirmToken } from "@/lib/tokens";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const redirectTo = (result: "1" | "expired" | "error") =>
    NextResponse.redirect(new URL(`/?subscribed=${result}`, request.url), 303);

  const resend = getResend();
  const secret = process.env.NEWSLETTER_SECRET;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (!resend || !secret || secret.length < 32 || !segmentId) {
    console.error("Newsletter-Bestätigung: RESEND_API_KEY, NEWSLETTER_SECRET oder RESEND_SEGMENT_ID fehlt.");
    return redirectTo("error");
  }

  const email = verifyConfirmToken(new URL(request.url).searchParams.get("token") ?? "", secret);
  if (!email) return redirectTo("expired");

  try {
    await addNewsletterContact(resend, email, segmentId);
  } catch (error) {
    console.error("Newsletter-Bestätigung: Kontakt konnte nicht angelegt werden.", error);
    return redirectTo("error");
  }
  return redirectTo("1");
}
