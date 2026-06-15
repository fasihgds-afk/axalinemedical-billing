import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getClients } from "@/actions/clients";
import { ClientSearch } from "@/components/clients/ClientSearch";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { PageIntro } from "@/components/layout/PageIntro";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

function SearchFallback() {
  return <Skeleton className="h-8 w-full max-w-xl" />;
}

export default async function ClientsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const session = await auth();
  const userCanWrite = canWrite(session?.role);

  const result = await getClients({ search: query });

  return (
    <div className="space-y-6">
      <PageIntro
        description="Manage client profiles and view payment history."
        extra={
          isAuthWithoutDb() ? (
            <span className="mt-2 block text-xs text-primary">
              Demo mode — changes are stored in memory until you connect MongoDB.
            </span>
          ) : null
        }
      >
        {userCanWrite ? (
          <Link
            href="/clients/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add client
          </Link>
        ) : null}
      </PageIntro>

      <Suspense fallback={<SearchFallback />}>
        <ClientSearch defaultValue={query} />
      </Suspense>

      {!result.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load clients</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <ClientsTable
          clients={result.data.clients}
          canWrite={userCanWrite}
          hasSearch={Boolean(query)}
        />
      )}
    </div>
  );
}
