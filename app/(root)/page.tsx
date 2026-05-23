import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { BoutiqueProductCardSkeleton } from "@/components/shop/BoutiqueProductCardSkeleton";

export const metadata: Metadata = {
  title: "An‑Nisa — Premium Women's Fashion & Embroidery",
  description:
    "Shop premium women's embroidery, handmade designs, abayas, and bespoke fashion pieces at An-Nisa.",
};

function ShopFallback() {
  return (
    <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
      {/* Sidebar fallback skeleton */}
      <div className="hidden w-[264px] lg:block">
        <div className="h-[600px] animate-pulse rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5" />
      </div>
      
      {/* Main content grid fallback skeleton */}
      <div className="flex-1 space-y-4">
        {/* Toolbar fallback skeleton */}
        <div className="h-12 animate-pulse rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5" />
        
        {/* Products loading grid */}
        <div className="grid gap-3 grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <BoutiqueProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopLayout />
    </Suspense>
  );
}
