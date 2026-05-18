"use client";

import Image from "next/image";
import { IconHeart, IconShoppingBagPlus } from "@tabler/icons-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/45">{product.category}</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-brand-black md:text-[2.6rem]">{product.name}</h1>
        </div>

        {product.fabricType ? (
          <p className="text-sm font-medium text-black/55">
            Fabric: <span className="text-brand-black">{product.fabricType}</span>
          </p>
        ) : null}

        <p className="text-[15px] leading-relaxed text-black/65">{product.description}</p>

        {/* Premium Tariff Glass Card */}
        <div className="glass rounded-2xl p-5 text-brand-black">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-black/45">Atelier tariff</div>
          <div className="mt-3 flex items-baseline gap-4">
            {product.discountPriceCents != null ? (
              <span className="text-sm text-black/40 line-through tabular-nums">
                {formatBdtFromCents(product.priceCents, product.currency)}
              </span>
            ) : null}
            <span className="text-3xl font-semibold tracking-tight text-brand-black tabular-nums">
              {formatBdtFromCents(product.effectivePriceCents, product.currency)}
            </span>
          </div>
        </div>

        {/* Sizes Selector */}
        {sizes.length ? (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">Select Size</span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    size === s
                      ? "bg-[#1a1a1a] text-white shadow-sm"
                      : "border border-brand-pink/25 text-black/55 hover:border-brand-pink/60 hover:bg-brand-pink/10"
                  }`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6 text-xs py-3"
            onClick={() => {
              dispatch(toggleWishlist(product.id));
              toast({
                title: liked ? "Removed from wishlist" : "Added to wishlist",
                message: liked ? `${product.name} removed.` : `${product.name} added.`,
                variant: liked ? "error" : "success",
              });
            }}
          >
            <IconHeart className={`h-4 w-4 mr-1 transition-all ${liked ? "fill-brand-pink text-brand-pink" : "text-black/50"}`} />
            Moodboard toggle
          </Button>

          <Button
            type="button"
            className={`rounded-xl px-8 text-xs py-3 bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/85 ${
              commerceBlocked ? "cursor-not-allowed opacity-70" : ""
            }`}
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
          </Button>
        </div>
      </div>
    </div>
  );
}
