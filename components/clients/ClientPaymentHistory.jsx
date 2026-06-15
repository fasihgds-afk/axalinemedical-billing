import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
  gradientEmptyStateClass,
  gradientTableShellClass,
} from "@/components/layout/GradientCard";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";

export function ClientPaymentHistory({ payments = [], clientId }) {
  return (
    <GradientCard>
      <GradientCardHeader>
        <GradientCardTitle>Payment history</GradientCardTitle>
        <GradientCardDescription>
          Recent payments for this client (up to 20)
        </GradientCardDescription>
      </GradientCardHeader>
      <GradientCardContent>
        {payments.length === 0 ? (
          <div className={gradientEmptyStateClass}>
            <CreditCard className="mb-3 h-9 w-9 text-primary/40" />
            <p className="text-sm font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Payments linked to this client will appear here.
            </p>
            <Link
              href="/payments"
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Go to payments
            </Link>
          </div>
        ) : (
          <div className={gradientTableShellClass}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.method?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: payment.status?.color,
                          color: payment.status?.color,
                        }}
                      >
                        {payment.status?.name ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.referenceNumber || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GradientCardContent>
    </GradientCard>
  );
}
