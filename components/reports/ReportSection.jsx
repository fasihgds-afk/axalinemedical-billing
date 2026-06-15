import { cn } from "@/lib/utils";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { ReportBreakdownTable } from "@/components/reports/ReportBreakdownTable";

const ACCENT_STYLES = {
  blue: "from-primary to-[#3d8fd4]",
  navy: "from-[#0c1f38] to-primary",
  red: "from-axaline-red to-[#ff6b6b]",
  slate: "from-slate-600 to-slate-500",
};

export function ReportSection({
  title,
  description,
  chart,
  rows = [],
  nameColumn = "Name",
  emptyMessage,
  accent = "blue",
  showStatusColors = false,
}) {
  const accentClass = ACCENT_STYLES[accent] ?? ACCENT_STYLES.blue;

  return (
    <section className="space-y-4">
      {chart}
      <GradientCard className="relative">
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b opacity-90",
            accentClass
          )}
        />
        <GradientCardHeader className="bg-gradient-to-r from-primary/[0.06] to-transparent">
          <GradientCardTitle>{title}</GradientCardTitle>
          {description ? (
            <GradientCardDescription>{description}</GradientCardDescription>
          ) : null}
        </GradientCardHeader>
        <GradientCardContent>
          <ReportBreakdownTable
            rows={rows}
            nameColumn={nameColumn}
            emptyMessage={emptyMessage}
            showStatusColors={showStatusColors}
          />
        </GradientCardContent>
      </GradientCard>
    </section>
  );
}
