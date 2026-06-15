import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gradientTableShellClass } from "@/components/layout/GradientCard";
import { formatCurrency } from "@/lib/formatCurrency";

export function ReportBreakdownTable({
  rows = [],
  nameColumn = "Name",
  emptyMessage = "No data for the selected period",
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className={gradientTableShellClass}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{nameColumn}</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id ?? row.label ?? row.name}>
              <TableCell className="font-medium">
                {row.color ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden
                    />
                    {row.name ?? row.label}
                  </span>
                ) : (
                  row.name ?? row.label
                )}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
