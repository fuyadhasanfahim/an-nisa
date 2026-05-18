"use client";

import Link from "next/link";
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetOverviewQuery } from "@/store/api/overviewApi";
import type { OrderListItemDto } from "@/store/api/ordersApi";
import { DataTable } from "@/components/admin/DataTable";
import {
  IconChartBar,
  IconClipboardList,
  IconCoinOff,
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackage,
  IconPencil,
  IconReceipt2,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

function formatMoney(cents: number) {
  return (Math.round(cents) / 100).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function majorFromCents(cents: number) {
  return Math.round(cents) / 100;
}

function capitalizeWords(s: string) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const QUICK_LINKS = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Catalogue, pricing, inventory",
    Icon: IconPackage,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Fulfillment & payments",
    Icon: IconReceipt2,
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    description: "PDFs & billing references",
    Icon: IconFileInvoice,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    description: "Accounts & profiles",
    Icon: IconUsers,
  },
  {
    href: "/admin/earnings",
    label: "Earnings",
    description: "Revenue charts & trends",
    Icon: IconChartBar,
  },
  {
    href: "/admin/expenses",
    label: "Expenses",
    description: "Costs & ledger",
    Icon: IconCoinOff,
  },
] as const;

const kpiCardClass =
  "rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06] transition hover:shadow-softSm";

export function AdminOverviewDashboard() {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetOverviewQuery();

  const chartRows = useMemo(() => {
    if (!data?.daily.length) return [];
    return data.daily.map((d) => ({
      ...d,
      paidMajor: majorFromCents(d.paidCents),
    }));
  }, [data?.daily]);

  const col = useMemo(() => createColumnHelper<OrderListItemDto>(), []);
  const columns = useMemo(
    () => [
      col.accessor("id", {
        header: "Order",
        cell: (ctx) => (
          <span className="font-mono text-xs text-black/85">{ctx.getValue()}</span>
        ),
      }),
      col.accessor("customerPublicId", {
        header: "Customer ID",
        cell: (ctx) => (
          <span className="font-mono text-xs uppercase tracking-wide text-black/85">
            {ctx.getValue() ?? "—"}
          </span>
        ),
      }),
      col.accessor("user", {
        header: "Customer",
        cell: (ctx) => (
          <span className="font-medium text-brand-black">
            {ctx.getValue().name}
          </span>
        ),
      }),
      col.accessor("status", {
        header: "Status",
        cell: (ctx) => (
          <span className="text-black/75">{capitalizeWords(ctx.getValue())}</span>
        ),
      }),
      col.accessor("paymentStatus", {
        header: "Payment",
        cell: (ctx) =>
          ctx.getValue() === "paid" ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
              Paid
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
              Pending
            </span>
          ),
      }),
      col.accessor("totalCents", {
        header: "Total",
        cell: (ctx) => (
          <span className="tabular-nums text-black/85">
            ৳ {(ctx.getValue() / 100).toFixed(2)}
          </span>
        ),
      }),
      col.accessor("createdAt", {
        header: "Created",
        cell: (ctx) => (
          <span className="text-black/75">
            {format(parseISO(ctx.getValue()), "PPp")}
          </span>
        ),
      }),
      col.display({
        id: "open",
        header: () => <div className="text-end"> </div>,
        cell: (ctx) => (
          <div className="flex justify-end">
            <Link
              href={`/admin/orders/${ctx.row.original.id}`}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/[0.04]"
            >
              <IconPencil className="h-4 w-4" stroke={2} />
              Edit
            </Link>
          </div>
        ),
      }),
    ],
    [col],
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-black/[0.06]"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-black/[0.06]" />
        <div className="h-64 animate-pulse rounded-xl bg-black/[0.06]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-black/65">
          Couldn&apos;t load overview. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-xl bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, currency, chartDays, recentOrders } = data;
  const hasChartActivity = chartRows.some(
    (d) => d.paidCents > 0 || d.orderCount > 0,
  );

  return (
    <div
      className={[
        "space-y-8",
        isFetching ? "opacity-80 transition-opacity" : "",
      ].join(" ")}
    >
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/55">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Paid revenue (lifetime)
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {formatMoney(stats.lifetimePaidRevenueCents)}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  {stats.paidOrderCount} paid orders · {currency}
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-pink/25 text-brand-black">
                <IconTrendingUp className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Unpaid pipeline
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {formatMoney(stats.lifetimePendingRevenueCents)}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  {stats.pendingPaymentOrderCount} order
                  {stats.pendingPaymentOrderCount === 1 ? "" : "s"} awaiting
                  payment
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-900">
                <IconReceipt2 className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Orders
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {stats.totalOrders}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  All time · {stats.paidOrderCount} paid /{" "}
                  {stats.pendingPaymentOrderCount} unpaid
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconLayoutDashboard className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Customers
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {stats.customersCount}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  Registered shopper accounts
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconUsers className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Products
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {stats.productsActive}
                  <span className="text-lg font-sans text-black/45">
                    {" "}
                    / {stats.productsTotal}
                  </span>
                </div>
                <div className="mt-1 text-xs text-black/50">
                  Active / total SKUs in catalogue
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconPackage className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Invoices
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {stats.invoicesCount}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  Issued from paid workflows
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconFileInvoice className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>

          <Link href="/admin/expenses" className={`${kpiCardClass} block hover:ring-brand-pink/25`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Expenses (lifetime)
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {formatMoney(stats.lifetimeExpenseCents)}
                </div>
                <div className="mt-1 text-xs text-brand-pink/90">
                  Open spending ledger →
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconCoinOff className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </Link>

          <div className={kpiCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium tracking-wide text-black/55">
                  Custom requests
                </div>
                <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                  {stats.customOrdersNew}
                </div>
                <div className="mt-1 text-xs text-black/50">
                  New bespoke enquiries (site form)
                </div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-brand-black">
                <IconClipboardList className="h-5 w-5" stroke={1.75} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/55">
          Activity · last {chartDays} days
        </h2>
        <div className="mt-6 h-[340px] w-full min-h-[280px]">
          {!hasChartActivity ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-black/[0.03] text-sm text-black/55">
              No orders in this window yet — charts will fill as sales come in.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartRows} margin={{ left: 4, right: 12 }}>
                <defs>
                  <linearGradient id="overviewPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fcc4c8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#fcc4c8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(11,11,15,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(11,11,15,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "rgba(11,11,15,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  label={{
                    value: `Paid (${currency})`,
                    angle: -90,
                    position: "insideLeft",
                    fill: "rgba(11,11,15,0.45)",
                    fontSize: 10,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "rgba(11,11,15,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                  label={{
                    value: "Orders",
                    angle: 90,
                    position: "insideRight",
                    fill: "rgba(11,11,15,0.45)",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(11,11,15,0.08)",
                    boxShadow: "0 8px 20px rgba(11,11,15,0.06)",
                  }}
                  formatter={(value, name) => {
                    if (name === "paidMajor") {
                      const n =
                        typeof value === "number" ? value : Number(value);
                      if (!Number.isFinite(n)) return "";
                      return [
                        `${currency} ${formatMoney(Math.round(n * 100))}`,
                        "Paid revenue",
                      ];
                    }
                    if (name === "orderCount") {
                      return [String(value), "Orders placed"];
                    }
                    return [String(value), name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                  formatter={(value) =>
                    value === "paidMajor"
                      ? "Paid revenue"
                      : value === "orderCount"
                        ? "Orders placed"
                        : value
                  }
                />
                <Bar
                  yAxisId="right"
                  dataKey="orderCount"
                  fill="rgba(11,11,15,0.12)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  name="orderCount"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="paidMajor"
                  stroke="#f472b6"
                  strokeWidth={2}
                  fill="url(#overviewPink)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#0b0b0f" }}
                  name="paidMajor"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-black/55">
          Where to go next
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className={[
                "flex gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/[0.06]",
                "transition hover:-translate-y-px hover:shadow-softSm hover:ring-brand-pink/25",
              ].join(" ")}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f9fafb] text-brand-black ring-1 ring-black/5">
                <Icon className="h-5 w-5" stroke={1.75} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-brand-black">{label}</div>
                <div className="mt-0.5 text-sm text-black/55">{description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-black/55">
              Recent orders
            </div>
            <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
              Latest ten checkouts
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-brand-pink hover:text-brand-black"
          >
            View all orders →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-black/55 shadow-sm ring-1 ring-black/5">
            No orders yet — they&apos;ll show here once customers start checking
            out.
          </div>
        ) : (
          <DataTable data={recentOrders} columns={columns} />
        )}
      </section>
    </div>
  );
}
