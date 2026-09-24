import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // Statischer Export nach out/; Cloudflare liefert die Dateien aus, /api/* übernimmt worker/.
  output: "export",
  // Ohne Next-Server keine Bildoptimierung; die Produktbilder liegen schon als WebP vor.
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
