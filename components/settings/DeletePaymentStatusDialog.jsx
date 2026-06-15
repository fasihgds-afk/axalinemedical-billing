"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePaymentStatusAction } from "@/actions/paymentStatuses";
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

export function DeletePaymentStatusDialog({ statusId, statusName }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deletePaymentStatusAction(statusId);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setOpen(false);
      toast.success("Payment status deleted");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {statusName}</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete payment status</DialogTitle>
          <DialogDescription>
            Delete <strong>{statusName}</strong>? Statuses linked to payments
            cannot be removed.
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
