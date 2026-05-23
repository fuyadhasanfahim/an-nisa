"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutMutation } from "@/store/api/customerOrdersApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/boutiqueUISlice";
import { Container } from "@/components/shared/Container";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { authClient } from "@/lib/auth/auth-client";
import { useToast } from "@/components/shared/toast/useToast";
import { motion } from "framer-motion";
import { IconLock } from "@tabler/icons-react";
import { useBannedCommerce } from "@/hooks/useBannedCommerce";
import { cn } from "@/lib/utils/cn";

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
  const [shippingLocation, setShippingLocation] = useState<"inside" | "outside">("inside");
  const [trxId, setTrxId] = useState("");
  const walletPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+880 1789-555666";

  const subtotal = lines.reduce((s, line) => s + line.quantity * line.unitCents, 0);
  const shippingFee = Math.round(lines.length ? (shippingLocation === "inside" ? 6000 : 13000) : 0); // 60 BDT (6000 cents) inside, 130 BDT (13000 cents) outside

  async function submit() {
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=/checkout`);
      return;
    }
    if (!lines.length) {
      toast({ title: "Cart empty", message: "Nest a heirloom first.", variant: "error" });
      return;
    }
    if (!trxId.trim()) {
      toast({ title: "Transaction ID Required", message: "Please paste your advance payment TrxID.", variant: "error" });
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
        paymentMethod: "cod",
        paymentId: trxId.trim().toUpperCase(), // Store transaction ID of advance payment
        paymentCollectedVia: "cash",
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
      <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-20">
        <Container>
          <div className="py-24 text-center rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] max-w-lg mx-auto">
            <IconLock className="mx-auto h-14 w-14 text-[#fcc4c8]" />
            <p className="mt-6 font-serif text-2xl font-bold text-brand-black">Sign in to proceed</p>
            <p className="mt-2 text-sm text-black/55 font-semibold">Please authenticate to access the checkout gateway.</p>
            <Link
              href={`/sign-in?callbackUrl=/checkout`}
              className="mt-8 inline-block rounded-full bg-[#fcc4c8] text-brand-black font-bold text-xs uppercase tracking-wider px-10 py-3.5 transition-all duration-300 shadow-sm hover:bg-[#fcc4c8]/85 hover:scale-105 active:scale-95 border-none cursor-pointer select-none"
            >
              Sign In Now
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-14">
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
          <motion.div layout className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/45 font-serif">
                Concierge fulfillment
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-brand-black md:text-[2.6rem]">
                Checkout
              </h1>
            </div>

            <div className="space-y-6 rounded-[32px] border border-[#fcc4c8]/35 bg-white p-7 shadow-[0_12px_40px_rgba(252,196,200,0.08)]">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none">
                  Shipping address *
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-[#fcc4c8]/50 bg-white px-4 py-3 text-sm focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm text-brand-black font-semibold placeholder-black/35"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street address, apartment details, landmark description…"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none">
                    City *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-[#fcc4c8]/50 bg-white px-4 py-3 text-sm focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm text-brand-black font-semibold"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="e.g. Dhaka, Chittagong"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none">
                    WhatsApp ready phone *
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-2xl border border-[#fcc4c8]/50 bg-white px-4 py-3 text-sm focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm text-brand-black font-semibold"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="e.g. +880 1712-345678"
                  />
                </div>
              </div>

              {/* Delivery Area Options */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none">
                  Delivery Area *
                </label>
                <div className="grid gap-3 grid-cols-2">
                  {[
                    { id: "inside", label: "Inside Dhaka (৳60)" },
                    { id: "outside", label: "Outside Dhaka (৳130)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShippingLocation(opt.id as "inside" | "outside")}
                      className={cn(
                        "rounded-full px-4 py-3 text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center cursor-pointer",
                        shippingLocation === opt.id
                          ? "bg-[#fcc4c8] text-brand-black border-none font-bold shadow-sm scale-[1.01]"
                          : "border border-[#fcc4c8]/35 text-black/60 bg-white hover:bg-[#fcc4c8]/10 hover:border-[#fcc4c8]/60 font-semibold"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Value Payment Options */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none font-serif">
                  Product Value Payment Method
                </label>
                <div className="rounded-full bg-[#fcc4c8]/10 border border-[#fcc4c8]/30 px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand-black w-fit select-none">
                  💵 Cash on Delivery (COD)
                </div>
              </div>

              {/* Upfront Delivery Fee Notice Card */}
              <div className="rounded-2xl border border-[#fcc4c8]/40 bg-[#fffbfa] p-5 shadow-sm text-sm text-brand-black space-y-3">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-[#d37b82]">
                  <IconLock className="h-4 w-4" />
                  Advance Delivery Charge Payment Required
                </div>
                <p className="leading-relaxed font-semibold text-black/75">
                  To secure your shipment, please pay the delivery charge of{" "}
                  <span className="font-bold text-brand-black">৳{shippingLocation === "inside" ? 60 : 130}</span> in advance to our official personal wallet:
                </p>
                <div className="bg-white/80 rounded-xl p-3 border border-[#fcc4c8]/30 font-semibold text-xs space-y-1.5 text-black/80">
                  <div>📱 <span className="font-bold text-brand-black">bKash Personal:</span> {walletPhone} <span className="text-[#d37b82] font-bold ml-1">(Reference: An Nisa)</span></div>
                  <div>📱 <span className="font-bold text-brand-black">Nagad Personal:</span> {walletPhone} <span className="text-[#d37b82] font-bold ml-1">(Reference: An Nisa)</span></div>
                </div>
                <p className="text-xs text-black/55 font-medium leading-normal">
                  After sending the payment, copy the Transaction ID (TrxID) and paste it below to validate and complete your purchase.
                </p>
              </div>

              {/* Transaction ID Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/55 mb-2 select-none">
                  Payment Transaction ID (Advance Delivery Charge) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-2xl border border-[#fcc4c8]/50 bg-white px-4 py-3 text-sm focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm text-brand-black font-bold placeholder-black/25 uppercase"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g. 9K72B4D8X"
                />
              </div>

              <button
                type="button"
                className={cn(
                  "mt-8 w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm border-none cursor-pointer flex items-center justify-center",
                  commerceBlocked || !shippingAddress.trim() || !shippingCity.trim() || !shippingPhone.trim() || !trxId.trim()
                    ? "bg-black/5 text-black/35 cursor-not-allowed shadow-none"
                    : "bg-[#fcc4c8] text-brand-black hover:bg-[#fcc4c8]/85 hover:scale-[1.02] active:scale-[0.98]"
                )}
                disabled={commerceBlocked || !shippingAddress.trim() || !shippingCity.trim() || !shippingPhone.trim() || !trxId.trim()}
                onClick={() => void submit()}
              >
                Place Order
              </button>
              {commerceBlocked ? (
                <p className="text-center text-[11px] text-rose-600 font-semibold mt-2">{message}</p>
              ) : null}
            </div>
          </motion.div>

          <aside className="mt-10 lg:mt-0 space-y-6 rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] h-fit">
            <h2 className="font-serif text-2xl font-bold text-brand-black tracking-tight border-b border-[#fcc4c8]/25 pb-4 select-none">
              Heirloom bag
            </h2>
            {!lines.length ? (
              <p className="text-sm text-black/55 font-semibold">
                Your bag is empty →{" "}
                <Link className="text-brand-black underline underline-offset-4 hover:text-[#fcc4c8]" href="/">
                  return to gallery
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-[#fcc4c8]/20 text-sm">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.size}`} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-serif text-base font-semibold text-brand-black">{line.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#fcc4c8] mt-1">
                        {line.quantity} × {formatBdtFromCents(line.unitCents)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="space-y-3.5 border-t border-[#fcc4c8]/25 pt-6 text-sm font-semibold text-brand-black">
              <div className="flex justify-between text-black/55 font-semibold">
                <span>Subtotal</span>
                <span className="font-serif">{formatBdtFromCents(subtotal)}</span>
              </div>
              <div className="flex justify-between text-black/55 font-semibold">
                <span>Delivery Charge</span>
                <span className="font-serif">{formatBdtFromCents(shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-4 text-brand-black border-t border-[#fcc4c8]/15 select-none">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-serif font-bold text-brand-black">{formatBdtFromCents(subtotal + shippingFee)}</span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
