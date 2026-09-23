import type { MetadataRoute } from "next";
import { isProductComplete, pageProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import { writings } from "@/lib/writing";

const LEGAL_PATHS = ["/kontakt", "/impressum", "/datenschutz", "/agb", "/widerruf", "/versand"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...pageProducts.filter(isProductComplete).map((product) => ({
      url: `${SITE_URL}/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/gedanken`, changeFrequency: "weekly", priority: 0.7 },
    ...writings.map((writing) => ({
      url: `${SITE_URL}/gedanken/${writing.slug}`,
      lastModified: writing.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...LEGAL_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
