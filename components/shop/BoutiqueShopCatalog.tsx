"use client";

import Link from "next/link";
import { useCallback, useMemo, useTransition } from "react";
import {
  PRODUCT_SORT_MODES,
  normalizeProductListQuery,
  productFiltersFromSearchParams,
  type ProductSortMode,
} from "@/lib/validators/product-list.query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BoutiqueProductCard } from "@/components/shop/BoutiqueProductCard";
import { useListProductsQuery, type ProductListApiParams } from "@/store/api/productsApi";
import { Button } from "@/components/ui/Button";
import { IconFilter, IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";

const SORT_MENU: { mode: ProductSortMode; label: string }[] = [
  { mode: "latest", label: "Latest" },
  { mode: "popular", label: "Popular" },
  { mode: "price_asc", label: "Price · low → high" },
  { mode: "price_desc", label: "Price · high → low" },
  { mode: "top_rated", label: "Top rated" },
];

const LIMIT_OPTS = [20, 50, 100] as const;

export function BoutiqueShopCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const normalized = useMemo(
    () =>
      normalizeProductListQuery({
        q: searchParams.get("q"),
        sort: searchParams.get("sort"),
        order: searchParams.get("order"),
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        sortMode: searchParams.get("sortMode"),
      }),
    [searchParams]
  );

  const filters = useMemo(() => productFiltersFromSearchParams(searchParams), [
    searchParams,
  ]);

  const listArgs: Partial<ProductListApiParams> = useMemo(
    () => ({ ...normalized, ...filters }),
    [filters, normalized]
  );

  const { data, isLoading, isFetching } = useListProductsQuery(listArgs);

  const sortMode =
    normalized.sortMode &&
    PRODUCT_SORT_MODES.includes(normalized.sortMode as ProductSortMode)
      ? (normalized.sortMode as ProductSortMode)
      : undefined;

  const pushParams = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    },
    [pathname, router, searchParams, startTransition]
  );

  return (
    <section
      id="boutique-catalog"
      className="bg-[radial-gradient(circle_at_top,_rgba(252,196,200,0.25),transparent_62%)] py-24 dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_72%)]"
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:gap-14 lg:px-10">
        <aside className="hidden lg:block lg:w-[280px]">
          <div className="sticky top-36 space-y-8 rounded-[32px] border border-black/12 bg-white/90 p-7 shadow-soft dark:border-white/12 dark:bg-white/10">
            <div className="flex items-center gap-3 text-brand-black dark:text-white">
              <IconFilter />
              <span className="font-serif text-xl">Refine</span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-black/50 dark:text-white/62">
                Category
              </p>
              {[
                { label: "All", value: "" },
                { label: "Embroidery", value: "embroidery" },
                { label: "Abaya", value: "abaya" },
                { label: "Fashion", value: "fashion" },
                { label: "Accessories", value: "accessories" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() =>
                    pushParams((sp) => {
                      chip.value ? sp.set("category", chip.value) : sp.delete("category");
                      sp.set("page", "1");
                    })
                  }
                  className={[
                    "flex w-full items-center rounded-2xl border px-3 py-2 text-left transition hover:border-brand-pink",
                    (filters.category ?? "") === chip.value
                      ? "border-brand-pink bg-brand-pink/25"
                      : "border-black/15 dark:border-white/15",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="space-y-2 text-xs uppercase tracking-[0.18em] text-black/53 dark:text-white/62">
              <p>Ribbons</p>
              <FilterToggle
                label="Trending"
                active={Boolean(filters.trendingOnly)}
                onClick={() =>
                  pushParams((sp) => {
                    filters.trendingOnly ? sp.delete("trending") : sp.set("trending", "true");
                    sp.set("page", "1");
                  })
                }
              />
              <FilterToggle
                label="Handmade"
                active={Boolean(filters.handmadeOnly)}
                onClick={() =>
                  pushParams((sp) => {
                    filters.handmadeOnly ? sp.delete("handmade") : sp.set("handmade", "true");
                    sp.set("page", "1");
                  })
                }
              />
              <FilterToggle
                label="Featured suite"
                active={Boolean(filters.featuredOnly)}
                onClick={() =>
                  pushParams((sp) => {
                    filters.featuredOnly ? sp.delete("featured") : sp.set("featured", "true");
                    sp.set("page", "1");
                  })
                }
              />
              <FilterToggle
                label="On sale"
                active={Boolean(filters.onSaleOnly)}
                onClick={() =>
                  pushParams((sp) => {
                    filters.onSaleOnly ? sp.delete("onSale") : sp.set("onSale", "true");
                    sp.set("page", "1");
                  })
                }
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-10">
          <motion.div layout className="flex flex-wrap items-start justify-between gap-6 pb-12">
            <div>
              <p className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/52 dark:text-white/62">
                <IconSparkles className="h-4 w-4 text-brand-pink" stroke={2} />
                Curated heirloom grid
              </p>
              <h2 className="mt-2 font-serif text-4xl text-brand-black md:text-[2.85rem] dark:text-white">
                Needle-guided wardrobe poetry
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex flex-col rounded-3xl bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60 shadow-softSm ring-1 ring-black/14 dark:bg-white/8 dark:text-white/75 dark:ring-white/12">
                Sort ritual
                <select
                  className="mt-2 rounded-2xl border border-transparent bg-black/[0.05] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-brand-black dark:bg-white/10 dark:text-white"
                  value={sortMode ?? "latest"}
                  onChange={(e) =>
                    pushParams((sp) => {
                      sp.set("sortMode", e.target.value);
                      sp.set("page", "1");
                    })
                  }
                >
                  {SORT_MENU.map((mode) => (
                    <option key={mode.mode} value={mode.mode}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex flex-col rounded-3xl bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60 shadow-softSm ring-1 ring-black/14 dark:bg-white/8 dark:text-white/75 dark:ring-white/12">
                Pieces per page
                <select
                  className="mt-2 rounded-2xl border border-transparent bg-black/[0.05] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-brand-black dark:bg-white/10 dark:text-white"
                  value={normalized.limit}
                  onChange={(e) =>
                    pushParams((sp) => {
                      sp.set("limit", e.target.value);
                      sp.set("page", "1");
                    })
                  }
                >
                  {LIMIT_OPTS.map((limit) => (
                    <option key={limit} value={limit}>
                      Show {limit}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </motion.div>

          <div className="rounded-[38px] border border-black/10 bg-[color-mix(in_srgb,var(--background)_96%,transparent)] px-6 py-8 shadow-soft dark:border-white/12 dark:bg-white/[0.04]">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[520px] animate-pulse rounded-[32px] bg-black/[0.05] dark:bg-white/12"
                  />
                ))}
              </div>
            ) : (
              <>
                {!data?.items.length ? (
                  <div className="flex flex-col items-center gap-4 py-24 text-center">
                    <p className="text-black/72 dark:text-white/75">
                      No heirloom matches this choreography yet{" "}
                      {normalized.q.trim() ? <>for “{normalized.q.trim()}”.</> : "."}
                    </p>
                    <Button
                      type="button"
                      className="rounded-full px-10"
                      onClick={() =>
                        pushParams((sp) => {
                          sp.forEach((_v, k) => sp.delete(k));
                          sp.set("page", "1");
                          sp.set("limit", "20");
                          sp.set("sortMode", "latest");
                        })
                      }
                    >
                      Reset boutique filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-7 md:grid-cols-2 xl:grid-cols-3 ${
                        isFetching ? "opacity-90" : ""
                      }`}
                    >
                      {data.items.map((product) => (
                        <BoutiqueProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    <div className="mt-14 flex flex-col gap-8 border-t border-black/12 pt-8 text-sm md:flex-row md:items-center md:justify-between dark:border-white/14">
                      <div className="text-black/65 dark:text-white/70">
                        Showing{" "}
                        <span suppressHydrationWarning>
                          {(data.page - 1) * data.limit + 1}
                        </span>
                        –
                        <span suppressHydrationWarning>
                          {Math.min(data.page * data.limit, data.total)}
                        </span>{" "}
                        of <span suppressHydrationWarning>{data.total}</span> keepsakes
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="outline"
                          type="button"
                          className="rounded-full px-6"
                          disabled={data.page <= 1}
                          onClick={() =>
                            pushParams((sp) => {
                              sp.set("page", String(Math.max(1, data.page - 1)));
                            })
                          }
                        >
                          Prev
                        </Button>
                        <span className="text-xs uppercase tracking-[0.24em] text-black/50 dark:text-white/62">
                          Page{" "}
                          <span suppressHydrationWarning>{data.page}</span> /
                          <span suppressHydrationWarning>{data.totalPages}</span>
                        </span>
                        <Button
                          type="button"
                          className="rounded-full px-7"
                          disabled={data.page >= data.totalPages}
                          onClick={() =>
                            pushParams((sp) => {
                              sp.set(
                                "page",
                                String(Math.min(data.totalPages, data.page + 1))
                              );
                            })
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="fixed bottom-24 right-6 z-[60] lg:hidden">
            <Link
              href="#boutique-catalog"
              className="inline-flex items-center gap-2 rounded-full bg-brand-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-soft dark:bg-white dark:text-brand-black"
            >
              <IconFilter className="h-4 w-4" /> Refine upward
            </Link>
          </div>
        </main>
      </div>
    </section>
  );
}

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-2 text-[11px] font-semibold normal-case tracking-[0.12em]",
        active
          ? "border-brand-pink bg-brand-pink/30"
          : "border-black/13 dark:border-white/15",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
