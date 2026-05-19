"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconHeart, IconShoppingBagPlus, IconStar } from "@tabler/icons-react";
import type { ProductDto } from "@/store/api/productsApi";
import { cn } from "@/lib/utils/cn";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, toggleWishlist } from "@/store/slices/boutiqueUISlice";
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

  const gallery = useMemo(
    () => [primary, secondary].filter(Boolean) as string[],
    [primary, secondary]
  );

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#fcc4c8]/35 bg-white/95 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(252,196,200,0.35)] hover:border-[#fcc4c8]",
        className
      )}
    >
      {/* Image area */}
      <div
        className="relative aspect-[3/3.8] overflow-hidden"
        onMouseEnter={() =>
          secondary && primary !== secondary ? setHoverIdx(1) : undefined
        }
        onMouseLeave={() => setHoverIdx(0)}
      >


        {/* Discount badge */}
        {discountPct ? (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-red-500/90 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm border border-red-400/20">
            Save {discountPct}%
          </span>
        ) : null}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={
            liked
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={() => dispatch(toggleWishlist(product.id))}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white border border-[#fcc4c8]/30"
        >
          <IconHeart
            className={cn(
              "h-4 w-4 transition-all duration-300",
              liked
                ? "fill-[#fcc4c8] stroke-[#fcc4c8] scale-110"
                : "text-black/40 hover:text-black/60"
            )}
            stroke={1.8}
          />
        </button>

        {/* Product images with hover transition */}
        {gallery[0] ? (
          <>
            <Image
              src={gallery[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              className={cn(
                "object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]",
                hoverIdx === 1 && gallery[1] ? "opacity-0" : "opacity-100"
              )}
            />
            {gallery[1] ? (
              <Image
                src={gallery[1]}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className={cn(
                  "object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]",
                  hoverIdx === 1 ? "opacity-100" : "opacity-0"
                )}
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#fcc4c8]/15 to-brand-cream">
            <span className="text-sm text-black/25">No image</span>
          </div>
        )}

        {/* Category label */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3.5 pb-2.5 pt-8 z-20">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product info - animated primary tinted glassmorphic panel on hover */}
      <div className="relative z-20 flex flex-1 flex-col gap-3 p-4 bg-white border-t border-[#fcc4c8]/15 transition-all duration-500 ease-out group-hover:bg-[#fff9fa]/90 group-hover:backdrop-blur-md group-hover:border-t-[#fcc4c8]/65 shadow-[0_-8px_20px_-8px_rgba(252,196,200,0)] group-hover:shadow-[0_-8px_20px_-8px_rgba(252,196,200,0.25)]">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-brand-black transition hover:text-[#fcc4c8]"
          >
            {product.name}
          </Link>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 border border-amber-200/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 shadow-sm">
            <IconStar className="h-3 w-3 fill-amber-400 text-amber-500" />
            {(product.ratingAverage ?? 0).toFixed(1)}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {product.fabricType && (
            <span className="rounded-full border border-[#fcc4c8]/40 bg-[#fcc4c8]/8 px-2 py-0.5 font-medium text-black/60">
              {product.fabricType}
            </span>
          )}
          {product.trackInventory && product.stockQuantity <= 4 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold uppercase tracking-wider text-amber-600 border border-amber-200/50">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Limited Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wider text-emerald-600 border border-emerald-200/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
        </div>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase transition-all duration-200",
                  size === s
                    ? "bg-[#1a1a1a] text-white shadow-sm"
                    : "border border-[#fcc4c8]/30 text-black/55 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Price + actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            {product.discountPriceCents != null && (
              <span className="text-[10px] font-semibold text-black/35 line-through tracking-tight">
                {formatBdtFromCents(product.priceCents, product.currency)}
              </span>
            )}
            <span className="text-lg font-extrabold tracking-tight text-brand-black leading-none mt-0.5">
              {formatBdtFromCents(
                product.effectivePriceCents,
                product.currency
              )}
            </span>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm shrink-0",
              commerceBlocked
                ? "cursor-not-allowed bg-black/8 text-black/35"
                : "bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/85 hover:scale-105 active:scale-95"
            )}
            disabled={commerceBlocked}
            onClick={() => {
              if (commerceBlocked) {
                toast({
                  title: "Checkout paused",
                  message,
                  variant: "error",
                });
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
                title: "Added to cart",
                message: `${product.name} has been added.`,
                variant: "success",
              });
            }}
          >
            <IconShoppingBagPlus className="h-3.5 w-3.5" stroke={1.8} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
