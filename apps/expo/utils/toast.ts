import { toast } from 'sonner-native';

type ToastType = 'success' | 'error' | 'info';

/**
 * Shows a toast notification using sonner-native
 * @param type The type of toast (success, error, info)
 * @param title Optional title for the toast
 * @param message The message to display
 */
export const showToast = (
  type: ToastType = 'info',
  title?: string,
  message?: string
) => {
  switch (type) {
    case 'success':
      toast.success(title || 'Success', {
        description: message,
      });
      break;
    case 'error':
      toast.error(title || 'Error', {
        description: message,
      });
      break;
    case 'info':
    default:
      toast.info(title || 'Info', {
        description: message,
      });
      break;
  }
};

/**
 * Legacy support for old toast API
 * @deprecated Use the new API with type, title, message parameters
 */
export const showToastLegacy = ({ 
  message, 
  type = 'info'
}: {
  message: string;
  type?: ToastType;
  duration?: 'short' | 'long';
}) => {
  showToast(type, undefined, message);
}; 