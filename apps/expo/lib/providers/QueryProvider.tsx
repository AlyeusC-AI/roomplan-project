import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner-native";
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          console.log("🚀 ~ QueryProvider ~ error:", error.response?.data);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "An error occurred while fetching data"
          );
        },
      },
      queries: {
        throwOnError: (error) => {
          console.log("🚀 ~ QueryProvider ~ error:", error.response);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "An error occurred while fetching data"
          );
          return true;
        },
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
