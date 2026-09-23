"use client";

import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Glass } from "@/components/Glass";
import type { ProductSlug } from "@/lib/products";
import { useUiStore } from "@/lib/ui-store";

const panels = [
  {
    slug: "body",
    number: "Nº 01",
    name: "KÖRPER",
    image: "/products/body-1.png",
    alt: "Nº 01 Körper, schwarzer Einband",
    ariaLabel: "body – Nº 01 Körper, Askesis, Prototyp V2, ansehen",
  },
  {
    slug: "mind",
    number: "Nº 02",
    name: "GEIST",
    image: "/products/mind-1.png",
    alt: "Nº 02 Geist, cremefarbener Einband",
    ariaLabel: "mind – Nº 02 Geist, Hypomnemata, Prototyp V2, ansehen",
  },
] as const;

export function SplitHero() {
  const router = useRouter();
  const zoom = useUiStore((state) => state.zoom);
  const reducedMotion = useReducedMotion() === true;
  const [hovered, setHovered] = useState<ProductSlug | null>(null);
  const [breathing, setBreathing] = useState<ProductSlug | null>(null);
  const [selected, setSelected] = useState<ProductSlug | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    router.prefetch("/body");
    router.prefetch("/mind");
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(media.matches);
      setHovered(null);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || reducedMotion || zoom || selected) return;
    let next: ProductSlug = "body";
    let clear: number | undefined;
    const cycle = window.setInterval(() => {
      setBreathing(next);
      next = next === "body" ? "mind" : "body";
      if (clear) window.clearTimeout(clear);
      clear = window.setTimeout(() => setBreathing(null), 1500);
    }, 4000);
    return () => {
      window.clearInterval(cycle);
      if (clear) window.clearTimeout(clear);
      setBreathing(null);
    };
  }, [isMobile, reducedMotion, zoom, selected]);

  useEffect(() => {
    if (!selected) return;
    const timeout = window.setTimeout(
      () => router.push(`/${selected}`),
      reducedMotion ? 0 : 300,
    );
    return () => window.clearTimeout(timeout);
  }, [reducedMotion, router, selected]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, slug: ProductSlug) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    event.preventDefault();
    if (selected) return;
    if (isMobile) {
      router.push(`/${slug}`);
      return;
    }
    setSelected(slug);
  }

  function handlePointerEnter(event: PointerEvent<HTMLAnchorElement>, slug: ProductSlug) {
    if (
      !isMobile &&
      !selected &&
      event.pointerType !== "touch" &&
      window.matchMedia("(hover: hover)").matches
    ) setHovered(slug);
  }

  return (
    <main className="relative h-svh overflow-hidden bg-bg pt-12 transition-[padding] duration-500" style={{ paddingBottom: "calc(4rem + var(--email-bar-space, 0px))" }}>
      <h1 className="sr-only">pronoia — Die Welt arbeitet für dich. Bücher für Körper und Geist.</h1>
      <div className="grid h-full grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        {panels.map((panel) => {
          const active = zoom || hovered === panel.slug || breathing === panel.slug;
          const opposite = !zoom && hovered !== null && hovered !== panel.slug;
          const blur = active ? 0 : opposite ? 28 : 18;
          const duration = reducedMotion ? 0 : 0.6;

          return (
            <a
              key={panel.slug}
              href={`/${panel.slug}`}
              aria-label={panel.ariaLabel}
              onClick={(event) => handleClick(event, panel.slug)}
              onPointerEnter={(event) => handlePointerEnter(event, panel.slug)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => !selected && setHovered(panel.slug)}
              onBlur={() => setHovered(null)}
              className="hero-panel relative block min-h-0 min-w-0 overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ scale: zoom ? 1.25 : selected === panel.slug ? 1.04 : 1 }}
                transition={{ duration: reducedMotion ? 0 : selected ? 0.3 : 0.6, ease: [0.7, 0, 0.2, 1] }}
                className="product-shadow pointer-events-none absolute left-1/2 top-1/2 h-[29svh] w-[60%] -translate-x-1/2 -translate-y-1/2 md:h-[45svh] md:w-[66%]"
              >
                <Image src={panel.image} alt={panel.alt} fill priority sizes="(max-width: 767px) 60vw, 33vw" className="object-contain" />
              </motion.div>

              <Glass
                strength="normal"
                initial={false}
                animate={{
                  backdropFilter: `blur(${blur}px) saturate(120%)`,
                  backgroundColor: active ? "rgba(240,246,250,0)" : opposite ? "rgba(240,246,250,0.60)" : "rgba(240,246,250,0.38)",
                  borderColor: active ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.90)",
                  boxShadow: active ? "0 0 0 rgba(180,200,215,0)" : "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 0 rgba(180,200,215,0.35)",
                }}
                transition={{ duration, ease: [0.7, 0, 0.2, 1] }}
                className="pointer-events-none absolute inset-4 flex flex-col items-center justify-center md:inset-6"
              >
                <motion.span
                  initial={false}
                  animate={{ opacity: active ? 0 : 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className="font-display text-[clamp(64px,12.5vw,210px)] leading-[0.9] text-ink"
                >
                  {panel.slug}
                </motion.span>
                <span className="absolute bottom-[10%] px-3 text-center font-ui text-[10px] uppercase tracking-[0.2em] text-muted md:bottom-[13%] md:text-[11px]">
                  <span className="font-display-regular text-[16px] md:text-[18px]">{panel.number}</span> · {panel.name}{active ? " — PROTOTYP V2 →" : ""}
                </span>
              </Glass>
            </a>
          );
        })}
      </div>

      {selected && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className="pointer-events-none fixed inset-0 z-40 bg-bg"
        />
      )}
    </main>
  );
}
