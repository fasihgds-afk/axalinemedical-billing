import { DollarSign, Hash, CalendarDays } from "lucide-react";
import { GradientStatCard } from "@/components/layout/GradientCard";
import { formatCurrency } from "@/lib/formatCurrency";

export function ReportSummaryCards({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GradientStatCard
        label="Total amount"
        value={formatCurrency(summary?.totalAmount ?? 0)}
        icon={DollarSign}
        accent="bg-gradient-to-b from-primary to-[#3d8fd4]"
        iconWrap="bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-lg shadow-primary/30"
        surface="from-primary/[0.08] via-card to-card"
        ring="ring-primary/15"
        valueClassName="text-primary"
      />
      <GradientStatCard
        label="Payments"
        value={summary?.paymentCount ?? 0}
        icon={Hash}
        accent="bg-gradient-to-b from-[#0c1f38] to-primary"
        iconWrap="bg-gradient-to-br from-[#0c1f38] to-primary text-white shadow-lg shadow-primary/25"
        surface="from-[#0c1f38]/[0.06] via-card to-card"
        ring="ring-primary/15"
      />
      <GradientStatCard
        label="Period"
        value={summary?.periodLabel ?? "All payments"}
        icon={CalendarDays}
        accent="bg-gradient-to-b from-axaline-red to-[#ff6b6b]"
        iconWrap="bg-gradient-to-br from-axaline-red to-[#e02828] text-white shadow-lg shadow-axaline-red/30"
        surface="from-axaline-red/[0.06] via-card to-card"
        ring="ring-axaline-red/15"
        valueClassName="text-base leading-snug"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
