import { Skeleton } from "@/components/ui/skeleton";
import {
  GradientCard,
  GradientCardContent,
  GradientCardHeader,
  gradientFilterPanelClass,
} from "@/components/layout/GradientCard";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
      <div className={gradientFilterPanelClass}>
        <Skeleton className="h-4 w-20 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <GradientCard>
        <GradientCardHeader>
          <Skeleton className="h-5 w-24 rounded-lg" />
        </GradientCardHeader>
        <GradientCardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
