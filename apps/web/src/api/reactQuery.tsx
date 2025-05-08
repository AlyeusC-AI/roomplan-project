import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: any) => {
        console.log("🚀 ~ errorasdasdadasdsad:", error);
        console.log("🚀 ~ erroasdadasdasdr:", error.response.data.message);
        if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            error.response.data.message.forEach((message: any) => {
              toast.error(message);
            });
          } else {
            toast.error(error.response.data.message);
          }
        } else {
          toast.error((error as Error).message || "An error occurred");
        }
      },
    },
    queries: {
      throwOnError: (error, query) => {
        console.log("🚀 ~ query:asdadasdasdd", query);
        console.log("🚀 ~ error:", error);
        toast.error((error as Error).message || "An error occurred");
        return false;
      },
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  );
}
