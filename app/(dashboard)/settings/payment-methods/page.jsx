import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getPaymentMethods } from "@/actions/paymentMethods";
import { PaymentMethodForm } from "@/components/settings/PaymentMethodForm";
import { PaymentMethodsTable } from "@/components/settings/PaymentMethodsTable";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Payment Methods",
};

export default async function PaymentMethodsSettingsPage() {
  const session = await auth();

  if (!canWrite(session?.role)) {
    redirect("/dashboard?error=forbidden");
  }

  const result = await getPaymentMethods();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment methods</h1>
        <p className="text-sm text-muted-foreground">
          Configure how clients pay (Zelle, bank transfer, etc.).
          {isAuthWithoutDb() ? (
            <span className="mt-1 block text-xs text-primary">
              Demo mode — changes stored in memory until MongoDB is connected.
            </span>
          ) : null}
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Add payment method</GradientCardTitle>
          <GradientCardDescription>Create a new option for payment forms.</GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <PaymentMethodForm mode="create" />
        </GradientCardContent>
      </GradientCard>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load payment methods</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <PaymentMethodsTable methods={result.data} />
      )}
    </div>
  );
}
