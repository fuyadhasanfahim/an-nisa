"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  PRODUCT_SORT_MODES,
  normalizeProductListQuery,
  productFiltersFromSearchParams,
  type ProductSortMode,
} from "@/lib/validators/product-list.query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useListProductsQuery, type ProductListApiParams } from "@/store/api/productsApi";
import { ShopSidebar } from "@/components/shop/ShopSidebar";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileFiltersOpen } from "@/store/slices/boutiqueUISlice";

export function ShopLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const mobileFilters = useAppSelector((state) => state.boutiqueUi.mobileFiltersOpen);

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

  const filters = useMemo(
    () => productFiltersFromSearchParams(searchParams),
    [searchParams]
  );

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
    <main className="flex-1">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
        {/* Left sidebar */}
        <ShopSidebar
          filters={filters}
          pushParams={pushParams}
          mobileOpen={mobileFilters}
          onMobileClose={() => dispatch(setMobileFiltersOpen(false))}
        />

        {/* Right content */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Toolbar */}
          <ShopToolbar
            total={data?.total ?? 0}
            page={data?.page ?? normalized.page}
            limit={normalized.limit}
            sortMode={sortMode}
            pushParams={pushParams}
            onMobileFilterToggle={() => dispatch(setMobileFiltersOpen(true))}
          />

          {/* Product grid + pagination */}
          <ProductGrid
            data={data}
            isLoading={isLoading}
            isFetching={isFetching}
            query={normalized.q}
            pushParams={pushParams}
          />
        </div>
      </div>
    </main>
  );
}
