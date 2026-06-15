"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function useLogout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      const result = await logoutAction();
      if (result?.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  }

  return { logout, isPending };
}

export function LogoutButton({ variant = "menu", className, onNavigate }) {
  const { logout, isPending } = useLogout();

  function handleLogout() {
    onNavigate?.();
    logout();
  }

  const label = isPending ? "Signing out..." : "Sign out";

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
        className={cn("shrink-0", className)}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin sm:mr-2" />
        ) : (
          <LogOut className="h-4 w-4 shrink-0 sm:mr-2" />
        )}
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </Button>
    );
  }

  if (variant === "sidebar") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        disabled={isPending}
        className={cn(
          "w-full justify-start border-sidebar-border/50 bg-transparent text-sidebar-foreground/90 hover:bg-destructive/15 hover:text-destructive",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={handleLogout}
      disabled={isPending}
      className={cn("cursor-pointer", className)}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {label}
    </DropdownMenuItem>
  );
}
