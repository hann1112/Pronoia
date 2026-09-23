import Link from "next/link";

// Für AGB, Widerruf und Versand, solange nichts verkauft wird (Spec 10).
export function ShopNotice({ topic }: { topic: string }) {
  return (
    <>
      <p>
        Derzeit verkaufen wir über diese Website keine Produkte. Die gezeigten Journale Nº 01 und
        Nº 02 sind Einzelstücke (Legacy-Prototypen) und nicht verkäuflich.
      </p>
      <p>
        {topic} veröffentlichen wir hier, bevor das erste Produkt erhältlich ist. Wenn du dabei
        sein willst, trag dich unten für Updates ein.
      </p>
      <p>
        Fragen? <Link href="/kontakt" className="underline underline-offset-2">Kontakt</Link>
      </p>
    </>
  );
}
