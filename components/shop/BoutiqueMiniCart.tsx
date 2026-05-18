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
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-softSm transition hover:shadow-soft dark:border-white/15 dark:bg-white/10"
      >
        <IconShoppingBagHeart className="h-6 w-6 text-brand-black dark:text-white" />
        {summary.qty ? (
          <span className="absolute -top-2 -right-1 min-w-[24px] rounded-full bg-brand-pink px-2 text-[11px] font-semibold text-brand-black">
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
              className="fixed inset-0 bg-black/45 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
              onClick={() => setOpen(false)}
            />

            <div className="absolute bottom-6 right-4 left-4 max-h-[80vh] overflow-y-auto rounded-[32px] border border-black/10 bg-white px-7 py-7 shadow-soft dark:border-white/10 dark:bg-brand-black md:static md:max-h-[75vh]">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/50 dark:text-white/65">
                    Heirloom cart
                  </p>
                  <h3 className="font-serif text-2xl text-brand-black dark:text-white">
                    {summary.qty} keepsakes
                  </h3>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close cart">
                  <IconX />
                </button>
              </header>

              {lines.length ? (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <li
                      key={keyFor(line)}
                      className="rounded-2xl border border-black/10 p-4 text-sm dark:border-white/12"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-brand-black dark:text-white">
                            {line.name}
                          </div>
                          {line.size ? (
                            <div className="text-xs uppercase tracking-[0.18em] text-black/54 dark:text-white/55">
                              Size {line.size}
                            </div>
                          ) : null}
                          <div className="mt-2 text-[13px] text-black/60 dark:text-white/65">
                            {formatBdtFromCents(line.unitCents)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-xs uppercase tracking-[0.18em] text-rose-600"
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
                      <div className="mt-4 flex items-center gap-4">
                        <label className="text-xs uppercase tracking-[0.18em] text-black/53 dark:text-white/62">
                          Qty
                          <select
                            className="mt-1 w-full rounded-2xl border border-black/10 bg-transparent px-2 py-1 text-brand-black dark:border-white/12 dark:text-white"
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
                <p className="text-sm text-black/62 dark:text-white/70">
                  Your cart awaits its first heirloom.
                </p>
              )}

              <footer className="mt-8 space-y-4 border-t border-black/12 pt-6 dark:border-white/12">
                <div className="flex items-center justify-between text-brand-black dark:text-white">
                  <span className="text-sm uppercase tracking-[0.22em]">Subtotal</span>
                  <span className="font-serif text-2xl">{formatBdtFromCents(subtotal)}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className={cn(
                      "flex-1 rounded-full",
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
                    className="rounded-full px-5"
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
