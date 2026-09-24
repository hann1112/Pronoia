import Link from "next/link";

// Für AGB, Widerruf und Versand, solange der Shop noch geschlossen ist.
export function ShopNotice({ topic }: { topic: string }) {
  return (
    <>
      <p>
        Der Verkauf der Prototypen V2 von Nº 01 · Körper und Nº 02 · Geist startet in Kürze. Bis
        dahin kann über diese Website noch nichts bestellt werden.
      </p>
      <p>
        {topic} veröffentlichen wir hier vor dem Verkaufsstart. Wenn du dabei sein willst, trag
        dich auf der Produktseite für die Benachrichtigung ein.
      </p>
      <p>
        Fragen? <Link href="/kontakt" className="underline underline-offset-2">Kontakt</Link>
      </p>
    </>
  );
}
