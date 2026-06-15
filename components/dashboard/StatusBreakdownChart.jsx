"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { REPORT_BRAND } from "@/lib/reportBrand";
import { BRAND_COLORS } from "@/config/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  ChartEmptyState,
  ChartTooltipBox,
  DashboardCard,
} from "@/components/dashboard/DashboardCard";

const FALLBACK_COLORS = [
  BRAND_COLORS.blue,
  BRAND_COLORS.red,
  BRAND_COLORS.gray,
  "#F59E0B",
  "#6366F1",
];

function resolveStatusChartColor(name, dbColor, index) {
  const key = name?.toLowerCase?.() ?? "";
  if (key === "paid") return REPORT_BRAND.paid;
  if (key === "pending") return REPORT_BRAND.pending;
  return dbColor || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

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

export function StatusBreakdownChart({ data = [] }) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.total,
    total: item.total,
    count: item.count,
    color: resolveStatusChartColor(item.name, item.color, index),
  }));

  return (
    <DashboardCard title="By status" description="Payment amounts grouped by status">
      {chartData.length === 0 ? (
        <ChartEmptyState message="No payments by status yet" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={68}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
              formatter={(value) => (
                <span className="text-xs font-medium text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
