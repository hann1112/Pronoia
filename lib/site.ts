// Öffentliche Basis-URL. Beim statischen Build eingebacken, im Worker zur Laufzeit gelesen.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const SITE_URL = siteUrl();
