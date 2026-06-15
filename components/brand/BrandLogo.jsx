import { cn } from "@/lib/utils";

export function BrandLogo({ size = 64, className, priority = false }) {
  return (
    <picture>
      <source srcSet="/logo.png" type="image/png" />
      <img
        src="/logo.svg"
        alt="Axaline Medical Billing"
        width={size}
        height={size}
        className={cn("rounded-lg bg-white object-contain", className)}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
