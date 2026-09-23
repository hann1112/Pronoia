import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ShopNotice } from "@/components/ShopNotice";

export const metadata: Metadata = { title: "AGB — pronoia" };

export default function AgbPage() {
  return (
    <LegalPage title="agb">
      <div className="space-y-3">
        <ShopNotice topic="Unsere AGB" />
      </div>
    </LegalPage>
  );
}
