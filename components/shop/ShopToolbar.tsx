"use client";

import { IconFilter, IconArrowsSort } from "@tabler/icons-react";
import type { ProductSortMode } from "@/lib/validators/product-list.query";

const SORT_MENU: { mode: ProductSortMode; label: string }[] = [
  { mode: "latest", label: "Latest" },
  { mode: "popular", label: "Popular" },
  { mode: "price_asc", label: "Price: Low → High" },
  { mode: "price_desc", label: "Price: High → Low" },
  { mode: "top_rated", label: "Top Rated" },
];

const LIMIT_OPTS = [20, 50, 100] as const;

type PushParams = (mutate: (sp: URLSearchParams) => void) => void;

export function ShopToolbar({
  total,
  page,
  limit,
  sortMode,
  pushParams,
  onMobileFilterToggle,
}: {
  total: number;
  page: number;
  limit: number;
  sortMode: string | undefined;
  pushParams: PushParams;
  onMobileFilterToggle: () => void;
}) {
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/6 bg-white px-4 py-3 shadow-sm dark:border-white/8 dark:bg-white/[0.04]">
      {/* Left — count + mobile filter */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileFilterToggle}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-brand-pink/15 lg:hidden dark:border-white/15 dark:text-white/70"
        >
          <IconFilter className="h-3.5 w-3.5" />
          Filters
        </button>
        <span className="text-sm text-black/55 dark:text-white/55">
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-brand-black dark:text-white">
                {from}–{to}
              </span>{" "}
              of{" "}
              <span className="font-medium text-brand-black dark:text-white">
                {total}
              </span>{" "}
              products
            </>
          ) : (
            "No products found"
          )}
        </span>
      </div>

      {/* Right — sort + page size */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
          <IconArrowsSort className="h-3.5 w-3.5" />
          <select
            className="rounded-lg border border-black/10 bg-brand-lightgray px-2 py-1.5 text-xs font-medium text-brand-black focus:border-brand-pink focus:outline-none dark:border-white/12 dark:bg-white/8 dark:text-white"
            value={sortMode ?? "latest"}
            onChange={(e) =>
              pushParams((sp) => {
                sp.set("sortMode", e.target.value);
                sp.set("page", "1");
              })
            }
          >
            {SORT_MENU.map((m) => (
              <option key={m.mode} value={m.mode}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <select
          className="rounded-lg border border-black/10 bg-brand-lightgray px-2 py-1.5 text-xs font-medium text-brand-black focus:border-brand-pink focus:outline-none dark:border-white/12 dark:bg-white/8 dark:text-white"
          value={limit}
          onChange={(e) =>
            pushParams((sp) => {
              sp.set("limit", e.target.value);
              sp.set("page", "1");
            })
          }
        >
          {LIMIT_OPTS.map((l) => (
            <option key={l} value={l}>
              {l} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
