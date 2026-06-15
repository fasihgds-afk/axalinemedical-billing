"use client";

import { useState, useTransition } from "react";
import { Loader2, UserX } from "lucide-react";
import { toast } from "sonner";
import { deactivateUserAction } from "@/actions/users";
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

export function DeactivateUserDialog({ userId, userName, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDeactivate() {
    setError(null);

    startTransition(async () => {
      const result = await deactivateUserAction(userId);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setOpen(false);
      toast.success("User deactivated");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={disabled}>
            <UserX className="mr-1 h-3.5 w-3.5" />
            Deactivate
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate user</DialogTitle>
          <DialogDescription>
            Deactivate <strong>{userName}</strong>? They will no longer be able to sign in.
            This does not delete their account or audit history.
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
            onClick={handleDeactivate}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
