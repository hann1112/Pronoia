# PRONOIA — Webshop-Spezifikation v2

> Übergabedokument für ChatGPT. Dieses Dokument beschreibt **was** gebaut wird (Frontend + Backend).
> **v2 ersetzt v1.** Neu: weißes „icy“ Design mit Milchglas (Glassmorphism/Blur), leichte verspielte Display-Schrift,
> „+“-Zoom oben links, E-Mail-Feld unten, Journale Nº 01/Nº 02 sind **Legacy-Prototypen (1/1, nicht verkäuflich)**.
> Alle Änderungen gegenüber v1 sind mit **[v2]** markiert.

---

## 0. So nutzt du dieses Dokument mit ChatGPT

**Wenn du schon mitten im Bauen bist (Phasen 1–3 fertig):**
1. Füge das **gesamte v2-Dokument** in denselben ChatGPT-Chat ein mit:
   *„Die Spezifikation wurde auf v2 aktualisiert. Sie ersetzt v1 komplett. Lies sie und nenne mir in Stichpunkten, was sich an Phase 1–3 ändern muss. Warte dann.“*
2. Danach den Prompt **Phase 3.5 (Design-Update)** aus Abschnitt 12 senden.
3. Dann weiter mit **Phase 4** (Warenkorb) usw.

**Neuer Chat:** Dokument einfügen → *„Lies es vollständig, fasse es in 5 Sätzen zusammen und warte auf Phase 1.“* → Phasen einzeln abarbeiten.

---

## 1. Das Projekt in drei Sätzen

**pronoia** ist eine Marke rund um **body** und **mind**. Die Website besteht aus **einem einzigen weißen Screen**: links **body**, rechts **mind**, jeweils hinter einer Scheibe aus Milchglas. Wer darüberfährt, sieht das Produkt dahinter scharf; ein Klick führt direkt zum Produkt.

**[v2] Status der aktuellen Produkte:** Die beiden Journale **Nº 01 KÖRPER** und **Nº 02 GEIST** sind **Legacy-Prototypen**. Von jedem gibt es **genau ein Stück**. Sie werden gezeigt, sind aber **nicht verkäuflich**. Statt „In den Warenkorb“ gibt es dort die E-Mail-Anmeldung für das nächste Release.
Warenkorb und Stripe werden trotzdem vollständig gebaut, aber über einen Schalter deaktiviert (`NEXT_PUBLIC_SHOP_ENABLED=false`), bis das erste verkäufliche Produkt kommt.

| Startseite | Produkt | Status |
|---|---|---|
| **body** (links) | Nº 01 — KÖRPER (schwarzer Einband) | LEGACY · PROTOTYPE · 1/1 |
| **mind** (rechts) | Nº 02 — GEIST (cremefarbener Einband) | LEGACY · PROTOTYPE · 1/1 |

---

## 2. Referenzen: was wir übernehmen

**yeezy.com (Hauptreferenz)**
- ✅ **Reines Weiß** als Fläche, die Produkte sind der einzige Inhalt
- ✅ Kleine Mono-/Tech-UI-Schrift in Großbuchstaben mit weiter Laufweite
- ✅ **„+“ oben links = Zoom**: Das Raster wird größer und näher, das Icon wechselt zu „−“ bzw. „‹“
- ✅ Oben mittig ein Umschalter (bei Yeezy „MALE FEMALE“) → bei uns **BODY  MIND**
- ✅ **E-Mail-Feld unten**: Label, Eingabefeld mit Unterstrich, schwarzer Button, Schließen-„×“
- ✅ Fußzeile als eine Reihe winziger Links, zentriert
- ❌ Cookie-Banner (brauchen wir nicht, siehe Abschnitt 10)

**vivetofficial.com (Produktseite)**
- ✅ Großes Bild, Bildzähler, daneben nur Name, Status/Preis, eine Aktion und „Details“ zum Aufklappen

**[v2] Eigene Note: „icy“**
- Weiß mit kühlem, fast unsichtbarem Blaustich
- **Milchglas-Flächen** (`backdrop-filter: blur`) als einziges „Effekt“-Element
- Leichte, verspielte, intellektuelle Display-Schrift als Kontrast zur kleinen Mono-UI (siehe 5.3)

---

## 3. Tech-Stack

| Bereich | Wahl | Warum |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Frontend + Backend in einem Projekt |
| Styling | **Tailwind CSS v4** | Design-Tokens als CSS-Variablen |
| Animation | **Framer Motion** (`motion`) | Übergänge, Blur-Animationen |
| Warenkorb-State | **Zustand** + `persist` | kein Login nötig |
| Zahlung | **Stripe Checkout (gehostet)** | Karte, Apple/Google Pay, PayPal, Klarna, SEPA |
| E-Mail + Newsletter **[v2]** | **Resend** (Transaktionsmails + Kontaktliste) | eine Lösung für Bestellmails und Newsletter-Liste |
| Validierung | **zod** | API-Eingaben |
| Hosting | **Cloudflare Workers** | statischer Export (`out/`) + Worker für `/api/*`, kostenlos, kein Einschlafen |
| Datenbank | **keine** | Stripe = Bestellungen, Resend = E-Mail-Liste |
| Fonts | `next/font/google` | selbst gehostet, DSGVO-freundlich |

---

## 4. Routen & Dateistruktur

### Seiten
| Route | Inhalt |
|---|---|
| `/` | Split-Screen body \| mind mit Milchglas |
| `/body` | Produktseite Nº 01 KÖRPER (Legacy) |
| `/mind` | Produktseite Nº 02 GEIST (Legacy) |
| `/danke` | Bestellbestätigung nach Stripe |
| `/impressum`, `/datenschutz`, `/agb`, `/widerruf`, `/versand`, `/kontakt` | Rechtstexte |

### API
| Route | Methode | Aufgabe |
|---|---|---|
| `/api/checkout` | POST | Warenkorb → Stripe-Checkout-Session (nur wenn Shop aktiv) |
| `/api/webhooks/stripe` | POST | bezahlte Bestellungen → E-Mail |
| `/api/subscribe` **[v2]** | POST | E-Mail eintragen → Bestätigungsmail (Double-Opt-in) |
| `/api/subscribe/confirm` **[v2]** | GET | Link aus der Mail → Kontakt in Resend anlegen |

### Ordnerstruktur
```
pronoia/
├─ app/
│  ├─ layout.tsx                  # Fonts, Tokens, Header, Footer, EmailBar, CartDrawer
│  ├─ page.tsx                    # Landing
│  ├─ [slug]/page.tsx             # Produktseite
│  ├─ danke/page.tsx
│  ├─ (legal)/…                   # Rechtsseiten
│  └─ api/
│     ├─ checkout/route.ts
│     ├─ webhooks/stripe/route.ts
│     └─ subscribe/route.ts, subscribe/confirm/route.ts
├─ components/
│  ├─ Glass.tsx                   # [v2] wiederverwendbare Milchglas-Fläche
│  ├─ SplitHero.tsx
│  ├─ Header.tsx                  # „+“ | Mitte | WARENKORB
│  ├─ Footer.tsx
│  ├─ EmailBar.tsx                # [v2] fixiert unten
│  ├─ EmailForm.tsx               # [v2] Formular, auch auf der Produktseite genutzt
│  ├─ ProductGallery.tsx          # inkl. Zoom-Modus
│  ├─ ProductInfo.tsx             # zeigt je nach Status: Legacy / Kaufen / Ausverkauft
│  ├─ AddToCartButton.tsx
│  ├─ CartDrawer.tsx, CartLine.tsx
│  └─ Accordion.tsx
├─ lib/
│  ├─ products.ts
│  ├─ shop.ts                     # [v2] SHOP_ENABLED-Flag + isPurchasable()
│  ├─ stripe.ts, resend.ts
│  ├─ tokens.ts                   # [v2] HMAC-Token für Double-Opt-in
│  ├─ ui-store.ts                 # [v2] zoom an/aus, EmailBar geschlossen
│  ├─ cart-store.ts
│  └─ format.ts
└─ public/brand/, public/products/
```

---

## 5. Design-System [v2 komplett neu]

### 5.1 Farben
```
--bg:            #FFFFFF                    /* Seite: reines Weiß */
--ink:           #0A0A0A                    /* Text, Buttons */
--muted:         #8C949A                    /* Sekundärtext, inaktive Links (kühles Grau) */
--faint:         #B9C1C7                    /* inaktiver Umschalter, Platzhalter */
--line:          #E3E8EC                    /* Haarlinien, Unterstriche */
--ice:           rgba(240, 246, 250, 0.38)  /* Glas-Füllung */
--ice-strong:    rgba(240, 246, 250, 0.60)  /* Glas für Leisten (EmailBar, Drawer) */
--glass-border:  rgba(255, 255, 255, 0.90)
--glass-shade:   rgba(180, 200, 215, 0.35)
```
Keine Akzentfarbe. Das einzige „Farbige“ sind die Produkte selbst.

### 5.2 Milchglas-Rezept (`components/Glass.tsx`)
```css
.glass {
  background: var(--ice);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),   /* Lichtkante oben */
    0 1px 0 var(--glass-shade);           /* feine Kante unten */
}
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(245, 248, 250, 0.88); }  /* Fallback ohne Blur */
}
```
- Varianten: `strength="soft" | "normal" | "strong"` → Blur 10 / 18 / 28px
- Blur funktioniert nur, wenn **etwas dahinter** liegt. Deshalb liegen auf der Landing die Produktbilder **hinter** dem Glas.
- **Performance:** höchstens 3 Glasflächen gleichzeitig; Blur-Werte über Framer Motion animieren (`filter`/`backdropFilter`), nicht über Layout-Eigenschaften.

### 5.3 Typografie [v2.1: entschieden → Instrument Serif Italic]
Die Display-Schrift soll **verspielt, ästhetisch, leicht und intellektuell** wirken, nicht technisch. Die Tech-Note kommt nur aus der kleinen UI-Schrift (Geist Mono, wie bei Yeezy).
**Entscheidung: Instrument Serif Italic.** Schlank, elegant, wie aus einem Kunstbuch, und kursiv wie die Wortmarke.

| Rolle | Font | Stil |
|---|---|---|
| Display | **Instrument Serif** | *Italic* 400, kleingeschrieben, `letter-spacing: -0.01em` → „body“, „mind“, Produktnamen, „danke.“, Leerzustände |
| Nummern | **Instrument Serif** | Regular 400 (nicht kursiv) → „Nº 01“, „Nº 02“ |
| UI | **Geist Mono** | 11px, UPPERCASE, `letter-spacing: 0.2em`, 400 |
| Fließtext | **Geist Mono** | 13px, normale Schreibung, line-height 1.7 |
| Logo | bleibt **Bilddatei/SVG** (kursive Serife) | |

**Einbindung in Next.js** (Instrument Serif hat nur Gewicht 400, deshalb `weight` angeben):
```ts
import { Instrument_Serif, Geist_Mono } from 'next/font/google';
export const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['italic', 'normal'],
  variable: '--font-display',
  display: 'swap',
});
export const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
// CSS Display: font-family: var(--font-display); font-style: italic; font-weight: 400;
```

- „body“ / „mind“: `clamp(64px, 12.5vw, 210px)`, `line-height: 0.9` (Instrument Serif wirkt kleiner, deshalb größer gesetzt)
- Produktname: `clamp(46px, 5.75vw, 92px)`
- **Kein** Fake-Bold: nur Gewicht 400 verwenden (es gibt kein Bold, der Browser würde es künstlich erzeugen → `font-synthesis: none`).
- Fraunces, Chakra Petch, Michroma, Cormorant und Inter **nicht** verwenden.

### 5.4 Formen & Abstände
- Radius: Glas 14px, Buttons/Inputs **6px**, Bilder 0
- Buttons: `--ink` gefüllt, weiße Schrift, 44px hoch (wie Yeezys SUBSCRIBE)
- Inputs: kein Rahmen, nur 1px Unterstrich `--line`, beim Fokus `--ink`
- Außenrand 16px mobil / 24px Desktop, Header 48px hoch

### 5.5 Bewegung
- Easing `cubic-bezier(0.7, 0, 0.2, 1)`, 500–700ms
- „Enteisen“: Blur 18px → 0px, Glasfüllung → transparent, Rand → transparent
- `prefers-reduced-motion`: keine Blur-Animation, sofortiger Wechsel, kein Auto-Wechsel auf Mobil

### 5.6 Logo
- Zeichen (`pronoia-mark.png`) → `public/brand/mark.svg`, Wortmarke → `wordmark.svg`, Favicon = Zeichen
- Auf Weiß einfach schwarz (der mix-blend-Trick aus v1 entfällt)

### 5.7 Produktbilder
| Aktuelle Datei | Neuer Name | Inhalt |
|---|---|---|
| `…08_43_56 PM-1.png` | `body-1.png` | Nº 01 frontal (Hauptbild, liegt auf der Landing hinter dem Glas) |
| `…08_44_01 PM-2.png` | `body-2.png` | Nº 01 schräg mit Buchrücken |
| `…08_44_04 PM-3.png` | `body-3.png` | Nº 01 liegend |
| `…08_44_06 PM-4.png` | `mind-1.png` | Nº 02 frontal (Hauptbild) ⚠️ oben helle Freistell-Reste entfernen |
| `…08_44_08 PM-5.png` | `mind-2.png` | Nº 02 zweite Ansicht |
| `…08_44_09 PM-6.png` | `mind-3.png` | Nº 02 liegend |
| `…08_44_11 PM-7.png` | `set-1.png` | beide frontal → **OG-/Share-Bild** |
| `…08_44_12 PM-8.png` | `set-2.png` | beide mit Buchrücken |
| `…08_44_14 PM-9.png` | `set-3.png` | beide überlappend |

**[v2] Auf Weiß:** Der cremefarbene Einband verschwimmt sonst mit dem Hintergrund. Deshalb bekommen alle Produktbilder einen sehr weichen Kontaktschatten: `filter: drop-shadow(0 24px 32px rgba(20,30,40,.10))`.

---

## 6. Screens (Frontend)

### 6.0 Globale Elemente [v2]

**Header** (48px, transparent, über allem)
| Links | Mitte | Rechts |
|---|---|---|
| **„+“** Zoom-Schalter (wird zu **„−“**) | Landing: Logo-Zeichen · Produktseite: **BODY  MIND**-Umschalter | **WARENKORB (n)**, nur wenn Shop aktiv |

- BODY  MIND: aktiver Begriff `--ink`, inaktiver `--faint` (wie Yeezys MALE/FEMALE). Klick wechselt zwischen `/body` und `/mind`.
- Zoom-Status liegt in `ui-store` und gilt seitenweit (siehe 6.1 und 6.2).

**Footer:** eine Reihe winziger Links, zentriert, `--muted`:
`KONTAKT  IMPRESSUM  DATENSCHUTZ  AGB  WIDERRUF  VERSAND` + Logo-Zeichen klein links (Link auf `/`).

**EmailBar** (Abschnitt 6.5): fixiert unten auf jeder Seite, schließbar.

---

### 6.1 Startseite `/`

```
┌────────────────────────────────────────────────────────────────────┐
│ +                               ◯                   WARENKORB (0)  │
│                                                                    │
│   ┌──────────────────────────┐    ┌──────────────────────────┐     │
│   │░░░░░░░░░░░░░░░░░░░░░░░░░░│    │░░░░░░░░░░░░░░░░░░░░░░░░░░│     │
│   │░░░░░  [Nº01 unscharf] ░░░│    │░░░░░  [Nº02 unscharf] ░░░│     │
│   │░░░░░░░░  body  ░░░░░░░░░░│    │░░░░░░░░  mind  ░░░░░░░░░░│     │ ← Milchglas
│   │░░░░░░ Nº 01 · KÖRPER ░░░░│    │░░░░░░ Nº 02 · GEIST ░░░░░│     │
│   │░░░░░░░░░░░░░░░░░░░░░░░░░░│    │░░░░░░░░░░░░░░░░░░░░░░░░░░│     │
│   └──────────────────────────┘    └──────────────────────────┘     │
│                                                                    │
│      KONTAKT  IMPRESSUM  DATENSCHUTZ  AGB  WIDERRUF  VERSAND        │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ UPDATES   E-MAIL-ADRESSE ______________________  [ EINTRAGEN ] × │ │ ← EmailBar (Glas)
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

**Aufbau**
- `100svh`, kein Scroll, Hintergrund `--bg`.
- Zwei Hälften, beide echte Links (`<a href="/body">`, `<a href="/mind">`).
- In jeder Hälfte: **hinten** das Hauptbild des Produkts (`body-1.png` / `mind-1.png`, ca. 45vh hoch, mit Kontaktschatten), **davor** eine Glasfläche (fast die ganze Hälfte, 24px Abstand), **auf dem Glas** das Wort (Display-Font, `--ink`) und darunter die Zeile `Nº 01 · KÖRPER` (UI-Font, `--muted`).
- Ergebnis: Man ahnt das Buch hinter dem Eis, sieht es aber nicht scharf.

**Interaktion (Desktop)**
1. **Hover links:** Das Glas links „enteist“ (Blur 18 → 0, Füllung und Rand verschwinden, 600ms), das Wort blendet aus, das Buch steht scharf da. Die Zeile `Nº 01 · KÖRPER — LEGACY 1/1 →` bleibt sichtbar. Gleichzeitig wird das Glas **rechts stärker** (Blur 18 → 28). Rechts umgekehrt.
2. **Klick:** Das Produktbild skaliert leicht (1 → 1.04), die Seite blendet in 300ms auf Weiß, dann `router.push`. (Optional v2+: View Transitions API für einen gemeinsamen Bild-Übergang.)
3. **„+“ (Zoom):** Beide Gläser enteisen gleichzeitig, die Bücher werden größer (Scale 1.25), die Wörter verschwinden. „+“ wird zu „−“. Nochmal klicken → zurück.
4. Tastatur: Fokus auf einer Hälfte = gleicher Effekt wie Hover. Sichtbarer Fokusrahmen: 1px `--ink`, 6px Abstand.

**Mobil (< 768px)**
- Hälften übereinander (je ca. 42svh, darunter Footer + EmailBar).
- Kein Hover. Stattdessen **„Atmen“**: Alle 4 Sekunden enteist abwechselnd oben/unten für 1,5s. Deaktiviert bei `prefers-reduced-motion`.
- Tippen öffnet direkt die Produktseite.

**Accessibility:** visuell versteckte `<h1>`: „pronoia — body und mind“. `aria-label`: „body – Nº 01 Körper, Legacy-Prototyp, ansehen“.

---

### 6.2 Produktseite `/body` und `/mind`

Beide Seiten weiß. Die Produktfarbe kommt nur noch aus den Bildern.

```
┌────────────────────────────────────────────────────────────────────┐
│ +                          BODY   mind                             │
├────────────────────────────────────────┬───────────────────────────┤
│                                        │ ┌───────────────────────┐ │
│                                        │ │ LEGACY · PROTOTYPE 1/1│ │
│            [ body-1 ]                  │ │ Nº 01                 │ │
│                                        │ │ körper                │ │
│                                        │ │                       │ │
├────────────────────────────────────────┤ │ Einzelstück.          │ │
│            [ body-2 ]                  │ │ Nicht verkäuflich.    │ │ ← Glas-Panel, sticky
│                                        │ │                       │ │
├────────────────────────────────────────┤ │ NÄCHSTES RELEASE      │ │
│            [ body-3 ]                  │ │ E-MAIL ____________   │ │
│                                        │ │ [ EINTRAGEN ]         │ │
│ 1 / 3                                  │ │ + DETAILS             │ │
│                                        │ │ + ÜBER DEN PROTOTYP   │ │
│                                        │ └───────────────────────┘ │
└────────────────────────────────────────┴───────────────────────────┘
```

**Linke Spalte (Galerie, 60%)**
- 3 Bilder untereinander, je ca. 85vh, `object-fit: contain`, Kontaktschatten. Erstes Bild `priority`.
- Zähler `1 / 3` unten links fixiert.
- **Zoom (Header „+“):** Galerie wechselt in den Detailmodus: Bild füllt die ganze Breite (Info-Panel fährt nach rechts raus) und folgt der Maus (`transform-origin` = Cursorposition, Scale 2). Mobil: Pinch-Zoom erlauben, „+“ schaltet auf Vollbreite ohne Rand.

**Rechte Spalte (Info-Panel, 40%, sticky, Glas „normal“)**
Der Inhalt hängt von `product.status` ab:

| Status | Anzeige |
|---|---|
| `legacy` **[v2]** | Badge `LEGACY · PROTOTYPE · 1/1` → Nº → Name → „Einzelstück. Nicht verkäuflich.“ → **EmailForm** mit Label `NÄCHSTES RELEASE` → Akkordeon **DETAILS** + **ÜBER DEN PROTOTYP** (2–3 Sätze Geschichte). **Kein Preis, kein Warenkorb-Button.** |
| `available` | Nº → Name → Preis + „inkl. MwSt., zzgl. Versand“ + Lieferzeit → **IN DEN WARENKORB** → Beschreibung → Akkordeon DETAILS + VERSAND & RÜCKGABE |
| `soldout` | wie `available`, Button deaktiviert `AUSVERKAUFT`, darunter EmailForm „Benachrichtigen“ |

- Badge: UI-Font, 10–11px, 1px Rahmen `--ink`, Radius 4px, Padding 4×8px.
- Ganz unten: Kreuzlink `auch: mind →`.

**Mobil:** Galerie als Swipe-Slider (`scroll-snap`) mit Zähler, Info-Panel darunter (Glas mit Blur „soft“).

**SEO:** `<title>`: `Nº 01 körper — legacy prototype — pronoia`. JSON-LD `Product` **ohne** `offers`, solange `legacy` (sonst erwartet Google einen Preis). OG-Bild = erstes Produktbild.

---

### 6.3 Warenkorb (Drawer), nur wenn Shop aktiv

- Panel von rechts, 420px bzw. 100% mobil, **Glas „strong“** (`--ice-strong`, Blur 28px) über der abgedunkelten Seite (`rgba(255,255,255,.4)` + Blur 4px statt Schwarz, passend zu icy).
- Inhalt wie v1: Zeilen mit Bild, Name, Preis, `– 1 +`, ENTFERNEN; ZWISCHENSUMME; „Versand wird an der Kasse berechnet.“; Button **ZUR KASSE** (schwarz, volle Breite).
- Leer: „dein warenkorb ist leer.“ + `body →` `mind →`
- Focus trap, Esc, Scroll-Lock, `role="dialog"`, `?cart=open` öffnet ihn.
- ZUR KASSE → `WEITERLEITUNG…` → `POST /api/checkout` → Redirect; Fehlertext inline.
- **[v2] Legacy-Produkte kommen nie in den Warenkorb.** Der Store lehnt `add()` für Produkte ab, die nicht `available` sind.
- **[v2]** Ist `NEXT_PUBLIC_SHOP_ENABLED` nicht `true`, werden Drawer und „WARENKORB“ im Header gar nicht gerendert.

### 6.4 Danke-Seite `/danke`
Wie v1, auf Weiß: „danke.“ (Display-Font), Bestätigungstext mit E-Mail, `← zurück`. Warenkorb leeren. Ungültige Session → `/`.

### 6.5 EmailBar + EmailForm [v2 neu]

**EmailBar** (fixiert unten, 16px Abstand zum Rand, Glas „strong“, Höhe 52px)
```
UPDATES   E-MAIL-ADRESSE ____________________________   [ EINTRAGEN ]   ×
Mit dem Eintragen erhältst du Updates zu pronoia per E-Mail. Abmeldung jederzeit. DATENSCHUTZ
```
- Zweite Zeile: 10px, `--muted`, nur sichtbar, solange das Feld fokussiert oder ausgefüllt ist.
- „×“ schließt die Bar; gespeichert in localStorage (30 Tage). Nach erfolgreicher Anmeldung: dauerhaft ausgeblendet.
- Mobil: volle Breite, Input und Button untereinander, Bar ca. 96px hoch.
- Auf der Produktseite mit Status `legacy` wird die EmailBar ausgeblendet (dort steht das Formular schon im Panel).

**EmailForm-Zustände**
| Zustand | Anzeige |
|---|---|
| idle | Input + EINTRAGEN |
| loading | Button `…`, Input gesperrt |
| success | Text `FAST GESCHAFFT. BITTE BESTÄTIGE DEINE E-MAIL.` |
| error | `DAS HAT NICHT GEKLAPPT. BITTE NOCHMAL VERSUCHEN.` bzw. `BITTE GÜLTIGE E-MAIL EINGEBEN.` |
| confirmed | nach Rückkehr über `/?subscribed=1`: `DU BIST DABEI.` (3s), dann Bar weg |

- Unsichtbares Honeypot-Feld `company` (Bots füllen es aus → Anfrage still verwerfen).

### 6.6 Rechtsseiten
Weiß, max. 640px breit, Geist Mono 13px, Header und Footer wie überall.

---

## 7. Produktdaten (`lib/products.ts`)

```ts
export type ProductStatus = 'legacy' | 'available' | 'soldout';

export type Product = {
  slug: 'body' | 'mind';
  number: string;              // "Nº 01"
  name: string;                // "körper"
  status: ProductStatus;       // [v2]
  edition?: string;            // [v2] "PROTOTYPE · 1/1"
  stripePriceId?: string;      // nur nötig, wenn status !== 'legacy'
  images: { src: string; alt: string }[];
  description: string;
  story?: string;              // [v2] Text für „ÜBER DEN PROTOTYP“
  details: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: 'body',
    number: 'Nº 01',
    name: 'körper',
    status: 'legacy',
    edition: 'PROTOTYPE · 1/1',
    images: [
      { src: '/products/body-1.png', alt: 'pronoia Nº 01 Körper, Legacy-Prototyp, schwarzer Einband, frontal' },
      { src: '/products/body-2.png', alt: 'Nº 01 Körper, schräg mit Buchrücken' },
      { src: '/products/body-3.png', alt: 'Nº 01 Körper, liegend' },
    ],
    description: 'Einzelstück. Nicht verkäuflich.',
    story: '[PLATZHALTER: 2–3 Sätze, warum dieser Prototyp existiert]',
    details: [
      { label: 'Format', value: '[A5]' },
      { label: 'Seiten', value: '[192]' },
      { label: 'Einband', value: '[Hardcover, schwarz, Heißfolienprägung]' },
      { label: 'Auflage', value: '1 Stück' },
    ],
  },
  { slug: 'mind', number: 'Nº 02', name: 'geist', status: 'legacy', edition: 'PROTOTYPE · 1/1', /* analog, mind-1..3 */ },
];
```

`lib/shop.ts`:
```ts
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED === 'true';
export const isPurchasable = (p: Product) => SHOP_ENABLED && p.status === 'available' && !!p.stripePriceId;
```
Preise (nur bei `available`) kommen wie in v1 von Stripe (`stripe.prices.retrieve`, 1h Cache).

---

## 8. Warenkorb-Logik (`lib/cart-store.ts`)

Wie v1 (Zustand + persist, Key `pronoia-cart`, Menge 1–10, Client schickt nur `slug` + `quantity`).
**[v2]** `add()` prüft `isPurchasable(product)` und ignoriert sonst den Aufruf.

`lib/ui-store.ts` **[v2]**: `zoom: boolean`, `toggleZoom()`, `emailBarDismissedUntil: number | null`, `subscribed: boolean` (persist).

---

## 9. Backend

### 9.1 Checkout-Ablauf (unverändert zu v1)
```
Warenkorb → POST /api/checkout {items:[{slug,quantity}]}
  → Server: SHOP_ENABLED? Produkt available? Menge 1–10? → slug → stripePriceId
  → stripe.checkout.sessions.create(...) → {url} → Redirect zu Stripe
  → Erfolg: /danke?session_id=…   Abbruch: /?cart=open
  → Stripe-Webhook → Bestellmail an dich
```

### 9.2 `POST /api/checkout`
Wie v1, zusätzlich **[v2]**:
- `SHOP_ENABLED` false → `403 { error: 'shop_closed' }`
- Produkt nicht `available` → `409 { error: 'not_available' }`

Session-Parameter (v1): `mode: 'payment'`, `line_items` aus Preis-IDs, `locale: 'de'`, `shipping_address_collection`, `shipping_options`, `allow_promotion_codes`, `invoice_creation`, `consent_collection.terms_of_service: 'required'`, `success_url`, `cancel_url`, `metadata.cart`. Kein `payment_method_types` setzen.

### 9.3 `POST /api/webhooks/stripe`
Unverändert zu v1: Raw Body, Signaturprüfung, Events `checkout.session.completed` (nur bei `payment_status === 'paid'`), `async_payment_succeeded`, `async_payment_failed`; Schutz vor doppelter Ausführung über PaymentIntent-Metadata `fulfilled`; Bestellmail über Resend; Kundenbelege über Stripe.

### 9.4 Newsletter mit Double-Opt-in [v2 neu]
In Deutschland Pflicht: Eine E-Mail kommt erst **nach** Klick auf den Bestätigungslink auf die Liste.

**`POST /api/subscribe`**
1. Body mit zod prüfen: `{ email: string().email().max(254), company?: string }`
2. `company` ausgefüllt (Honeypot) → trotzdem `200` antworten, nichts tun.
3. Rate-Limit: max. 5 Anfragen/Stunde pro IP und 3 pro E-Mail-Adresse (Cloudflare KV; lokal im Speicher).
4. Token bauen (`lib/tokens.ts`): `base64url(email + '.' + ablaufzeit48h) + '.' + HMAC_SHA256(NEWSLETTER_SECRET)`.
5. Bestätigungsmail über Resend senden: Betreff „bitte bestätigen — pronoia“, schlichtes HTML (weiß, Geist Mono, schwarzer Button `BESTÄTIGEN`) → Link `SITE_URL/api/subscribe/confirm?token=…`.
6. Immer `200 { ok: true }` zurückgeben, auch wenn die Adresse schon existiert (verrät nichts).

**`GET /api/subscribe/confirm?token=…`**
1. Token prüfen (HMAC mit `timingSafeEqual`, Ablaufzeit).
2. Ungültig/abgelaufen → Redirect `/?subscribed=expired` → EmailBar zeigt „LINK ABGELAUFEN. BITTE NEU EINTRAGEN.“
3. Gültig → Kontakt in Resend anlegen (Contacts-API, Segment `RESEND_SEGMENT_ID`; Resend hat Audiences durch Segments ersetzt) mit `unsubscribed: false`.
4. Redirect `/?subscribed=1`.

**Versand von Newslettern** später direkt aus Resend (Broadcasts). Jede Mail enthält automatisch einen Abmeldelink.

### 9.5 Stripe-Dashboard-Setup (manuell, wenn der Shop live geht)
Wie v1: Konto verifizieren → Produkte + EUR-Preise → Versandtarife → Zahlungsmethoden → Branding (**[v2]** Hintergrund `#FFFFFF`, Button `#0A0A0A`, Schrift „Sans Serif“) → AGB-/Datenschutz-URL → Steuer-Entscheidung → Webhook-Endpoint → Kundenbelege → erst Test-, dann Live-Modus.

### 9.6 Resend-Setup [v2]
1. Account anlegen, **eigene Domain verifizieren** (DNS-Einträge SPF/DKIM bei deinem Domain-Anbieter), Absender z. B. `hello@pronoia.de`.
2. Ein Segment „pronoia updates“ anlegen → ID in die Env (`RESEND_SEGMENT_ID`).
3. API-Key mit **vollem Zugriff** erzeugen (ein reiner Sende-Key darf keine Kontakte anlegen).

### 9.7 Umgebungsvariablen
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SHOP_ENABLED=false         # [v2] true erst beim ersten verkäuflichen Produkt

STRIPE_SECRET_KEY=sk_test_...          # nur Server
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SHIPPING_DE=shr_...
STRIPE_SHIPPING_EU=shr_...
# STRIPE_PRICE_<SLUG>=price_...        # pro verkäuflichem Produkt

RESEND_API_KEY=re_...
RESEND_FROM="pronoia <hello@deinedomain.de>"
RESEND_SEGMENT_ID=...                  # [v2] Resend-Segment „pronoia updates“
NEWSLETTER_SECRET=<langer Zufallsstring> # [v2] für HMAC-Token
ORDER_NOTIFY_EMAIL=deine@mail.de
```

### 9.8 Lokal testen
- Stripe: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, Testkarte `4242 4242 4242 4242`
- Shop-Flag zum Testen lokal auf `true` setzen und in `products.ts` testweise ein Produkt auf `available` stellen (mit Test-Preis-ID)
- Newsletter: eigene Adresse eintragen → Mail kommt → Link → Kontakt erscheint in Resend

---

## 10. Deutschland-Pflichten (Checkliste, keine Rechtsberatung)

- [ ] Impressum, Datenschutz (+ AGB, Widerruf, Versand, sobald verkauft wird), von jeder Seite erreichbar → Footer
- [ ] **[v2] Newsletter:** Double-Opt-in, Hinweistext am Feld, Link zur Datenschutzerklärung, Abmeldelink in jeder Mail. Datenschutzerklärung nennt Resend als Auftragsverarbeiter.
- [ ] Kein Cookie-Banner nötig, solange nur notwendiger Speicher genutzt wird (localStorage für Warenkorb/EmailBar-Status, selbst gehostete Fonts). Kein Google Analytics und kein Meta-Pixel.
- [ ] **[v2] Legacy-Seiten:** Nichts darf wie ein Kaufangebot aussehen (kein Preis, kein Button) → dann gelten dafür auch keine Shop-Pflichtangaben.
- [ ] Sobald verkauft wird: Preise „inkl. MwSt., zzgl. Versand“, Lieferzeit, Button-Lösung prüfen lassen, LUCID-Registrierung (Verpackungsgesetz).

---

## 11. Offene Punkte / Platzhalter

| # | Punkt | Wert |
|---|---|---|
| 1 | ~~Display-Font~~ | ✅ entschieden: **Instrument Serif Italic** |
| 2 | **[v2]** Sind beide Journale (Nº 01 und Nº 02) Legacy 1/1, oder nur eins? | ___ |
| 3 | **[v2]** Text „Über den Prototyp“ je Journal (2–3 Sätze) | ___ |
| 4 | Produktdetails (Format, Seiten, Papier, Einband) | ___ |
| 5 | **[v2]** Absender-E-Mail + Domain für Resend | ___ |
| 6 | E-Mail für Bestellbenachrichtigungen | ___ |
| 7 | Später beim ersten Verkauf: Preise, Versandkosten, Lieferländer, MwSt./§19 | ___ |

---

## 12. Phasen-Prompts für ChatGPT

**Phase 1: Setup** *(erledigt)*
**Phase 2: Startseite** *(erledigt, wird in 3.5 angepasst)*
**Phase 3: Produktseite** *(erledigt, wird in 3.5 angepasst)*

**Phase 3.5: Design-Update auf v2** ← *jetzt*
> Passe die bestehenden Phasen 1–3 an Spezifikation v2 an:
> 1. Ersetze die Design-Tokens durch Abschnitt 5.1 (reines Weiß, icy). Entferne das Schwarz/Creme-Theming der Seiten.
> 2. Ersetze die Fonts laut 5.3: Display = Instrument Serif (Italic für Wörter, Regular für Nº), UI + Fließtext = Geist Mono. Cormorant Garamond, Inter, Fraunces und Chakra Petch komplett entfernen.
> 3. Baue `components/Glass.tsx` nach dem Rezept in 5.2 (drei Stärken, Fallback ohne backdrop-filter).
> 4. Baue die Startseite nach 6.1 um: Produktbild hinter Milchglas, Enteisen beim Hover, Gegenseite wird unschärfer, „+“-Zoom, mobiles „Atmen“, reduced-motion.
> 5. Baue Header und Footer nach 6.0 um (+/− links, Logo bzw. BODY/MIND-Umschalter in der Mitte, Warenkorb nur bei SHOP_ENABLED).
> 6. Baue die Produktseite nach 6.2 um: weiß, Glas-Info-Panel, Status-Logik legacy/available/soldout aus Abschnitt 7, Galerie-Zoom-Modus, JSON-LD ohne offers bei legacy.
> 7. Erweitere `lib/products.ts` und lege `lib/shop.ts` und `lib/ui-store.ts` laut Abschnitt 7 und 8 an.
> Gib mir jede geänderte Datei vollständig.

**Phase 4: Warenkorb**
> Baue `lib/cart-store.ts` (Abschnitt 8) und CartDrawer + CartLine nach 6.3 im Glas-Stil. Verbinde AddToCartButton (nur für `isPurchasable`) und den Header-Zähler (hydration-sicher). Alles nur rendern, wenn `NEXT_PUBLIC_SHOP_ENABLED=true`. Focus trap, Esc, Scroll-Lock, `?cart=open`, Leerzustand, Fehlerzustand bei ZUR KASSE.

**Phase 5: Stripe Checkout**
> Baue `lib/stripe.ts`, `app/api/checkout/route.ts` nach 9.2 (inkl. 403/409-Prüfungen) und `/danke` nach 6.4. Preis bei `available`-Produkten von Stripe laden (Abschnitt 7).

**Phase 6: Stripe-Webhook**
> Baue `app/api/webhooks/stripe/route.ts` nach 9.3 mit Raw Body, Signaturprüfung, Idempotenz und Resend-Bestellmail. Erkläre den lokalen Test mit der Stripe CLI.

**Phase 6.5: E-Mail-Feld + Double-Opt-in** *[v2 neu]*
> Baue EmailBar und EmailForm nach 6.5 (alle Zustände, Honeypot, Schließen mit 30 Tagen Speicher, mobil gestapelt, Ausblenden auf Legacy-Produktseiten). Baue `lib/tokens.ts`, `lib/resend.ts`, `POST /api/subscribe` und `GET /api/subscribe/confirm` nach 9.4 inkl. Rate-Limit und schlichter Bestätigungsmail im pronoia-Stil.

**Phase 7: Rechtsseiten + Deploy**
> Rechtsseiten nach 6.6, Favicon, OG-Bild `set-1.png`, `robots.txt`, `sitemap.xml`. Erkläre Deployment auf Cloudflare inkl. Env-Variablen (9.7), Domain, Resend-Domain-Verifizierung und später Stripe-Live-Webhook.

---

## 13. Abnahme-Checkliste

**Look**
- [ ] Überall reines Weiß, keine schwarzen/cremefarbenen Seitenflächen mehr
- [ ] Milchglas sichtbar unscharf mit Produkt dahinter; in Safari (iOS + macOS), Chrome und Firefox getestet
- [ ] Nur Instrument Serif + Geist Mono im Einsatz, kein Cormorant/Inter/Fraunces/Chakra Petch mehr im Bundle
- [ ] Kein künstliches Bold bei Instrument Serif (`font-synthesis: none`)

**Startseite**
- [ ] Kein Scroll; Hover enteist die eine Seite und macht die andere unschärfer
- [ ] „+“ enteist beide und vergrößert, „−“ stellt zurück
- [ ] Mobil: übereinander, „Atmen“ läuft, bei reduced-motion aus

**Produktseite (legacy)**
- [ ] Badge `LEGACY · PROTOTYPE · 1/1`, **kein Preis, kein Warenkorb-Button**
- [ ] E-Mail-Formular im Panel funktioniert, EmailBar dort ausgeblendet
- [ ] BODY/MIND-Umschalter wechselt die Seite, Zoom-Modus funktioniert

**Shop-Schalter**
- [ ] `SHOP_ENABLED=false` → kein WARENKORB im Header, `/api/checkout` antwortet 403
- [ ] `SHOP_ENABLED=true` + Testprodukt `available` → kompletter Testkauf mit 4242 klappt, Bestellmail kommt genau einmal

**Newsletter**
- [ ] Eintragen → Bestätigungsmail → Link → Kontakt in Resend → `DU BIST DABEI.`
- [ ] Abgelaufener/manipulierter Token wird abgelehnt
- [ ] Honeypot ausgefüllt → kein Mailversand

**Qualität**
- [ ] Lighthouse mobil: Performance ≥ 85 (Blur kostet etwas), Accessibility ≥ 95
- [ ] Keine Secrets im Browser-Bundle
