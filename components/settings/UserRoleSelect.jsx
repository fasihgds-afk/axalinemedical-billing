"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/actions/users";
import { ROLES } from "@/config/constants";

const selectClassName =
  "h-8 min-w-[120px] rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function UserRoleSelect({ userId, currentRole, disabled = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const role = event.target.value;
    if (role === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, role);

      if (!result.success) {
        toast.error(result.error || "Failed to update role");
        return;
      }

      toast.success("Role updated");
      router.refresh();
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentRole}
        onChange={handleChange}
        className={selectClassName}
        disabled={disabled || isPending}
        aria-label="User role"
      >
        <option value={ROLES.ADMIN}>Admin</option>
        <option value={ROLES.MANAGER}>Manager</option>
        <option value={ROLES.VIEWER}>Viewer</option>
      </select>
      {isPending ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
