"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  normalizeProductListQuery,
} from "@/lib/validators/product-list.query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { IconSearch } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";

async function fetchSuggest(q: string) {
  const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const payload = await res.json();
  return (payload.items ?? []) as {
    id: string;
    name: string;
    slug: string;
    category: string;
    images: string[];
    priceCents: number;
    discountPriceCents: number | null;
    effectivePriceCents: number;
  }[];
}

export function BoutiqueSearchBar({
  placement = "header",
}: {
  placement?: "header" | "inline";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const [draft, setDraft] = useState(normalized.q);
  const [open, setOpen] = useState(false);
  type Suggestions = Awaited<ReturnType<typeof fetchSuggest>>;
  const [suggestions, setSuggestions] = useState<Suggestions>([]);

  const commitSearch = useCallback(
    (q: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      next.set("page", "1");
      router.replace(`${pathname}?${next.toString()}`);
      setDraft(q);
      setOpen(false);
      setSuggestions([]);
    },
    [pathname, router, searchParams]
  );

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    commitSearch(draft);
  }

  const containerClass =
    placement === "header"
      ? "relative flex-1"
      : "relative w-full";

  return (
    <div className={cn(containerClass, "isolate")}>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex h-11 items-center justify-between gap-2 rounded-full border border-[#fcc4c8] bg-white/70 pl-4 pr-1.5 text-sm backdrop-blur-sm transition-all duration-300 focus-within:border-[#fcc4c8] focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(252,196,200,0.12)] focus-within:ring-4 focus-within:ring-[#fcc4c8]/20"
      >
        <div className="flex flex-1 items-center min-w-0">
          <IconSearch className="mr-2.5 h-4 w-4 shrink-0 text-[#fcc4c8]" stroke={2.2} />
          <label className="sr-only">Search products</label>
          <input
            value={draft}
            onChange={(evt) => {
              const value = evt.target.value;
              setDraft(value);
              void fetchSuggest(value).then((items) => {
                if (value.trim().length < 2) {
                  setSuggestions([]);
                  setOpen(false);
                  return;
                }
                setSuggestions(items);
                setOpen(items.length > 0);
              });
            }}
            onFocus={() => {
              if (suggestions.length) setOpen(true);
            }}
            placeholder="Search for premium embroidery, abayas, fashion..."
            className="w-full bg-transparent text-xs text-brand-black placeholder:text-black/35 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="flex h-8 items-center justify-center rounded-full bg-[#fcc4c8] px-4 text-xs font-semibold text-brand-black transition-all hover:bg-[#fcc4c8]/85 hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="glass-strong absolute left-0 right-0 top-[calc(100%+6px)] z-[80] overflow-hidden rounded-xl shadow-lg"
          >
            {suggestions.length ? (
              <ul className="max-h-96 divide-y divide-[#fcc4c8]/25 overflow-y-auto">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition hover:bg-[#fcc4c8]/20"
                      onClick={() => {
                        router.push(`/product/${item.slug}`);
                        setOpen(false);
                        setSuggestions([]);
                      }}
                    >
                      {/* Product Image */}
                      {item.images?.[0] ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#fcc4c8]/30 bg-white shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-lg bg-[#fcc4c8]/10 flex items-center justify-center border border-[#fcc4c8]/20">
                          <IconSearch className="h-5 w-5 text-[#fcc4c8]" />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-brand-black truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider uppercase text-black/40 mt-0.5">
                          {item.category}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs font-bold text-brand-black">
                            {formatBdtFromCents(item.effectivePriceCents)}
                          </span>
                          {item.discountPriceCents && (
                            <span className="text-[10px] text-black/35 line-through">
                              {formatBdtFromCents(item.priceCents)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4 text-xs text-black/45">
                Start typing to see suggestions...
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
