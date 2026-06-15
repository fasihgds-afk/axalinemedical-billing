import { BrandLogo } from "@/components/brand/BrandLogo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { DevModeBanner } from "@/components/auth/DevModeBanner";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
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
      <RegisterForm />
    </div>
  );
}
