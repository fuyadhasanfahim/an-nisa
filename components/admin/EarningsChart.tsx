"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

export function EarningsChart() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="text-xs font-medium tracking-wide text-black/55">
        Weekly earnings
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="rgba(11,11,15,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="rgba(11,11,15,0.45)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(11,11,15,0.45)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#fcc4c8"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

