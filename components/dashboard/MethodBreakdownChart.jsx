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
      <p className="font-semibold">{item.name}</p>
      <p className="mt-0.5 font-bold text-primary">{formatCurrency(item.total)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.count} payment{item.count === 1 ? "" : "s"}
      </p>
    </ChartTooltipBox>
  );
}

export function MethodBreakdownChart({ data = [] }) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    total: item.total,
    count: item.count,
    fill: BAR_COLORS[index % BAR_COLORS.length],
  }));

  return (
    <DashboardCard
      title="By payment method"
      description="Total amounts per payment method"
    >
      {chartData.length === 0 ? (
        <ChartEmptyState message="No payments by method yet" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              width={96}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--primary)", opacity: 0.08 }} />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={32}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
