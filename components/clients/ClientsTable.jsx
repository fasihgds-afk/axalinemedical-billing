import Link from "next/link";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
  gradientEmptyStateClass,
  gradientTableShellClass,
} from "@/components/layout/GradientCard";
import { formatDate } from "@/lib/formatDate";

function EmptyState({ canWrite, hasSearch }) {
  return (
    <div className={gradientEmptyStateClass}>
      <Users className="mb-3 h-10 w-10 text-primary/40" />
      <p className="text-sm font-medium text-foreground">No clients found</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "No clients match your search. Try a different term."
          : canWrite
            ? "Add your first client to start tracking payments."
            : "No clients have been added yet."}
      </p>
      {canWrite && !hasSearch ? (
        <Link
          href="/clients/new"
          className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Add client
        </Link>
      ) : null}
    </div>
  );
}

export function ClientsTable({ clients = [], canWrite = false, hasSearch = false }) {
  return (
    <GradientCard>
      <GradientCardHeader>
        <GradientCardTitle>All clients</GradientCardTitle>
        <GradientCardDescription>
          {clients.length} client{clients.length === 1 ? "" : "s"}
        </GradientCardDescription>
      </GradientCardHeader>
      <GradientCardContent>
        {clients.length === 0 ? (
          <EmptyState canWrite={canWrite} hasSearch={hasSearch} />
        ) : (
          <div className={gradientTableShellClass}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <Link
                        href={`/clients/${client._id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email || "—"}
                    </TableCell>
                    <TableCell>{client.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GradientCardContent>
    </GradientCard>
  );
}
