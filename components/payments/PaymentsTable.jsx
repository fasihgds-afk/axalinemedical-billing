import Link from "next/link";
import Image from "next/image";
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

function EmptyState({ canWrite }) {
  return (
    <div className={gradientEmptyStateClass}>
      <CreditCard className="mb-3 h-10 w-10 text-primary/40" />
      <p className="text-sm font-medium">No payments found</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {canWrite
          ? "Record your first payment to see it here."
          : "No payments match your filters."}
      </p>
      {canWrite ? (
        <Link
          href="/payments/new"
          className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Add payment
        </Link>
      ) : null}
    </div>
  );
}

export function PaymentsTable({
  payments = [],
  tableCustomFields = [],
  canWrite = false,
}) {
  return (
    <GradientCard>
      <GradientCardHeader>
        <GradientCardTitle>Payments</GradientCardTitle>
        <GradientCardDescription>
          {payments.length} payment{payments.length === 1 ? "" : "s"} shown
        </GradientCardDescription>
      </GradientCardHeader>
      <GradientCardContent>
        {payments.length === 0 ? (
          <EmptyState canWrite={canWrite} />
        ) : (
          <div className={gradientTableShellClass}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  {tableCustomFields.map((field) => (
                    <TableHead key={field._id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Screenshot</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/payments/${payment._id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {payment.client?.name ?? "—"}
                      </Link>
                    </TableCell>
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
                    {tableCustomFields.map((field) => (
                      <TableCell key={field._id} className="text-muted-foreground">
                        {formatCustomValue(payment.customFields?.[field.key])}
                      </TableCell>
                    ))}
                    <TableCell>
                      {payment.screenshot?.url ? (
                        <div className="relative h-8 w-12 overflow-hidden rounded border">
                          <Image
                            src={payment.screenshot.url}
                            alt="Screenshot"
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        "—"
                      )}
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

function formatCustomValue(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
