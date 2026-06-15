import {
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";

const STAT_CONFIG = [
  {
    key: "totalAmount",
    label: "Total amount",
    icon: DollarSign,
    format: formatCurrency,
    accent: "bg-gradient-to-b from-primary to-[#3d8fd4]",
    iconWrap: "bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-lg shadow-primary/30",
    surface: "from-primary/[0.07] via-card to-card",
    ring: "ring-primary/15",
  },
  {
    key: "paidAmount",
    label: "Paid",
    icon: CheckCircle2,
    format: formatCurrency,
    accent: "bg-gradient-to-b from-[#1E67B5] to-[#4a9ad4]",
    iconWrap: "bg-gradient-to-br from-[#1E67B5] to-[#2d7fc2] text-white shadow-lg shadow-[#1E67B5]/30",
    surface: "from-[#1E67B5]/[0.08] via-card to-card",
    ring: "ring-[#1E67B5]/15",
  },
  {
    key: "pendingAmount",
    label: "Pending",
    icon: Clock,
    format: formatCurrency,
    accent: "bg-gradient-to-b from-amber-500 to-amber-400",
    iconWrap: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30",
    surface: "from-amber-500/[0.08] via-card to-card",
    ring: "ring-amber-500/15",
  },
  {
    key: "failedAmount",
    label: "Failed",
    icon: XCircle,
    format: formatCurrency,
    accent: "bg-gradient-to-b from-axaline-red to-[#ff6b6b]",
    iconWrap: "bg-gradient-to-br from-axaline-red to-[#e02828] text-white shadow-lg shadow-axaline-red/30",
    surface: "from-axaline-red/[0.07] via-card to-card",
    ring: "ring-axaline-red/15",
  },
  {
    key: "clientCount",
    label: "Clients",
    icon: Users,
    format: (value) => String(value ?? 0),
    accent: "bg-gradient-to-b from-slate-600 to-slate-500",
    iconWrap: "bg-gradient-to-br from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/25",
    surface: "from-slate-500/[0.06] via-card to-card",
    ring: "ring-slate-400/20",
    isCount: true,
  },
];

export function StatsCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {STAT_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = stats?.[config.key] ?? 0;
        const display = config.isCount ? config.format(value) : config.format(value);

        return (
          <div
            key={config.key}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-5",
              "shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(30,103,181,0.2)]",
              config.surface,
              config.ring
            )}
          >
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-1 rounded-r-full opacity-90",
                config.accent
              )}
            />
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {config.label}
                </p>
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
                    config.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
              </div>
              <p className="text-[1.75rem] font-bold leading-none tracking-tight text-foreground xl:text-3xl">
                {display}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
