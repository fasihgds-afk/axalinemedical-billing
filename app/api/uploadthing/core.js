import { ensureUploadthingToken } from "@/lib/uploadthingEnv";
import { createUploadthing } from "uploadthing/next";

ensureUploadthingToken();
import { UploadThingError } from "uploadthing/server";
import { auth, canUserWrite } from "@/lib/auth";

const f = createUploadthing();

async function requireAuthUser() {
  const session = await auth();

  if (!session?.userId) {
    throw new UploadThingError("Unauthorized");
  }

  if (!canUserWrite(session.role)) {
    throw new UploadThingError("You do not have permission to upload files");
  }

  return { userId: session.userId };
}

export const ourFileRouter = {
  paymentScreenshot: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(requireAuthUser)
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.ufsUrl || file.url,
        key: file.key,
        uploadedBy: metadata.userId,
      };
    }),

  businessLogo: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.userId) {
        throw new UploadThingError("Unauthorized");
      }

      if (session.role !== "Admin") {
        throw new UploadThingError("Only admins can upload business logos");
      }

      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.ufsUrl || file.url,
        key: file.key,
        uploadedBy: metadata.userId,
      };
    }),
};
