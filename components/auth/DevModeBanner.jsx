import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isAuthWithoutDb, getDevLoginHint } from "@/lib/devAuth";

export function DevModeBanner() {
  if (!isAuthWithoutDb()) {
    return null;
  }

  return (
    <Alert className="mb-4 border-primary/30 bg-primary/5">
      <AlertTitle className="text-primary">Demo mode (no database)</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Sign in with: <span className="font-medium text-foreground">{getDevLoginHint()}</span>
      </AlertDescription>
    </Alert>
  );
}
