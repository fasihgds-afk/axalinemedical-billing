import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { getPaymentById, getPaymentFormOptions } from "@/actions/payments";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { DeletePaymentDialog } from "@/components/payments/DeletePaymentDialog";
import { Badge } from "@/components/ui/badge";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getPaymentById(id);

  return {
    title: result.success
      ? `${formatCurrency(result.data.payment.amount)} — Payment`
      : "Payment",
  };
}

export default async function PaymentDetailPage({ params }) {
  const { id } = await params;
  const session = await auth();
  const userCanWrite = canWrite(session?.role);

  const [paymentResult, optionsResult] = await Promise.all([
    getPaymentById(id),
    getPaymentFormOptions(),
  ]);

  if (!paymentResult.success) {
    if (paymentResult.error === "Payment not found") {
      notFound();
    }

    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{paymentResult.error}</AlertDescription>
      </Alert>
    );
  }

  const { payment } = paymentResult.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/payments"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to payments
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {formatCurrency(payment.amount)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {payment.client?.name} · {formatDate(payment.paymentDate)}
          </p>
        </div>
        {userCanWrite ? <DeletePaymentDialog paymentId={payment._id} /> : null}
      </div>

      {!userCanWrite ? (
        <GradientCard>
          <GradientCardHeader>
            <GradientCardTitle>Payment summary</GradientCardTitle>
          </GradientCardHeader>
          <GradientCardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                style={{
                  borderColor: payment.status?.color,
                  color: payment.status?.color,
                }}
              >
                {payment.status?.name}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span>{payment.method?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span>{payment.referenceNumber || "—"}</span>
            </div>
            {payment.notes ? (
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p className="mt-1">{payment.notes}</p>
              </div>
            ) : null}
            {payment.screenshot?.url ? (
              <div className="relative mt-2 h-48 w-full max-w-md overflow-hidden rounded-lg border">
                <Image
                  src={payment.screenshot.url}
                  alt="Payment screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
          </GradientCardContent>
        </GradientCard>
      ) : null}

      {userCanWrite && optionsResult.success ? (
        <GradientCard>
          <GradientCardHeader>
            <GradientCardTitle>Edit payment</GradientCardTitle>
            <GradientCardDescription>Update payment details below.</GradientCardDescription>
          </GradientCardHeader>
          <GradientCardContent>
            <PaymentForm
              mode="edit"
              payment={payment}
              options={{
                ...optionsResult.data,
                customFields: paymentResult.data.customFields,
              }}
            />
          </GradientCardContent>
        </GradientCard>
      ) : null}
    </div>
  );
}
