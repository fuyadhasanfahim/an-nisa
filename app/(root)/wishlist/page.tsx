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
    <main className="flex-1">
      <Container>
        <div className="py-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/55 dark:text-white/62">
            Thread saved for later
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-brand-black md:text-[2.8rem] dark:text-white">
            Wishlist tableau
          </h1>

          {!wishlistIds.length ? (
            <div className="mt-14 rounded-[32px] border border-black/15 bg-[color-mix(in_srgb,var(--background)_95%,transparent)] px-8 py-12 text-black/70 shadow-softSm dark:border-white/12 dark:text-white/70">
              <p>
                Whisper pieces you love—they’ll perch here elegantly. Wander to the{" "}
                <Link className="text-brand-black underline underline-offset-[6px] dark:text-white" href="/#boutique-catalog">
                  boutique carousel
                </Link>
              </p>
            </div>
          ) : isLoading ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: Math.min(wishlistIds.length, 3) }).map((_, idx) => (
                <div key={idx} className="h-[540px] animate-pulse rounded-[32px] bg-black/[0.05] dark:bg-white/13" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.length ? (
                items.map((product) => <BoutiqueProductCard key={product.id} product={product} />)
              ) : (
                <p className="text-sm text-black/65 dark:text-white/70">
                  Some saved pieces paused availability—browse fresh heirlooms in the storefront.
                </p>
              )}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
