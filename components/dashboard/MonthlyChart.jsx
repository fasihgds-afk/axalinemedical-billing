"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND_COLORS } from "@/config/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  ChartEmptyState,
  ChartTooltipBox,
  DashboardCard,
} from "@/components/dashboard/DashboardCard";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipBox>
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-base font-bold text-primary">
        {formatCurrency(payload[0].value)}
      </p>
      {payload[0].payload?.count != null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {payload[0].payload.count} payment
          {payload[0].payload.count === 1 ? "" : "s"}
        </p>
      ) : null}
    </ChartTooltipBox>
  );
}

export function MonthlyChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: item.label,
    total: item.total,
    count: item.count,
  }));

  const hasData = chartData.some((item) => item.total > 0);

  return (
    <DashboardCard
      title="Monthly payments"
      description="Total received per month (last 12 months)"
    >
      {!hasData ? (
        <ChartEmptyState message="No payment data for the last 12 months" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
              }
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--primary)", opacity: 0.08 }} />
            <Bar
              dataKey="total"
              fill={BRAND_COLORS.blue}
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
