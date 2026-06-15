"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { auth, isAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  getDevBusinessProfile,
  updateDevBusinessProfile,
} from "@/lib/devBusinessProfileStore";
import BusinessProfile from "@/models/BusinessProfile";
import { APP_NAME } from "@/config/constants";
import {
  parseBusinessProfileForm,
  formatZodErrors,
} from "@/lib/validations/businessProfile";
import { isUploadthingConfigured } from "@/lib/uploadthingEnv";

function serializeProfile(profile) {
  return {
    _id: profile._id?.toString?.() ?? profile._id ?? "business-profile",
    businessName: profile.businessName || APP_NAME,
    logo: profile.logo?.url
      ? { url: profile.logo.url, key: profile.logo.key || "" }
      : null,
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    website: profile.website || "",
    createdAt: profile.createdAt?.toISOString?.() ?? profile.createdAt,
    updatedAt: profile.updatedAt?.toISOString?.() ?? profile.updatedAt,
  };
}

async function deleteUploadThingFile(key) {
  if (!key || !isUploadthingConfigured()) return;

  try {
    const { UTApi } = await import("uploadthing/server");
    const utapi = new UTApi();
    await utapi.deleteFiles(key);
  } catch {
    // File deletion should not block profile updates
  }
}

async function requireAdminAccess() {
  const session = await auth();

  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }

  if (!isAdmin(session.role)) {
    return {
      error: "Only admins can manage the business profile",
      session: null,
    };
  }

  return { error: null, session };
}

async function getOrCreateProfile() {
  let profile = await BusinessProfile.findOne().lean();

  if (!profile) {
    profile = (
      await BusinessProfile.create({
        businessName: APP_NAME,
      })
    ).toObject();
  }

  return profile;
}

export async function getBusinessProfile() {
  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: {
          profile: serializeProfile(getDevBusinessProfile()),
          uploadEnabled: isUploadthingConfigured(),
        },
        error: null,
      };
    }

    await connectDB();
    const profile = await getOrCreateProfile();

    return {
      success: true,
      data: {
        profile: serializeProfile(profile),
        uploadEnabled: isUploadthingConfigured(),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load business profile",
    };
  }
}

export async function updateBusinessProfileAction(prevState, formData) {
  const { session, error: authError } = await requireAdminAccess();

  if (authError) {
    return { success: false, error: authError };
  }

  const parsed = parseBusinessProfileForm(formData);

  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { businessName, email, phone, address, website, logoUrl, logoKey } =
    parsed.data;

  const logo =
    logoUrl && logoKey
      ? { url: logoUrl, key: logoKey }
      : logoUrl
        ? { url: logoUrl, key: "" }
        : null;

  try {
    if (isAuthWithoutDb()) {
      const profile = updateDevBusinessProfile({
        businessName: businessName.trim(),
        email: email?.trim().toLowerCase() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        website: website?.trim() || "",
        logo,
      });

      revalidatePath("/settings/business-profile");

      return {
        success: true,
        data: serializeProfile(profile),
        error: null,
      };
    }

    await connectDB();

    const existing = await BusinessProfile.findOne();

    if (!existing) {
      const created = await BusinessProfile.create({
        businessName: businessName.trim(),
        email: email?.trim().toLowerCase() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        website: website?.trim() || "",
        logo,
      });

      await writeAuditLog({
        userId: session.userId,
        action: "create",
        entity: "BusinessProfile",
        entityId: created._id,
        changes: { businessName: created.businessName },
      });

      revalidatePath("/settings/business-profile");

      return {
        success: true,
        data: serializeProfile(created.toObject()),
        error: null,
      };
    }

    const oldLogoKey = existing.logo?.key;

    existing.businessName = businessName.trim();
    existing.email = email?.trim().toLowerCase() || "";
    existing.phone = phone?.trim() || "";
    existing.address = address?.trim() || "";
    existing.website = website?.trim() || "";
    existing.logo = logo;

    await existing.save();

    if (oldLogoKey && oldLogoKey !== logo?.key) {
      await deleteUploadThingFile(oldLogoKey);
    }

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "BusinessProfile",
      entityId: existing._id,
      changes: { businessName: existing.businessName },
    });

    revalidatePath("/settings/business-profile");

    return {
      success: true,
      data: serializeProfile(existing.toObject()),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update business profile",
    };
  }
}
