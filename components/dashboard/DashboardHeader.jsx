export function DashboardHeader({ devMode = false }) {
  if (!devMode) return null;

  return (
    <div className="flex justify-end">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Demo mode
      </span>
    </div>
  );
}
