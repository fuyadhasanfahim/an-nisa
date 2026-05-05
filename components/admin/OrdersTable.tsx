"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";

type Row = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
};

const col = createColumnHelper<Row>();

const columns = [
  col.accessor("id", { header: "Order" }),
  col.accessor("status", { header: "Status" }),
  col.accessor("totalCents", {
    header: "Total",
    cell: (ctx) => `৳ ${(ctx.getValue() / 100).toFixed(2)}`,
  }),
  col.accessor("createdAt", { header: "Created" }),
];

export function OrdersTable() {
  // Wire up RTK Query endpoint when Orders API is ready.
  const rows: Row[] = [];
  return <DataTable data={rows} columns={columns} />;
}

