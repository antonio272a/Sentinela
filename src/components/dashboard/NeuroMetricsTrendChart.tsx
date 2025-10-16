"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricKey = "energy" | "focus" | "emotionalBalance" | "sleep";

export type NeuroMetricPoint = {
  date: string;
} & Record<MetricKey, number | null>;

const metricConfig: Record<MetricKey, { label: string; color: string }> = {
  energy: { label: "Energia", color: "#fbbf24" },
  focus: { label: "Foco", color: "#38bdf8" },
  emotionalBalance: { label: "Equilíbrio", color: "#f472b6" },
  sleep: { label: "Sono", color: "#34d399" },
};

export function NeuroMetricsTrendChart({ data }: { data: NeuroMetricPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: "#e2e8f0" }}
        />
        {(Object.keys(metricConfig) as MetricKey[]).map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={metricConfig[key].label}
            stroke={metricConfig[key].color}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
