"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCustomFieldAction } from "@/actions/customFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteCustomFieldDialog({ fieldId, fieldLabel }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteCustomFieldAction(fieldId);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setOpen(false);
      toast.success("Custom field deleted");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {fieldLabel}</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete custom field</DialogTitle>
          <DialogDescription>
            Delete <strong>{fieldLabel}</strong>? Existing payment values for this
            field will remain in historical records.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
