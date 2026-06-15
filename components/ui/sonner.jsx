"use client";

import { Toaster as Sonner } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      expand
      closeButton
      richColors
      duration={4000}
      gap={10}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border-border/80 !shadow-lg !backdrop-blur-sm",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton:
            "!border-border !bg-background !text-foreground hover:!bg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
