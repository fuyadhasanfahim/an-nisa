"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { useListProductsQuery } from "@/store/api/productsApi";
import Link from "next/link";
import { IconPencil, IconPlus } from "@tabler/icons-react";

type Row = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  isActive: boolean;
};

const col = createColumnHelper<Row>();

const columns = [
  col.accessor("name", {
    header: "Name",
    cell: (ctx) => <span className="font-medium">{ctx.getValue()}</span>,
  }),
  col.accessor("slug", { header: "Slug" }),
  col.accessor("priceCents", {
    header: "Price",
    cell: (ctx) => `৳ ${(ctx.getValue() / 100).toFixed(2)}`,
  }),
  col.accessor("isActive", {
    header: "Status",
    cell: (ctx) => (
      <span
        className={[
          "inline-flex items-center rounded-xl px-2 py-1 text-xs",
          ctx.getValue()
            ? "bg-[#fcc4c8]/35 text-black"
            : "bg-black/5 text-black/60",
        ].join(" ")}
      >
        {ctx.getValue() ? "Active" : "Hidden"}
      </span>
    ),
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (ctx) => (
      <div className="flex justify-end">
        <Link
          href={`/admin/products/${ctx.row.original.id}`}
          className={[
            "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
            "text-black/60 transition hover:bg-black/5 hover:text-brand-black",
            "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
          ].join(" ")}
        >
          <IconPencil className="h-4 w-4" stroke={2} />
          <span className="hidden sm:inline">Edit</span>
        </Link>
      </div>
    ),
  }),
];

export function ProductsTable() {
  const { data, isLoading } = useListProductsQuery();

  const rows: Row[] =
    data?.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceCents: p.priceCents,
      isActive: p.isActive,
    })) ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm">
        Loading…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="text-sm font-medium text-brand-black">No products yet</div>
        <div className="mt-1 text-sm text-black/60">
          Create your first product to start building your catalog.
        </div>

        <Link
          href="/admin/products/new"
          className={[
            "mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white",
            "shadow-sm transition hover:shadow-softSm hover:scale-[1.02] hover:bg-black",
            "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
          ].join(" ")}
        >
          <IconPlus className="h-[18px] w-[18px] text-white" stroke={2} />
          Create your first product
        </Link>
      </div>
    );
  }

  return <DataTable data={rows} columns={columns} />;
}

