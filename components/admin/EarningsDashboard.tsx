"use client";

import { useMemo, useState } from "react";
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
import { useGetEarningsQuery } from "@/store/api/earningsApi";
import {
  IconChartBar,
  IconClockHour4,
  IconReceipt2,
  IconTrendingUp,
} from "@tabler/icons-react";

const RANGE_OPTIONS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

const PIE_COLORS = [
  "#fcc4c8",
  "#0b0b0f",
  "#d4d4d8",
  "#fda4af",
  "#a3a3a3",
  "#fecdd3",
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

function capitalizeStatus(s: string) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function EarningsDashboard() {
  const [days, setDays] = useState<(typeof RANGE_OPTIONS)[number]["days"]>(30);
  const { data, isLoading, isError, refetch, isFetching } = useGetEarningsQuery({
    days,
  });

  const trendData = useMemo(() => {
    if (!data?.daily.length) return [];
    return data.daily.map((d) => ({
      ...d,
      paidMajor: major(d.paidCents),
    }));
  }, [data?.daily]);

  const methodBars = useMemo(() => {
    if (!data?.byPaymentMethod.length) return [];
    return data.byPaymentMethod.map((m) => ({
      ...m,
      revenueMajor: major(m.revenueCents),
    }));
  }, [data?.byPaymentMethod]);

  const statusPie = useMemo(() => {
    if (!data?.byOrderStatus.length) return [];
    return data.byOrderStatus.map((s) => ({
      ...s,
      name: capitalizeStatus(s.status),
    }));
  }, [data?.byOrderStatus]);

  if (isLoading && !data) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-36 animate-pulse rounded-xl bg-black/6 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl bg-black/6 lg:col-span-2" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-black/65">
          Couldn&apos;t load earnings. Check your connection and try again.
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

  const kpiCard =
    "rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06] transition hover:shadow-softSm";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
                Lifetime paid revenue
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {formatAmount(data.lifetime.paidRevenueCents)}
              </div>
              <div className="mt-1 text-xs text-black/50">
                {data.lifetime.paidOrderCount} paid order
                {data.lifetime.paidOrderCount === 1 ? "" : "s"} ·{" "}
                {data.currency}
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pink/25 text-brand-black">
              <IconTrendingUp className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Revenue ({data.rangeDays}d, paid)
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {formatAmount(data.inRange.paidRevenueCents)}
              </div>
              <div className="mt-1 text-xs text-black/50">
                {data.inRange.paidOrderCount} paid · avg{" "}
                {formatAmount(data.inRange.avgPaidOrderCents)}
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pink/25 text-brand-black">
              <IconChartBar className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Pending pipeline
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {formatAmount(data.lifetime.pendingRevenueCents)}
              </div>
              <div className="mt-1 text-xs text-black/50">
                {data.lifetime.pendingOrderCount} unpaid order
                {data.lifetime.pendingOrderCount === 1 ? "" : "s"}
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pink/25 text-brand-black">
              <IconClockHour4 className="h-5 w-5" stroke={1.75} />
            </div>
          </div>
        </div>

        <div className={kpiCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-black/55">
                Orders in range
              </div>
              <div className="mt-2 font-serif text-2xl tracking-tight text-brand-black tabular-nums">
                {data.inRange.totalOrderCount}
              </div>
              <div className="mt-1 text-xs text-black/50">
                All statuses · last {data.rangeDays} days
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pink/25 text-brand-black">
              <IconReceipt2 className="h-5 w-5" stroke={1.75} />
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
              Paid revenue by day
            </div>
          </div>
          <div className="text-xs text-black/50">
            {data.currency} · major units on chart axis
          </div>
        </div>
        <div className="mt-6 h-80 w-full min-h-[280px]">
          {trendData.every((d) => d.paidCents === 0) ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
              No paid orders in this window yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="earnPink" x1="0" y1="0" x2="0" y2="1">
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
                      typeof value === "number"
                        ? value
                        : Number(value);
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
                  dataKey="paidMajor"
                  stroke="#f472b6"
                  strokeWidth={2}
                  fill="url(#earnPink)"
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
            Payment method
          </div>
          <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
            Paid revenue ({data.rangeDays}d)
          </div>
          <div className="mt-6 h-72">
            {methodBars.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
                No paid orders in this window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={methodBars}
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
                    width={88}
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
                        typeof value === "number"
                          ? value
                          : Number(value);
                      if (!Number.isFinite(n)) return "";
                      return formatAmount(Math.round(n * 100));
                    }}
                  />
                  <Bar
                    dataKey="revenueMajor"
                    radius={[0, 10, 10, 0]}
                    fill="#fcc4c8"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/6 lg:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-black/55">
            Fulfillment status
          </div>
          <div className="mt-1 font-serif text-lg tracking-tight text-brand-black">
            Orders in range
          </div>
          <div className="mt-4 h-72">
            {statusPie.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-black/3 text-sm text-black/55">
                No orders in this window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="orderCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {statusPie.map((_, i) => (
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
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/60">
            {statusPie.map((s, i) => (
              <li key={s.status} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      PIE_COLORS[i % PIE_COLORS.length] ?? "#e5e7eb",
                  }}
                />
                {s.name}: {s.orderCount}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
