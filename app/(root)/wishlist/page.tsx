"use client";

import Link from "next/link";
import { BoutiqueProductCard } from "@/components/shop/BoutiqueProductCard";
import { Container } from "@/components/shared/Container";
import { useListProductsQuery } from "@/store/api/productsApi";
import { useAppSelector } from "@/store/hooks";

export default function BoutiqueWishlistPage() {
  const wishlistIds = useAppSelector((state) => state.boutiqueUi.wishlist);
  const idSet = new Set(wishlistIds);

  const { data, isLoading } = useListProductsQuery({
    limit: 100,
    page: 1,
    sortMode: "popular",
    q: "",
  });

  const items = data?.items.filter((product) => idSet.has(product.id)) ?? [];

  return (
    <main className="flex-1 bg-gradient-to-b from-white via-[#fffbfa] to-[#fff5f6]">
      <Container>
        <div className="py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/55 select-none">
            Saved boutique threads
          </p>
          <h1 className="mt-2.5 font-serif text-3xl md:text-[2.6rem] font-bold tracking-tight text-brand-black select-none">
            Wishlist Tableau
          </h1>

          {!wishlistIds.length ? (
            <div className="mt-14 max-w-lg mx-auto text-center rounded-[32px] border border-[#fcc4c8]/35 bg-white px-8 py-16 text-black/70 shadow-[0_12px_40px_rgba(252,196,200,0.08)] flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[#fcc4c8]/15 flex items-center justify-center text-brand-black mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#fcc4c8] fill-current"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-black tracking-tight mb-2">
                Your sanctuary is vacant
              </h2>
              <p className="text-xs text-black/55 font-semibold max-w-sm mb-8 leading-relaxed">
                Whisper pieces you love while browsing—they will nest here elegantly for your final touch.
              </p>
              <Link
                href="/#boutique-catalog"
                className="rounded-full bg-[#fcc4c8] hover:bg-[#fcc4c8]/85 text-brand-black font-bold text-xs uppercase tracking-wider px-8 py-3.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] select-none text-center border-none"
              >
                Explore storefront
              </Link>
            </div>
          ) : isLoading ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: Math.min(wishlistIds.length, 3) }).map((_, idx) => (
                <div key={idx} className="h-[540px] animate-pulse rounded-[32px] bg-black/[0.05]" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.length ? (
                items.map((product) => <BoutiqueProductCard key={product.id} product={product} />)
              ) : (
                <div className="col-span-full rounded-[32px] border border-[#fcc4c8]/35 bg-white p-10 text-center shadow-[0_12px_40px_rgba(252,196,200,0.08)]">
                  <p className="text-sm font-semibold text-black/55">
                    Some saved pieces paused availability—browse fresh heirlooms in the storefront.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
