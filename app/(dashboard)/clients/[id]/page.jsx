import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { getClientById } from "@/actions/clients";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientPaymentHistory } from "@/components/clients/ClientPaymentHistory";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getClientById(id);

  return {
    title: result.success ? result.data.client.name : "Client",
  };
}

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const session = await auth();
  const userCanWrite = canWrite(session?.role);

  const result = await getClientById(id);

  if (!result.success) {
    if (result.error === "Client not found") {
      notFound();
    }

    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  const { client, payments } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/clients"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to clients
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-sm text-muted-foreground">Client profile</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userCanWrite ? (
            <Link
              href={`/payments/new?clientId=${client._id}`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Add payment
            </Link>
          ) : null}
          {userCanWrite ? (
            <DeleteClientDialog clientId={client._id} clientName={client.name} />
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {!userCanWrite ? <ClientDetails client={client} /> : null}

        {userCanWrite ? (
          <GradientCard className="lg:col-span-2">
            <GradientCardHeader>
              <GradientCardTitle>Edit client</GradientCardTitle>
              <GradientCardDescription>Update client information below.</GradientCardDescription>
            </GradientCardHeader>
            <GradientCardContent>
              <ClientForm mode="edit" client={client} />
            </GradientCardContent>
          </GradientCard>
        ) : null}
      </div>

      <ClientPaymentHistory payments={payments} clientId={client._id} />
    </div>
  );
}
