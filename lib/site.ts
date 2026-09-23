// Öffentliche Basis-URL: eigene Domain über NEXT_PUBLIC_SITE_URL, sonst die Render-Adresse.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");
