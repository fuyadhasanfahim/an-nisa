"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconShoppingBagHeart, IconX } from "@tabler/icons-react";
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

            <div className="glass-strong absolute bottom-6 right-4 left-4 max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl sidebar-scroll md:static md:max-h-[75vh]">
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
                <ul className="space-y-3.5">
                  {lines.map((line) => (
                    <li
                      key={keyFor(line)}
                      className="rounded-xl border border-brand-pink/15 bg-white/70 p-4 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-brand-black">
                            {line.name}
                          </div>
                          {line.size ? (
                            <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-black/45">
                              Size {line.size}
                            </div>
                          ) : null}
                          <div className="mt-1.5 font-medium text-brand-black/70">
                            {formatBdtFromCents(line.unitCents)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-semibold uppercase tracking-wider text-rose-600 hover:text-rose-700"
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                productId: line.productId,
                                size: line.size ?? null,
                              })
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-black/45">
                          Qty
                          <select
                            className="mt-1 block w-20 rounded-lg border border-brand-pink/20 bg-white/80 px-2 py-1 text-xs text-brand-black focus:border-brand-pink focus:outline-none"
                            value={line.quantity}
                            onChange={(e) =>
                              dispatch(
                                setLineQuantity({
                                  productId: line.productId,
                                  size: line.size,
                                  quantity: Number(e.target.value),
                                })
                              )
                            }
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n}>{n}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-black/45">
                  Your cart awaits its first heirloom.
                </p>
              )}

              <footer className="mt-6 space-y-4 border-t border-brand-pink/15 pt-5">
                <div className="flex items-center justify-between text-brand-black">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/45">
                    Subtotal
                  </span>
                  <span className="font-serif text-xl font-semibold">
                    {formatBdtFromCents(subtotal)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className={cn(
                      "flex-1 rounded-xl text-xs py-2.5",
                      commerceBlocked && "opacity-65"
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
                    asChild
                  >
                    <Link href="/checkout">Secure checkout</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-4 text-xs py-2.5"
                    onClick={() => setOpen(false)}
                    asChild
                  >
                    <Link href="/#boutique-catalog">Continue curating</Link>
                  </Button>
                </div>
              </footer>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
