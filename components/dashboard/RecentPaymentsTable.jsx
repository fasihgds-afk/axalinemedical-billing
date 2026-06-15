import Link from "next/link";
import { ArrowRight, CreditCard, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  gradientEmptyStateClass,
  gradientTableShellClass,
} from "@/components/layout/GradientCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";

function EmptyState() {
  return (
    <div className={gradientEmptyStateClass}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#155a9e] text-white shadow-lg shadow-primary/30">
        <CreditCard className="h-7 w-7" />
      </div>
      <p className="text-base font-semibold text-foreground">No payments yet</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Record your first payment to see activity here on the dashboard.
      </p>
      <Link
        href="/payments/new"
        className={cn(buttonVariants({ size: "sm" }), "mt-6")}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add payment
      </Link>
    </div>
  );
}

export function RecentPaymentsTable({ payments = [] }) {
  return (
    <DashboardCard
      title="Recent payments"
      description="Latest 10 payment records"
      action={
        payments.length > 0 ? (
          <Link
            href="/payments"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View all
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        ) : null
      }
      contentClassName="pt-4"
    >
      {payments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={gradientTableShellClass}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment._id}
                  className="transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell>
                    <Link
                      href={`/payments/${payment._id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {payment.client?.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.method?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-medium"
                      style={{
                        borderColor: `${payment.status?.color}55`,
                        backgroundColor: `${payment.status?.color}12`,
                        color: payment.status?.color,
                      }}
                    >
                      {payment.status?.name ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold tabular-nums text-foreground">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
