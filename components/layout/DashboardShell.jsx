import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export function DashboardShell({ user, children }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--page-gradient-start)_0%,var(--background)_12rem)]">
      <NavigationProgress />
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopNav user={user} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
