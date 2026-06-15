import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { DevModeBanner } from "@/components/auth/DevModeBanner";

export const metadata = {
  title: "Login",
};

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-8 shadow-[0_24px_64px_-16px_rgba(12,31,56,0.45)] backdrop-blur-sm sm:p-10">
      <div className="mb-8 flex justify-center">
        <BrandLogo
          size={56}
          className="rounded-xl p-1.5 shadow-md ring-1 ring-border/40"
          priority
        />
      </div>

      <DevModeBanner />

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
