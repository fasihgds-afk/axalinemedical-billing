"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gradientFilterPanelClass } from "@/components/layout/GradientCard";

const selectClassName =
  "h-8 w-full rounded-lg border border-primary/10 bg-card/80 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function PaymentFilters({ clients = [], methods = [], statuses = [], defaults = {} }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    q: defaults.q || "",
    clientId: defaults.clientId || "",
    methodId: defaults.methodId || "",
    statusId: defaults.statusId || "",
    from: defaults.from || "",
    to: defaults.to || "",
  });

  function applyFilters(event) {
    event.preventDefault();

    startTransition(() => {
      const params = new URLSearchParams();

      if (filters.q) params.set("q", filters.q);
      if (filters.clientId) params.set("clientId", filters.clientId);
      if (filters.methodId) params.set("methodId", filters.methodId);
      if (filters.statusId) params.set("statusId", filters.statusId);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      router.push(`/payments?${params.toString()}`);
    });
  }

  function clearFilters() {
    setFilters({ q: "", clientId: "", methodId: "", statusId: "", from: "", to: "" });
    startTransition(() => router.push("/payments"));
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <form onSubmit={applyFilters} className={gradientFilterPanelClass}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-primary" />
        Filters
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Reference, notes, client..."
            className="border-primary/10 bg-card/80"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <select
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            className={selectClassName}
            disabled={isPending}
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Method</label>
          <select
            value={filters.methodId}
            onChange={(e) => setFilters({ ...filters, methodId: e.target.value })}
            className={selectClassName}
            disabled={isPending}
          >
            <option value="">All methods</option>
            {methods.map((method) => (
              <option key={method._id} value={method._id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={filters.statusId}
            onChange={(e) => setFilters({ ...filters, statusId: e.target.value })}
            className={selectClassName}
            disabled={isPending}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status._id} value={status._id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">From date</label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="border-primary/10 bg-card/80"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">To date</label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="border-primary/10 bg-card/80"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          Apply filters
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
