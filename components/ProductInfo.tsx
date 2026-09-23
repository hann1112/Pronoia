"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { AddToCartButton } from "@/components/AddToCartButton";
import { EmailForm } from "@/components/EmailForm";
import { Glass } from "@/components/Glass";
import {
  formatPrice,
  getProduct,
  isPlaceholder,
  PRICE_PLACEHOLDER,
  PROTOTYPE_BENEFIT,
  type Product,
  type ProductSlug,
} from "@/lib/products";
import { VAT_NOTE } from "@/lib/legal";
import { SHOP_ENABLED } from "@/lib/shop";
import { useUiStore } from "@/lib/ui-store";

type ProductInfoProps = {
  product: Product;
  purchasable: boolean;
  showPrevious: boolean;
  onShowPreviousChange: (showPrevious: boolean) => void;
};

function VersionSwitch({
  current,
  previous,
  showPrevious,
  onChange,
}: {
  current: string;
  previous: string;
  showPrevious: boolean;
  onChange: (showPrevious: boolean) => void;
}) {
  const options = [
    { label: current, value: false },
    { label: previous, value: true },
  ];

  return (
    <div role="group" aria-label="Version" className="relative inline-grid grid-cols-2 rounded-full border border-line p-1">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] motion-reduce:transition-none"
        style={{ transform: showPrevious ? "translateX(100%)" : "translateX(0)" }}
      />
      {options.map((option) => {
        const active = option.value === showPrevious;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 font-ui text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink ${active ? "text-bg" : "text-muted hover:text-ink"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProductInfo({ product, purchasable, showPrevious, onShowPreviousChange }: ProductInfoProps) {
  const zoom = useUiStore((state) => state.zoom);
  const [isDesktop, setIsDesktop] = useState(false);
  const otherSlug: ProductSlug = product.slug === "body" ? "mind" : "body";
  const legacy = product.status === "legacy";
  const soldout = product.status === "soldout";
  const previous = showPrevious ? product.previous : undefined;
  const details = product.details.filter((detail) => !isPlaceholder(detail.value));
  const story = isPlaceholder(product.story) ? null : product.story;
  const price = product.priceCents ? formatPrice(product.priceCents) : PRICE_PLACEHOLDER;
  const setProduct = getProduct("set");
  const set = setProduct?.priceCents && product.slug !== "set" ? formatPrice(setProduct.priceCents) : null;
  const cartLabel = soldout ? "Ausverkauft" : purchasable ? "In den Warenkorb" : "Bald verfügbar";

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <aside
      className={`min-w-0 px-4 ${legacy || !SHOP_ENABLED ? "pb-10" : "pb-24"} pt-4 transition-[transform,opacity] duration-500 md:top-12 md:self-start md:px-6 md:py-6 ${zoom ? "md:pointer-events-none md:absolute md:right-0 md:w-[40%] md:translate-x-full md:opacity-0" : "md:sticky"}`}
      aria-hidden={zoom && isDesktop ? true : undefined}
      inert={zoom && isDesktop}
    >
      <Glass strength="normal" className="product-info-glass p-5 md:p-7">
        {product.previous && product.versionLabel && (
          <div className="mb-6">
            <VersionSwitch
              current={product.versionLabel}
              previous={product.previous.label}
              showPrevious={showPrevious}
              onChange={onShowPreviousChange}
            />
          </div>
        )}

        <span className="inline-block rounded-[4px] border border-ink px-2 py-1 font-ui text-[10px] uppercase tracking-[0.2em]">
          {previous ? previous.edition : legacy ? `Legacy · ${product.edition ?? "Prototype · 1/1"}` : product.edition}
        </span>

        <h1 className="mt-8">
          <span className="block font-display-regular text-[18px] leading-none">{product.number}</span>
          <span className="mt-3 block font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">
            {product.name}
          </span>
        </h1>
        {product.work && !previous && (
          <p className="mt-4 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {product.work} · {product.genre}
          </p>
        )}

        {previous ? (
          <p className="mt-10 text-[13px] leading-[1.7]">{previous.description}</p>
        ) : legacy ? (
          <>
            <p className="mt-10 text-[13px] leading-[1.7]">{product.description}</p>
            <div className="mt-10">
              <EmailForm label="Nächstes Release" />
            </div>
          </>
        ) : (
          <>
            {SHOP_ENABLED && (
              <div className="mt-10 font-ui text-[11px] uppercase tracking-[0.2em]">
                <p>{price}</p>
                <p className="mt-2 normal-case tracking-normal text-muted">
                  {VAT_NOTE}, zzgl. <Link href="/versand" className="underline underline-offset-2">Versand</Link>
                </p>
                <div className="mt-7 hidden md:block">
                  <AddToCartButton slug={product.slug} disabled={!purchasable || soldout} label={cartLabel} />
                </div>
                {set && (
                  <div className="mt-3">
                    <AddToCartButton slug="set" variant="outline" label={`Als Set mit Nº ${product.slug === "body" ? "02" : "01"} · ${set}`} />
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 space-y-4 text-[13px] leading-[1.7]">
              {(product.intro ?? [product.description]).map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            {product.features && (
              <ul className="mt-5 space-y-2 text-[13px] leading-[1.7]">
                {product.features.map((feature) => (
                  <li key={feature.slice(0, 32)} className="grid grid-cols-[14px_1fr]">
                    <span aria-hidden="true" className="text-muted">–</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {(soldout || !SHOP_ENABLED) && (
              <div className="mt-10">
                <EmailForm label={soldout ? "Benachrichtigen" : "Zum Verkaufsstart benachrichtigen"} />
              </div>
            )}

            {product.note && (
              <p className="mt-8 border-l border-line pl-4 text-[11px] leading-[1.7] text-muted">
                {product.note} {PROTOTYPE_BENEFIT}
              </p>
            )}
          </>
        )}

        <div className="mt-10 border-t border-line">
          {!previous && details.length > 0 && (
            <Accordion title="Details">
              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3">
                {details.map((detail) => (
                  <div key={detail.label} className="col-span-2 grid grid-cols-subgrid">
                    <dt className="text-muted">{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>
          )}
          {legacy && story && (
            <Accordion title="Über den Prototyp">
              <p>{story}</p>
            </Accordion>
          )}
          {!legacy && SHOP_ENABLED && (
            <Accordion title="Versand & Rückgabe">
              <p>Lieferzeit und Versandkosten: [Angaben ergänzen]</p>
              <p className="mt-3">14 Tage Widerruf. <Link href="/widerruf" className="underline underline-offset-2">Mehr zum Widerruf</Link></p>
            </Accordion>
          )}
        </div>

        <Link href={`/${otherSlug}`} className="mt-10 inline-block font-ui text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink">
          auch: {otherSlug} →
        </Link>
      </Glass>
      {!legacy && SHOP_ENABLED && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 p-4 md:hidden">
          <AddToCartButton slug={product.slug} disabled={!purchasable || soldout} label={cartLabel} />
        </div>
      )}
    </aside>
  );
}
