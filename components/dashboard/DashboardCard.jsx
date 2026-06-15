import { cn } from "@/lib/utils";
import {
  gradientCardClass,
  gradientCardContentClass,
  gradientCardHeaderClass,
  gradientEmptyStateClass,
} from "@/components/layout/GradientCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChartTooltipBox({ children }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3 py-2.5 text-sm shadow-lg backdrop-blur-sm">
      {children}
    </div>
  );
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}) {
  return (
    <Card className={cn(gradientCardClass, className)}>
      <CardHeader
        className={cn(
          gradientCardHeaderClass,
          "flex flex-row items-start justify-between gap-4 space-y-0"
        )}
      >
        <div className="space-y-1">
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn(gradientCardContentClass, contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export function ChartEmptyState({ message }) {
  return (
    <div className={cn(gradientEmptyStateClass, "h-[280px] px-6")}>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
