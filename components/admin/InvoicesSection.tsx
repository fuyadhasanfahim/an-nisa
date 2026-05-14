"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import {
  useCreateInvoiceMutation,
  useListInvoicesQuery,
} from "@/store/api/invoicesApi";
import { useListOrdersQuery } from "@/store/api/ordersApi";
import Link from "next/link";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/shared/toast/useToast";
import {
  INVOICE_PAGE_SIZES,
  normalizeInvoiceListQuery,
  type InvoiceListQuery,
  type InvoiceListSortField,
  type InvoicePageSize,
} from "@/lib/validators/invoice-list.query";
import type { OrderListQuery } from "@/lib/validators/order-list.query";
import { adminControlClass, FormSelect } from "@/components/admin/form";

const SORT_OPTIONS: {
  value: `${InvoiceListSortField}:${"asc" | "desc"}`;
  label: string;
}[] = [
  { value: "issuedAt:desc", label: "Newest issued" },
  { value: "issuedAt:asc", label: "Oldest issued" },
  { value: "number:asc", label: "Invoice # A–Z" },
  { value: "number:desc", label: "Invoice # Z–A" },
  { value: "totalCents:desc", label: "Total: high to low" },
  { value: "totalCents:asc", label: "Total: low to high" },
];

function sortTupleFromSelect(v: string): {
  sort: InvoiceListSortField;
  order: "asc" | "desc";
} {
  const idx = v.indexOf(":");
  if (idx === -1) return { sort: "issuedAt", order: "desc" };
  const sort = v.slice(0, idx) as InvoiceListSortField;
  const order = v.slice(idx + 1) as "asc" | "desc";
  const allowedSort = ["issuedAt", "number", "totalCents"] as const;
  if (
    !(allowedSort as readonly string[]).includes(sort) ||
    (order !== "asc" && order !== "desc")
  ) {
    return { sort: "issuedAt", order: "desc" };
  }
  return { sort, order };
}

function listQueryToSearchString(p: InvoiceListQuery): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  sp.set("sort", p.sort);
  sp.set("order", p.order);
  sp.set("page", String(p.page));
  sp.set("limit", String(p.limit));
  return sp.toString();
}

const UNINVOICED_ORDERS_QUERY: OrderListQuery = {
  q: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
  limit: 50,
  withoutInvoice: true,
};

type InvoiceRow = {
  id: string;
  number: string;
  orderId: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  issuedAt: string;
};

function IssueInvoicePanel() {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const { data, isLoading } = useListOrdersQuery(UNINVOICED_ORDERS_QUERY);
  const [createInvoice, { isLoading: creating }] = useCreateInvoiceMutation();

  const orders = data?.items ?? [];

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!orderId.trim()) return;
      try {
        await createInvoice({ orderId: orderId.trim() }).unwrap();
        toast({
          title: "Invoice issued",
          message: "You can download the PDF from the table below.",
          variant: "success",
        });
        setOrderId("");
      } catch (err: unknown) {
        const msg =
          typeof err === "object" && err && "data" in err
            ? String((err as { data?: { error?: string } }).data?.error ?? "")
            : "";
        toast({
          title: "Couldn’t create invoice",
          message: msg || "Something went wrong.",
          variant: "error",
        });
      }
    },
    [createInvoice, orderId, toast]
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-brand-black">
            Issue from order
          </h2>
          <p className="mt-1 text-sm text-black/60">
            Pick an order that doesn&apos;t have an invoice yet. PDF uses live
            line items and totals from that order.
          </p>
        </div>
        <Link
          href="/api/invoices/sample"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
        >
          <IconDownload className="h-4 w-4 text-black/70" stroke={2} />
          Sample PDF
        </Link>
      </div>

      <form
        onSubmit={(ev) => void onSubmit(ev)}
        className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <label className="grid min-w-0 flex-1 gap-1.5">
          <span className="text-xs font-medium text-black/55">Order</span>
          <FormSelect
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading || orders.length === 0}
            aria-label="Select order for invoice"
          >
            <option value="">
              {isLoading
                ? "Loading orders…"
                : orders.length === 0
                  ? "No orders without an invoice"
                  : "Choose an order…"}
            </option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.user.name} · {o.user.email} ·{" "}
                {(o.totalCents / 100).toFixed(2)} ·{" "}
                {o.id.slice(0, 10)}
                …
              </option>
            ))}
          </FormSelect>
        </label>
        <button
          type="submit"
          disabled={!orderId || creating || orders.length === 0}
          className={[
            "inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white",
            "bg-[#0b0b0f] shadow-sm transition hover:bg-black hover:shadow-softSm hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
            "disabled:pointer-events-none disabled:opacity-45",
          ].join(" ")}
        >
          <IconPlus className="h-[18px] w-[18px]" stroke={2} />
          {creating ? "Issuing…" : "Issue invoice"}
        </button>
      </form>
    </div>
  );
}

function buildColumns(
  col: ReturnType<typeof createColumnHelper<InvoiceRow>>
) {
  const comboBtn =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40";

  return [
    col.accessor("number", {
      header: "Invoice",
      cell: (ctx) => (
        <span className="font-mono text-sm font-medium text-brand-black">
          {ctx.getValue()}
        </span>
      ),
    }),
    col.accessor("orderId", {
      header: "Order",
      cell: (ctx) => (
        <Link
          href={`/admin/orders/${ctx.getValue()}`}
          className="font-mono text-xs text-brand-black underline decoration-black/20 underline-offset-2 hover:decoration-brand-black"
        >
          {ctx.getValue().slice(0, 12)}…
        </Link>
      ),
    }),
    col.accessor("customerEmail", {
      header: "Customer",
      cell: (ctx) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-brand-black">
            {ctx.row.original.customerName}
          </div>
          <div className="truncate text-xs text-black/55">
            {ctx.getValue()}
          </div>
        </div>
      ),
    }),
    col.accessor("orderStatus", {
      header: "Order status",
      cell: (ctx) => (
        <span className="capitalize text-black/75">{ctx.getValue()}</span>
      ),
    }),
    col.accessor("totalCents", {
      header: "Total",
      cell: (ctx) => (
        <span className="tabular-nums">
          {(ctx.getValue() / 100).toFixed(2)}
        </span>
      ),
    }),
    col.accessor("issuedAt", {
      header: "Issued",
      cell: (ctx) => format(parseISO(ctx.getValue()), "PPp"),
    }),
    col.display({
      id: "actions",
      header: () => <div className="text-end">Actions</div>,
      cell: (ctx) => (
        <div className="flex justify-end gap-2">
          <a
            href={`/api/invoices/${ctx.row.original.id}/pdf`}
            className={`${comboBtn} bg-[#0b0b0f] text-white hover:bg-black`}
          >
            <IconDownload className="h-4 w-4" stroke={2} />
            PDF
          </a>
          <Link
            href={`/admin/orders/${ctx.row.original.orderId}`}
            className={`${comboBtn} bg-white text-brand-black ring-1 ring-black/10 hover:bg-black/5`}
          >
            <IconPencil className="h-4 w-4" stroke={2} />
            Order
          </Link>
        </div>
      ),
    }),
  ];
}

export function InvoicesSection() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const listQuery = useMemo(
    () =>
      normalizeInvoiceListQuery({
        q: searchParams.get("q"),
        sort: searchParams.get("sort"),
        order: searchParams.get("order"),
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
      }),
    [searchParams]
  );

  const { data, isLoading, isFetching } = useListInvoicesQuery(listQuery);

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
      const next: InvoiceListQuery = {
        ...listQuery,
        q: nextQ,
        page: 1,
      };
      router.replace(`${pathname}?${listQueryToSearchString(next)}`);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchDraft, listQuery, pathname, router]);

  const pushQuery = useCallback(
    (patch: Partial<InvoiceListQuery>) => {
      const next = { ...listQuery, ...patch };
      router.replace(`${pathname}?${listQueryToSearchString(next)}`);
    },
    [listQuery, pathname, router]
  );

  const col = useMemo(() => createColumnHelper<InvoiceRow>(), []);
  const columns = useMemo(() => buildColumns(col), [col]);

  const rows: InvoiceRow[] =
    data?.items.map((inv) => ({
      id: inv.id,
      number: inv.number,
      orderId: inv.orderId,
      orderStatus: inv.order.status,
      customerName: inv.user.name,
      customerEmail: inv.user.email,
      totalCents: inv.totalCents,
      issuedAt: inv.issuedAt,
    })) ?? [];

  const sortSelectValue =
    `${listQuery.sort}:${listQuery.order}` as (typeof SORT_OPTIONS)[number]["value"];

  const rangeStart = data?.total ? (data.page - 1) * data.limit + 1 : 0;
  const rangeEnd = data?.total
    ? Math.min(data.page * data.limit, data.total)
    : 0;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <IssueInvoicePanel />
        <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm ring-1 ring-black/5">
          Loading invoices…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <IssueInvoicePanel />

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl tracking-tight text-brand-black">
            Issued invoices
          </h2>
          <p className="text-sm text-black/60">
            Search by invoice number, order id, or customer.
          </p>
        </div>

        {data && data.total === 0 && !listQuery.q ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-pink/15 text-brand-black">
              <IconDownload className="h-6 w-6 opacity-80" stroke={1.75} />
            </div>
            <div className="mt-4 text-sm font-medium text-brand-black">
              No invoices yet
            </div>
            <div className="mx-auto mt-2 max-w-md text-sm text-black/60">
              Issue your first invoice from an order above. PDFs include item
              lines, discounts, shipping, and the order total.
            </div>
          </div>
        ) : (
          <>
            <div
              className={[
                "flex flex-col gap-4",
                "sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
              ].join(" ")}
            >
              <label className="grid min-w-0 gap-1.5 sm:min-w-[220px] sm:flex-1">
                <span className="text-xs font-medium text-black/55">
                  Search
                </span>
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Invoice #, order id, customer…"
                  className={adminControlClass}
                  autoComplete="off"
                />
              </label>
              <label className="grid w-full gap-1.5 sm:w-52">
                <span className="text-xs font-medium text-black/55">Sort</span>
                <FormSelect
                  value={sortSelectValue}
                  onChange={(e) => {
                    const { sort, order } = sortTupleFromSelect(
                      e.target.value
                    );
                    pushQuery({ sort, order, page: 1 });
                  }}
                  aria-label="Sort invoices"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </FormSelect>
              </label>
              <label className="grid w-full gap-1.5 sm:w-36">
                <span className="text-xs font-medium text-black/55">
                  Per page
                </span>
                <FormSelect
                  value={listQuery.limit}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const limit: InvoicePageSize =
                      n === 50 || n === 100 ? n : 20;
                    pushQuery({ limit, page: 1 });
                  }}
                  aria-label="Invoices per page"
                >
                  {INVOICE_PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </FormSelect>
              </label>
            </div>

            {data && data.total === 0 && listQuery.q ? (
              <div className="rounded-xl bg-white p-8 text-center text-sm text-black/60 shadow-sm ring-1 ring-black/5">
                No invoices match &ldquo;{listQuery.q}&rdquo;. Try a different
                search.
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
          </>
        )}
      </div>
    </div>
  );
}
