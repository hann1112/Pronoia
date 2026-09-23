import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ShopNotice } from "@/components/ShopNotice";

export const metadata: Metadata = { title: "Versand — pronoia" };

export default function VersandPage() {
  return (
    <LegalPage title="versand">
      <div className="space-y-3">
        <ShopNotice topic="Versandkosten, Lieferländer und Lieferzeiten" />
      </div>
    </LegalPage>
  );
}
