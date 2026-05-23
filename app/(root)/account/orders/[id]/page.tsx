"use client";

import Link from "next/link";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "next/navigation";
import { useGetMyOrderQuery, useUpdateMyOrderMutation } from "@/store/api/customerOrdersApi";
import { Container } from "@/components/shared/Container";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/shared/toast/useToast";
import { useState, useEffect } from "react";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";

export default function BoutiqueOrderDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const { data, isLoading } = useGetMyOrderQuery(id ?? skipToken);
  const [updateOrder, { isLoading: isUpdating }] = useUpdateMyOrderMutation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPaymentId, setEditPaymentId] = useState("");
  const [editItems, setEditItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Sync state values when data arrives
  useEffect(() => {
    if (data) {
      setEditAddress(data.shippingAddress ?? "");
      setEditCity(data.shippingCity ?? "");
      setEditPhone(data.shippingPhone ?? "");
      setEditPaymentId(data.paymentId ?? "");
      setEditItems(data.items.map((it) => ({ productId: it.product.id, quantity: it.quantity })));
    }
  }, [data]);

  async function handleCancel() {
    if (!data) return;
    try {
      await updateOrder({ id: data.id, status: "cancelled" }).unwrap();
      setCancelDialogOpen(false);
      toast({ title: "Order Cancelled", message: "Your order thread has been gently cancelled.", variant: "success" });
    } catch (e: any) {
      toast({ title: "Failed to cancel", message: e.data?.error || "Please try again.", variant: "error" });
    }
  }

  async function handleSaveEdits() {
    if (!data) return;
    if (!editAddress.trim() || !editCity.trim() || !editPhone.trim()) {
      toast({ title: "Validation Error", message: "Shipping Address, City, and Phone are required.", variant: "error" });
      return;
    }
    try {
      await updateOrder({
        id: data.id,
        shippingAddress: editAddress,
        shippingCity: editCity,
        shippingPhone: editPhone,
        paymentId: editPaymentId,
        items: editItems,
      }).unwrap();
      setIsEditing(false);
      toast({ title: "Changes Saved", message: "Your shipping information and item quantities were updated successfully.", variant: "success" });
    } catch (e: any) {
      toast({ title: "Failed to update", message: e.data?.error || "Please try again.", variant: "error" });
    }
  }

  if (!id || isLoading) {
    return (
      <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-20">
        <Container>
          <div className="py-20 text-center rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] max-w-lg mx-auto text-sm text-black/55 font-semibold animate-pulse">
            Gathering stitch ledger…
          </div>
        </Container>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-20">
        <Container>
          <div className="py-20 text-center rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] max-w-lg mx-auto text-sm text-black/55 font-semibold">
            Order not traced. Try returning to the{" "}
            <Link href="/account/orders" className="text-brand-black underline hover:text-[#fcc4c8]">
              orders lounge
            </Link>
            .
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-14">
      <Container>
        <div className="py-8 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/45 font-serif">
                Receipt thread
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-brand-black md:text-[2.6rem]">
                Invoice for {data.id}
              </h1>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#fcc4c8]/60 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black hover:bg-[#fcc4c8]/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-sm cursor-pointer select-none"
            >
              All orders
            </Link>
          </div>

          <section className="grid gap-8 rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] md:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 border-b border-[#fcc4c8]/25 pb-2 select-none">
                Recipient Details
              </div>
              
              <div className="mt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-black/55 mb-1.5 select-none">
                        Shipping Address *
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-[#fcc4c8]/50 bg-white px-3 py-2 text-xs focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-brand-black font-semibold placeholder-black/30"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Street details..."
                      />
                    </div>
                    <div className="grid gap-3 grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-black/55 mb-1.5 select-none">
                          City *
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-[#fcc4c8]/50 bg-white px-3 py-2 text-xs focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-brand-black font-semibold"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-black/55 mb-1.5 select-none">
                          Phone *
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-[#fcc4c8]/50 bg-white px-3 py-2 text-xs focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-brand-black font-semibold"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-black/55 mb-1.5 select-none">
                        Transaction ID (Advance Payment)
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-[#fcc4c8]/50 bg-white px-3 py-2 text-xs focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all text-brand-black font-bold uppercase"
                        value={editPaymentId}
                        onChange={(e) => setEditPaymentId(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-3.5 border-t border-[#fcc4c8]/25 pt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-black/55 select-none">
                        Order Item Quantities
                      </label>
                      <div className="space-y-2">
                        {data.items.map((item) => {
                          const currentQty = editItems.find((it) => it.productId === item.product.id)?.quantity ?? item.quantity;
                          return (
                            <div key={item.id} className="flex items-center justify-between text-xs bg-[#fcc4c8]/5 border border-[#fcc4c8]/15 rounded-2xl p-3 select-none">
                              <span className="font-serif font-bold text-brand-black pr-2 truncate">{item.product.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  className="h-7 w-7 rounded-full bg-white border border-[#fcc4c8]/40 hover:bg-[#fcc4c8]/10 flex items-center justify-center font-bold text-brand-black cursor-pointer shadow-sm active:scale-[0.9] transition-transform select-none"
                                  onClick={() => {
                                    setEditItems((prev) =>
                                      prev.map((it) =>
                                        it.productId === item.product.id
                                          ? { ...it, quantity: Math.max(1, it.quantity - 1) }
                                          : it
                                      )
                                    );
                                  }}
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-sm text-brand-black">{currentQty}</span>
                                <button
                                  type="button"
                                  className="h-7 w-7 rounded-full bg-white border border-[#fcc4c8]/40 hover:bg-[#fcc4c8]/10 flex items-center justify-center font-bold text-brand-black cursor-pointer shadow-sm active:scale-[0.9] transition-transform select-none"
                                  onClick={() => {
                                    setEditItems((prev) =>
                                      prev.map((it) =>
                                        it.productId === item.product.id
                                          ? { ...it, quantity: it.quantity + 1 }
                                          : it
                                      )
                                    );
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void handleSaveEdits()}
                        className="rounded-full bg-[#fcc4c8] hover:bg-[#fcc4c8]/85 text-brand-black font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-full border border-[#fcc4c8]/60 bg-white hover:bg-[#fcc4c8]/10 text-brand-black font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-brand-black">
                      <div className="text-lg font-serif font-bold">{data.user.name}</div>
                      <div className="mt-1 text-sm font-semibold text-black/60">{data.user.email}</div>
                    </div>
                    <div className="mt-6 text-xs text-black/60 font-semibold space-y-2">
                      {data.shippingPhone ? <div>📱 Phone • {data.shippingPhone}</div> : null}
                      {data.shippingAddress ? <div className="mt-2">📍 Address • {data.shippingAddress}</div> : null}
                      {data.shippingCity ? <div className="mt-1">🌆 City • {data.shippingCity}</div> : null}
                      {data.paymentId ? <div className="mt-1">🔑 Payment TrxID • <span className="font-bold uppercase">{data.paymentId}</span></div> : null}
                    </div>
                    {data.status === "pending" ? (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="rounded-full border border-[#fcc4c8]/60 bg-white hover:bg-[#fcc4c8]/10 text-brand-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Edit Details
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setCancelDialogOpen(true)}
                          className="rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 border-b border-[#fcc4c8]/25 pb-2 select-none">
                Order status
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <div className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#fcc4c8]/10 text-brand-black border border-[#fcc4c8]/25 select-none w-fit">
                  {data.status}
                </div>
                <div className="mt-3 text-xs font-semibold text-black/60">
                  💳 Payment • {data.paymentMethod} / {data.paymentStatus}
                </div>
              </div>
              {data.invoice ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`/api/invoices/${data.invoice.id}/pdf`}
                    className="rounded-full bg-[#fcc4c8] hover:bg-[#fcc4c8]/85 text-brand-black font-bold text-xs uppercase tracking-wider px-6 py-3 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center select-none border-none"
                  >
                    Download PDF
                  </a>
                  <button
                    type="button"
                    className="rounded-full border border-[#fcc4c8]/60 bg-white hover:bg-[#fcc4c8]/10 text-brand-black font-bold text-xs uppercase tracking-wider px-6 py-3 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center select-none"
                    onClick={() => window.print()}
                  >
                    Print keepsake
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-xs text-black/45 font-semibold">
                  Invoice will appear once the atelier finalizes accounting.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 pb-6">
                    <th className="pb-4 select-none">Keepsake</th>
                    <th className="pb-4 select-none">Qty</th>
                    <th className="pb-4 select-none">Unit</th>
                    <th className="pb-4 select-none">Line sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fcc4c8]/20">
                  {data.items.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="py-5 font-serif text-base font-bold text-brand-black">{item.product.name}</td>
                      <td className="py-5 font-semibold text-black/75">{item.quantity}</td>
                      <td className="py-5 font-semibold text-black/75 font-serif">{formatBdtFromCents(item.unitCents, data.currency)}</td>
                      <td className="py-5 font-semibold text-brand-black font-serif">{formatBdtFromCents(item.unitCents * item.quantity, data.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 ml-auto grid w-full max-w-sm gap-3.5 text-sm font-semibold text-brand-black md:text-[15px] border-t border-[#fcc4c8]/25 pt-6">
              <div className="flex justify-between text-black/55 font-semibold">
                <span>Subtotal</span>
                <span className="font-serif">{formatBdtFromCents(data.subtotalCents, data.currency)}</span>
              </div>
              {data.discountCents > 0 ? (
                <div className="flex justify-between text-black/55 font-semibold">
                  <span>Courtesy trims</span>
                  <span className="font-serif">− {formatBdtFromCents(data.discountCents, data.currency)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-black/55 font-semibold">
                <span>Delivery Charge</span>
                <span className="font-serif">{formatBdtFromCents(data.shippingFeeCents, data.currency)}</span>
              </div>
              <div className="flex justify-between pt-4 text-brand-black border-t border-[#fcc4c8]/15 select-none">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-serif font-bold text-brand-black">{formatBdtFromCents(data.totalCents, data.currency)}</span>
              </div>
            </div>
          </section>
        </div>
      </Container>
      
      <ConfirmAlertDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Keepsake Order?"
        description="Are you absolutely sure you want to wind down and cancel this pending order? This action cannot be undone."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        variant="destructive"
        loading={isUpdating}
        onConfirm={handleCancel}
      />
    </main>
  );
}
