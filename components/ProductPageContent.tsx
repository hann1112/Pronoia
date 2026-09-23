"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { currentImages, type Product } from "@/lib/products";
import { useUiStore } from "@/lib/ui-store";

type ProductPageContentProps = {
  product: Product;
  purchasable: boolean;
};

export function ProductPageContent({ product, purchasable }: ProductPageContentProps) {
  const zoom = useUiStore((state) => state.zoom);
  const [showPrevious, setShowPrevious] = useState(false);
  const images = showPrevious && product.previous ? product.previous.images : currentImages(product);

  return (
    <div className={`relative grid min-w-0 overflow-x-clip pt-12 md:items-start ${zoom ? "md:grid-cols-1" : "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"}`}>
      <ProductGallery key={showPrevious ? "previous" : "current"} images={images} />
      <ProductInfo
        product={product}
        purchasable={purchasable}
        showPrevious={showPrevious}
        onShowPreviousChange={setShowPrevious}
      />
    </div>
  );
}
