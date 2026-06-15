"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState = {
  success: false,
  error: null,
  redirectTo: null,
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state?.success, state?.redirectTo, router]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 border-primary/10 bg-background/80 pl-10"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 border-primary/10 bg-background/80 pl-10"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-gradient-to-r from-primary to-[#2d7fc2] text-base font-semibold shadow-md shadow-primary/25 hover:from-primary/95 hover:to-[#2d7fc2]/95"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
