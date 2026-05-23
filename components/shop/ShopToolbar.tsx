"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconFilter, IconArrowsSort, IconChevronDown } from "@tabler/icons-react";
import type { ProductSortMode } from "@/lib/validators/product-list.query";

const SORT_MENU: { value: ProductSortMode; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "top_rated", label: "Top Rated" },
];

const LIMIT_OPTS = [
  { value: 20, label: "20 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
];

type PushParams = (mutate: (sp: URLSearchParams) => void) => void;

function CustomDropdown<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-30 inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-brand-black shadow-sm transition-all duration-300 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10 focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none min-w-[125px] cursor-pointer"
      >
        <span className="truncate">{selectedOpt.label}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-brand-black transition-transform duration-300 shrink-0 ${
            open ? "rotate-180 text-brand-pink" : ""
          }`}
          stroke={2.2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-[#fcc4c8]/25 bg-white/95 p-1 shadow-lg backdrop-blur-md focus:outline-none z-45"
          >
            <div className="py-1 space-y-0.5">
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    opt.value === value
                      ? "bg-[#fcc4c8] text-brand-black shadow-sm"
                      : "text-black/75 hover:bg-[#fcc4c8]/25 hover:text-brand-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const activeSort = (sortMode ?? "latest") as ProductSortMode;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-5 py-3.5 shadow-sm">
      {/* Left — count + mobile filter */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileFilterToggle}
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/65 transition-all duration-200 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10 hover:text-brand-black lg:hidden cursor-pointer"
        >
          <IconFilter className="h-3.5 w-3.5 text-brand-black/60" />
          Filters
        </button>
        <span className="text-sm text-black/50 font-semibold">
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-bold text-brand-black">
                {from}–{to}
              </span>{" "}
              of{" "}
              <span className="font-bold text-brand-black">
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-black/45 font-bold">
          <IconArrowsSort className="h-3.5 w-3.5 text-brand-black/60" />
          <CustomDropdown
            value={activeSort}
            options={SORT_MENU}
            onChange={(val) =>
              pushParams((sp) => {
                sp.set("sortMode", String(val));
                sp.set("page", "1");
              })
            }
          />
        </div>

        <CustomDropdown
          value={limit}
          options={LIMIT_OPTS as unknown as { value: number; label: string }[]}
          onChange={(val) =>
            pushParams((sp) => {
              sp.set("limit", String(val));
              sp.set("page", "1");
            })
          }
        />
      </div>
    </div>
  );
}
