"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { useUiStore } from "@/lib/ui-store";

type ProductImage = Product["images"][number];

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const zoom = useUiStore((state) => state.zoom);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const mobile = window.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | undefined;

    function observeImages() {
      observer?.disconnect();
      const slides = Array.from(track!.querySelectorAll<HTMLElement>("[data-product-slide]"));
      const ratios = new Map<Element, number>();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            ratios.set(entry.target, entry.intersectionRatio);
          }

          const mostVisible = slides.reduce(
            (best, slide, index) =>
              (ratios.get(slide) ?? 0) > best.ratio
                ? { index, ratio: ratios.get(slide) ?? 0 }
                : best,
            { index: 0, ratio: 0 },
          );

          if (mostVisible.ratio > 0) setActiveImage(mostVisible.index);
        },
        {
          root: mobile.matches ? track : null,
          threshold: [0, 0.25, 0.5, 0.75, 1],
        },
      );

      slides.forEach((slide) => observer?.observe(slide));
    }

    observeImages();
    mobile.addEventListener("change", observeImages);
    return () => {
      observer?.disconnect();
      mobile.removeEventListener("change", observeImages);
    };
  }, [images, zoom]);

  function moveZoomOrigin(event: PointerEvent<HTMLElement>) {
    if (!zoom || event.pointerType === "touch") return;
    const image = event.currentTarget.querySelector<HTMLElement>("[data-zoom-image]");
    if (!image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
  }

  return (
    <section aria-label="Produktbilder" className="min-w-0">
      <div
        ref={trackRef}
        style={{ touchAction: zoom ? "pan-x pinch-zoom" : undefined }}
        className="product-gallery-track flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:block md:overflow-visible"
      >
        {images.map((image, index) => (
          <figure
            key={image.src}
            data-product-slide
            onPointerMove={moveZoomOrigin}
            className={`relative h-[70svh] w-full shrink-0 snap-center overflow-hidden md:h-[85svh] ${zoom ? "px-0 py-0" : "px-4 pb-6 pt-12 md:px-10 md:py-8"}`}
          >
            <div
              data-zoom-image
              style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: "50% 50%" }}
              className="product-shadow product-zoom-image relative h-full w-full transition-transform duration-500 motion-reduce:transition-none"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 767px) 100vw, 60vw"
                className="object-contain"
              />
            </div>
          </figure>
        ))}
      </div>

      <p className="px-4 pb-4 font-ui text-[11px] tracking-[0.2em] text-muted md:fixed md:bottom-6 md:left-6 md:z-30 md:p-0">
        <span className="sr-only">Bild</span> {activeImage + 1} / {images.length}
      </p>
    </section>
  );
}
