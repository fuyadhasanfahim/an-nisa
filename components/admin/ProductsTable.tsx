"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import {
  useDeleteProductMutation,
  useListProductsQuery,
  usePatchProductMutation,
} from "@/store/api/productsApi";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconEye, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/shared/toast/useToast";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import {
  PRODUCT_PAGE_SIZES,
  PRODUCT_SORT_FIELDS,
  normalizeProductListQuery,
  type ProductListQuery,
  type ProductListSortField,
  type ProductPageSize,
} from "@/lib/validators/product-list.query";
import { adminControlClass, FormSelect } from "@/components/admin/form";

const SORT_OPTIONS: {
  value: `${ProductListSortField}:${"asc" | "desc"}`;
  label: string;
}[] = [
  { value: "createdAt:desc", label: "Newest created" },
  { value: "createdAt:asc", label: "Oldest created" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "updatedAt:asc", label: "Least recently updated" },
  { value: "priceCents:desc", label: "Price: high to low" },
  { value: "priceCents:asc", label: "Price: low to high" },
  { value: "ratingAverage:desc", label: "Rating average: high → low" },
  { value: "ratingCount:desc", label: "Most reviewed" },
];

function sortTupleFromSelect(
  v: string
): { sort: ProductListSortField; order: "asc" | "desc" } {
  const idx = v.indexOf(":");
  if (idx === -1) return { sort: "createdAt", order: "desc" };
  const sort = v.slice(0, idx) as ProductListSortField;
  const order = v.slice(idx + 1) as "asc" | "desc";
  if (
    !PRODUCT_SORT_FIELDS.includes(sort as ProductListSortField) ||
    (order !== "asc" && order !== "desc")
  ) {
    return { sort: "createdAt", order: "desc" };
  }
  return { sort, order };
}

function listQueryToSearchString(p: ProductListQuery): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  sp.set("sort", p.sort);
  sp.set("order", p.order);
  sp.set("page", String(p.page));
  sp.set("limit", String(p.limit));
  return sp.toString();
}

const fieldClass = adminControlClass;

type Row = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  priceCents: number;
  isActive: boolean;
  stockQuantity: number;
  trackInventory: boolean;
  createdAt: string;
};

function ProductStatusCell({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const { toast } = useToast();
  const [patch, { isLoading }] = usePatchProductMutation();

  const onToggle = useCallback(
    async (next: boolean) => {
      try {
        await patch({ id: productId, body: { isActive: next } }).unwrap();
        toast({
          title: next ? "Product activated" : "Product hidden",
          message: next
            ? "It will show as active in your catalog."
            : "It will show as inactive until you turn it back on.",
          variant: "success",
        });
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "data" in e
            ? String((e as { data?: { error?: string } }).data?.error ?? "")
            : "";
        toast({
          title: "Couldn’t update status",
          message: msg || "Something went wrong. Try again.",
          variant: "error",
        });
      }
    },
    [patch, productId, toast]
  );

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isActive}
        disabled={isLoading}
        aria-label={isActive ? "Deactivate product" : "Activate product"}
        onChange={(v) => void onToggle(v)}
      />
      <span className="text-xs tabular-nums text-black/55">
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

function ProductActionsCell({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const comboBtn =
    "grid h-9 w-9 place-items-center text-black/65 transition hover:bg-black/[0.04] hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40 disabled:opacity-50";

  const comboBtnFirst = "rounded-l-xl";
  const comboBtnMid = "";
  const comboBtnLast = "rounded-r-xl";

  const performDelete = useCallback(async () => {
    try {
      await deleteProduct(productId).unwrap();
      toast({
        title: "Product deleted",
        message: "Removed from the catalog.",
        variant: "success",
      });
      setDeleteOpen(false);
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? String((e as { data?: { error?: string } }).data?.error ?? "")
          : "";
      toast({
        title: "Couldn’t delete product",
        message: msg || "Something went wrong.",
        variant: "error",
      });
    }
  }, [deleteProduct, productId, router, toast]);

  return (
    <>
      <ConfirmAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="destructive"
        title="Delete this product?"
        description="It will be removed from your catalog. If it is still linked to existing orders, deletion will not be allowed."
        confirmLabel="Delete product"
        cancelLabel="Cancel"
        loading={isLoading}
        onConfirm={performDelete}
      />
      <div className="flex justify-end">
        <div
          className={[
            "inline-flex rounded-xl bg-white",
            "shadow-sm ring-1 ring-black/10",
            "divide-x divide-black/10",
          ].join(" ")}
        >
          <Link
            href={`/admin/products/${productId}`}
            className={`${comboBtn} ${comboBtnFirst}`}
            title="Edit"
            aria-label="Edit product"
          >
            <IconPencil className="h-4 w-4" stroke={2} />
          </Link>
          <button
            type="button"
            className={`${comboBtn} ${comboBtnMid}`}
            title="Delete"
            aria-label="Delete product"
            disabled={isLoading}
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash className="h-4 w-4" stroke={2} />
          </button>
          <Link
            href={`/admin/products/${productId}/details`}
            className={`${comboBtn} ${comboBtnLast}`}
            title="Details"
            aria-label="Product details"
          >
            <IconEye className="h-4 w-4" stroke={2} />
          </Link>
        </div>
      </div>
    </>
  );
}

function buildColumns(col: ReturnType<typeof createColumnHelper<Row>>) {
  return [
    col.accessor("name", {
      header: "Name",
      cell: (ctx) => <span className="font-medium">{ctx.getValue()}</span>,
    }),
    col.accessor("slug", { header: "Slug" }),
    col.accessor("sku", {
      header: "SKU",
      cell: (ctx) => {
        const v = ctx.getValue();
        return v ? (
          <span className="font-mono text-xs text-black/90">{v}</span>
        ) : (
          <span className="text-black/40">—</span>
        );
      },
    }),
    col.accessor("priceCents", {
      header: "Price",
      cell: (ctx) => `৳ ${(ctx.getValue() / 100).toFixed(2)}`,
    }),
    col.display({
      id: "stock",
      header: "Stock",
      cell: (ctx) => {
        const tr = ctx.row.original.trackInventory;
        const q = ctx.row.original.stockQuantity;
        if (!tr) {
          return <span className="text-black/45">—</span>;
        }
        return (
          <span className="tabular-nums text-black/85">{q}</span>
        );
      },
    }),
    col.display({
      id: "status",
      header: "Status",
      cell: (ctx) => (
        <ProductStatusCell
          productId={ctx.row.original.id}
          isActive={ctx.row.original.isActive}
        />
      ),
    }),
    col.accessor("createdAt", {
      header: "Created",
      cell: (ctx) => format(parseISO(ctx.getValue()), "PPP"),
    }),
    col.display({
      id: "actions",
      header: () => <div className="text-end">Actions</div>,
      cell: (ctx) => <ProductActionsCell productId={ctx.row.original.id} />,
    }),
  ];
}

export function ProductsTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const listQuery = useMemo(
    () =>
      normalizeProductListQuery({
        q: searchParams.get("q"),
        sort: searchParams.get("sort"),
        order: searchParams.get("order"),
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
      }),
    [searchParams]
  );

  const { data, isLoading, isFetching } = useListProductsQuery({
    ...listQuery,
    includeInactive: true,
  });

  const [searchDraft, setSearchDraft] = useState(listQuery.q);
  useEffect(() => {
    startTransition(() => {
      setSearchDraft(listQuery.q);
    });
  }, [listQuery.q, startTransition]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const nextQ = searchDraft.trim().slice(0, 200);
      if (nextQ === listQuery.q) return;
      const next: ProductListQuery = {
        ...listQuery,
        q: nextQ,
        page: 1,
      };
      router.replace(`${pathname}?${listQueryToSearchString(next)}`);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchDraft, listQuery, pathname, router]);

  const pushQuery = useCallback(
    (patch: Partial<ProductListQuery>) => {
      const next = { ...listQuery, ...patch };
      router.replace(`${pathname}?${listQueryToSearchString(next)}`);
    },
    [listQuery, pathname, router]
  );

  const col = useMemo(() => createColumnHelper<Row>(), []);
  const columns = useMemo(() => buildColumns(col), [col]);

  const rows: Row[] =
    data?.items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      priceCents: p.priceCents,
      isActive: p.isActive,
      stockQuantity: p.stockQuantity,
      trackInventory: p.trackInventory,
      createdAt: p.createdAt,
    })) ?? [];

  const sortSelectValue = `${listQuery.sort}:${listQuery.order}` as (typeof SORT_OPTIONS)[number]["value"];

  const rangeStart = data?.total ? (data.page - 1) * data.limit + 1 : 0;
  const rangeEnd = data?.total
    ? Math.min(data.page * data.limit, data.total)
    : 0;

  if (isLoading && !data) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm">
        Loading…
      </div>
    );
  }

  if (data && data.total === 0 && !listQuery.q) {
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

  return (
    <div className="space-y-4">
      <div
        className={[
          "flex flex-col gap-4",
          "sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        ].join(" ")}
      >
        <label className="grid min-w-0 gap-1.5 sm:min-w-[220px] sm:flex-1">
          <span className="text-xs font-medium text-black/55">Search</span>
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Name, slug, or SKU…"
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        <label className="grid w-full gap-1.5 sm:w-52">
          <span className="text-xs font-medium text-black/55">Sort</span>
          <FormSelect
            value={sortSelectValue}
            onChange={(e) => {
              const { sort, order } = sortTupleFromSelect(e.target.value);
              pushQuery({ sort, order, page: 1 });
            }}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FormSelect>
        </label>
        <label className="grid w-full gap-1.5 sm:w-36">
          <span className="text-xs font-medium text-black/55">Per page</span>
          <FormSelect
            value={listQuery.limit}
            onChange={(e) => {
              const n = Number(e.target.value);
              const limit: ProductPageSize =
                n === 50 || n === 100 ? n : 20;
              pushQuery({ limit, page: 1 });
            }}
            aria-label="Products per page"
          >
            {PRODUCT_PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </FormSelect>
        </label>
      </div>

      {data && data.total === 0 && listQuery.q ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-black/60 shadow-sm ring-1 ring-black/5">
          No products match &ldquo;{listQuery.q}&rdquo;. Try a different search.
        </div>
      ) : (
        <div
          className={[
            "transition-opacity",
            isFetching ? "opacity-70" : "opacity-100",
          ].join(" ")}
        >
          <DataTable data={rows} columns={columns} />
        </div>
      )}

      {data && data.total > 0 ? (
        <div
          className={[
            "flex flex-col gap-3 rounded-xl bg-white px-4 py-3 text-sm text-black/65 shadow-sm ring-1 ring-black/5",
            "sm:flex-row sm:items-center sm:justify-between",
          ].join(" ")}
        >
          <p className="tabular-nums">
            Showing {rangeStart}–{rangeEnd} of {data.total}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => pushQuery({ page: data.page - 1 })}
              className={[
                "inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand-black",
                "ring-1 ring-black/10 transition hover:bg-black/5",
                "disabled:cursor-not-allowed disabled:opacity-45",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
              ].join(" ")}
            >
              <IconChevronLeft className="h-4 w-4" stroke={2} />
              Previous
            </button>
            <span className="px-1 tabular-nums">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={data.page >= data.totalPages}
              onClick={() => pushQuery({ page: data.page + 1 })}
              className={[
                "inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand-black",
                "ring-1 ring-black/10 transition hover:bg-black/5",
                "disabled:cursor-not-allowed disabled:opacity-45",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
              ].join(" ")}
            >
              Next
              <IconChevronRight className="h-4 w-4" stroke={2} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
