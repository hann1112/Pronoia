import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageContent } from "@/components/ProductPageContent";
import { currentImages, getProduct, isProductComplete, pageProducts } from "@/lib/products";
import { isPurchasable } from "@/lib/shop";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return pageProducts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || product.bundleOf) notFound();

  const suffix = product.work ? ` · ${product.work}` : product.status === "legacy" ? " — legacy prototype" : "";
  return {
    title: `${product.number} ${product.name}${suffix} — pronoia`,
    description: product.description,
    robots: isProductComplete(product) ? undefined : { index: false, follow: true },
    openGraph: {
      images: [currentImages(product)[0].src],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || product.bundleOf) notFound();

  const purchasable = isPurchasable(product);
  // Product mit Angebot erst, wenn man wirklich kaufen kann; vorher CreativeWork.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": purchasable ? "Product" : "CreativeWork",
    name: `pronoia ${product.number} ${product.name}${product.work ? ` · ${product.work}` : ""}`,
    description: product.description,
    image: currentImages(product).map((image) => new URL(image.src, SITE_URL).toString()),
    url: new URL(`/${product.slug}`, SITE_URL).toString(),
    ...(purchasable && product.priceCents
      ? {
          brand: { "@type": "Brand", name: "pronoia" },
          offers: {
            "@type": "Offer",
            price: (product.priceCents / 100).toFixed(2),
            priceCurrency: "EUR",
            availability: "https://schema.org/LimitedAvailability",
          },
        }
      : { creator: { "@type": "Organization", name: "pronoia" } }),
  };

  return (
    <main className="min-h-svh bg-bg text-ink">
      <ProductPageContent product={product} purchasable={purchasable} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
