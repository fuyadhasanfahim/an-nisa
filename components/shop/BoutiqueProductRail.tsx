"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { ProductDto } from "@/store/api/productsApi";
import { BoutiqueProductCard } from "@/components/shop/BoutiqueProductCard";

async function fetchList(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed list");
  return (await res.json()) as {
    items: ProductDto[];
  };
}

export function BoutiqueProductRail({
  title,
  description,
  query,
}: {
  title: string;
  description?: string;
  /** Query string appended to `/api/products?` */
  query: string;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchList(`/api/products?${query}`),
    staleTime: 60 * 1000,
  });

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/52 dark:text-white/62">
              An-Nisa curation desk
            </p>
            <h2 className="mt-2 font-serif text-3xl text-brand-black md:text-[2.05rem] dark:text-white">{title}</h2>
            {description ? (
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-black/70 dark:text-white/75">{description}</p>
            ) : null}
          </div>
          <div className="hidden text-xs uppercase tracking-[0.24em] text-black/50 md:block dark:text-white/62">
            Swipe sideways on mobile • hover on desktop ateliers
          </div>
        </div>
        <div className="mt-10 overflow-x-auto pb-4 scrollbar-thin">
          <motion.div layout className="flex min-w-max gap-6">
            {isPending ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[520px] w-[320px] shrink-0 animate-pulse rounded-[32px] bg-black/5 dark:bg-white/12"
                />
              ))
            ) : (
              data?.items.map((item) => (
                <div key={item.id} className="w-[288px] sm:w-[300px]" id={`product-${item.slug}`}>
                  <BoutiqueProductCard product={item} />
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
