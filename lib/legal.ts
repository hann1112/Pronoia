// Angaben für Impressum, Datenschutz und Kontakt. Leere Felder werden auf der Seite
// als „[…]“ markiert und müssen vor dem öffentlichen Start ausgefüllt sein.
export const operator = {
  // Einzelunternehmen: voller Name des Inhabers plus Geschäftsbezeichnung.
  name: "Hannes Jantz",
  business: "Pronoia",
  street: "Roscherstraße 11",
  city: "01139 Dresden",
  country: "Deutschland",
  email: "pronoia_company@proton.me",
  phone: "",
  vatId: "",
  // Verantwortlich nach § 18 Abs. 2 MStV: immer eine natürliche Person.
  contentResponsible: "Hannes Jantz",
};

export function filled(value: string, placeholder: string): string {
  return value.trim() || `[${placeholder}]`;
}

export const LEGAL_UPDATED = "September 2026";

// Kleinunternehmerregelung (§ 19 UStG): true = keine Umsatzsteuer ausweisen.
// Muss vor dem Shop-Start feststehen; steuert den Hinweis neben jedem Preis.
export const SMALL_BUSINESS = false;
export const VAT_NOTE = SMALL_BUSINESS ? "ohne USt. (§ 19 UStG)" : "inkl. MwSt.";
