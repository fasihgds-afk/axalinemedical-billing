import { Suspense } from "react";
import { getDashboardData } from "@/actions/dashboard";
import { DashboardAlerts } from "@/components/auth/DashboardAlerts";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentPaymentsTable } from "@/components/dashboard/RecentPaymentsTable";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { StatusBreakdownChart } from "@/components/dashboard/StatusBreakdownChart";
import { DashboardError } from "@/components/dashboard/DashboardError";

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-8">
        <Suspense fallback={null}>
          <DashboardAlerts />
        </Suspense>
        <DashboardHeader />
        <DashboardError message={result.error} />
      </div>
    );
  }

  const { stats, monthlyData, statusBreakdown, recentPayments } = result.data;

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <DashboardAlerts />
      </Suspense>

      {result.data?.devMode ? (
        <DashboardHeader devMode />
      ) : null}

      <section aria-label="Summary statistics" className={result.data?.devMode ? "" : "-mt-2"}>
        <StatsCards stats={stats} />
      </section>

      <section
        aria-label="Charts"
        className="grid gap-6 lg:grid-cols-2"
      >
        <MonthlyChart data={monthlyData} />
        <StatusBreakdownChart data={statusBreakdown} />
      </section>

      <section aria-label="Recent activity">
        <RecentPaymentsTable payments={recentPayments} />
      </section>
    </div>
  );
}
