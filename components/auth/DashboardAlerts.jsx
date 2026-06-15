"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardAlerts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "forbidden") {
      toast.error("You do not have permission to access that page.");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null;
}
