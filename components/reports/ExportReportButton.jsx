"use client";

import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportReportsCsv } from "@/actions/reports";
import { Button } from "@/components/ui/button";

export function ExportReportButton({ filters = {} }) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportReportsCsv({
        dateFrom: filters.from || "",
        dateTo: filters.to || "",
      });

      if (!result.success) {
        toast.error(result.error || "Export failed");
        return;
      }

      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `axaline-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export report CSV
    </Button>
  );
}
