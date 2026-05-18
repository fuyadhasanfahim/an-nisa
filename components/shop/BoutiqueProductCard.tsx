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
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-pink/15 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-pink/10",
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
          <span className="absolute left-3 top-3 z-20 rounded-lg bg-brand-pink/90 px-2.5 py-1 text-[11px] font-semibold text-brand-black backdrop-blur-sm">
            −{discountPct}%
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
          className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <IconHeart
            className={cn(
              "h-4 w-4",
              liked
                ? "fill-brand-pink stroke-brand-pink"
                : "text-black/40"
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
                "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]",
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
                  "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]",
                  hoverIdx === 1 ? "opacity-100" : "opacity-0"
                )}
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-pink/15 to-brand-cream">
            <span className="text-sm text-black/25">No image</span>
          </div>
        )}

        {/* Category label */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-8">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-medium leading-snug text-brand-black transition hover:text-black/65"
          >
            {product.name}
          </Link>
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-brand-pink/25 px-1.5 py-0.5 text-[11px] font-semibold text-brand-black">
            <IconStar className="h-3 w-3 fill-amber-400 text-amber-500" />
            {(product.ratingAverage ?? 0).toFixed(1)}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-black/40">
          {product.fabricType && (
            <span className="rounded-md border border-brand-pink/15 bg-brand-pink/8 px-1.5 py-0.5">
              {product.fabricType}
            </span>
          )}
          <span>
            {product.trackInventory && product.stockQuantity <= 4
              ? "Limited stock"
              : "In stock"}
          </span>
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
                  "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase transition-colors",
                  size === s
                    ? "bg-[#1a1a1a] text-white"
                    : "border border-brand-pink/15 text-black/50 hover:border-brand-pink/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Price + actions */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            {product.discountPriceCents != null && (
              <span className="block text-[11px] text-black/35 line-through">
                {formatBdtFromCents(product.priceCents, product.currency)}
              </span>
            )}
            <span className="text-lg font-semibold tracking-tight text-brand-black">
              {formatBdtFromCents(
                product.effectivePriceCents,
                product.currency
              )}
            </span>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition",
              commerceBlocked
                ? "cursor-not-allowed bg-black/8 text-black/35"
                : "bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/85"
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
