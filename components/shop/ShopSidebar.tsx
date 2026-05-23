"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconFilter,
  IconX,
  IconStar,
  IconChevronDown,
  IconChevronUp,
  IconFlame,
  IconSparkles,
  IconTag,
  IconNeedle,
  IconRosetteDiscount,
} from "@tabler/icons-react";
import type { ProductListFilters } from "@/lib/validators/product-list.query";
import { cn } from "@/lib/utils/cn";
import { useGetProductFiltersQuery } from "@/store/api/productsApi";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Embroidery", value: "embroidery" },
  { label: "Abaya", value: "abaya" },
  { label: "Fashion", value: "fashion" },
  { label: "Accessories", value: "accessories" },
];

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "Free Size"];

const COLOR_SWATCHES = [
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Red", value: "red", hex: "#dc2626" },
  { name: "Pink", value: "pink", hex: "#fcc4c8" },
  { name: "Navy", value: "navy", hex: "#1e3a5f" },
  { name: "Gold", value: "gold", hex: "#d4a853" },
  { name: "Green", value: "green", hex: "#16a34a" },
  { name: "Maroon", value: "maroon", hex: "#7f1d1d" },
];

const FABRIC_TYPES = [
  "Cotton",
  "Silk",
  "Chiffon",
  "Georgette",
  "Linen",
  "Organza",
  "Viscose",
];

const RATING_OPTIONS = [
  { label: "4.5+ ★", value: 4.5 },
  { label: "4+ ★", value: 4 },
  { label: "3+ ★", value: 3 },
];

const QUICK_FILTERS = [
  { key: "trending", label: "Trending", icon: IconFlame },
  { key: "newArrival", label: "New Arrivals", icon: IconSparkles },
  { key: "onSale", label: "On Sale", icon: IconRosetteDiscount },
  { key: "handmade", label: "Handmade", icon: IconNeedle },
  { key: "featured", label: "Featured", icon: IconTag },
] as const;

type PushParams = (mutate: (sp: URLSearchParams) => void) => void;

export function ShopSidebar({
  filters,
  pushParams,
  mobileOpen,
  onMobileClose,
}: {
  filters: ProductListFilters;
  pushParams: PushParams;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { data: dynamicFilters } = useGetProductFiltersQuery();

  return (
    <>
      {/* Desktop sidebar — premium glass effect */}
      <aside className="hidden lg:block lg:w-[264px] lg:shrink-0">
        <div className="sticky top-[72px] max-h-[calc(100vh-80px)] overflow-y-auto sidebar-scroll rounded-2xl p-5 border border-[#fcc4c8]/35 bg-white/90 backdrop-blur-md bg-gradient-to-b from-white/95 to-[#fff5f6]/95 shadow-[0_8px_32px_rgba(252,196,200,0.08)]">
          <SidebarContent filters={filters} pushParams={pushParams} dynamicFilters={dynamicFilters} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[110] w-[300px] max-w-[85vw] overflow-y-auto p-5 shadow-xl sidebar-scroll lg:hidden border-r border-[#fcc4c8]/35 bg-white/95 backdrop-blur-md bg-gradient-to-b from-white/98 to-[#fff8f9]/98"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-black">
                  <IconFilter className="h-4 w-4" />
                  Filters
                </div>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="rounded-full p-1.5 hover:bg-[#fcc4c8]/20"
                  aria-label="Close filters"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent filters={filters} pushParams={pushParams} dynamicFilters={dynamicFilters} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  filters,
  pushParams,
  dynamicFilters,
}: {
  filters: ProductListFilters;
  pushParams: PushParams;
  dynamicFilters?: {
    categories: Array<{ label: string; value: string }>;
    fabricTypes: string[];
    sizes: string[];
    colors: Array<{ name: string; value: string; hex: string }>;
  };
}) {
  const categories = dynamicFilters?.categories?.length
    ? [{ label: "All", value: "" }, ...dynamicFilters.categories]
    : CATEGORIES;

  const sizes = dynamicFilters?.sizes?.length
    ? dynamicFilters.sizes
    : SIZE_OPTIONS;

  const colorSwatches = dynamicFilters?.colors?.length
    ? dynamicFilters.colors
    : COLOR_SWATCHES;

  const fabricTypes = dynamicFilters?.fabricTypes?.length
    ? dynamicFilters.fabricTypes
    : FABRIC_TYPES;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <FilterSection title="Categories" defaultOpen>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() =>
                pushParams((sp) => {
                  cat.value
                    ? sp.set("category", cat.value)
                    : sp.delete("category");
                  sp.set("page", "1");
                })
              }
              className={cn(
                "flex w-full items-center rounded-xl pl-3.5 pr-4 py-2.5 text-sm font-semibold border-l-4 transition-all duration-300 relative cursor-pointer",
                (filters.category ?? "") === cat.value
                  ? "bg-[#fcc4c8]/25 text-brand-black border-l-[#fcc4c8] shadow-sm font-bold"
                  : "text-black/60 border-l-transparent hover:bg-black/[0.03] hover:text-brand-black"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm"
            value={filters.priceMinCents ? Math.floor(filters.priceMinCents / 100) : ""}
            onChange={(e) =>
              pushParams((sp) => {
                const val = e.target.value;
                val
                  ? sp.set("priceMin", String(Number(val) * 100))
                  : sp.delete("priceMin");
                sp.set("page", "1");
              })
            }
          />
          <span className="text-xs text-black/35 font-bold">–</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm"
            value={filters.priceMaxCents ? Math.floor(filters.priceMaxCents / 100) : ""}
            onChange={(e) =>
              pushParams((sp) => {
                const val = e.target.value;
                val
                  ? sp.set("priceMax", String(Number(val) * 100))
                  : sp.delete("priceMax");
                sp.set("page", "1");
              })
            }
          />
        </div>
        <p className="mt-1.5 text-[10px] text-black/35 font-bold uppercase tracking-wider">Values in BDT (৳)</p>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Sizes">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                pushParams((sp) => {
                  const cur = sp.get("size");
                  cur === s ? sp.delete("size") : sp.set("size", s);
                  sp.set("page", "1");
                })
              }
              className={cn(
                "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-300 cursor-pointer",
                filters.size === s
                  ? "border-[#fcc4c8] bg-[#fcc4c8]/20 text-brand-black border-2 font-bold shadow-sm"
                  : "border-black/10 text-black/55 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Colors">
        <div className="flex flex-wrap gap-2.5 pt-1">
          {colorSwatches.map((c) => {
            const isSelected = filters.color === c.value;
            const isWhite = c.name.toLowerCase() === "white" || c.hex.toLowerCase() === "#ffffff";
            return (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() =>
                  pushParams((sp) => {
                    const cur = sp.get("color");
                    cur === c.value
                      ? sp.delete("color")
                      : sp.set("color", c.value);
                    sp.set("page", "1");
                  })
                }
                className={cn(
                  "h-7.5 w-7.5 rounded-full transition-all duration-300 relative flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/5",
                  isSelected
                    ? "scale-110 ring-2 ring-[#fcc4c8] ring-offset-2"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "h-3.5 w-3.5 stroke-[3]",
                      isWhite || c.name.toLowerCase() === "gold" || c.name.toLowerCase() === "pink" ? "text-brand-black" : "text-white"
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Fabric Type */}
      <FilterSection title="Fabric Type">
        <div className="flex flex-wrap gap-1.5">
          {fabricTypes.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() =>
                pushParams((sp) => {
                  const cur = sp.get("fabric");
                  cur === f.toLowerCase()
                    ? sp.delete("fabric")
                    : sp.set("fabric", f.toLowerCase());
                  sp.set("page", "1");
                })
              }
              className={cn(
                "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-300 cursor-pointer",
                filters.fabricType === f.toLowerCase()
                  ? "border-[#fcc4c8] bg-[#fcc4c8]/20 text-brand-black border-2 font-bold shadow-sm"
                  : "border-black/10 text-black/55 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-black/65 font-semibold">
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={() =>
              pushParams((sp) => {
                filters.inStockOnly
                  ? sp.delete("inStock")
                  : sp.set("inStock", "true");
                sp.set("page", "1");
              })
            }
            className="h-4.5 w-4.5 rounded-lg border border-black/15 text-[#fcc4c8] accent-[#fcc4c8] focus:ring-[#fcc4c8]/20 cursor-pointer"
          />
          In Stock Only
        </label>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() =>
                pushParams((sp) => {
                  const cur = Number(sp.get("minRating") ?? 0);
                  cur === r.value
                    ? sp.delete("minRating")
                    : sp.set("minRating", String(r.value));
                  sp.set("page", "1");
                })
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-xl pl-3.5 pr-4 py-2.5 text-sm font-semibold border-l-4 transition-all duration-300 cursor-pointer",
                filters.minRating === r.value
                  ? "bg-[#fcc4c8]/25 text-brand-black border-l-[#fcc4c8] shadow-sm font-bold"
                  : "text-black/60 border-l-transparent hover:bg-[#fcc4c8]/15 hover:text-brand-black"
              )}
            >
              <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-500 animate-pulse" />
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Quick Filters */}
      <FilterSection title="Quick Filters" defaultOpen>
        <div className="space-y-1.5">
          {QUICK_FILTERS.map((qf) => {
            const filterMap: Record<string, boolean | undefined> = {
              trending: filters.trendingOnly,
              newArrival: filters.newArrivalOnly,
              onSale: filters.onSaleOnly,
              handmade: filters.handmadeOnly,
              featured: filters.featuredOnly,
            };
            const active = Boolean(filterMap[qf.key]);
            const Icon = qf.icon;
            return (
              <button
                key={qf.key}
                type="button"
                onClick={() =>
                  pushParams((sp) => {
                    active ? sp.delete(qf.key) : sp.set(qf.key, "true");
                    sp.set("page", "1");
                  })
                }
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl pl-3.5 pr-4 py-2.5 text-sm font-semibold border-l-4 transition-all duration-300 cursor-pointer",
                  active
                    ? "bg-[#fcc4c8]/25 text-brand-black border-l-[#fcc4c8] shadow-sm font-bold"
                    : "text-black/60 border-l-transparent hover:bg-[#fcc4c8]/15 hover:text-brand-black"
                )}
              >
                <Icon className="h-4 w-4" stroke={1.8} />
                {qf.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Clear all */}
      <button
        type="button"
        onClick={() =>
          pushParams((sp) => {
            sp.forEach((_v, k) => sp.delete(k));
            sp.set("page", "1");
            sp.set("limit", "20");
            sp.set("sortMode", "latest");
          })
        }
        className="w-full rounded-xl bg-brand-black text-white py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:opacity-95 shadow-softSm active:scale-95 cursor-pointer text-center"
      >
        Clear all filters
      </button>
    </div>
  );
}

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  return (
    <div className="border-b border-brand-pink/10 pb-4">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-black/45"
      >
        {title}
        {open ? (
          <IconChevronUp className="h-3.5 w-3.5" />
        ) : (
          <IconChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
