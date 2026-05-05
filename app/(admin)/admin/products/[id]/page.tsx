"use client";

import { AdminTitle } from "@/components/admin/AdminTitle";
import { ProductForm } from "@/components/admin/product/ProductForm";
import { useGetProductByIdQuery } from "@/store/api/productsApi";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";

export default function EditProductPage() {
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
        <AdminTitle title="Edit Product" subtitle="Loading product details…" />
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
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
        <AdminTitle title="Edit Product" subtitle="Couldn’t load this product." />
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-sm text-black/70">
            Something went wrong while fetching this product.
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
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
            >
              <IconArrowLeft className="h-4 w-4" stroke={2} />
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminTitle title="Edit Product" subtitle="Product not found." />
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
        >
          <IconArrowLeft className="h-4 w-4" stroke={2} />
          Back to products
        </Link>
      </div>
    );
  }

  const initialValues = {
    name: data.name,
    slug: data.slug,
    description: data.description ?? "",
    price: data.priceCents / 100,
    discountPrice: undefined,
    images: data.images ?? [],
    category: "embroidery",
    status: data.isActive ? "active" : "draft",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-6"
    >
      <AdminTitle title="Edit Product" subtitle="Update this product in your catalog" />

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <ProductForm productId={id} initialValues={{ ...initialValues }} />
        </div>
      </div>
    </motion.div>
  );
}

