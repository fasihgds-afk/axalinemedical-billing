import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { getPaymentFormOptions } from "@/actions/payments";
import { PaymentForm } from "@/components/payments/PaymentForm";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Add Payment",
};

export default async function NewPaymentPage({ searchParams }) {
  const session = await auth();
  const params = await searchParams;

  if (!canWrite(session?.role)) {
    redirect("/payments");
  }

  const optionsResult = await getPaymentFormOptions();

  if (!optionsResult.success) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load form</AlertTitle>
        <AlertDescription>{optionsResult.error}</AlertDescription>
      </Alert>
    );
  }

  const preselectedClientId = params?.clientId || "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/payments"
          className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to payments
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add payment</h1>
        <p className="text-sm text-muted-foreground">
          Record a new payment with optional screenshot.
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Payment details</GradientCardTitle>
          <GradientCardDescription>Fields marked with * are required.</GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <PaymentForm
            mode="create"
            options={optionsResult.data}
            payment={
              preselectedClientId
                ? { clientId: preselectedClientId }
                : null
            }
          />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
