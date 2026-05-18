"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutMutation } from "@/store/api/customerOrdersApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/boutiqueUISlice";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { authClient } from "@/lib/auth/auth-client";
import { useToast } from "@/components/shared/toast/useToast";
import { motion } from "framer-motion";
import { IconLock } from "@tabler/icons-react";
import { useBannedCommerce } from "@/hooks/useBannedCommerce";

export default function BoutiqueCheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const lines = useAppSelector((state) => state.boutiqueUi.cart);
  const dispatch = useAppDispatch();
  const [checkout] = useCheckoutMutation();
  const { toast } = useToast();
  const { commerceBlocked, message } = useBannedCommerce();

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad">("cod");

  const subtotal = lines.reduce((s, line) => s + line.quantity * line.unitCents, 0);
  const shippingFee = Math.round(lines.length ? 450 : 0);

  async function submit() {
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=/checkout`);
      return;
    }
    if (!lines.length) {
      toast({ title: "Cart empty", message: "Nest a heirloom first.", variant: "error" });
      return;
    }
    if (commerceBlocked) {
      toast({
        title: "Checkout paused",
        message,
        variant: "error",
      });
      return;
    }
    try {
      await checkout({
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        shippingAddress,
        shippingCity,
        shippingPhone: shippingPhone || null,
        shippingCountry: "BD",
        discount: 0,
        shippingFee: shippingFee / 100,
        paymentMethod,
        paymentId: paymentMethod === "cod" ? "COD" : "PENDING_TRANSFER",
        paymentCollectedVia:
          paymentMethod === "bkash"
            ? "bkash"
            : paymentMethod === "nagad"
              ? "nagad"
              : "cash",
      }).unwrap();
      toast({
        title: "Order luminous",
        message: "We’ll send thread updates from the atelier.",
        variant: "success",
      });
      dispatch(clearCart());
      router.push("/account/orders");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? (e as { data?: { error?: string } }).data?.error
          : undefined;
      toast({
        title: "Couldn’t weave order",
        message: msg ?? "Try again softly.",
        variant: "error",
      });
    }
  }

  useEffect(() => {
    if (commerceBlocked) {
      toast({ title: "Checkout paused", message, variant: "error" });
    }
  }, [commerceBlocked, message, toast]);

  if (!isPending && !session?.user) {
    return (
      <main className="flex-1">
        <Container>
          <div className="py-28 text-center text-sm">
            <IconLock className="mx-auto h-14 w-14 text-brand-pink/80" />
            <p className="mt-6 text-lg font-serif text-brand-black dark:text-white">Sign in to proceed</p>
            <Button asChild className="mt-8 rounded-full px-11">
              <Link href={`/sign-in?callbackUrl=/checkout`}>Open session</Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <Container>
        <div className="py-16 lg:grid lg:grid-cols-[1fr_360px] lg:gap-12">
          <motion.div layout className="space-y-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/53 dark:text-white/62">
                Concierge fulfillment
              </p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-brand-black dark:text-white md:text-[2.8rem]">
                Secure heirloom checkout
              </h1>
            </div>

            <div className="space-y-5 rounded-[32px] border border-black/12 bg-[color-mix(in_srgb,var(--background)_96%,white)] px-7 py-7 shadow-soft dark:border-white/12 dark:bg-black/42">
              <label className="grid gap-2 text-sm font-semibold text-brand-black dark:text-white">
                Shipping address *
                <textarea
                  rows={5}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-inner shadow-black/[0.04] dark:border-white/15 dark:bg-black/72 dark:text-white"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street, postal notes, gifting instructions…"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-brand-black dark:text-white">
                  City *
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-4 py-[0.8rem] text-sm dark:border-white/15 dark:bg-black/72 dark:text-white"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-black dark:text-white">
                  WhatsApp ready phone
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-4 py-[0.8rem] text-sm dark:border-white/15 dark:bg-black/72 dark:text-white"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold text-brand-black dark:text-white">Payment cadence</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {[
                    { id: "cod", label: "Cash on Delivery" },
                    { id: "bkash", label: "bKash" },
                    { id: "nagad", label: "Nagad" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id as typeof paymentMethod)}
                      className={`rounded-[22px] border px-5 py-[0.8rem] text-xs font-semibold uppercase tracking-[0.18em] ${
                        paymentMethod === opt.id
                          ? "border-brand-pink bg-brand-pink/35"
                          : "border-black/12 dark:border-white/15"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                className="mt-8 w-full rounded-full py-[1rem] text-[11px] font-semibold uppercase tracking-[0.18em]"
                disabled={commerceBlocked || !shippingAddress.trim() || !shippingCity.trim()}
                onClick={() => void submit()}
              >
                Lace this order securely
              </Button>
              {commerceBlocked ? (
                <p className="text-center text-[11px] text-rose-600">{message}</p>
              ) : null}
            </div>
          </motion.div>

          <aside className="mt-10 space-y-5 rounded-[34px] border border-black/10 bg-white px-8 py-8 shadow-soft dark:border-white/12 dark:bg-black/40 lg:mt-0">
            <h2 className="font-serif text-2xl text-brand-black dark:text-white">Heirloom bag</h2>
            {!lines.length ? (
              <p className="text-sm text-black/65 dark:text-white/70">
                Cart is empty →{" "}
                <Link className="text-brand-black underline underline-offset-4 dark:text-white" href="/#boutique-catalog">
                  glide back into the grid
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-black/12 text-sm dark:divide-white/10">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.size}`} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-semibold text-brand-black dark:text-white">{line.name}</div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-black/50 dark:text-white/62">
                        {line.quantity} × {formatBdtFromCents(line.unitCents)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-2 text-sm font-semibold text-brand-black dark:text-white">
              <div className="flex justify-between text-black/72 dark:text-white/75">
                <span>Tactile goods</span>
                <span>{formatBdtFromCents(subtotal)}</span>
              </div>
              <div className="flex justify-between text-black/72 dark:text-white/75">
                <span>Careful courier</span>
                <span>{formatBdtFromCents(shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-6 text-xl">
                <span>Total</span>
                <span>{formatBdtFromCents(subtotal + shippingFee)}</span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
