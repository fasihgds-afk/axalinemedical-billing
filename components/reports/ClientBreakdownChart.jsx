"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const BAR_COLORS = [
  BRAND_COLORS.blue,
  BRAND_COLORS.red,
  "#6366F1",
  "#F59E0B",
  BRAND_COLORS.gray,
];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <ChartTooltipBox>
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="mt-0.5 text-base font-bold text-primary">{formatCurrency(item.total)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.count} payment{item.count === 1 ? "" : "s"}
      </p>
    </ChartTooltipBox>
  );
}

export function ClientBreakdownChart({ data = [] }) {
  const chartData = data.slice(0, 10).map((item, index) => ({
    name: item.name,
    total: item.total,
    count: item.count,
    fill: BAR_COLORS[index % BAR_COLORS.length],
  }));

  if (chartData.length === 0) {
    return (
      <DashboardCard
        title="By Client"
        description="Total amounts per client (top 10)"
      >
        <ChartEmptyState message="No payments by client for this period" />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="By Client"
      description="Total amounts per client (top 10)"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}
