import Link from "next/link";

export default function ClientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold">Client not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This client may have been deleted or the link is invalid.
      </p>
      <Link
        href="/clients"
        className="mt-6 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Back to clients
      </Link>
    </div>
  );
}
