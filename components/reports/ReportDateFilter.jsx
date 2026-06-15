"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gradientFilterPanelClass } from "@/components/layout/GradientCard";
import { cn } from "@/lib/utils";

export function ReportDateFilter({ defaults = {} }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [from, setFrom] = useState(defaults.from || "");
  const [to, setTo] = useState(defaults.to || "");

  function applyFilters(event) {
    event.preventDefault();

    startTransition(() => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const query = params.toString();
      router.push(query ? `/reports?${query}` : "/reports");
    });
  }

  function clearFilters() {
    setFrom("");
    setTo("");
    startTransition(() => router.push("/reports"));
  }

  const hasFilters = Boolean(from || to);

  return (
    <form
      onSubmit={applyFilters}
      className={cn(
        gradientFilterPanelClass,
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-primary sm:w-full">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-sm">
          <Calendar className="h-4 w-4" />
        </span>
        Filter by date range
      </div>
      <div className="space-y-2 sm:min-w-[160px]">
        <label className="text-sm font-medium">From</label>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border-primary/10 bg-card/80"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2 sm:min-w-[160px]">
        <label className="text-sm font-medium">To</label>
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border-primary/10 bg-card/80"
          disabled={isPending}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary to-[#2d7fc2] shadow-sm">
          Apply
        </Button>
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={clearFilters} disabled={isPending}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}
