import { toast } from "sonner";

export const notify = {
  success(message, description) {
    toast.success(message, description ? { description } : undefined);
  },
  error(message, description) {
    toast.error(message, description ? { description } : undefined);
  },
  info(message, description) {
    toast.info(message, description ? { description } : undefined);
  },
  loading(message) {
    return toast.loading(message);
  },
  dismiss(id) {
    toast.dismiss(id);
  },
  promise(promise, messages) {
    return toast.promise(promise, {
      loading: messages.loading ?? "Please wait...",
      success: messages.success ?? "Done",
      error: messages.error ?? "Something went wrong",
    });
  },
};
