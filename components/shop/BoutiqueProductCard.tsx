"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconHeart, IconShoppingBagPlus, IconStar } from "@tabler/icons-react";
import type { ProductDto } from "@/store/api/productsApi";
import { cn } from "@/lib/utils/cn";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, toggleWishlist } from "@/store/slices/boutiqueUISlice";
import { Button } from "@/components/ui/Button";
import { useBannedCommerce } from "@/hooks/useBannedCommerce";
import { useToast } from "@/components/shared/toast/useToast";

export function BoutiqueProductCard({
  product,
  className,
}: {
  product: ProductDto;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const { commerceBlocked, message } = useBannedCommerce();
  const { toast } = useToast();

  const [hoverIdx, setHoverIdx] = useState(0);
  const liked = useAppSelector((state) =>
    state.boutiqueUi.wishlist.includes(product.id)
  );

  const imgs = product.images ?? [];
  const primary = imgs[0] ?? null;
  const secondary = imgs[1] ?? primary;

  const discountPct =
    product.discountPriceCents != null &&
    product.priceCents > product.discountPriceCents
      ? Math.round(
          ((product.priceCents - product.discountPriceCents) /
            product.priceCents) *
            100
        )
      : null;

  const sizes = product.sizes?.length ? product.sizes : [];
  const [size, setSize] = useState<string | undefined>(sizes[0]);

  const gallery = useMemo(() => [primary, secondary].filter(Boolean) as string[], [
    primary,
    secondary,
  ]);

  return (
    <motion.article
      layout
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-[color-mix(in_srgb,var(--background)_94%,white)] shadow-softSm transition hover:-translate-y-[2px] hover:shadow-soft dark:border-white/10 dark:bg-white/10",
        className
      )}
      transition={{ duration: 0.45, ease: [0.2, 0.85, 0.2, 1] }}
    >
      <div
        className="relative isolate aspect-[3/4] overflow-hidden rounded-t-3xl"
        onMouseEnter={() =>
          secondary && primary !== secondary ? setHoverIdx(1) : undefined
        }
        onMouseLeave={() => setHoverIdx(0)}
      >
        {discountPct ? (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-brand-pink/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-black backdrop-blur">
            −{discountPct}%
          </span>
        ) : null}

        <button
          type="button"
          aria-label={
            liked ? `Remove ${product.name} from wishlist` : `Wishlist ${product.name}`
          }
          onClick={() => dispatch(toggleWishlist(product.id))}
          className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-brand-black shadow-sm ring-1 ring-black/5 transition hover:bg-white dark:bg-black/70 dark:text-white dark:ring-white/10"
        >
          <IconHeart
            className={cn(
              "h-5 w-5",
              liked ? "fill-brand-pink stroke-brand-black dark:stroke-white" : ""
            )}
            stroke={1.65}
          />
        </button>

        {gallery[0] ? (
          <>
            <Image
              src={gallery[0]}
              alt={`${product.name}`}
              fill
              sizes="(max-width: 768px) 52vw, 22vw"
              loading="lazy"
              className={cn(
                "object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.04]",
                hoverIdx === 1 && gallery[1] ? "opacity-0" : "opacity-100"
              )}
            />
            {gallery[1] ? (
              <Image
                src={gallery[1]}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(max-width: 768px) 52vw, 22vw"
                loading="lazy"
                className={cn(
                  "object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.04]",
                  hoverIdx === 1 ? "opacity-100" : "opacity-0"
                )}
              />
            ) : null}
          </>
        ) : null}

        {!gallery.length ? (
          <div className="flex h-full flex-col justify-end bg-[radial-gradient(circle_at_20%_-10%,rgba(252,196,200,0.55),transparent_62%),linear-gradient(to_bottom,white,#fdeef3)] px-8 py-12">
            <span className="inline-flex rounded-full bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/60">
              Lookbook forthcoming
            </span>
            <span className="mt-6 font-serif text-2xl text-brand-black">{product.name}</span>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/82 via-transparent to-transparent dark:from-black/90" />

        <div className="absolute inset-x-0 bottom-5 flex justify-between px-5 text-[11px] uppercase tracking-[0.18em] text-white/76">
          <span>{product.category}</span>
          <span>Atelier stitch</span>
        </div>
      </div>

      <div className="relative z-30 flex flex-1 flex-col gap-5 px-6 pb-7 pt-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 font-serif text-xl tracking-tight text-brand-black underline-offset-[6px] transition hover:text-black/82 dark:text-white"
            >
              {product.name}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-black/52 dark:text-white/65">
              {product.fabricType ? (
                <span className="rounded-full border border-black/15 px-2 py-1 dark:border-white/15">
                  {product.fabricType}
                </span>
              ) : null}
              <span>
                {product.trackInventory && product.stockQuantity <= 4
                  ? "Limited heirloom qty"
                  : "Ready couture timelines"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-brand-pink/60 bg-brand-pink/35 px-2 py-1 text-xs font-semibold text-brand-black backdrop-blur">
            <IconStar className="h-[15px] w-[15px] fill-amber-500 text-brand-black/80" />
            {(product.ratingAverage ?? 0).toFixed(1)}
          </div>
        </div>

        {sizes.length ? (
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  size === s
                    ? "bg-brand-black text-white shadow-softSm dark:bg-white dark:text-brand-black"
                    : "border border-black/18 text-brand-black hover:border-brand-pink hover:bg-brand-pink/35 dark:border-white/22 dark:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-black/50 dark:text-white/60">
              Atelier tariff
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {product.discountPriceCents != null ? (
                <span className="text-xs text-black/50 line-through dark:text-white/50">
                  {formatBdtFromCents(product.priceCents, product.currency)}
                </span>
              ) : null}
              <span className="font-serif text-2xl tracking-tight text-brand-black dark:text-white">
                {formatBdtFromCents(
                  product.effectivePriceCents,
                  product.currency
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.18em]"
              type="button"
              asChild
            >
              <Link href={`/product/${product.slug}`}>Studio view</Link>
            </Button>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-7 py-[0.85rem] text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:brightness-105",
                commerceBlocked
                  ? "cursor-not-allowed bg-black/35 text-black/70 dark:bg-white/10 dark:text-white/55"
                  : "bg-brand-black text-white dark:bg-white dark:text-brand-black"
              )}
              disabled={commerceBlocked}
              onClick={() => {
                if (commerceBlocked) {
                  toast({ title: "Checkout paused", message, variant: "error" });
                  return;
                }
                dispatch(
                  addToCart({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: imgs[0] ?? null,
                    unitCents: product.effectivePriceCents,
                    quantity: 1,
                    size: sizes.length ? size : null,
                  })
                );
                toast({
                  title: "Nestled into your cart",
                  message: `${product.name} awaits finishing touches.`,
                  variant: "success",
                });
              }}
            >
              <IconShoppingBagPlus className="h-4 w-4" stroke={1.6} />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
