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
        valueClassName="text-primary"
      />
      <GradientStatCard
        label="Payments"
        value={summary?.paymentCount ?? 0}
        icon={Hash}
        accent="bg-gradient-to-b from-[#1E67B5] to-[#4a9ad4]"
        iconWrap="bg-gradient-to-br from-[#1E67B5] to-[#2d7fc2] text-white shadow-lg shadow-[#1E67B5]/30"
        surface="from-[#1E67B5]/[0.08] via-card to-card"
        ring="ring-[#1E67B5]/15"
      />
      <GradientStatCard
        label="Period"
        value={summary?.periodLabel ?? "All payments"}
        icon={CalendarDays}
        accent="bg-gradient-to-b from-slate-600 to-slate-500"
        iconWrap="bg-gradient-to-br from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/25"
        surface="from-slate-500/[0.06] via-card to-card"
        ring="ring-slate-400/20"
        valueClassName="text-base leading-snug"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
