"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gradientFilterPanelClass } from "@/components/layout/GradientCard";
import { cn } from "@/lib/utils";

export function ClientSearch({ defaultValue = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      router.push(`/clients?${params.toString()}`);
    });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => {
      router.push("/clients");
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn(gradientFilterPanelClass, "space-y-0")}>
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        <Search className="h-4 w-4 text-primary" />
        Search clients
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, phone..."
            className="border-primary/10 bg-card/80 pl-9"
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
        {query ? (
          <Button type="button" variant="outline" size="icon" onClick={handleClear} disabled={isPending}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
