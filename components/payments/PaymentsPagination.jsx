"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
export function PaymentsPagination({ page, total, limit }) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit) || 1;

  if (totalPages <= 1) return null;

  function buildPageUrl(targetPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `/payments?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildPageUrl(page - 1)}
            className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={buildPageUrl(page + 1)}
            className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
