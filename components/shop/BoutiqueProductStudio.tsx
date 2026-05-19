"use client";

import Image from "next/image";
import { IconHeart, IconShoppingBagPlus, IconStar } from "@tabler/icons-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, toggleWishlist } from "@/store/slices/boutiqueUISlice";
import { useBannedCommerce } from "@/hooks/useBannedCommerce";
import { useToast } from "@/components/shared/toast/useToast";
import type { BoutiqueProductStudioModel } from "./product-studio-model";

export function BoutiqueProductStudio({ product }: { product: BoutiqueProductStudioModel }) {
  const dispatch = useAppDispatch();
  const { commerceBlocked, message } = useBannedCommerce();
  const { toast } = useToast();

  const [active, setActive] = useState(0);

  const images = product.images?.length ? product.images : [];

  const liked = useAppSelector((state) => state.boutiqueUi.wishlist.includes(product.id));
  const sizes = product.sizes?.length ? product.sizes : [];
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const colors = product.colors?.length ? product.colors : [];
  const [color, setColor] = useState<string | undefined>(colors[0]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.06fr_minmax(0,0.9fr)]">
      {/* Studio Image Showcase */}
      <motion.div layout className="relative aspect-[3/4] overflow-hidden rounded-[32px] border border-brand-pink/20 bg-white/70 shadow-sm backdrop-blur-sm">
        {images.length ? (
          <>
            <Image
              src={images[Math.min(active, images.length - 1)] ?? images[0]}
              alt={`${product.name} studio frame`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/60 via-transparent p-6">
              {images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    active === idx ? "border-[#fcc4c8] scale-105" : "border-white/40 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                  onClick={() => setActive(idx)}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center px-14 text-center text-lg text-brand-black">
            Photographer en route • heirloom capture pending.
          </div>
        )}
      </motion.div>

      {/* Product Information */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/45 font-serif">{product.category}</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-black md:text-[2.6rem] leading-tight">{product.name}</h1>
          
          {/* Star Rating details */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/40 px-2.5 py-0.5 text-xs font-bold text-amber-700 shadow-sm select-none">
              <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {(product.ratingAverage ?? 0).toFixed(1)}
            </div>
            <span className="text-xs font-semibold text-black/45">
              ({product.ratingCount ?? 0} keepsakes reviewed)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-black/55">
          {product.fabricType ? (
            <p>
              Fabric: <span className="text-brand-black font-semibold">{product.fabricType}</span>
            </p>
          ) : null}
          {product.embroideryType ? (
            <p>
              Embroidery: <span className="text-brand-black font-semibold">{product.embroideryType}</span>
            </p>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-black/65 font-medium">{product.description}</p>

        {/* Premium Tariff Glass Card */}
        <div className="rounded-2xl border border-[#fcc4c8]/35 bg-white p-5 shadow-[0_12px_40px_rgba(252,196,200,0.12)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/45">Atelier tariff</div>
          <div className="mt-3 flex items-baseline gap-4">
            {product.discountPriceCents != null ? (
              <span className="text-sm font-serif font-medium text-black/40 line-through tabular-nums">
                {formatBdtFromCents(product.priceCents, product.currency)}
              </span>
            ) : null}
            <span className="text-3xl font-serif font-bold tracking-tight text-brand-black tabular-nums">
              {formatBdtFromCents(product.effectivePriceCents, product.currency)}
            </span>
          </div>
        </div>

        {/* Sizes Selector */}
        {sizes.length ? (
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/45">Select Size</span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    size === s
                      ? "bg-[#fcc4c8] text-brand-black shadow-sm font-bold"
                      : "border border-brand-pink/35 text-black/55 hover:border-brand-pink/60 hover:bg-brand-pink/10"
                  }`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Colors Selector */}
        {colors.length ? (
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/45">Select Color</span>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer",
                    color === c
                      ? "bg-[#fcc4c8] text-brand-black shadow-sm font-bold"
                      : "border border-[#fcc4c8]/30 text-black/55 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10"
                  )}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="rounded-full border border-[#fcc4c8]/60 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-black hover:bg-[#fcc4c8]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer"
            onClick={() => {
              dispatch(toggleWishlist(product.id));
              toast({
                title: liked ? "Removed from wishlist" : "Added to wishlist",
                message: liked ? `${product.name} removed.` : `${product.name} added.`,
                variant: liked ? "error" : "success",
              });
            }}
          >
            <IconHeart className={`h-4 w-4 mr-1.5 transition-all ${liked ? "fill-[#fcc4c8] text-[#fcc4c8]" : "text-black/50"}`} />
            Moodboard toggle
          </button>

          <button
            type="button"
            className={cn(
              "flex-1 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 border-none cursor-pointer",
              commerceBlocked
                ? "bg-black/5 text-black/35 cursor-not-allowed shadow-none"
                : "bg-[#fcc4c8] text-brand-black hover:bg-[#fcc4c8]/85 hover:scale-[1.02] active:scale-[0.98]"
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
                  image: images[0] ?? null,
                  unitCents: product.effectivePriceCents,
                  quantity: 1,
                  size: sizes.length ? size : undefined,
                })
              );
              toast({
                title: "Nestled delicately",
                message: `${product.name} joined your heirloom bag.`,
                variant: "success",
              });
            }}
          >
            <IconShoppingBagPlus className="h-4 w-4 mr-1" />
            Add heirloom
          </button>
        </div>
      </div>
    </div>
  );
}
