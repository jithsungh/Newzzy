import { toast } from "react-hot-toast";

// Keep track of active toasts to prevent duplicates
const activeToasts = new Set();

const createToastWithDuplicateCheck = (toastFn, message, options = {}) => {
  const toastId = `${toastFn.name}-${message}`;

  if (activeToasts.has(toastId)) {
    return;
  }

  activeToasts.add(toastId);

  const toastPromise = toastFn(message, {
    ...options,
    onDismiss: () => {
      activeToasts.delete(toastId);
      options.onDismiss?.();
    },
  });

  // Remove from active toasts after duration
  setTimeout(() => {
    activeToasts.delete(toastId);
  }, options.duration || 4000);

  return toastPromise;
};

export const toastManager = {
  success: (message, options) =>
    createToastWithDuplicateCheck(toast.success, message, options),
  error: (message, options) =>
    createToastWithDuplicateCheck(toast.error, message, options),
  loading: (message, options) =>
    createToastWithDuplicateCheck(toast.loading, message, options),
  promise: (promise, messages, options) =>
    toast.promise(promise, messages, options),
  dismiss: (toastId) => toast.dismiss(toastId),
  remove: (toastId) => toast.remove(toastId),
};

export default toastManager;
