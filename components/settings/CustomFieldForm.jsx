"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCustomFieldAction,
  updateCustomFieldAction,
} from "@/actions/customFields";
import { CUSTOM_FIELD_TYPES } from "@/config/constants";
import { slugifyFieldKey } from "@/lib/validations/customFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormSelect } from "@/components/payments/FormSelect";

const initialState = { success: false, error: null };

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function CustomFieldForm({
  mode = "create",
  field = null,
  onSuccess,
  onCancel,
}) {
  const action =
    mode === "create" ? createCustomFieldAction : updateCustomFieldAction;

  const router = useRouter();
  const formRef = useRef(null);
  const [fieldType, setFieldType] = useState(field?.type ?? "Text");
  const [fieldKey, setFieldKey] = useState(field?.key ?? "");
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        mode === "create" ? "Custom field created" : "Custom field updated"
      );
      router.refresh();
      if (mode === "create") {
        formRef.current?.reset();
        setFieldType("Text");
        setFieldKey("");
      }
      onSuccess?.();
    }
  }, [state?.success, mode, onSuccess, router]);

  function handleLabelBlur(event) {
    if (mode === "edit") return;

    const label = event.target.value;
    if (!fieldKey && label.trim()) {
      setFieldKey(slugifyFieldKey(label));
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {mode === "edit" && field?._id ? (
        <input type="hidden" name="fieldId" value={field._id} />
      ) : null}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`label-${mode}`}>Label *</Label>
          <Input
            id={`label-${mode}`}
            name="label"
            defaultValue={field?.label ?? ""}
            placeholder="e.g. Invoice number"
            required
            disabled={isPending}
            onBlur={handleLabelBlur}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`key-${mode}`}>Field key *</Label>
          <Input
            id={`key-${mode}`}
            name="key"
            value={fieldKey}
            onChange={(event) => setFieldKey(event.target.value.toLowerCase())}
            placeholder="invoice_number"
            required
            disabled={isPending || mode === "edit"}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {mode === "edit"
              ? "Key cannot be changed after creation."
              : "Auto-generated from label; lowercase and underscores only."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`type-${mode}`}>Field type *</Label>
        <select
          id={`type-${mode}`}
          name="type"
          value={fieldType}
          onChange={(event) => setFieldType(event.target.value)}
          disabled={isPending}
          required
          className={selectClassName}
        >
          {CUSTOM_FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`placeholder-${mode}`}>Placeholder</Label>
        <Input
          id={`placeholder-${mode}`}
          name="placeholder"
          defaultValue={field?.placeholder ?? ""}
          disabled={isPending}
        />
      </div>

      {fieldType === "Dropdown" ? (
        <div className="space-y-2">
          <Label htmlFor={`options-${mode}`}>Dropdown options *</Label>
          <Textarea
            id={`options-${mode}`}
            name="options"
            rows={4}
            defaultValue={(field?.options || []).join("\n")}
            placeholder="One option per line"
            required
            disabled={isPending}
          />
        </div>
      ) : (
        <input type="hidden" name="options" value="" />
      )}

      <div className="space-y-2">
        <Label htmlFor={`sortOrder-${mode}`}>Sort order</Label>
        <Input
          id={`sortOrder-${mode}`}
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={field?.sortOrder ?? 0}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="required"
            defaultChecked={field?.required}
            disabled={isPending}
            className="h-4 w-4 rounded border-input"
          />
          Required on payment form
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showInTable"
            defaultChecked={field?.showInTable}
            disabled={isPending}
            className="h-4 w-4 rounded border-input"
          />
          Show in payments table
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={field?.active !== false}
            disabled={isPending}
            className="h-4 w-4 rounded border-input"
          />
          Active
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Add field"
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
