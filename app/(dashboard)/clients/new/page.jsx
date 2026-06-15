import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canWrite } from "@/config/constants";
import { ClientForm } from "@/components/clients/ClientForm";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";

export const metadata = {
  title: "Add Client",
};

export default async function NewClientPage() {
  const session = await auth();

  if (!canWrite(session?.role)) {
    redirect("/clients");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/clients"
          className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to clients
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add client</h1>
        <p className="text-sm text-muted-foreground">
          Create a new client profile for payment tracking.
        </p>
      </div>

      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>Client details</GradientCardTitle>
          <GradientCardDescription>Fields marked with * are required.</GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <ClientForm mode="create" />
        </GradientCardContent>
      </GradientCard>
    </div>
  );
}
