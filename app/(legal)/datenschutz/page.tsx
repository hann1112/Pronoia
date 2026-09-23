import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { filled, LEGAL_UPDATED, operator } from "@/lib/legal";

export const metadata: Metadata = { title: "Datenschutz — pronoia" };

// Wird zur Build-Zeit ausgewertet: Upstash erscheint nur, wenn es wirklich genutzt wird.
const USES_UPSTASH = Boolean(process.env.UPSTASH_REDIS_REST_URL);

const US_TRANSFER =
  "Die Übermittlung in die USA stützen wir auf den Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework, soweit der Anbieter danach zertifiziert ist, andernfalls auf die EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).";

export default function DatenschutzPage() {
  return (
    <LegalPage title="datenschutz">
      <LegalSection title="Verantwortlicher">
        <p>
          {filled(operator.name, "Vor- und Nachname")}
          <br />
          {operator.business}
          <br />
          {filled(operator.street, "Straße und Hausnummer")}
          <br />
          {filled(operator.city, "PLZ Ort")}
          <br />
          E-Mail:{" "}
          {operator.email ? (
            <a href={`mailto:${operator.email}`} className="underline underline-offset-2">{operator.email}</a>
          ) : (
            "[E-Mail-Adresse]"
          )}
        </p>
      </LegalSection>

      <LegalSection title="Kurz gesagt">
        <p>
          Diese Website setzt keine Cookies, nutzt kein Tracking, keine Analyse-Tools und keine
          Social-Media-Plugins. Personenbezogene Daten verarbeiten wir nur, soweit das für den
          Betrieb der Website oder für den Newsletter nötig ist, für den du dich selbst einträgst.
        </p>
      </LegalSection>

      <LegalSection title="Hosting und Server-Logs">
        <p>
          Die Website wird bei Render Services, Inc. (USA) gehostet, auf Servern in Frankfurt am
          Main (EU). Beim Aufruf verarbeitet Render technisch notwendige Daten: IP-Adresse, Datum
          und Uhrzeit, aufgerufene Seite, Referrer-URL, Browser und Betriebssystem. Das ist nötig,
          um die Website sicher und stabil auszuliefern. Rechtsgrundlage ist unser berechtigtes
          Interesse nach Art. 6 Abs. 1 lit. f DSGVO. Mit Render besteht ein Vertrag zur
          Auftragsverarbeitung.
        </p>
        <p>{US_TRANSFER}</p>
        <p>
          Mehr dazu:{" "}
          <a href="https://render.com/privacy" className="underline underline-offset-2" rel="noopener noreferrer" target="_blank">
            Datenschutzerklärung von Render
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Lokaler Speicher im Browser">
        <p>
          Wir speichern im lokalen Speicher deines Browsers (localStorage) nur Einstellungen, die
          du selbst auslöst: ob die Zoom-Ansicht aktiv ist, ob du die E-Mail-Leiste geschlossen
          hast (für 30 Tage) und ob du dich bereits eingetragen hast. Diese Angaben verlassen dein
          Gerät nicht. Die Speicherung ist für die von dir gewünschte Funktion unbedingt
          erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Du kannst sie jederzeit in den
          Browsereinstellungen löschen.
        </p>
      </LegalSection>

      <LegalSection title="Schriftarten">
        <p>
          Die Schriften werden von unserem eigenen Server geladen. Es besteht keine Verbindung zu
          Google oder anderen Schriftanbietern.
        </p>
      </LegalSection>

      <LegalSection title="Newsletter (Double-Opt-in)">
        <p>
          Wenn du dich für Updates einträgst, schicken wir dir zuerst eine E-Mail mit einem
          Bestätigungslink. Erst wenn du ihn anklickst, nehmen wir deine Adresse in die Liste auf.
          Gespeichert werden deine E-Mail-Adresse und der Zeitpunkt der Bestätigung, damit wir
          deine Einwilligung nachweisen können.
        </p>
        <p>
          Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie
          jederzeit widerrufen: über den Abmeldelink in jeder E-Mail oder per Nachricht an uns.
          Danach löschen wir deine Adresse aus der Liste.
        </p>
        <p>
          Versand und Verwaltung der Liste übernimmt Resend, Inc. (USA) als Auftragsverarbeiter.{" "}
          {US_TRANSFER}{" "}
          <a href="https://resend.com/legal/privacy-policy" className="underline underline-offset-2" rel="noopener noreferrer" target="_blank">
            Datenschutzerklärung von Resend
          </a>
        </p>
        <p>
          Zum Schutz vor Missbrauch begrenzen wir die Zahl der Anmeldungen pro Stunde. Dafür
          speichern wir für höchstens eine Stunde einen nicht umkehrbaren Hashwert deiner
          IP-Adresse und deiner E-Mail-Adresse
          {USES_UPSTASH
            ? " bei Upstash, Inc. (Speicherort EU) als Auftragsverarbeiter"
            : " im Arbeitsspeicher unseres Servers"}
          . Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren Betrieb
          (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="Kontakt per E-Mail">
        <p>
          Wenn du uns schreibst, verwenden wir deine Angaben nur, um deine Anfrage zu beantworten
          (Art. 6 Abs. 1 lit. b bzw. f DSGVO), und löschen sie, sobald sie dafür nicht mehr nötig
          sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
        </p>
      </LegalSection>

      <LegalSection title="Deine Rechte">
        <p>
          Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung
          (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und
          Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21).
          Eine Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen.
        </p>
        <p>
          Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, etwa bei der
          Behörde deines Wohnorts oder unseres Sitzes.
        </p>
        <p>
          Für alle Anliegen genügt eine Nachricht an die oben genannte E-Mail-Adresse oder über{" "}
          <Link href="/kontakt" className="underline underline-offset-2">Kontakt</Link>.
        </p>
      </LegalSection>

      <p className="mt-10 text-muted">Stand: {LEGAL_UPDATED}</p>
    </LegalPage>
  );
}
