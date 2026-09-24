"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { AddToCartButton } from "@/components/AddToCartButton";
import { EmailForm } from "@/components/EmailForm";
import { VAT_NOTE } from "@/lib/legal";
import {
  formatPrice,
  getProduct,
  isPlaceholder,
  PROTOTYPE_BENEFIT,
  type Product,
  type ProductSlug,
} from "@/lib/products";
import { DELIVERY_NOTE, SHOP_ENABLED } from "@/lib/shop";
import { useUiStore } from "@/lib/ui-store";

type ProductInfoProps = {
  product: Product;
  purchasable: boolean;
  showPrevious: boolean;
  onShowPreviousChange: (showPrevious: boolean) => void;
};

const MICRO = "font-ui text-[10px] uppercase tracking-[0.2em]";
const FOCUS = "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink";

// Versionswahl als Kacheln, wie eine Farbauswahl.
function VersionTiles({
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
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span>Version</span>
        <span className="text-muted">{showPrevious ? previous : current}</span>
      </div>
      <div role="group" aria-label="Version" className="mt-3 flex gap-2">
        {options.map((option) => {
          const active = option.value === showPrevious;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              aria-label={option.label}
              onClick={() => onChange(option.value)}
              className={`flex h-14 w-14 items-center justify-center border font-display text-[22px] leading-none transition-colors duration-300 ${FOCUS} ${active ? "border-ink" : "border-line text-muted hover:border-faint hover:text-ink"}`}
            >
              {option.label.replace(/^Prototyp\s+/i, "").toLowerCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// „Mehr anzeigen“: ganzer Text als Seitenpanel von rechts.
function DetailsSheet({ product, onClose, open }: { product: Product; onClose: () => void; open: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Der Zustand `open` ist die einzige Quelle: × , Esc und Klick daneben setzen ihn zurück.
  // (Auf das native close-Event verlassen wir uns nicht; es kommt nicht in jedem Browser an.)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="product-sheet fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[460px] overflow-y-auto bg-bg p-0 text-ink backdrop:bg-white/50 backdrop:backdrop-blur-[3px]"
    >
      <div className="flex min-h-full flex-col px-6 pb-12 pt-6 md:px-10">
        <div className="flex items-center justify-between">
          <p className={`${MICRO} text-muted`}>{product.number}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className={`-mr-2 h-10 w-10 text-center font-ui text-2xl font-light leading-none ${FOCUS}`}
          >
            ×
          </button>
        </div>

        <h2 id={titleId} className="mt-8 font-display text-[40px] leading-[1.05]">
          {product.name}
        </h2>
        {product.work && (
          <p className="mt-2 text-[12px] text-muted">
            {product.work} — {product.genre}
          </p>
        )}

        <div className="mt-10 space-y-5 font-display-regular text-[19px] leading-[1.55]">
          {(product.intro ?? [product.description]).map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        {product.features && (
          <ul className="mt-8 space-y-3 border-t border-line pt-8 text-[13px] leading-[1.65]">
            {product.features.map((feature) => (
              <li key={feature.slice(0, 32)} className="grid grid-cols-[18px_1fr]">
                <span aria-hidden="true" className="text-muted">–</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-8 space-y-1 border-t border-line pt-8 text-[13px] leading-[1.65]">
          {product.details.filter((detail) => !isPlaceholder(detail.value)).map((detail) => (
            <li key={detail.label}>{detail.value}</li>
          ))}
        </ul>

        {product.note && (
          <p className="mt-10 text-[12px] leading-[1.7] text-muted">
            {product.note} {PROTOTYPE_BENEFIT}
          </p>
        )}
      </div>
    </dialog>
  );
}

export function ProductInfo({ product, purchasable, showPrevious, onShowPreviousChange }: ProductInfoProps) {
  const zoom = useUiStore((state) => state.zoom);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const otherSlug: ProductSlug = product.slug === "body" ? "mind" : "body";
  const legacy = product.status === "legacy";
  const soldout = product.status === "soldout";
  const previous = showPrevious ? product.previous : undefined;
  const details = product.details.filter((detail) => !isPlaceholder(detail.value));
  const story = isPlaceholder(product.story) ? null : product.story;
  const setProduct = getProduct("set");
  const otherNumber = getProduct(otherSlug)?.number;
  const cartLabel = soldout ? "Ausverkauft" : purchasable ? "In den Warenkorb" : "Bald verfügbar";
  const forSale = !legacy && !previous;
  const lead = product.intro?.[0] ?? product.description;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <aside
      className={`min-w-0 px-4 ${SHOP_ENABLED && forSale ? "pb-28" : "pb-12"} pt-6 transition-[transform,opacity] duration-500 md:top-12 md:self-start md:px-10 md:py-16 ${zoom ? "md:pointer-events-none md:absolute md:right-0 md:w-[40%] md:translate-x-full md:opacity-0" : "md:sticky"}`}
      aria-hidden={zoom && isDesktop ? true : undefined}
      inert={zoom && isDesktop}
    >
      <div className="mx-auto max-w-[380px]">
        {/* Kopf: Nummer, Hinweis, Name, Werk, Preis */}
        <p className={`${MICRO} text-muted`}>
          {previous ? previous.label : product.versionLabel ?? product.edition}
        </p>
        <p className="mt-5 text-[12px] text-muted">
          {previous ? "Einzelstück · nicht verkäuflich" : legacy ? `Legacy · ${product.edition ?? "1/1"}` : "Neu · limitiert auf 50 Exemplare"}
        </p>
        <h1 className="mt-2">
          <span className="sr-only">{product.number} </span>
          <span className="block font-display text-[clamp(40px,4vw,56px)] leading-[1.02]">{product.name}</span>
        </h1>
        {product.work && !previous && (
          <p className="mt-2 text-[13px]">
            {product.number} · {product.work} — {product.genre}
          </p>
        )}
        {forSale && product.priceCents && (
          <p className="mt-3 text-[13px]">
            {formatPrice(product.priceCents)}
            <span className="text-muted"> · inkl. Versand</span>
          </p>
        )}

        {product.previous && product.versionLabel && (
          <div className="mt-9">
            <VersionTiles
              current={product.versionLabel}
              previous={product.previous.label}
              showPrevious={showPrevious}
              onChange={onShowPreviousChange}
            />
          </div>
        )}

        {/* Aktion */}
        {forSale && (
          <div className="mt-9">
            {SHOP_ENABLED ? (
              <>
                <div className="hidden md:block">
                  <AddToCartButton slug={product.slug} disabled={!purchasable || soldout} label={cartLabel} />
                </div>
                {setProduct?.priceCents && otherNumber && (
                  <div className="mt-4 text-center">
                    <AddToCartButton
                      slug="set"
                      variant="link"
                      label={`Als Set mit ${otherNumber} · ${formatPrice(setProduct.priceCents)}`}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmailForm label={soldout ? "Benachrichtigen" : "Zum Verkaufsstart benachrichtigen"} />
            )}
            <p className="mt-6 text-[12px] leading-[1.7] text-muted">
              {DELIVERY_NOTE} {VAT_NOTE}.
            </p>
          </div>
        )}
        {legacy && !previous && (
          <div className="mt-9">
            <EmailForm label="Nächstes Release" />
          </div>
        )}

        {/* Beschreibung: kurz, der Rest im Seitenpanel */}
        <div className="mt-9 text-[13px] leading-[1.75]">
          {previous ? (
            <p>{previous.description}</p>
          ) : (
            <>
              <p className="line-clamp-4">{lead}</p>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className={`mt-3 text-[12px] underline underline-offset-4 hover:text-muted ${FOCUS}`}
              >
                Mehr anzeigen
              </button>
            </>
          )}
        </div>

        {/* Aufklappbare Zeilen */}
        {!previous && (
          <div className="mt-10 border-t border-line">
            {details.length > 0 && (
              <Accordion title="Produktdetails">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  {details.map((detail) => (
                    <div key={detail.label} className="col-span-2 grid grid-cols-subgrid">
                      <dt className="text-muted">{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            )}
            {forSale && (
              <Accordion title="Lieferung & Rückgabe">
                <p>{DELIVERY_NOTE}</p>
                <p className="mt-3">
                  14 Tage Widerrufsrecht.{" "}
                  <Link href="/widerruf" className="underline underline-offset-2">Widerrufsbelehrung</Link>
                  {" · "}
                  <Link href="/versand" className="underline underline-offset-2">Versand</Link>
                </p>
              </Accordion>
            )}
            {forSale && product.note && (
              <Accordion title="Prototyp-Programm">
                <p>{product.note}</p>
                <p className="mt-3">{PROTOTYPE_BENEFIT}</p>
              </Accordion>
            )}
            {legacy && story && (
              <Accordion title="Über den Prototyp">
                <p>{story}</p>
              </Accordion>
            )}
          </div>
        )}

        <Link href={`/${otherSlug}`} className={`mt-12 inline-block ${MICRO} text-muted hover:text-ink ${FOCUS}`}>
          auch: {otherSlug} →
        </Link>
      </div>

      <DetailsSheet product={product} open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {SHOP_ENABLED && forSale && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 p-4 md:hidden">
          <AddToCartButton slug={product.slug} disabled={!purchasable || soldout} label={cartLabel} />
        </div>
      )}
    </aside>
  );
}
