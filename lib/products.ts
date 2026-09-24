export type ProductSlug = "body" | "mind" | "set";
export type ProductStatus = "legacy" | "available" | "soldout";

export const PRICE_PLACEHOLDER = "€ --,--";

export type ProductImage = { src: string; alt: string };

// Frühere Version eines Bandes, auf der Produktseite per Umschalter ansehbar.
export type PreviousEdition = {
  label: string;
  edition: string;
  images: ProductImage[];
  description: string;
};

export type Product = {
  slug: ProductSlug;
  number: string;
  name: string;
  // Werktitel und Gattung, z. B. „Askesis“ · „ein Trainingsbuch“.
  work?: string;
  genre?: string;
  status: ProductStatus;
  versionLabel?: string;
  edition?: string;
  // Preis in Cent. Wird erst angezeigt, wenn der Shop aktiv ist.
  priceCents?: number;
  // Name der Umgebungsvariable mit der Stripe-Preis-ID (nur serverseitig lesbar).
  priceEnv?: "STRIPE_PRICE_BODY" | "STRIPE_PRICE_MIND" | "STRIPE_PRICE_SET";
  // Leer = Bilder der Vorversion, bis eigene Fotos da sind (public/products/v2/…).
  images: ProductImage[];
  description: string;
  intro?: string[];
  features?: string[];
  note?: string;
  story?: string;
  details: { label: string; value: string }[];
  previous?: PreviousEdition;
  // Set aus mehreren Bänden: keine eigene Seite, zählt beim Bestand für jeden Band.
  bundleOf?: ProductSlug[];
};

// Auflage je Band (Prototyp V2). Der Verkauf stoppt, wenn sie erreicht ist.
export const EDITION_SIZE = 50;

const SPECS = [
  { label: "Format", value: "A5" },
  { label: "Seiten", value: "92" },
  { label: "Bindung", value: "Fadenheftung" },
  { label: "Papier", value: "Punktraster 5 mm" },
  { label: "Auflage", value: "50 Exemplare, handnummeriert" },
];

const PROTOTYPE_NOTE = "Das ist ein Prototyp. Deine Rückmeldung entscheidet, wie die Serie aussieht.";

export const PROTOTYPE_BENEFIT =
  "Wer einen Prototyp kauft, bekommt zum offiziellen Drop 50 % Rabatt und ein Geschenk.";

export const products: Product[] = [
  {
    slug: "body",
    number: "Nº 01",
    name: "körper",
    work: "Askesis",
    genre: "ein Trainingsbuch",
    status: "available",
    versionLabel: "Prototyp V2",
    edition: "Prototyp V2 · 50 nummerierte Exemplare",
    priceCents: 4200,
    priceEnv: "STRIPE_PRICE_BODY",
    images: [],
    description:
      "Nº 01 · Körper. Askesis, ein Trainingsbuch: 32 Einheiten mit Studie, acht Linsen, acht Rückblicke. Prototyp V2, limitiert auf 50 nummerierte Exemplare.",
    intro: [
      "Askesis heißt ursprünglich: üben. Gemeint war der Körper auf dem Platz und die Wiederholung, durch die Kraft entsteht. Dieses Buch folgt dieser älteren Bedeutung.",
      "Nº 01 hält fest, was trainiert wurde, und schärft zugleich den Blick. Jede Doppelseite verbindet eine Einheit mit einer Studie. Links stehen Inhalt, Umfang, Intensität und RPE. Rechts steht eine von acht Linsen, auf die du dich in dieser Einheit konzentrierst: Atem, Kontakt, Rhythmus, Lösen, Am Ende, Fremdes Auge, Nichts Überflüssiges, Wasser. Jede Linse bringt ein Beispiel aus einer Disziplin mit und stellt zwei Fragen. Am Ende steht ein Satz, der bleibt.",
    ],
    features: [
      "32 Einheiten mit Studie, in vier Durchläufen durch die acht Linsen",
      "8 Rückblicke: Was ist stärker geworden? Was braucht noch Zeit?",
      "Seiten für Bestleistungen und ein Inhaltsverzeichnis zum Selbstanlegen",
      "Querverweise auf Nº 02 · Geist: Gedanken aus dem Training wandern ins zweite Buch",
      "Ohne Datum, du beginnst, wann du willst",
    ],
    note: PROTOTYPE_NOTE,
    details: SPECS,
    previous: {
      label: "Prototyp V1",
      edition: "Prototyp V1 · 1/1 · nicht verkäuflich",
      images: [
        { src: "/products/body-1.webp", alt: "pronoia Nº 01 Körper, Prototyp V1, schwarzer Einband, frontal" },
        { src: "/products/body-2.webp", alt: "Nº 01 Körper, Prototyp V1, schräg mit Buchrücken" },
        { src: "/products/body-3.webp", alt: "Nº 01 Körper, Prototyp V1, liegend" },
      ],
      description: "Die erste Fassung von Nº 01. Ein Einzelstück, aus dem V2 entstanden ist. Nicht verkäuflich.",
    },
  },
  {
    slug: "mind",
    number: "Nº 02",
    name: "geist",
    work: "Hypomnemata",
    genre: "ein Schöpfungsbuch",
    status: "available",
    versionLabel: "Prototyp V2",
    edition: "Prototyp V2 · 50 nummerierte Exemplare",
    priceCents: 4200,
    priceEnv: "STRIPE_PRICE_MIND",
    images: [],
    description:
      "Nº 02 · Geist. Hypomnemata, ein Schöpfungsbuch: 27 Impulse aus Sätzen, Bildformen und offenen Fragen, danach freie Seiten. Prototyp V2, limitiert auf 50 nummerierte Exemplare.",
    intro: [
      "In der Antike waren Hypomnemata persönliche Hefte für das, was bleiben sollte. Hinein kamen Zitate, Lesefrüchte und Beobachtungen, an denen man das eigene Leben prüfen konnte. Nº 02 knüpft daran an. Es lässt dich auch deinen Tag festhalten, bevorzugt aber, was du morgen noch brauchst.",
      "Im Buch verteilt stehen 27 Impulse, danach folgen freie Seiten:",
    ],
    features: [
      "12 Sätze aus 2.500 Jahren, von Heraklit bis Rilke, mit einer Frage dazu. Die meisten Übersetzungen sind von Pronoia.",
      "8 Bildformen als Anstoß für Skizze, Collage oder eingeklebtes Bild: Rahmen, Neun, Horizont, Kreis, Punkt, Sechzehn, Fenster, Spirale.",
      "7 offene Fragen, zum Beispiel: Was würdest du erschaffen, wenn es niemand sehen würde?",
      "Dazu eine Werke-Liste für Bücher und Arbeiten mit „ein Satz dazu“, ein Inhaltsverzeichnis zum Selbstanlegen und Seitenverweise („von S. / weiter S.“). Damit lassen sich Gedanken über das ganze Buch hinweg verfolgen.",
    ],
    note: PROTOTYPE_NOTE,
    details: SPECS,
    previous: {
      label: "Prototyp V1",
      edition: "Prototyp V1 · 1/1 · nicht verkäuflich",
      images: [
        { src: "/products/mind-1.webp", alt: "pronoia Nº 02 Geist, Prototyp V1, cremefarbener Einband, frontal" },
        { src: "/products/mind-2.webp", alt: "Nº 02 Geist, Prototyp V1, zweite Ansicht" },
        { src: "/products/mind-3.webp", alt: "Nº 02 Geist, Prototyp V1, liegend" },
      ],
      description: "Die erste Fassung von Nº 02. Ein Einzelstück, aus dem V2 entstanden ist. Nicht verkäuflich.",
    },
  },
  {
    slug: "set",
    number: "Nº 01 + Nº 02",
    name: "set",
    work: "Askesis + Hypomnemata",
    genre: "beide Bände",
    status: "available",
    versionLabel: "Prototyp V2",
    edition: "Prototyp V2 · je 50 nummerierte Exemplare",
    priceCents: 7500,
    priceEnv: "STRIPE_PRICE_SET",
    images: [{ src: "/products/set-1.webp", alt: "pronoia Nº 01 Körper und Nº 02 Geist nebeneinander" }],
    description: "Beide Bände im Set: Nº 01 · Körper (Askesis) und Nº 02 · Geist (Hypomnemata). Prototyp V2.",
    details: SPECS,
    bundleOf: ["body", "mind"],
  },
];

// Einzelbände mit eigener Seite (ohne Set).
export const pageProducts = products.filter((product) => !product.bundleOf);

// Aktuelle Bilder; ohne eigene Fotos die der Vorversion.
export function currentImages(product: Pick<Product, "images" | "previous">): ProductImage[] {
  return product.images.length > 0 ? product.images : product.previous?.images ?? [];
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

// Werte wie "[A5]" oder "[Platzhalter: …]" sind noch nicht ausgefüllt.
export function isPlaceholder(value?: string): boolean {
  return !value || /^\[.*\]$|\[Platzhalter/.test(value.trim());
}

// Unvollständige Produktseiten bleiben aus dem Index (noindex + nicht in der Sitemap).
export function isProductComplete(product: Pick<Product, "status" | "story" | "details">): boolean {
  const storyReady = product.status !== "legacy" || !isPlaceholder(product.story);
  return storyReady && product.details.every((detail) => !isPlaceholder(detail.value));
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
