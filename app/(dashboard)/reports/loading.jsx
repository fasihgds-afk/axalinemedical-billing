import { Skeleton } from "@/components/ui/skeleton";
import {
  GradientCard,
  GradientCardContent,
  GradientCardHeader,
  gradientCardClass,
} from "@/components/layout/GradientCard";
import { cn } from "@/lib/utils";

export default function ReportsLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn(gradientCardClass, "p-5")}>
            <Skeleton className="mb-3 h-4 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
      <GradientCard>
        <GradientCardHeader>
          <Skeleton className="h-5 w-40 rounded-lg" />
        </GradientCardHeader>
        <GradientCardContent>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
