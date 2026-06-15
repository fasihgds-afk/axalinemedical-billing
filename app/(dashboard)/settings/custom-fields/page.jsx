import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/auth";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getCustomFields } from "@/actions/customFields";
import { CustomFieldForm } from "@/components/settings/CustomFieldForm";
import { CustomFieldsTable } from "@/components/settings/CustomFieldsTable";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Custom Fields",
};

export default async function CustomFieldsSettingsPage() {
  const session = await auth();

  if (!isAdmin(session?.role)) {
    redirect("/dashboard?error=forbidden");
  }

  const result = await getCustomFields();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Custom fields</h1>
        <p className="text-sm text-muted-foreground">
          Add extra fields to payment forms and optionally show them in the
          payments table. Admin only.
          {isAuthWithoutDb() ? (
            <span className="mt-1 block text-xs text-primary">
              Demo mode — changes stored in memory until MongoDB is connected.
            </span>
          ) : null}
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Add custom field</GradientCardTitle>
          <GradientCardDescription>
            Define label, type, and whether it appears on payment forms or the
            list table.
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <CustomFieldForm mode="create" />
        </GradientCardContent>
      </GradientCard>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load custom fields</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <CustomFieldsTable fields={result.data} />
      )}
    </div>
  );
}
