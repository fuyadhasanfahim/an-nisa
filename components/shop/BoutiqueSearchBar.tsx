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
        className="flex items-center rounded-lg border border-black/8 bg-brand-lightgray px-3 py-2 text-sm transition-colors focus-within:border-brand-pink dark:border-white/12 dark:bg-white/6"
      >
        <IconSearch className="mr-2.5 h-4 w-4 shrink-0 text-black/40 dark:text-white/50" />
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
          placeholder="Search products..."
          className="w-full bg-transparent text-sm text-brand-black placeholder:text-black/35 focus:outline-none dark:text-white dark:placeholder:text-white/35"
        />
      </form>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] overflow-hidden rounded-xl border border-black/8 bg-white shadow-lg dark:border-white/10 dark:bg-[#151318]"
          >
            {suggestions.length ? (
              <ul className="max-h-64 divide-y divide-black/5 overflow-y-auto dark:divide-white/8">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition hover:bg-brand-pink/15"
                      onClick={() => commitSearch(item.name)}
                    >
                      <span className="text-sm font-medium text-brand-black dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-black/40 dark:text-white/45">
                        {item.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4 text-xs text-black/50 dark:text-white/50">
                Start typing to see suggestions...
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
