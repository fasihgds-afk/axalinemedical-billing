import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export function ReportsHero({ summary }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-sidebar-gradient shadow-[0_12px_40px_-12px_rgba(12,31,56,0.45)] ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,103,181,0.28),transparent_55%)]" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#FF3131]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-lg shadow-primary/40">
            <BarChart3 className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Analytics overview
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Payment reports
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              {summary?.periodLabel ?? "All payments"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:justify-end">
          <div className="min-w-[140px] rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Total
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {formatCurrency(summary?.totalAmount ?? 0)}
            </p>
          </div>
          <div className="min-w-[100px] rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Payments
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {summary?.paymentCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary via-[#3d8fd4] to-axaline-red" />
    </div>
  );
}
