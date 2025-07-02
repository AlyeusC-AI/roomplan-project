import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "sonner-native";
import React, { createContext, useContext, useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

// Create a persister for React Native using AsyncStorage
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Custom error type for better error handling
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Network status context
interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  isOffline: false,
});

export const useNetworkStatus = () => useContext(NetworkContext);

// Network status provider component
function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    isConnected,
    isInternetReachable,
    isOffline: !isConnected || !isInternetReachable,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <NetworkStatusProvider>
      <QueryProviderContent>{children}</QueryProviderContent>
    </NetworkStatusProvider>
  );
}

function QueryProviderContent({ children }: { children: React.ReactNode }) {
  const { isOffline } = useNetworkStatus();

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error: ApiError) => {
          console.log("🚀 ~ QueryProvider ~ error:", error.response?.data);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "An error occurred while fetching data"
          );
        },
        // Retry less when offline
        retry: isOffline ? 1 : 3,
      },
      queries: {
        throwOnError: (error: ApiError) => {
          console.log("🚀 ~ QueryProvider ~ error:", error.response);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "An error occurred while fetching data"
          );
          return true;
        },
        // Add offline-friendly settings
        retry: (failureCount, error: ApiError) => {
          // Don't retry on network errors when offline
          if (
            error.message?.includes("Network Error") ||
            error.message?.includes("fetch")
          ) {
            return failureCount < 1;
          }
          return failureCount < 3;
        },
        // Offline-friendly cache settings
        staleTime: isOffline ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30 minutes when offline, 5 minutes when online
        gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
        // Disable refetch when offline
        refetchOnWindowFocus: !isOffline,
        refetchOnMount: !isOffline,
        refetchOnReconnect: true, // Always refetch when reconnecting
      },
    },
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        console.log("Query client persisted successfully");
      }}
      onError={() => {
        console.error("Failed to persist query client");
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
