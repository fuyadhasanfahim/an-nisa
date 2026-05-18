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
      <motion.div layout className="relative aspect-[3/4] overflow-hidden rounded-[36px] border border-black/10 bg-brand-pink/20 shadow-soft dark:border-white/10">
        {images.length ? (
          <>
            <Image
              src={images[Math.min(active, images.length - 1)] ?? images[0]}
              alt={`${product.name} studio frame`}
              fill
              sizes="60vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/82 via-transparent p-6">
              {images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  className={`relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border ${
                    active === idx ? "border-brand-pink" : "border-white/40 opacity-72"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                  onClick={() => setActive(idx)}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center px-14 text-center text-lg text-brand-black dark:text-white">
            Photographer en route • heirloom capture pending.
          </div>
        )}
      </motion.div>

      <div className="space-y-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-black/53 dark:text-white/62">{product.category}</p>
        <h1 className="font-serif text-4xl text-brand-black md:text-[2.9rem] dark:text-white">{product.name}</h1>
        {product.fabricType ? (
          <p className="text-sm text-black/70 dark:text-white/73">Fabric • {product.fabricType}</p>
        ) : null}
        <p className="text-[15px] leading-relaxed text-black/73 dark:text-white/75">{product.description}</p>
        <div className="rounded-[28px] border border-brand-pink/60 bg-brand-pink/35 px-6 py-4 text-brand-black backdrop-blur">
          <div className="text-xs uppercase tracking-[0.24em]">Atelier tariff</div>
          <div className="mt-4 flex gap-8 text-brand-black dark:text-brand-black">
            {product.discountPriceCents != null ? (
              <span className="text-xl line-through">{formatBdtFromCents(product.priceCents, product.currency)}</span>
            ) : null}
            <span className="text-4xl">{formatBdtFromCents(product.effectivePriceCents, product.currency)}</span>
          </div>
        </div>

        {sizes.length ? (
          <div className="flex flex-wrap gap-3">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  size === s
                    ? "bg-brand-black text-white dark:bg-white dark:text-brand-black"
                    : "border border-black/17 dark:border-white/15"
                }`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-10"
            onClick={() => dispatch(toggleWishlist(product.id))}
          >
            <IconHeart className={liked ? "fill-brand-pink" : ""} />
            Moodboard toggle
          </Button>
          <Button
            type="button"
            className={`rounded-full px-12 py-[0.85rem] ${
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
              toast({ title: "Nestled delicately", message: `${product.name} joined your heirloom bag.`, variant: "success" });
            }}
          >
            <IconShoppingBagPlus className="h-5 w-5" />
            Add heirloom
          </Button>
        </div>
      </div>
    </div>
  );
}
