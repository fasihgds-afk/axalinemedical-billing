"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ScreenshotUpload({
  initialScreenshot = null,
  uploadEnabled = false,
}) {
  const [screenshot, setScreenshot] = useState(initialScreenshot);

  function handleClear() {
    setScreenshot(null);
  }

  return (
    <div className="space-y-3">
      <Label>Payment screenshot</Label>

      <input type="hidden" name="screenshotUrl" value={screenshot?.url || ""} />
      <input type="hidden" name="screenshotKey" value={screenshot?.key || ""} />

      {screenshot?.url ? (
        <div className="relative inline-block overflow-hidden rounded-lg border">
          <Image
            src={screenshot.url}
            alt="Payment screenshot"
            width={320}
            height={200}
            className="max-h-48 w-auto object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove screenshot</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-6">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          {uploadEnabled ? (
            <UploadButton
              endpoint="paymentScreenshot"
              onClientUploadComplete={(response) => {
                const file = response?.[0];
                if (file) {
                  setScreenshot({
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
              Screenshot upload requires UploadThing configuration in .env.local.
              You can save payments without a screenshot in demo mode.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
