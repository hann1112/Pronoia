import { Resend } from "resend";

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

const FONT = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function confirmationHtml(confirmUrl: string): string {
  return `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;font-family:${FONT};color:#0a0a0a;">
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:40px;line-height:1;padding-bottom:32px;">pronoia</td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.7;padding-bottom:32px;">
                Fast geschafft. Bitte bestätige, dass du Updates zu pronoia per E-Mail erhalten möchtest.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${confirmUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;border-radius:6px;padding:14px 28px;font-family:${FONT};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Bestätigen</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:11px;line-height:1.7;color:#8c949a;">
                Der Link ist 48 Stunden gültig. Wenn du dich nicht eingetragen hast, ignoriere diese E-Mail einfach. Dann passiert nichts.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendConfirmationEmail(
  resend: Resend,
  { from, to, confirmUrl }: { from: string; to: string; confirmUrl: string },
) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "bitte bestätigen — pronoia",
    html: confirmationHtml(confirmUrl),
    text: [
      "Fast geschafft.",
      "",
      "Bitte bestätige, dass du Updates zu pronoia per E-Mail erhalten möchtest:",
      confirmUrl,
      "",
      "Der Link ist 48 Stunden gültig. Wenn du dich nicht eingetragen hast, ignoriere diese E-Mail einfach.",
    ].join("\n"),
  });
  if (error || !data?.id) {
    throw new Error(`Resend-Bestätigungsmail fehlgeschlagen: ${error?.message ?? "keine Mail-ID"}`);
  }
}

// Legt den Kontakt an; existiert er schon, wird er wieder angemeldet und dem Segment zugeordnet.
export async function addNewsletterContact(resend: Resend, email: string, segmentId: string) {
  const created = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
  if (!created.error) return;

  const updated = await resend.contacts.update({ email, unsubscribed: false });
  if (updated.error) {
    throw new Error(`Resend-Kontakt fehlgeschlagen: ${created.error.message} / ${updated.error.message}`);
  }
  const added = await resend.contacts.segments.add({ email, segmentId });
  if (added.error) {
    console.warn(`Resend: Kontakt aktualisiert, Segment-Zuordnung meldet: ${added.error.message}`);
  }
}
