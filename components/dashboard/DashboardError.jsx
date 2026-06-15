import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DashboardError({ message }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Unable to load dashboard</AlertTitle>
      <AlertDescription>
        {message ||
          "Check your MongoDB connection in .env.local and try refreshing the page."}
      </AlertDescription>
    </Alert>
  );
}
