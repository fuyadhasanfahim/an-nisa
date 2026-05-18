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
        className="flex items-center justify-between gap-2 rounded-xl border border-brand-pink/35 bg-white/70 pl-3.5 pr-2 py-1.5 text-sm backdrop-blur-sm transition-all duration-300 focus-within:border-brand-pink/60 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(252,196,200,0.12)] focus-within:ring-4 focus-within:ring-brand-pink/10"
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
            className="w-full bg-transparent text-sm text-brand-black placeholder:text-black/35 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="flex h-7 items-center justify-center rounded-lg bg-[#fcc4c8] px-3.5 text-xs font-semibold text-brand-black transition-all hover:bg-[#fcc4c8]/85 hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0"
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
              <ul className="max-h-64 divide-y divide-brand-pink/10 overflow-y-auto">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition hover:bg-brand-pink/15"
                      onClick={() => commitSearch(item.name)}
                    >
                      <span className="text-sm font-medium text-brand-black">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-black/35">
                        {item.category}
                      </span>
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
