import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      <Skeleton className="h-9 w-40 rounded-lg" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[6.5rem] rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[22rem] rounded-xl" />
        <Skeleton className="h-[22rem] rounded-xl" />
      </div>

      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
