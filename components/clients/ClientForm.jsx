"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const createInitialState = { success: false, error: null };
const updateInitialState = { success: false, error: null };

export function ClientForm({
  mode = "create",
  client = null,
  submitLabel,
}) {
  const router = useRouter();
  const action = mode === "create" ? createClientAction : updateClientAction;
  const initialState = mode === "create" ? createInitialState : updateInitialState;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success && mode === "edit") {
      toast.success("Client updated successfully");
      router.refresh();
    }
  }, [state?.success, mode, router]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && client?._id ? (
        <input type="hidden" name="clientId" value={client._id} />
      ) : null}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Client name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={client?.name ?? ""}
          placeholder="e.g. Metro Health Clinic"
          required
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            placeholder="billing@clinic.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            placeholder="(555) 123-4567"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={client?.address ?? ""}
          placeholder="Street, city, state"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={client?.notes ?? ""}
          placeholder="Internal notes about this client..."
          disabled={isPending}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel || (mode === "create" ? "Create client" : "Save changes")
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
