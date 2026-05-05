"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

export function DataTable<T>({
  data,
  columns,
}: {
  data: T[];
  // TanStack Table columns are heterogeneous in value type (string | number | ...).
  // Using `any` here is the ergonomic, library-recommended escape hatch.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="bg-[#f9fafb] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-black/55"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-black/2">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-t border-black/5 bg-white px-4 py-3 text-sm text-black/80"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="bg-white px-4 py-10 text-center text-sm text-black/55"
              >
                No data
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

