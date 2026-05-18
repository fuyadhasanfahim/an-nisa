import { Suspense } from "react";
import { ProductsTable } from "@/components/admin/ProductsTable";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";

function ProductsTableFallback() {
  return (
    <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm">
      Loading products…
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Products</h1>
      <div className="flex justify-end">
        <Link
          href="/admin/products/new"
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white",
            "shadow-sm transition hover:shadow-softSm hover:scale-[1.02] hover:bg-black",
            "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
            "sm:w-auto",
          ].join(" ")}
        >
          <IconPlus className="h-[18px] w-[18px] text-white" stroke={2} />
          Add Product
        </Link>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<ProductsTableFallback />}>
          <ProductsTable />
        </Suspense>
      </div>
    </div>
  );
}

