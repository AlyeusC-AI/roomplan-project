import { create } from "zustand";
import { toast as sonnerToast } from "sonner-native";

interface ToastStore {
  toast: (props: {
    title?: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toast: ({ title, description, variant = "default" }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || description, {
        description: title ? description : undefined,
        duration: 4000,
      });
    } else {
      sonnerToast.success(title || description, {
        description: title ? description : undefined,
        duration: 4000,
      });
    }
  },
}));

export const useToast = () => {
  return {
    toast: useToastStore((state) => state.toast),
  };
}; 