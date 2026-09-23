export type WritingKind = "essay" | "gedanke" | "marke";

export const KIND_LABELS: Record<WritingKind, string> = {
  essay: "Essay",
  gedanke: "Gedanke",
  marke: "Zur Marke",
};

export type Writing = {
  slug: string;
  title: string;
  kind: WritingKind;
  date: string; // ISO, z. B. "2026-09-23"
  // Für Suchmaschinen und Vorschauen, max. ~155 Zeichen. Leer = Anfang des Textes.
  description?: string;
  // Absätze durch Leerzeilen getrennt.
  body: string;
};

// Neueste zuerst. Neuer Text = neuer Eintrag oben.
export const writings: Writing[] = [
  {
    slug: "was-ist-pronoia",
    title: "was ist pronoia",
    kind: "marke",
    date: "2026-09-23",
    description:
      "Pronoia ist die Überzeugung, dass die Welt für dich arbeitet — und die Arbeit daran, das sichtbar zu machen. Journale für Körper und Geist aus Dresden.",
    body: `
Pronoia ist das Gegenteil von Paranoia: die Annahme, dass die Welt für dich arbeitet und nicht gegen dich. Wer damit lebt, hört auf, sich zu verteidigen, und fängt an zu bauen.

Alles andere folgt daraus. Wir betreiben positive Propaganda. Wir zeigen, was einen Menschen kultiviert, und wir machen es schön: den Körper, der geformt wird. Den Gedanken, der bleibt. Die Form, die beides trägt.

Unsere ersten Werkzeuge sind zwei Bücher. Nº 01 für den Körper, Nº 02 für den Geist. Sie geben wenig vor und lassen viel Raum. Was daraus entsteht, gehört dir.
`,
  },
  {
    slug: "manifest",
    title: "manifest",
    kind: "marke",
    date: "2026-09-23",
    description:
      "Pronoia heißt: Die Welt arbeitet für dich. Kultivieren, ästhetisieren und positive Propaganda für eine Haltung, nicht für ein Produkt.",
    body: `
Pronoia ist ein altes Wort. Bei den Stoikern meinte es Vorsehung und Voraussicht, das Denken vor der Tat. Heute steht es für das Gegenteil von Paranoia: die Welt arbeitet für dich.

Das ist keine Beruhigung, sondern eine Arbeitsanweisung. Wer glaubt, dass die Welt gegen ihn steht, verteidigt sich. Wer glaubt, dass sie für ihn arbeitet, kultiviert.

Kultivieren heißt: etwas wiederholt tun, bis es Form annimmt. Am Körper heißt das Training. Am Geist heißt das Lesen, Denken, Schreiben. Beides ist dieselbe Übung, nur an verschiedenen Stellen.

Ästhetisieren heißt: dem Ergebnis eine Form geben, die man behalten will. Was schön ist, wird weitergeführt. Was hässlich ist, wird liegen gelassen.

Deshalb machen wir positive Propaganda. Nicht Werbung für ein Produkt, sondern für eine Haltung: Es lohnt sich, an sich zu arbeiten, und es darf dabei gut aussehen.

Unsere Werkzeuge sind Bücher, Editionen, Bilder. Sie sagen dir nicht, was du zu schreiben hast. Sie geben einen Anstoß und dann Ruhe.

Pronoia. Die Welt arbeitet für dich.
`,
  },
  {
    slug: "den-tiger-reiten",
    title: "den tiger reiten",
    kind: "essay",
    date: "2026-09-23",
    description:
      "Ein Essay über Zerstreuung, Neid und mimetisches Begehren und darüber, wie man in der Moderne real lebt, statt vor ihr zu fliehen.",
    body: `
Mir ist aufgefallen, dass ich zu lange digital gelebt habe. Es war ein freudiges, geselliges Leben, aber es war nicht real, und allein war ich trotzdem. Die tausend Gesichter, die mich anschauten, gaben mir bloß das Gefühl, es nicht zu sein.

Daraus erwächst mir die Frage, was es bedeutet, real zu leben, in Zeiten des Konsums.

Ich kenne kein echteres Gefühl als dieses: den unterkühlten Körper in zu warmes Wasser zu legen. Oder den Schmerz beim Training zu durchstehen. Beide Gefühle haben eines gemeinsam: Sie sind nicht zerstreut. Sie verlangen den ganzen Menschen, hier und jetzt.

Das Internet und die sozialen Netzwerke dagegen verlocken uns zur Zerstreuung, zum Multitasking. Lange dachte ich, meine Arbeit sei nichts wert, weil sie sich nicht richtig anfühlte: nicht schnell, nicht sofort, nicht monumental. Dieses Gefühl entstand, weil ich Hunderte Leben gleichzeitig durchlebte und zu viel machte, statt mich auf das Wesentliche zu konzentrieren.

Die Zerstreuung rührt von der Imagination her, von der Fähigkeit, Situationen und Momente zu durchleben, ohne sie zu leben. Sie ist eine Flucht vor der eigenen Realität. Und zugleich flüstert sie uns ein, uns stünde mehr zu, als unser Schaffen hergibt. Ihr Name: Neid.

Irgendwann merkte ich, dass die Zerstreuung sogar in die Hallen des Stahls vorgedrungen war, in jene Räume, die sonst mein Ort der Ruhe, der Vernunft und der Konzentration waren. Da wusste ich: Ein Lebenswandel muss her.

Zwei Lebensweisen konkurrieren miteinander. Das schnelle, wandelnde, auf Trab haltende Leben der Zerstreuung, das Leben der Moderne. Und das langsame, konzentrierte Leben des Bewusstseins, des Im-Moment-Seins. Lange hielt ich Letzteres für rückschrittlich, für erfolglos. Ich war stolz auf meine Gabe, Informationen aufzunehmen und zu verarbeiten, und merkte nicht, dass ich unter ihnen zusammenbrach und selbst nicht vorankam.

Doch der Ausstieg fühlt sich zunächst leer und einsam an. Man nimmt sich den künstlichen Sinn, der darin besteht, up to date zu sein, und muss nun selbst einen schaffen. Nihilismus. Das absurde Fragezeichen.

Die Einsamkeit ist ein Maßstab, an dem man bricht oder wächst. Doch es gibt eine andere Form von ihr, für die das Deutsche kaum ein Wort hat: das Alleinsein, das man nicht erleidet, sondern wählt. In ihm liegt die Kraft des Schaffens, des wahren Erkennens, der Möglichkeiten, und die göttliche Stimme in dir. Hier wird das Genie geboren, und nur ein Narr kehrt mit dieser Erkenntnis zurück.

Ich war dieser Narr. Aber es war nicht lustig. Wer im Schnellen verharren muss, ist abgelenkt. Der Kopf spielt Spiele mit einem, die man nicht durchschaut. Man hält für sein eigenes Ziel, was man nur begehrt, weil andere es begehren, und hat keinen Augenblick, um zu hinterfragen, was dahintersteckt. Mimetisches Begehren.

Dasselbe galt, als ich den Weg des Waldes wählte, den Weg des Urigen. Er war nicht für mich. Ich hielt ihn für passend, weil er nach Ruhe und Bestimmung aussah. Doch auch die Flucht aus der Moderne kann nur eine weitere Nachahmung sein.

Man kann den modernen Menschen nicht aus der Moderne herauslösen. Er muss sie nutzen, statt sie zu bekämpfen, einen eigenen Pfad erkennen und den Tiger selbst reiten.

Der Pfad ist bereits klar. Du musst ihn nur gehen.
`,
  },
];

export function getWriting(slug: string): Writing | undefined {
  return writings.find((writing) => writing.slug === slug);
}

export function paragraphs(writing: Writing): string[] {
  return writing.body.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim());
}

export function summary(writing: Writing, max = 155): string {
  if (writing.description) return writing.description;
  const text = paragraphs(writing)[0];
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,;:.]$/, "")} …`;
}

export function readingMinutes(writing: Writing): number {
  return Math.max(1, Math.round(writing.body.trim().split(/\s+/).length / 200));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${iso}T12:00:00`));
}
