import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const gradientCardClass = cn(
  "overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20",
  "shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)] ring-1 ring-border/40",
  "transition-shadow duration-300 hover:shadow-[0_12px_36px_-12px_rgba(30,103,181,0.15)]"
);

export const gradientCardHeaderClass = cn(
  "border-b border-border/40 bg-gradient-to-r from-primary/[0.04] to-transparent px-6 pb-4 pt-5"
);

export const gradientCardContentClass = "px-6 pb-6 pt-5";

export const gradientFilterPanelClass = cn(
  "space-y-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-card to-muted/30 p-5",
  "shadow-[0_4px_24px_-8px_rgba(30,103,181,0.12)] ring-1 ring-primary/10"
);

export const gradientTableShellClass =
  "overflow-x-auto rounded-xl border border-primary/10 bg-gradient-to-br from-card to-muted/10";

export const gradientEmptyStateClass = cn(
  "flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20",
  "bg-gradient-to-br from-primary/[0.03] to-transparent py-12 text-center"
);

export function GradientCard({ className, ...props }) {
  return <Card className={cn(gradientCardClass, className)} {...props} />;
}

export function GradientCardHeader({ className, ...props }) {
  return <CardHeader className={cn(gradientCardHeaderClass, className)} {...props} />;
}

export function GradientCardContent({ className, ...props }) {
  return <CardContent className={cn(gradientCardContentClass, className)} {...props} />;
}

export function GradientCardTitle({ className, ...props }) {
  return (
    <CardTitle
      className={cn("text-base font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function GradientCardDescription({ className, ...props }) {
  return (
    <CardDescription
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export function GradientStatCard({
  label,
  value,
  accent = "bg-gradient-to-b from-primary to-[#3d8fd4]",
  iconWrap = "bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-lg shadow-primary/30",
  surface = "from-primary/[0.07] via-card to-card",
  ring = "ring-primary/15",
  icon: Icon,
  className,
  valueClassName,
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-5",
        "shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(30,103,181,0.2)]",
        surface,
        ring,
        className
      )}
    >
      <div
        className={cn("absolute left-0 top-0 h-full w-1 rounded-r-full opacity-90", accent)}
      />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {Icon ? (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                iconWrap
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </div>
          ) : null}
        </div>
        <p
          className={cn(
            "text-[1.75rem] font-bold leading-none tracking-tight text-foreground",
            valueClassName
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
