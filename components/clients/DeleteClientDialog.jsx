"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "@/actions/clients";
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

export function DeleteClientDialog({ clientId, clientName }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteClientAction(clientId);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setOpen(false);
      toast.success("Client deleted");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete client</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{clientName}</strong>? This
            action cannot be undone. Clients with linked payments cannot be
            deleted.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
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
              "Delete client"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
