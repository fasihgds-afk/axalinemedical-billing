import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-card p-8 shadow-xl">
      <div className="mb-6 flex flex-col items-center">
        <Skeleton className="mb-4 h-16 w-16 rounded-lg" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Loading sign in…</p>
    </div>
  );
}
