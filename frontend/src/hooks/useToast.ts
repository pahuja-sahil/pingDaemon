import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  className?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const toast = {
    success: (message: string, options?: ToastOptions) => {
      return sonnerToast.success(message, {
        duration: options?.duration,
        position: options?.position,
        className: options?.className,
        description: options?.description,
        action: options?.action,
      });
    },

    error: (message: string, options?: ToastOptions) => {
      return sonnerToast.error(message, {
        duration: options?.duration,
        position: options?.position,
        className: options?.className,
        description: options?.description,
        action: options?.action,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      return sonnerToast.warning(message, {
        duration: options?.duration,
        position: options?.position,
        className: options?.className,
        description: options?.description,
        action: options?.action,
      });
    },

    info: (message: string, options?: ToastOptions) => {
      return sonnerToast.info(message, {
        duration: options?.duration,
        position: options?.position,
        className: options?.className,
        description: options?.description,
        action: options?.action,
      });
    },

    loading: (message: string, options?: Omit<ToastOptions, 'action'>) => {
      return sonnerToast.loading(message, {
        duration: options?.duration,
        position: options?.position,
        className: options?.className,
        description: options?.description,
      });
    },

    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },

    promise: <T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      } & Omit<ToastOptions, 'action'>
    ) => {
      return sonnerToast.promise(promise, {
        loading: options.loading,
        success: options.success,
        error: options.error,
        duration: options.duration,
        position: options.position,
        className: options.className,
        description: options.description,
      });
    },
  };

  return { toast };
};