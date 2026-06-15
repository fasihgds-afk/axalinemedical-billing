import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-primary", className)}
      aria-label={label}
    />
  );
}

export function PageSpinner({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Spinner className="h-8 w-8" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
