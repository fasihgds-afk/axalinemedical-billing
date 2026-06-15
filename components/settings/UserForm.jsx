"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUserAction } from "@/actions/users";
import { ROLES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const initialState = { success: false, error: null };

export function UserForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success("User created");
      router.refresh();
      formRef.current?.reset();
    }
  }, [state?.success, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user-name">Full name *</Label>
          <Input
            id="user-name"
            name="name"
            placeholder="Jane Smith"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email">Email *</Label>
          <Input
            id="user-email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user-password">Temporary password *</Label>
          <Input
            id="user-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role">Role *</Label>
          <select
            id="user-role"
            name="role"
            className={selectClassName}
            defaultValue={ROLES.VIEWER}
            required
            disabled={isPending}
          >
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.MANAGER}>Manager</option>
            <option value={ROLES.VIEWER}>Viewer</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create user"
        )}
      </Button>
    </form>
  );
}
