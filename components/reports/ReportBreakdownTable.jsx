import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { resolveStatusColor } from "@/lib/reportBrand";
import { formatCurrency } from "@/lib/formatCurrency";

export function ReportBreakdownTable({
  rows = [],
  nameColumn = "Name",
  emptyMessage = "No data for the selected period",
  showStatusColors = false,
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/[0.03] py-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-primary/10 bg-gradient-to-br from-card to-primary/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-primary/10 bg-gradient-to-r from-[#0c1f38] to-primary hover:from-[#0c1f38] hover:to-primary">
            <TableHead className="font-semibold text-white">{nameColumn}</TableHead>
            <TableHead className="text-right font-semibold text-white">Total</TableHead>
            <TableHead className="text-right font-semibold text-white">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const name = row.name ?? row.label ?? "—";
            const statusColor =
              showStatusColors || row.color
                ? resolveStatusColor(name, row.color)
                : null;

            return (
              <TableRow
                key={row.id ?? row.label ?? row.name ?? index}
                className={cn(
                  "border-primary/5 transition-colors hover:bg-primary/[0.04]",
                  index % 2 === 1 && "bg-primary/[0.02]"
                )}
              >
                <TableCell className="font-medium">
                  {statusColor ? (
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: statusColor }}
                        aria-hidden
                      />
                      <span style={{ color: statusColor }}>{name}</span>
                    </span>
                  ) : (
                    name
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {formatCurrency(row.total)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.count}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
