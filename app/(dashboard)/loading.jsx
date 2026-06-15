import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardRouteLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
