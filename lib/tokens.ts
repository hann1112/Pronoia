import { createHmac, timingSafeEqual } from "node:crypto";

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Token = base64url(email.ablaufzeit) + "." + HMAC-SHA256; ohne Datenbank prüfbar.
export function createConfirmToken(email: string, secret: string, now = Date.now()): string {
  const payload = Buffer.from(`${email}.${now + CONFIRM_TTL_MS}`).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

// Gibt die E-Mail zurück oder null, wenn der Token manipuliert oder abgelaufen ist.
export function verifyConfirmToken(token: string, secret: string, now = Date.now()): string | null {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const separator = decoded.lastIndexOf(".");
  if (separator < 1) return null;
  const expiresAt = Number(decoded.slice(separator + 1));
  if (!Number.isFinite(expiresAt) || expiresAt < now) return null;
  return decoded.slice(0, separator);
}
