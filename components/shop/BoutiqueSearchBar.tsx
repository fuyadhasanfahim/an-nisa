"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  normalizeProductListQuery,
  productFiltersFromSearchParams,
} from "@/lib/validators/product-list.query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { IconSearch } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

async function fetchSuggest(q: string) {
  const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const payload = await res.json();
  return (payload.items ?? []) as {
    id: string;
    name: string;
    slug: string;
    category: string;
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
  const filters = useMemo(() => productFiltersFromSearchParams(searchParams), [
    searchParams,
  ]);
  const activeFilterKeys = Object.values(filters).filter(Boolean).length;
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
      ? "relative hidden md:block md:flex-1"
      : "relative w-full";

  return (
    <div className={cn(containerClass, "isolate")}>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex items-center rounded-full border border-black/12 bg-[color-mix(in_srgb,var(--background)_86%,transparent)] px-4 py-[0.5rem] text-sm shadow-softSm backdrop-blur dark:border-white/15 dark:bg-black/42"
      >
        <IconSearch className="mr-3 h-5 w-5 shrink-0 text-black/54 dark:text-white/65" />
        <label className="sr-only">Search heirloom catalog</label>
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
          placeholder="Search motif, neckline, SKU…"
          className="w-full bg-transparent text-sm text-brand-black placeholder:text-black/45 focus:outline-none dark:text-white"
        />
      </form>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-3xl border border-black/10 bg-white/95 text-sm shadow-2xl ring-1 ring-black/5 dark:border-white/12 dark:bg-brand-black/95"
          >
            {suggestions.length ? (
              <ul className="max-h-72 divide-y divide-black/5 overflow-y-auto dark:divide-white/10">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-brand-pink/35"
                      onClick={() => commitSearch(item.name)}
                    >
                      <span className="font-semibold text-brand-black dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-black/50 dark:text-white/55">
                        {item.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-xs text-black/60 dark:text-white/60">
                Keep typing—we’ll surface heirloom matches.
              </div>
            )}
            <div className="border-t border-black/8 bg-[#fff6fa] px-4 py-3 text-[11px] text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/65">
              {activeFilterKeys} refinement chips syncing with this ritual
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
