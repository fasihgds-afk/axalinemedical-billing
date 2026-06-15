import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getPayments, getPaymentFormOptions } from "@/actions/payments";
import { parsePaymentFilters } from "@/lib/validations/payments";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { ExportPaymentsButton } from "@/components/payments/ExportPaymentsButton";
import { PaymentsPagination } from "@/components/payments/PaymentsPagination";
import { PageIntro } from "@/components/layout/PageIntro";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

function FiltersFallback() {
  return <Skeleton className="h-40 w-full" />;
}

export default async function PaymentsPage({ searchParams }) {
  const params = await searchParams;
  const filters = parsePaymentFilters(params);
  const session = await auth();
  const userCanWrite = canWrite(session?.role);

  const [paymentsResult, optionsResult] = await Promise.all([
    getPayments(filters),
    getPaymentFormOptions(),
  ]);

  const filterDefaults = {
    q: params?.q || "",
    clientId: params?.clientId || "",
    methodId: params?.methodId || "",
    statusId: params?.statusId || "",
    from: params?.from || "",
    to: params?.to || "",
  };

  const hasFilters = Boolean(
    filterDefaults.q ||
      filterDefaults.clientId ||
      filterDefaults.methodId ||
      filterDefaults.statusId ||
      filterDefaults.from ||
      filterDefaults.to
  );

  return (
    <div className="space-y-6">
      <PageIntro
        description="Track and manage all payment records."
        extra={
          isAuthWithoutDb() ? (
            <span className="mt-2 block text-xs text-primary">
              Demo mode — sample payments included; changes stored in memory.
            </span>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-2">
          <ExportPaymentsButton filters={filterDefaults} />
          {userCanWrite ? (
            <Link
              href="/payments/new"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <Plus className="h-4 w-4" />
              Add payment
            </Link>
          ) : null}
        </div>
      </PageIntro>

      {optionsResult.success ? (
        <Suspense fallback={<FiltersFallback />}>
          <PaymentFilters
            clients={optionsResult.data.clients}
            methods={optionsResult.data.methods}
            statuses={optionsResult.data.statuses}
            defaults={filterDefaults}
          />
        </Suspense>
      ) : null}

      {!paymentsResult.success ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load payments</AlertTitle>
          <AlertDescription>{paymentsResult.error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <PaymentsTable
            payments={paymentsResult.data.payments}
            tableCustomFields={paymentsResult.data.tableCustomFields}
            canWrite={userCanWrite && !hasFilters}
          />
          <PaymentsPagination
            page={paymentsResult.data.page}
            total={paymentsResult.data.total}
            limit={paymentsResult.data.limit}
          />
        </>
      )}
    </div>
  );
}
