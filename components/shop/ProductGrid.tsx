"use client";

import { BoutiqueProductCard } from "@/components/shop/BoutiqueProductCard";
import { BoutiqueProductCardSkeleton } from "@/components/shop/BoutiqueProductCardSkeleton";
import { Button } from "@/components/ui/Button";
import type { ProductDto, ProductListResponse } from "@/store/api/productsApi";

type PushParams = (mutate: (sp: URLSearchParams) => void) => void;

export function ProductGrid({
  data,
  isLoading,
  isFetching,
  query,
  pushParams,
}: {
  data: ProductListResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  query: string;
  pushParams: PushParams;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <BoutiqueProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-2xl py-20 text-center">
        <p className="text-sm text-black/50">
          No products found
          {query.trim() ? <> for &ldquo;{query.trim()}&rdquo;</> : "."}
        </p>
        <Button
          type="button"
          className="rounded-full px-8 text-xs"
          onClick={() =>
            pushParams((sp) => {
              sp.forEach((_v, k) => sp.delete(k));
              sp.set("page", "1");
              sp.set("limit", "20");
              sp.set("sortMode", "latest");
            })
          }
        >
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Product grid */}
      <div
        className={`stagger-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${
          isFetching ? "opacity-80 transition-opacity" : ""
        }`}
      >
        {data.items.map((product: ProductDto) => (
          <BoutiqueProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-brand-pink/10 pt-6 sm:flex-row sm:justify-between">
          <span className="text-sm text-black/45">
            Page{" "}
            <span className="font-medium text-brand-black">
              {data.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-brand-black">
              {data.totalPages}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              type="button"
              className="rounded-full px-5 text-xs"
              disabled={data.page <= 1}
              onClick={() =>
                pushParams((sp) => {
                  sp.set("page", String(Math.max(1, data.page - 1)));
                })
              }
            >
              Previous
            </Button>

            {generatePageNumbers(data.page, data.totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-1 text-sm text-black/25"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    pushParams((sp) => sp.set("page", String(p)))
                  }
                  className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                    p === data.page
                      ? "bg-brand-pink text-brand-black shadow-sm"
                      : "text-black/55 hover:bg-brand-pink/20"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <Button
              type="button"
              className="rounded-full px-5 text-xs"
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
      )}
    </>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
