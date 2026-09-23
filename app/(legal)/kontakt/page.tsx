import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { operator } from "@/lib/legal";

export const metadata: Metadata = { title: "Kontakt — pronoia" };

export default function KontaktPage() {
  return (
    <LegalPage title="kontakt">
      <LegalSection title="E-Mail">
        <p>
          {operator.email ? (
            <a href={`mailto:${operator.email}`} className="underline underline-offset-2">{operator.email}</a>
          ) : (
            "[E-Mail-Adresse]"
          )}
        </p>
        <p className="text-muted">Wir antworten in der Regel innerhalb von zwei Werktagen.</p>
      </LegalSection>

      <LegalSection title="Anbieter">
        <p>
          Alle Angaben zum Anbieter findest du im{" "}
          <Link href="/impressum" className="underline underline-offset-2">Impressum</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
