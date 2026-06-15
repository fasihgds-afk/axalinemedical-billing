import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { ReportBreakdownTable } from "@/components/reports/ReportBreakdownTable";

export function ReportSection({
  title,
  description,
  chart,
  rows = [],
  nameColumn = "Name",
  emptyMessage,
}) {
  return (
    <section className="space-y-4">
      {chart}
      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>{title} — details</GradientCardTitle>
          {description ? (
            <GradientCardDescription>{description}</GradientCardDescription>
          ) : null}
        </GradientCardHeader>
        <GradientCardContent>
          <ReportBreakdownTable
            rows={rows}
            nameColumn={nameColumn}
            emptyMessage={emptyMessage}
          />
        </GradientCardContent>
      </GradientCard>
    </section>
  );
}
