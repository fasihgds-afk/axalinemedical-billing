import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

export const UploadButton = generateUploadButton({
  url: "/api/uploadthing",
});

export const UploadDropzone = generateUploadDropzone({
  url: "/api/uploadthing",
});

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "/api/uploadthing",
});
