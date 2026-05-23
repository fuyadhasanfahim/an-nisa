"use client";

import { cn } from "@/lib/utils/cn";
import { IconHeart, IconShoppingBagPlus } from "@tabler/icons-react";

export function BoutiqueProductCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#fcc4c8]/25 bg-white/95 shadow-sm transition-all duration-500",
        className
      )}
    >
      {/* Image area skeleton */}
      <div className="relative aspect-[3/3.8] overflow-hidden bg-gradient-to-br from-[#fcc4c8]/10 via-[#fcc4c8]/5 to-brand-cream/20 animate-pulse">
        {/* Wishlist button skeleton mockup */}
        <div className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1.5 border border-[#fcc4c8]/20 shadow-sm backdrop-blur-sm">
          <IconHeart className="h-4 w-4 text-black/10" stroke={1.8} />
        </div>

        {/* Category label skeleton mockup */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent px-3.5 pb-2.5 pt-8 z-20">
          <div className="h-2 w-16 rounded bg-white/50 animate-pulse" />
        </div>
      </div>

      {/* Product info skeleton */}
      <div className="relative z-20 flex flex-1 flex-col gap-3 p-4 bg-white border-t border-[#fcc4c8]/15">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="h-4.5 w-3/4 rounded-md bg-black/[0.06] animate-pulse" />
          <div className="h-5 w-10 rounded-full bg-amber-500/10 border border-amber-200/20 animate-pulse" />
        </div>

        {/* Meta badges skeleton */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="h-4 w-12 rounded-full bg-black/[0.04] animate-pulse" />
          <div className="h-4 w-16 rounded-full bg-[#fcc4c8]/10 animate-pulse" />
        </div>

        {/* Sizes skeleton */}
        <div className="flex flex-wrap gap-1">
          <div className="h-4.5 w-7 rounded-full bg-black/[0.03] animate-pulse" />
          <div className="h-4.5 w-7 rounded-full bg-black/[0.03] animate-pulse" />
          <div className="h-4.5 w-7 rounded-full bg-black/[0.03] animate-pulse" />
        </div>

        {/* Price + actions skeleton */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-10 rounded bg-black/[0.04] animate-pulse" />
            <div className="h-5 w-16 rounded bg-black/[0.08] animate-pulse" />
          </div>

          <div className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#fcc4c8]/40 px-2.5 sm:px-4 text-xs font-bold transition-all duration-300 animate-pulse w-9 sm:w-20 shrink-0">
            <IconShoppingBagPlus className="h-3.5 w-3.5 text-brand-black/20" stroke={1.8} />
          </div>
        </div>
      </div>
    </div>
  );
}
