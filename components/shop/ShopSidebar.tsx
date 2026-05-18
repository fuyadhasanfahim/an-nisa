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

/* ── Sidebar filter sections ── */

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
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-[264px] lg:shrink-0">
        <div className="sticky top-[72px] max-h-[calc(100vh-80px)] overflow-y-auto sidebar-scroll rounded-2xl border border-black/8 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <SidebarContent filters={filters} pushParams={pushParams} />
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
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[110] w-[300px] max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl sidebar-scroll dark:bg-[#121014] lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-black dark:text-white">
                  <IconFilter className="h-4 w-4" />
                  Filters
                </div>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Close filters"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent filters={filters} pushParams={pushParams} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Inner sidebar content (shared desktop/mobile) ── */

function SidebarContent({
  filters,
  pushParams,
}: {
  filters: ProductListFilters;
  pushParams: PushParams;
}) {
  return (
    <div className="space-y-5">
      {/* Categories */}
      <FilterSection title="Categories" defaultOpen>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
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
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                (filters.category ?? "") === cat.value
                  ? "bg-brand-pink/30 font-medium text-brand-black dark:text-white"
                  : "text-black/70 hover:bg-brand-pink/15 dark:text-white/70 dark:hover:bg-white/8"
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
            className="w-full rounded-lg border border-black/10 bg-brand-lightgray px-3 py-2 text-sm text-brand-black focus:border-brand-pink focus:outline-none dark:border-white/15 dark:bg-white/8 dark:text-white"
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
          <span className="text-xs text-black/40 dark:text-white/40">–</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full rounded-lg border border-black/10 bg-brand-lightgray px-3 py-2 text-sm text-brand-black focus:border-brand-pink focus:outline-none dark:border-white/15 dark:bg-white/8 dark:text-white"
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
        <p className="mt-1 text-[11px] text-black/40 dark:text-white/40">
          Values in BDT (৳)
        </p>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Sizes">
        <div className="flex flex-wrap gap-1.5">
          {SIZE_OPTIONS.map((s) => (
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
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.size === s
                  ? "border-brand-pink bg-brand-pink/25 text-brand-black dark:text-white"
                  : "border-black/10 text-black/60 hover:border-brand-pink/60 dark:border-white/15 dark:text-white/60"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Colors">
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((c) => (
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
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                filters.color === c.value
                  ? "border-brand-pink ring-2 ring-brand-pink/40 scale-110"
                  : "border-black/15 dark:border-white/20"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Fabric Type */}
      <FilterSection title="Fabric Type">
        <div className="flex flex-wrap gap-1.5">
          {FABRIC_TYPES.map((f) => (
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
                "rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                filters.fabricType === f.toLowerCase()
                  ? "border-brand-pink bg-brand-pink/25 font-medium text-brand-black dark:text-white"
                  : "border-black/10 text-black/60 hover:border-brand-pink/60 dark:border-white/15 dark:text-white/60"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-black/70 dark:text-white/70">
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
            className="h-4 w-4 rounded border-black/20 accent-brand-pink"
          />
          In Stock Only
        </label>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-1">
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
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                filters.minRating === r.value
                  ? "bg-brand-pink/25 font-medium text-brand-black dark:text-white"
                  : "text-black/60 hover:bg-brand-pink/10 dark:text-white/60"
              )}
            >
              <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Quick Filters */}
      <FilterSection title="Quick Filters" defaultOpen>
        <div className="space-y-1">
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
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-brand-pink/25 font-medium text-brand-black dark:text-white"
                    : "text-black/65 hover:bg-brand-pink/10 dark:text-white/65"
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
        className="w-full rounded-lg border border-black/10 py-2 text-xs font-medium text-black/50 transition hover:bg-brand-pink/15 hover:text-brand-black dark:border-white/12 dark:text-white/50 dark:hover:text-white"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ── Collapsible section ── */

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
    <div className="border-b border-black/6 pb-4 dark:border-white/8">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/55"
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
