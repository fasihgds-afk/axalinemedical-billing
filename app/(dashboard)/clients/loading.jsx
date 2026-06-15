import { Skeleton } from "@/components/ui/skeleton";
import {
  GradientCard,
  GradientCardContent,
  GradientCardHeader,
  gradientFilterPanelClass,
} from "@/components/layout/GradientCard";
import { cn } from "@/lib/utils";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className={cn(gradientFilterPanelClass, "space-y-0")}>
        <Skeleton className="mb-4 h-4 w-32 rounded-lg" />
        <Skeleton className="h-8 w-full max-w-xl rounded-lg" />
      </div>
      <GradientCard>
        <GradientCardHeader>
          <Skeleton className="h-5 w-24 rounded-lg" />
        </GradientCardHeader>
        <GradientCardContent>
          <Skeleton className="h-48 w-full rounded-lg" />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
