import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ShopNotice } from "@/components/ShopNotice";

export const metadata: Metadata = { title: "Widerruf — pronoia" };

export default function WiderrufPage() {
  return (
    <LegalPage title="widerruf">
      <div className="space-y-3">
        <ShopNotice topic="Die Widerrufsbelehrung und das Muster-Widerrufsformular" />
      </div>
    </LegalPage>
  );
}
