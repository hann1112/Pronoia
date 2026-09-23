import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { EmailBar } from "@/components/EmailBar";
import { SHOP_ENABLED } from "@/lib/shop";
import { operator } from "@/lib/legal";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "pronoia — Die Welt arbeitet für dich",
  description:
    "Pronoia ist die Überzeugung, dass die Welt für dich arbeitet. Nº 01 körper und Nº 02 geist: Bücher für Training und Denken, Prototyp V2, je 50 Exemplare.",
  openGraph: { siteName: "pronoia", locale: "de_DE", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "pronoia",
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`,
    slogan: "Die Welt arbeitet für dich.",
    description: "Pronoia ist die Überzeugung, dass die Welt für dich arbeitet — und die Arbeit daran, das sichtbar zu machen.",
    email: operator.email,
    founder: { "@type": "Person", name: operator.name },
    address: {
      "@type": "PostalAddress",
      streetAddress: operator.street,
      postalCode: operator.city.split(" ")[0],
      addressLocality: operator.city.split(" ").slice(1).join(" "),
      addressCountry: "DE",
    },
  };

  return (
    <html lang="de" className={`${display.variable} ${geist.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
        <Header />
        {children}
        <Footer />
        <EmailBar />
        {SHOP_ENABLED && <CartDrawer />}
      </body>
    </html>
  );
}
