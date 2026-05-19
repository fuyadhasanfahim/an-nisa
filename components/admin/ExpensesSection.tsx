"use client";

import { useMemo, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetExpensesQuery,
  useDeleteExpenseMutation,
} from "@/store/api/expensesApi";
import type { ExpenseTransactionRow } from "@/store/api/expensesApi";
import { DataTable } from "@/components/admin/DataTable";
import { ExpenseModal } from "@/components/admin/ExpenseModal";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { useToast } from "@/components/shared/toast/useToast";
import {
  IconChartBar,
  IconCoinOff,
  IconPencil,
  IconPlus,
  IconReceipt2,
  IconTrash,
  IconTrendingDown,
} from "@tabler/icons-react";

function ExpenseActionsCell({
  row,
  onEdit,
}: {
  row: ExpenseTransactionRow;
  onEdit: (row: ExpenseTransactionRow) => void;
}) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExpense, { isLoading }] = useDeleteExpenseMutation();

  const comboBtn =
    "grid h-9 w-9 place-items-center text-black/65 transition hover:bg-black/[0.04] hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40 disabled:opacity-50";
  const comboBtnFirst = "rounded-l-xl";
  const comboBtnLast = "rounded-r-xl";

  const performDelete = useCallback(async () => {
    try {
      await deleteExpense(row.id).unwrap();
      toast({
        title: "Expense removed",
        message: `${row.title} was deleted.`,
        variant: "success",
      });
      setDeleteOpen(false);
    } catch {
      toast({
        title: "Couldn’t delete",
        message: "Try again.",
        variant: "error",
      });
    }
  }, [deleteExpense, row.id, row.title, toast]);

  return (
    <>
      <ConfirmAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="destructive"
        title={`Delete “${row.title}”?`}
        description="This permanently removes the expense from your ledger."
        confirmLabel="Delete"
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
          <button
            type="button"
            className={`${comboBtn} ${comboBtnFirst}`}
            title="Edit"
            aria-label={`Edit expense ${row.title}`}
            onClick={() => onEdit(row)}
          >
            <IconPencil className="h-4 w-4" stroke={2} />
          </button>
          <button
            type="button"
            className={`${comboBtn} ${comboBtnLast}`}
            title="Delete"
            aria-label={`Delete expense ${row.title}`}
            disabled={isLoading}
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash className="h-4 w-4" stroke={2} />
          </button>
        </div>
      </div>
    </>
  );
}

const RANGE_OPTIONS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

const PIE_COLORS = [
  "#94a3b8",
  "#fecdd3",
  "#0b0b0f",
  "#fda4af",
  "#cbd5e1",
  "#fcc4c8",
];

function major(cents: number) {
  return Math.round(cents) / 100;
}

function formatAmount(cents: number) {
  return major(cents).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function categoryCell(cat: string | null) {
  const s = cat?.trim();
  return s && s.length > 0 ? s : "Uncategorized";
}

export function ExpensesSection() {
  const [days, setDays] = useState<(typeof RANGE_OPTIONS)[number]["days"]>(30);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExpense, setModalExpense] =
    useState<ExpenseTransactionRow | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useGetExpensesQuery({
    days,
  });

  const openEdit = useCallback((row: ExpenseTransactionRow) => {
    setModalExpense(row);
    setModalOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setModalExpense(null);
    setModalOpen(true);
  }, []);

  const trendData = useMemo(() => {
    if (!data?.daily.length) return [];
    return data.daily.map((d) => ({
      ...d,
      expenseMajor: major(d.expenseCents),
    }));
  }, [data?.daily]);

  const categoryBars = useMemo(() => {
    if (!data?.byCategory.length) return [];
    return data.byCategory.map((c) => ({
      ...c,
      expenseMajor: major(c.expenseCents),
    }));
  }, [data?.byCategory]);

  const categoryPie = useMemo(() => {
    if (!data?.byCategory.length) return [];
    return data.byCategory.map((c) => ({
      ...c,
      name: c.label,
    }));
  }, [data?.byCategory]);

  const col = useMemo(() => createColumnHelper<ExpenseTransactionRow>(), []);
  const columns = useMemo(
    () => [
      col.accessor("spentAt", {
        header: "Date",
        cell: (ctx) => (
          <span className="text-black/80">
            {format(parseISO(ctx.getValue()), "PPP")}
          </span>
        ),
      }),
      col.accessor("title", {
        header: "Title",
        cell: (ctx) => (
          <span className="font-medium text-brand-black">{ctx.getValue()}</span>
        ),
      }),
      col.accessor("category", {
        header: "Category",
        cell: (ctx) => (
          <span className="text-black/65">{categoryCell(ctx.getValue())}</span>
        ),
      }),
      col.accessor("amountCents", {
        header: "Amount",
        cell: (ctx) => `৳ ${(ctx.getValue() / 100).toFixed(2)}`,
      }),
      col.accessor("description", {
        header: "Notes",
        cell: (ctx) => {
          const t = ctx.getValue()?.trim();
          if (!t)
            return <span className="text-black/45">—</span>;
          const short = t.length > 72 ? `${t.slice(0, 72)}…` : t;
          return (
            <span className="text-black/55" title={t}>
              {short}
            </span>
          );
        },
      }),
      col.display({
        id: "actions",
        header: () => <div className="text-end">Actions</div>,
        cell: (ctx) => (
          <ExpenseActionsCell row={ctx.row.original} onEdit={openEdit} />
        ),
      }),
    ],
    [col, openEdit],
  );

  if (isLoading && !data) {
    return (
      <section className="space-y-6 not-first:border-t not-first:border-black/10 not-first:pt-10">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-black/6" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-36 animate-pulse rounded-xl bg-black/6 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-xl bg-black/6 lg:col-span-2" />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="space-y-6 not-first:border-t not-first:border-black/10 not-first:pt-10">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-black/65">
            Couldn&apos;t load expenses. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const kpiCard =
    "rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06] transition hover:shadow-softSm";

  return (
    <section className="space-y-6 not-first:border-t not-first:border-black/10 not-first:pt-10">
      <ExpenseModal
        open={modalOpen}
        expenseToEdit={modalExpense}
        onOpenChange={(next) => {
          setModalOpen(next);
          if (!next) setModalExpense(null);
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
        <h2 className="text-base font-semibold tracking-tight text-brand-black">
          Expenses
        </h2>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <button
            type="button"
            onClick={openCreate}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0b0f] px-4 py-2.5 text-sm font-medium text-white",
              "shadow-sm transition hover:bg-black hover:shadow-softSm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
            ].join(" ")}
          >
            <IconPlus className="h-4 w-4" stroke={2} />
            Add expense
          </button>
          <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  days === opt.days
                    ? "bg-[#0b0b0f] text-white shadow-sm"
                    : "text-black/65 hover:bg-black/4 hover:text-brand-black",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={[
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
          isFetching ? "opacity-75 transition-opacity" : "",
        ].join(" ")}
      >
        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Lifetime spending
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {formatAmount(data.lifetime.totalExpenseCents)}
              </div>
              <div className="mt-1 text-xs text-black/50">
                {data.lifetime.expenseCount} expense
                {data.lifetime.expenseCount === 1 ? "" : "s"} · {data.currency}
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200/80 text-brand-black">
              <IconTrendingDown className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Spending ({data.rangeDays}d)
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {formatAmount(data.inRange.totalExpenseCents)}
              </div>
              <div className="mt-1 text-xs text-black/50">
                {data.inRange.expenseCount} recorded · avg{" "}
                {formatAmount(data.inRange.avgExpenseCents)}
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200/80 text-brand-black">
              <IconCoinOff className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Entries in range
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {data.inRange.expenseCount}
              </div>
              <div className="mt-1 text-xs text-black/50">
                Distinct expense rows · last {data.rangeDays} days
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200/80 text-brand-black">
              <IconReceipt2 className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Average ticket
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {data.inRange.expenseCount > 0
                  ? formatAmount(data.inRange.avgExpenseCents)
                  : "—"}
              </div>
              <div className="mt-1 text-xs text-black/50">
                Mean amount in this window
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200/80 text-brand-black">
              <IconChartBar className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-black/55">
              Daily trend
            </div>
            <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
              Spending by day
            </div>
          </div>
          <div className="text-xs text-black/50">
            {data.currency} · major units on chart axis
          </div>
        </div>
        <div className="mt-6 h-80 w-full min-h-[280px]">
          {trendData.every((d) => d.expenseCents === 0) ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
              No expenses in this window yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="expenseSlate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
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
                  tick={{ fill: "rgba(11,11,15,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(11,11,15,0.08)",
                    boxShadow: "0 8px 20px rgba(11,11,15,0.06)",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{ color: "#0b0b0f", fontWeight: "bold", fontSize: "12px" }}
                  itemStyle={{ color: "#0b0b0f", fontWeight: "500", fontSize: "12px" }}
                  formatter={(value) => {
                    const n =
                      typeof value === "number" ? value : Number(value);
                    if (!Number.isFinite(n)) return "";
                    return formatAmount(Math.round(n * 100));
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date
                      ? String(payload[0].payload.date)
                      : ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey="expenseMajor"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#expenseSlate)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#0b0b0f" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/6 lg:col-span-3">
          <div className="text-xs font-medium uppercase tracking-wide text-black/55">
            Category
          </div>
          <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
            Spending ({data.rangeDays}d)
          </div>
          <div className="mt-6 h-72">
            {categoryBars.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
                No categorized spending in this window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryBars}
                  layout="vertical"
                  margin={{ left: 4, right: 16 }}
                >
                  <CartesianGrid
                    stroke="rgba(11,11,15,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(11,11,15,0.5)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={100}
                    tick={{ fill: "rgba(11,11,15,0.65)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(11,11,15,0.08)",
                      backgroundColor: "#ffffff",
                    }}
                    labelStyle={{ color: "#0b0b0f", fontWeight: "bold", fontSize: "12px" }}
                    itemStyle={{ color: "#0b0b0f", fontWeight: "500", fontSize: "12px" }}
                    formatter={(value) => {
                      const n =
                        typeof value === "number" ? value : Number(value);
                      if (!Number.isFinite(n)) return "";
                      return formatAmount(Math.round(n * 100));
                    }}
                  />
                  <Bar
                    dataKey="expenseMajor"
                    radius={[0, 10, 10, 0]}
                    fill="#94a3b8"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/6 lg:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-black/55">
            Category mix
          </div>
          <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
            Share of spending
          </div>
          <div className="mt-4 h-72">
            {categoryPie.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
                No expenses in this window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPie}
                    dataKey="expenseCents"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length] ?? "#e5e7eb"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(11,11,15,0.08)",
                      backgroundColor: "#ffffff",
                    }}
                    labelStyle={{ color: "#0b0b0f", fontWeight: "bold", fontSize: "12px" }}
                    itemStyle={{ color: "#0b0b0f", fontWeight: "500", fontSize: "12px" }}
                    formatter={(value) =>
                      formatAmount(
                        typeof value === "number"
                          ? value
                          : Number(value),
                      )
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/60">
            {categoryPie.map((s, i) => (
              <li key={s.label} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      PIE_COLORS[i % PIE_COLORS.length] ?? "#e5e7eb",
                  }}
                />
                {s.name}: {formatAmount(s.expenseCents)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-black/55">
              Ledger
            </div>
            <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
              Expense transactions
            </div>
          </div>
          <div className="text-xs text-black/50">
            Newest first · {data.transactions.length} row
            {data.transactions.length === 1 ? "" : "s"}
          </div>
        </div>
        <div
          className={[
            "transition-opacity",
            isFetching ? "opacity-70" : "opacity-100",
          ].join(" ")}
        >
          <DataTable data={data.transactions} columns={columns} />
        </div>
      </div>
    </section>
  );
}
