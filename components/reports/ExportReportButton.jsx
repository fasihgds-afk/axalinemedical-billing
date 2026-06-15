"use client";

import { useTransition } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportReportsCsv, exportReportsPdf } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function todaySlug() {
  return new Date().toISOString().slice(0, 10);
}

export function ExportReportButton({ filters = {} }) {
  const [isCsvPending, startCsvTransition] = useTransition();
  const [isPdfPending, startPdfTransition] = useTransition();

  const filterInput = {
    dateFrom: filters.from || "",
    dateTo: filters.to || "",
  };

  function handleCsvExport() {
    startCsvTransition(async () => {
      const result = await exportReportsCsv(filterInput);

      if (!result.success) {
        toast.error(result.error || "CSV export failed");
        return;
      }

      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `axaline-report-${todaySlug()}.csv`);
      toast.success("CSV report downloaded");
    });
  }

  function handlePdfExport() {
    startPdfTransition(async () => {
      const result = await exportReportsPdf(filterInput);

      if (!result.success) {
        toast.error(result.error || "PDF export failed");
        return;
      }

      const binary = atob(result.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      downloadBlob(blob, `axaline-report-${todaySlug()}.pdf`);
      toast.success("PDF report downloaded");
    });
  }

  const busy = isPdfPending || isCsvPending;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={handlePdfExport}
        disabled={busy}
        className={cn(
          "bg-gradient-to-r from-primary to-[#2d7fc2] shadow-md shadow-primary/25",
          "hover:from-primary/95 hover:to-[#2d7fc2]/95"
        )}
      >
        {isPdfPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        Export PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleCsvExport}
        disabled={busy}
        className="border-primary/20 hover:bg-primary/[0.04]"
      >
        {isCsvPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export CSV
      </Button>
    </div>
  );
}
