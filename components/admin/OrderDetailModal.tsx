"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import { IconX } from "@tabler/icons-react";
import {
  normalizePaymentCollectedVia,
  PAYMENT_COLLECTED_VIA_LABEL,
} from "@/lib/validators/order.schema";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

function moneyBdt(cents: number): string {
  return `৳ ${(cents / 100).toFixed(2)}`;
}

function orderPaymentLabel(method: string): string {
  switch (method) {
    case "cod":
      return "Cash on delivery";
    case "bkash":
      return "bKash";
    case "nagad":
      return "Nagad";
    case "card":
      return "Card";
    case "bank_transfer":
      return "Bank transfer";
    case "other":
      return "Other";
    default:
      return method || "—";
  }
}

type OrderDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
};

export function OrderDetailModal({
  open,
  onOpenChange,
  orderId,
}: OrderDetailModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetOrderByIdQuery(
    orderId ?? "",
    { skip: !open || !orderId }
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!mounted || !open || !orderId) return null;

  const errMsg =
    isError && error && typeof error === "object" && "data" in error
      ? String((error as { data?: { error?: string } }).data?.error ?? "")
      : "";

  const body = (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "relative flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col",
          "rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl",
          "ring-1 ring-black/10",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-serif text-lg font-medium tracking-tight text-brand-black"
            >
              Order details
            </h2>
            <p className="mt-1 break-all font-mono text-xs text-black/55">
              {orderId}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className={[
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-black/55",
              "ring-1 ring-black/10 transition hover:bg-black/5 hover:text-brand-black",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
            ].join(" ")}
            aria-label="Close"
          >
            <IconX className="h-5 w-5" stroke={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {isLoading ? (
            <div className="space-y-3 text-sm text-black/55">
              <p>Loading…</p>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-4 animate-pulse rounded bg-black/6"
                  />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200/70">
              <p className="font-medium">Couldn’t load this order.</p>
              {errMsg ? (
                <p className="mt-1 text-rose-700/90">{errMsg}</p>
              ) : null}
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 text-sm font-medium text-rose-900 underline-offset-2 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <div className="space-y-8 text-sm text-black/80">
              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Status
                  </p>
                  <p className="mt-1 capitalize text-brand-black">{data.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Payment
                  </p>
                  <p className="mt-1 text-brand-black">
                    {orderPaymentLabel(data.paymentMethod)}
                  </p>
                  <div className="mt-2">
                    <PaymentStatusBadge status={data.paymentStatus} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Payment ID
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-brand-black">
                    {data.paymentId?.trim() ? data.paymentId : "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Received via
                  </p>
                  <p className="mt-1 text-brand-black">
                    {
                      PAYMENT_COLLECTED_VIA_LABEL[
                        normalizePaymentCollectedVia(data.paymentCollectedVia)
                      ]
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Created
                  </p>
                  <p className="mt-1 text-brand-black">
                    {format(parseISO(data.createdAt), "PPp")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                    Updated
                  </p>
                  <p className="mt-1 text-brand-black">
                    {format(parseISO(data.updatedAt), "PPp")}
                  </p>
                </div>
              </section>

              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                  Customer
                </p>
                <p className="mt-1 font-mono text-sm uppercase tracking-wide text-black/70">
                  {data.customerPublicId ?? "—"}
                </p>
                <p className="mt-2 font-medium text-brand-black">{data.user.name}</p>
                <p className="text-black/65">{data.user.email}</p>
              </section>

              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                  Delivery
                </p>
                <dl className="mt-2 space-y-1.5">
                  {data.shippingPhone ? (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-black/45">Phone</dt>
                      <dd className="text-brand-black">{data.shippingPhone}</dd>
                    </div>
                  ) : null}
                  {data.shippingAddress ? (
                    <div>
                      <dt className="text-black/45">Address</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-brand-black">
                        {data.shippingAddress}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-black/45">City</dt>
                    <dd>{data.shippingCity ?? "—"}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-black/45">Country</dt>
                    <dd className="uppercase">{data.shippingCountry}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                  Line items
                </p>
                <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-black/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-black/3 text-xs text-black/55">
                      <tr>
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium tabular-nums">Qty</th>
                        <th className="px-3 py-2 font-medium tabular-nums">Unit</th>
                        <th className="px-3 py-2 font-medium tabular-nums">Line</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {data.items.map((it) => {
                        const line = it.unitCents * it.quantity;
                        return (
                          <tr key={it.id}>
                            <td className="px-3 py-2.5 font-medium text-brand-black">
                              {it.product.name}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-black/75">
                              {it.quantity}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-black/75">
                              {moneyBdt(it.unitCents)}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-black/85">
                              {moneyBdt(line)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-xl bg-black/2 px-4 py-3 ring-1 ring-black/6">
                <div className="space-y-2 tabular-nums">
                  <div className="flex justify-between gap-3">
                    <span className="text-black/55">Subtotal</span>
                    <span>{moneyBdt(data.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-black/55">Discount</span>
                    <span>− {moneyBdt(data.discountCents)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-black/55">Shipping</span>
                    <span>{moneyBdt(data.shippingFeeCents)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-black/10 pt-2 text-base font-semibold text-brand-black">
                    <span>Total</span>
                    <span>{moneyBdt(data.totalCents)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-black/45">{data.currency}</p>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
