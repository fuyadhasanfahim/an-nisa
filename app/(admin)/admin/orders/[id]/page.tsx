"use client";

import { AdminTitle } from "@/components/admin/AdminTitle";
import { OrderForm } from "@/components/admin/order/OrderForm";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  ORDER_STATUSES,
  normalizePaymentMethod,
  normalizePaymentStatus,
  type OrderFormInput,
  type OrderStatus,
} from "@/lib/validators/order.schema";

function normalizeStatus(s: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s)
    ? (s as OrderStatus)
    : "pending";
}

export default function EditOrderPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const { data, isLoading, isError, refetch } = useGetOrderByIdQuery(
    id ?? skipToken
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Edit Order" subtitle="Loading order details…" />
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:p-10">
            <div className="grid gap-4">
              <div className="h-10 w-2/3 rounded-xl bg-black/5" />
              <div className="h-10 w-full rounded-xl bg-black/5" />
              <div className="h-28 w-full rounded-xl bg-black/5" />
              <div className="h-10 w-1/2 rounded-xl bg-black/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Edit Order" subtitle="Couldn’t load this order." />
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-sm text-black/70">
            Something went wrong while fetching this order.
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-softSm hover:scale-[1.02] hover:bg-black focus:outline-none focus:ring-2 focus:ring-brand-pink/40"
            >
              <IconRefresh className="h-4 w-4" stroke={2} />
              Retry
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
            >
              <IconArrowLeft className="h-4 w-4" stroke={2} />
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !id) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Edit Order" subtitle="Order not found." />
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
        >
          <IconArrowLeft className="h-4 w-4" stroke={2} />
          Back to orders
        </Link>
      </div>
    );
  }

  const initialValues: OrderFormInput = {
    userId: data.userId,
    status: normalizeStatus(data.status),
    items: data.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    })),
    shippingPhone: data.shippingPhone ?? "",
    shippingAddress: data.shippingAddress ?? "",
    shippingCity: data.shippingCity ?? "",
    shippingCountry: data.shippingCountry ?? "BD",
    discount: data.discountCents / 100,
    shippingFee: data.shippingFeeCents / 100,
    paymentMethod: normalizePaymentMethod(data.paymentMethod),
    paymentStatus: normalizePaymentStatus(data.paymentStatus),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-6"
    >
      <AdminTitle
        title="Edit Order"
        subtitle={`Order ${data.id.slice(0, 12)}… · ${data.items.length} line item(s)`}
      />

      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:p-10">
          <OrderForm
            orderId={id}
            initialValues={initialValues}
            initialCustomer={data.user}
          />
        </div>
      </div>
    </motion.div>
  );
}
