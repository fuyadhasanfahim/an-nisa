"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconShoppingBagHeart, IconX, IconChevronDown, IconTrash } from "@tabler/icons-react";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import {
  removeFromCart,
  setLineQuantity,
  type CartLine,
} from "@/store/slices/boutiqueUISlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import { useBannedCommerce } from "@/hooks/useBannedCommerce";
import { useToast } from "@/components/shared/toast/useToast";
import { cn } from "@/lib/utils/cn";

function keyFor(line: Pick<CartLine, "productId" | "size">) {
  return `${line.productId}::${(line.size ?? "").trim()}`;
}

function CartQtyDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative inline-block text-left mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-1.5 rounded-full border border-[#fcc4c8]/60 bg-white px-3 py-1 text-xs font-bold text-brand-black shadow-sm transition-all duration-300 hover:border-[#fcc4c8] hover:bg-[#fcc4c8]/10 focus:ring-2 focus:ring-[#fcc4c8]/25 outline-none min-w-[70px] cursor-pointer"
      >
        <span>{value}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-brand-black transition-transform duration-300 shrink-0 ${
            open ? "rotate-180 text-[#fcc4c8]" : ""
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
            transition={{ duration: 0.12 }}
            className="absolute left-0 mt-1.5 w-20 rounded-xl border border-[#fcc4c8]/30 bg-white/95 p-1 shadow-lg backdrop-blur-md focus:outline-none z-40"
          >
            <div className="py-1 max-h-40 overflow-y-auto space-y-0.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-center rounded-lg py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    n === value
                      ? "bg-[#fcc4c8] text-brand-black shadow-sm"
                      : "text-black/75 hover:bg-[#fcc4c8]/25 hover:text-brand-black"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BoutiqueMiniCart() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const lines = useAppSelector((state) => state.boutiqueUi.cart);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitCents,
    0
  );
  const { commerceBlocked, message } = useBannedCommerce();
  const { toast } = useToast();

  const summary = useMemo(
    () => ({
      qty: count,
      subtotal,
    }),
    [count, subtotal]
  );

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open heirloom cart"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8]"
      >
        <IconShoppingBagHeart className="h-[20px] w-[20px] text-brand-black/75" stroke={1.8} />
        {summary.qty ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#fcc4c8] px-1 text-[10px] font-bold text-brand-black ring-2 ring-white shadow-sm">
            {summary.qty}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed inset-0 z-[120] md:absolute md:inset-auto md:right-0 md:top-[calc(100%+16px)] md:w-[360px]"
          >
            <button
              type="button"
              aria-label="Close cart overlay"
              className="fixed inset-0 bg-black/25 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
              onClick={() => setOpen(false)}
            />

            <div className="absolute bottom-6 right-4 left-4 max-h-[80vh] overflow-y-auto rounded-2xl bg-white border border-[#fcc4c8]/35 p-6 shadow-[0_12px_40px_rgba(252,196,200,0.15)] sidebar-scroll md:static md:max-h-[75vh]">
              <header className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">
                    Heirloom cart
                  </p>
                  <h3 className="font-serif text-xl font-medium text-brand-black">
                    {summary.qty} keepsakes
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close cart"
                  className="rounded-lg p-1.5 hover:bg-brand-pink/15"
                >
                  <IconX className="h-5 w-5 text-brand-black/70" />
                </button>
              </header>

              {lines.length ? (
                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={keyFor(line)}
                      className="rounded-xl border border-[#fcc4c8]/30 bg-white/75 p-3 text-sm flex items-center justify-between gap-3 shadow-sm hover:border-[#fcc4c8]/60 transition duration-300"
                    >
                      {/* Name & Size */}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-brand-black truncate">
                          {line.name}
                        </div>
                        {line.size ? (
                          <div className="text-[10px] font-bold uppercase tracking-wider text-black/45 mt-0.5">
                            Size: {line.size}
                          </div>
                        ) : null}
                      </div>

                      {/* Qty & Price & Action Trash Icon in one line */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Qty dropdown (compact) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black/45">QTY</span>
                          <CartQtyDropdown
                            value={line.quantity}
                            onChange={(val) =>
                              dispatch(
                                setLineQuantity({
                                  productId: line.productId,
                                  size: line.size,
                                  quantity: val,
                                })
                              )
                            }
                          />
                        </div>

                        {/* Price */}
                        <div className="font-bold text-brand-black text-xs min-w-[50px] text-right">
                          {formatBdtFromCents(line.quantity * line.unitCents)}
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                productId: line.productId,
                                size: line.size ?? null,
                              })
                            )
                          }
                          className="rounded-full p-1.5 text-rose-500 hover:bg-rose-50 transition cursor-pointer shrink-0"
                        >
                          <IconTrash className="h-4 w-4" stroke={2.0} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-black/45">
                  Your cart awaits its first heirloom.
                </p>
              )}

              <footer className="mt-6 space-y-4 border-t border-[#fcc4c8]/25 pt-5">
                <div className="flex items-center justify-between text-brand-black">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/45">
                    Subtotal
                  </span>
                  <span className="font-serif text-xl font-semibold">
                    {formatBdtFromCents(subtotal)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={cn(
                      "flex-1 rounded-full text-center text-xs py-3 font-bold uppercase tracking-wider transition-all duration-300 shadow-sm border-none cursor-pointer",
                      commerceBlocked
                        ? "bg-black/5 text-black/35 cursor-not-allowed shadow-none"
                        : "bg-[#fcc4c8] text-brand-black hover:bg-[#fcc4c8]/85 hover:scale-[1.01] active:scale-[0.99]"
                    )}
                    type="button"
                    disabled={!lines.length || commerceBlocked}
                    onClick={() => {
                      if (commerceBlocked) {
                        toast({
                          title: "Checkout paused",
                          message,
                          variant: "error",
                        });
                        return;
                      }
                      setOpen(false);
                    }}
                  >
                    <Link href="/checkout" className="block w-full h-full">Checkout</Link>
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-5 text-center text-xs py-3 font-bold uppercase tracking-wider border border-[#fcc4c8]/60 bg-white text-brand-black hover:bg-[#fcc4c8]/12 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/#boutique-catalog" className="block w-full h-full">Continue curating</Link>
                  </button>
                </div>
              </footer>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
