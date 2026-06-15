"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
} from "@/actions/paymentMethods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState = { success: false, error: null };

export function PaymentMethodForm({
  mode = "create",
  method = null,
  onSuccess,
  onCancel,
}) {
  const action =
    mode === "create" ? createPaymentMethodAction : updatePaymentMethodAction;

  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        mode === "create" ? "Payment method created" : "Payment method updated"
      );
      router.refresh();
      if (mode === "create") {
        formRef.current?.reset();
      }
      onSuccess?.();
    }
  }, [state?.success, mode, onSuccess, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {mode === "edit" && method?._id ? (
        <input type="hidden" name="methodId" value={method._id} />
      ) : null}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`name-${mode}`}>Name *</Label>
        <Input
          id={`name-${mode}`}
          name="name"
          defaultValue={method?.name ?? ""}
          placeholder="e.g. Zelle"
          required
          disabled={isPending || method?.isDefault}
        />
        {method?.isDefault ? (
          <p className="text-xs text-muted-foreground">
            Default method names cannot be changed.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`description-${mode}`}>Description</Label>
        <Textarea
          id={`description-${mode}`}
          name="description"
          rows={2}
          defaultValue={method?.description ?? ""}
          placeholder="Optional description"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`active-${mode}`}
          name="active"
          defaultChecked={method?.active !== false}
          disabled={isPending}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor={`active-${mode}`}>Active (available in payment forms)</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Add method"
          ) : (
            "Save changes"
          )}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
