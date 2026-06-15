import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/auth";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getBusinessProfile } from "@/actions/businessProfile";
import { BusinessProfileForm } from "@/components/settings/BusinessProfileForm";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Business Profile",
};

export default async function BusinessProfileSettingsPage() {
  const session = await auth();

  if (!isAdmin(session?.role)) {
    redirect("/dashboard?error=forbidden");
  }

  const result = await getBusinessProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business profile</h1>
        <p className="text-sm text-muted-foreground">
          Your company name, logo, and contact details. Admin only.
          {isAuthWithoutDb() ? (
            <span className="mt-1 block text-xs text-primary">
              Demo mode — changes stored in memory until MongoDB is connected.
            </span>
          ) : null}
        </p>
      </div>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load business profile</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <GradientCard>
          <GradientCardHeader>
            <GradientCardTitle>Company details</GradientCardTitle>
            <GradientCardDescription>
              Used for branding across the app and on exported reports.
            </GradientCardDescription>
          </GradientCardHeader>
          <GradientCardContent>
            <BusinessProfileForm
              profile={result.data.profile}
              uploadEnabled={result.data.uploadEnabled}
            />
          </GradientCardContent>
        </GradientCard>
      )}
    </div>
  );
}
