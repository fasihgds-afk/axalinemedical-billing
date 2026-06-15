import { Skeleton } from "@/components/ui/skeleton";
import {
  GradientCard,
  GradientCardContent,
  GradientCardHeader,
} from "@/components/layout/GradientCard";

export default function BusinessProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
      </div>
      <GradientCard>
        <GradientCardHeader>
          <Skeleton className="h-5 w-36 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </GradientCardHeader>
        <GradientCardContent className="space-y-4">
          <Skeleton className="h-32 w-32 rounded-xl" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
