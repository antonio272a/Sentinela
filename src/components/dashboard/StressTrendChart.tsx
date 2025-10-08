"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StressPoint = {
  date: string;
  stress: number;
};

export function StressTrendChart({ data }: { data: StressPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="#94a3b8"
          tickLine={false}
          axisLine={false}
          domain={[0, 10]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            color: "#f8fafc",
            fontSize: "0.8rem",
          }}
        />
        <Area
          type="monotone"
          dataKey="stress"
          stroke="#fbbf24"
          strokeWidth={2}
          fill="url(#stressGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
