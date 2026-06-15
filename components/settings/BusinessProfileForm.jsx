"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessProfileAction } from "@/actions/businessProfile";
import { BusinessLogoUpload } from "@/components/settings/BusinessLogoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState = { success: false, error: null };

export function BusinessProfileForm({ profile, uploadEnabled = false }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateBusinessProfileAction,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Business profile updated");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <BusinessLogoUpload
        initialLogo={profile?.logo}
        uploadEnabled={uploadEnabled}
      />

      <div className="space-y-2">
        <Label htmlFor="businessName">Business name *</Label>
        <Input
          id="businessName"
          name="businessName"
          defaultValue={profile?.businessName ?? ""}
          placeholder="Axaline Medical Billing"
          required
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email ?? ""}
            placeholder="billing@example.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile?.phone ?? ""}
            placeholder="(555) 123-4567"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          defaultValue={profile?.website ?? ""}
          placeholder="https://example.com"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={profile?.address ?? ""}
          placeholder="Street, city, state, zip"
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  );
}
