"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPaymentStatusAction,
  updatePaymentStatusAction,
} from "@/actions/paymentStatuses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColorPicker } from "@/components/settings/ColorPicker";

const initialState = { success: false, error: null };

export function PaymentStatusForm({
  mode = "create",
  status = null,
  onSuccess,
  onCancel,
}) {
  const action =
    mode === "create" ? createPaymentStatusAction : updatePaymentStatusAction;

  const router = useRouter();
  const formRef = useRef(null);
  const [colorPickerKey, setColorPickerKey] = useState(0);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        mode === "create" ? "Payment status created" : "Payment status updated"
      );
      router.refresh();
      if (mode === "create") {
        formRef.current?.reset();
        setColorPickerKey((key) => key + 1);
      }
      onSuccess?.();
    }
  }, [state?.success, mode, onSuccess, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {mode === "edit" && status?._id ? (
        <input type="hidden" name="statusId" value={status._id} />
      ) : null}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`status-name-${mode}`}>Name *</Label>
        <Input
          id={`status-name-${mode}`}
          name="name"
          defaultValue={status?.name ?? ""}
          placeholder="e.g. Paid"
          required
          disabled={isPending || status?.isDefault}
        />
        {status?.isDefault ? (
          <p className="text-xs text-muted-foreground">
            Default status names cannot be changed.
          </p>
        ) : null}
      </div>

      <ColorPicker
        key={`${mode}-${colorPickerKey}-${status?._id ?? "new"}`}
        id={`status-color-${mode}`}
        defaultValue={status?.color ?? "#1E67B5"}
        disabled={isPending}
      />

      <div className="space-y-2">
        <Label htmlFor={`sortOrder-${mode}`}>Sort order</Label>
        <Input
          id={`sortOrder-${mode}`}
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={status?.sortOrder ?? 0}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Lower numbers appear first in dropdowns.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`status-active-${mode}`}
          name="active"
          defaultChecked={status?.active !== false}
          disabled={isPending}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor={`status-active-${mode}`}>
          Active (available in payment forms)
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Add status"
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
