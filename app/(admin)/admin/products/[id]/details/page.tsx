"use client";

import { AdminTitle } from "@/components/admin/AdminTitle";
import { useGetProductByIdQuery } from "@/store/api/productsApi";
import Link from "next/link";
import { IconArrowLeft, IconRefresh, IconPencil } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function ProductDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const { data, isLoading, isError, refetch } = useGetProductByIdQuery(
    id ?? skipToken
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Product details" subtitle="Loading…" />
        <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <div className="grid gap-4">
            <div className="h-10 w-2/3 rounded-xl bg-black/5" />
            <div className="h-10 w-full rounded-xl bg-black/5" />
            <div className="h-28 w-full rounded-xl bg-black/5" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Product details" subtitle="Couldn’t load this product." />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            <IconRefresh className="h-4 w-4" stroke={2} />
            Retry
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10"
          >
            <IconArrowLeft className="h-4 w-4" stroke={2} />
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const p = data;

  const regularMajor = p.priceCents / 100;
  const discountCents = p.discountPriceCents;
  const hasDiscount =
    discountCents != null &&
    discountCents < p.priceCents &&
    discountCents >= 0;
  const saleMajor =
    hasDiscount && discountCents != null ? discountCents / 100 : null;
  const pctOff =
    hasDiscount && discountCents != null && p.priceCents > 0
      ? Math.round(((p.priceCents - discountCents) / p.priceCents) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminTitle
          title={p.name}
          subtitle="Read-only overview — edit to make changes."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/products/${p.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
          >
            <IconPencil className="h-4 w-4" stroke={2} />
            Edit
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10"
          >
            <IconArrowLeft className="h-4 w-4" stroke={2} />
            All products
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-6">
        <dl className="grid gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              SKU
            </dt>
            <dd className="mt-1 font-mono text-sm text-brand-black">
              {p.sku ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Slug
            </dt>
            <dd className="mt-1 font-mono text-sm text-black/80">{p.slug}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Price
            </dt>
            <dd className="mt-1 text-sm text-brand-black">
              {hasDiscount && saleMajor != null ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular-nums text-black/45 line-through">
                    ৳ {regularMajor.toFixed(2)}
                  </span>
                  <span className="font-semibold tabular-nums text-brand-black">
                    ৳ {saleMajor.toFixed(2)}
                  </span>
                  <span className="text-black/55">{p.currency}</span>
                  {pctOff != null && pctOff > 0 ? (
                    <span className="rounded-full bg-black/4 px-2 py-0.5 text-xs font-medium tabular-nums text-black/70">
                      {pctOff}% off
                    </span>
                  ) : null}
                </div>
              ) : (
                <>
                  ৳ {regularMajor.toFixed(2)} {p.currency}
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Status
            </dt>
            <dd className="mt-1 text-sm text-brand-black">
              {p.isActive ? "Active" : "Draft / hidden"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Inventory
            </dt>
            <dd className="mt-1 text-sm text-brand-black">
              {p.trackInventory
                ? `${p.stockQuantity} units in stock`
                : "Not tracked"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Created
            </dt>
            <dd className="mt-1 text-sm text-black/80">
              {format(parseISO(p.createdAt), "PPP")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
              Updated
            </dt>
            <dd className="mt-1 text-sm text-black/80">
              {format(parseISO(p.updatedAt), "PPP")}
            </dd>
          </div>
        </dl>

        {p.description ? (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/45">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-black/80">
              {p.description}
            </p>
          </div>
        ) : null}

        {p.images?.length ? (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/45">
              Images
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.images.map((url) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover ring-1 ring-black/5"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
