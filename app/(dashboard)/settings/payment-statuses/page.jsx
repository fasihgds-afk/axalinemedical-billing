import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getPaymentStatuses } from "@/actions/paymentStatuses";
import { PaymentStatusForm } from "@/components/settings/PaymentStatusForm";
import { PaymentStatusesTable } from "@/components/settings/PaymentStatusesTable";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Payment Statuses",
};

export default async function PaymentStatusesSettingsPage() {
  const session = await auth();

  if (!canWrite(session?.role)) {
    redirect("/dashboard?error=forbidden");
  }

  const result = await getPaymentStatuses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment statuses</h1>
        <p className="text-sm text-muted-foreground">
          Manage status labels and colors shown on payments and reports.
          {isAuthWithoutDb() ? (
            <span className="mt-1 block text-xs text-primary">
              Demo mode — changes stored in memory until MongoDB is connected.
            </span>
          ) : null}
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Add payment status</GradientCardTitle>
          <GradientCardDescription>
            Choose a name and color for the status badge.
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <PaymentStatusForm mode="create" />
        </GradientCardContent>
      </GradientCard>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load payment statuses</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <PaymentStatusesTable statuses={result.data} />
      )}
    </div>
  );
}
