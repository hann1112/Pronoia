import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { filled, operator } from "@/lib/legal";

export const metadata: Metadata = { title: "Impressum — pronoia" };

export default function ImpressumPage() {
  const responsible = operator.contentResponsible;

  return (
    <LegalPage title="impressum">
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>
          {filled(operator.name, "Vor- und Nachname")}
          <br />
          {operator.business}
          <br />
          {filled(operator.street, "Straße und Hausnummer")}
          <br />
          {filled(operator.city, "PLZ Ort")}
          <br />
          {operator.country}
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{" "}
          {operator.email ? (
            <a href={`mailto:${operator.email}`} className="underline underline-offset-2">{operator.email}</a>
          ) : (
            "[E-Mail-Adresse]"
          )}
          {operator.phone && (
            <>
              <br />
              Telefon: {operator.phone}
            </>
          )}
        </p>
      </LegalSection>

      {operator.vatId && (
        <LegalSection title="Umsatzsteuer-ID">
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {operator.vatId}</p>
        </LegalSection>
      )}

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          {filled(responsible, "Vor- und Nachname")}
          <br />
          Anschrift wie oben
        </p>
      </LegalSection>

      <LegalSection title="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
