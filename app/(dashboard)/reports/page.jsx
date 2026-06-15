import { getReportsData } from "@/actions/reports";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { StatusBreakdownChart } from "@/components/dashboard/StatusBreakdownChart";
import { MethodBreakdownChart } from "@/components/dashboard/MethodBreakdownChart";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { ReportDateFilter } from "@/components/reports/ReportDateFilter";
import { ExportReportButton } from "@/components/reports/ExportReportButton";
import { ClientBreakdownChart } from "@/components/reports/ClientBreakdownChart";
import { ReportSection } from "@/components/reports/ReportSection";
import { ReportsHero } from "@/components/reports/ReportsHero";
import { PageIntro } from "@/components/layout/PageIntro";

export default async function ReportsPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    from: params?.from || "",
    to: params?.to || "",
  };

  const result = await getReportsData({
    dateFrom: filters.from,
    dateTo: filters.to,
  });

  return (
    <div className="space-y-6">
      <PageIntro
        description="Payment totals by month, client, method, and status."
        extra={
          result.data?.devMode ? (
            <span className="mt-2 block text-xs text-primary">
              Demo mode — connect MongoDB for live data.
            </span>
          ) : null
        }
      >
        <ExportReportButton filters={filters} />
      </PageIntro>

      <ReportDateFilter defaults={filters} />

      {!result.success ? (
        <DashboardError message={result.error} />
      ) : (
        <>
          <ReportsHero summary={result.data.summary} />
          <ReportSummaryCards summary={result.data.summary} />

          <ReportSection
            title="By month"
            description="Last 12 months within your date filter"
            accent="blue"
            chart={<MonthlyChart data={result.data.byMonth} />}
            rows={result.data.byMonth}
            nameColumn="Month"
            emptyMessage="No monthly data for this period"
          />

          <ReportSection
            title="By client"
            description="All clients in the selected period"
            accent="navy"
            chart={<ClientBreakdownChart data={result.data.byClient} />}
            rows={result.data.byClient}
            nameColumn="Client"
            emptyMessage="No client breakdown for this period"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ReportSection
              title="By payment method"
              description="Totals per payment method"
              accent="blue"
              chart={<MethodBreakdownChart data={result.data.byMethod} />}
              rows={result.data.byMethod}
              nameColumn="Method"
              emptyMessage="No method breakdown for this period"
            />
            <ReportSection
              title="By status"
              description="Totals per payment status"
              accent="red"
              showStatusColors
              chart={<StatusBreakdownChart data={result.data.byStatus} />}
              rows={result.data.byStatus}
              nameColumn="Status"
              emptyMessage="No status breakdown for this period"
            />
          </div>
        </>
      )}
    </div>
  );
}
