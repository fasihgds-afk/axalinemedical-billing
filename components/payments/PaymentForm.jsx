"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPaymentAction, updatePaymentAction } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormSelect } from "@/components/payments/FormSelect";
import { CustomFieldInputs } from "@/components/payments/CustomFieldInputs";
import { ScreenshotUpload } from "@/components/payments/ScreenshotUpload";

const initialState = { success: false, error: null };

function toDateInputValue(dateString) {
  if (!dateString) return new Date().toISOString().slice(0, 10);
  return new Date(dateString).toISOString().slice(0, 10);
}

export function PaymentForm({
  mode = "create",
  payment = null,
  options,
}) {
  const router = useRouter();
  const action = mode === "create" ? createPaymentAction : updatePaymentAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const { clients = [], methods = [], statuses = [], customFields = [], uploadEnabled = false } =
    options || {};

  useEffect(() => {
    if (state?.success && mode === "edit") {
      toast.success("Payment updated successfully");
      router.refresh();
    }
  }, [state?.success, mode, router]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && payment?._id ? (
        <input type="hidden" name="paymentId" value={payment._id} />
      ) : null}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FormSelect
        id="clientId"
        name="clientId"
        label="Client"
        required
        defaultValue={payment?.clientId ?? ""}
        placeholder="Select client"
        disabled={isPending}
        options={clients.map((client) => ({
          value: client._id,
          label: client.name,
        }))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={payment?.amount ?? ""}
            placeholder="0.00"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment date *</Label>
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            required
            defaultValue={toDateInputValue(payment?.paymentDate)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          id="paymentMethodId"
          name="paymentMethodId"
          label="Payment method"
          required
          defaultValue={payment?.paymentMethodId ?? ""}
          disabled={isPending}
          options={methods.map((method) => ({
            value: method._id,
            label: method.name,
          }))}
        />
        <FormSelect
          id="paymentStatusId"
          name="paymentStatusId"
          label="Status"
          required
          defaultValue={payment?.paymentStatusId ?? ""}
          disabled={isPending}
          options={statuses.map((status) => ({
            value: status._id,
            label: status.name,
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceNumber">Reference number</Label>
        <Input
          id="referenceNumber"
          name="referenceNumber"
          defaultValue={payment?.referenceNumber ?? ""}
          placeholder="e.g. ZEL-12345"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={payment?.notes ?? ""}
          disabled={isPending}
        />
      </div>

      <ScreenshotUpload
        initialScreenshot={payment?.screenshot}
        uploadEnabled={uploadEnabled}
      />

      <CustomFieldInputs
        fields={customFields}
        values={payment?.customFields ?? {}}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Create payment"
          ) : (
            "Save changes"
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
