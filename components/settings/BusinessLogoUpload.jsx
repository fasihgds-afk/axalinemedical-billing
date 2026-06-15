"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, X } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function BusinessLogoUpload({
  initialLogo = null,
  uploadEnabled = false,
}) {
  const [logo, setLogo] = useState(initialLogo);

  function handleClear() {
    setLogo(null);
  }

  return (
    <div className="space-y-3">
      <Label>Business logo</Label>

      <input type="hidden" name="logoUrl" value={logo?.url || ""} />
      <input type="hidden" name="logoKey" value={logo?.key || ""} />

      {logo?.url ? (
        <div className="relative inline-block overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-card to-muted/20 p-2">
          <Image
            src={logo.url}
            alt="Business logo"
            width={160}
            height={160}
            className="h-32 w-32 rounded-lg object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-3 right-3"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove logo</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-primary/20 bg-primary/[0.03] p-6">
          <Building2 className="h-8 w-8 text-primary/40" />
          {uploadEnabled ? (
            <UploadButton
              endpoint="businessLogo"
              onClientUploadComplete={(response) => {
                const file = response?.[0];
                if (file) {
                  setLogo({
                    url: file.ufsUrl || file.url,
                    key: file.key,
                  });
                }
              }}
              onUploadError={(error) => {
                toast.error(error.message || "Upload failed");
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Logo upload requires UploadThing configuration in .env.local. You
              can still save other business details without a logo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
