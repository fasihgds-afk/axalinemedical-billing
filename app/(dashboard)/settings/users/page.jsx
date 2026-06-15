import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/auth";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getUsers } from "@/actions/users";
import { UserForm } from "@/components/settings/UserForm";
import { UsersTable } from "@/components/settings/UsersTable";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Users",
};

export default async function UsersSettingsPage() {
  const session = await auth();

  if (!isAdmin(session?.role)) {
    redirect("/dashboard?error=forbidden");
  }

  const result = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Invite team members and manage roles. Admin only.
          {isAuthWithoutDb() ? (
            <span className="mt-1 block text-xs text-primary">
              Demo mode — user list stored in memory. Only the demo login account can
              sign in until MongoDB is connected.
            </span>
          ) : null}
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Create user</GradientCardTitle>
          <GradientCardDescription>
            Add a new account with a temporary password. Share credentials securely with
            the team member.
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <UserForm />
        </GradientCardContent>
      </GradientCard>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load users</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <UsersTable users={result.data} currentUserId={session.userId} />
      )}
    </div>
  );
}
