// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "sonner-native";
import React, { createContext, useContext, useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import * as SecureStore from "expo-secure-store";
import { offlineUploadProcessor } from "../services/offline-upload-processor";
import { offlineReadingsProcessor } from "../services/offline-readings-processor";
import { offlineEditProcessor } from "../services/offline-edit-processor";
import { offlineNotesProcessor } from "../services/offline-notes-processor";
import { offlineScopeProcessor } from "../services/offline-scope-processor";

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
      retry: false,
    },
    queries: {
      throwOnError: (error: ApiError) => {
        console.log("🚀 ~ QueryProvider ~ error:", error.response);
        // Don't throw errors when offline to prevent crashes
        // if (isOffline) {
        //   console.log("Offline mode - not throwing error");
        //   return false;
        // }
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "An error occurred while fetching data"
        );
        return false; // Changed from true to false to prevent crashes
      },
      // Add offline-friendly settings
      retry: (failureCount, error: ApiError) => {
        // Don't retry on network errors when offline
        if (
          error.message?.includes("Network Error") ||
          error.message?.includes("fetch") ||
          error.message?.includes("timeout")
        ) {
          return failureCount < 1;
        }
        return failureCount < 3;
      },
      // Offline-friendly cache settings
      staleTime: 5 * 60 * 1000, // 30 minutes when offline, 5 minutes when online
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
      // Disable refetch when offline
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true, // Always refetch when reconnecting
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
  },
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
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
const forceOffline = true;
const NetworkContext = createContext<NetworkContextType>({
  isConnected: forceOffline ? false : true,
  isInternetReachable: forceOffline ? false : true,
  isOffline: forceOffline ? true : false,
});

export const useNetworkStatus = () => useContext(NetworkContext);

// Network status provider component
function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(forceOffline ? false : true);
  const [isInternetReachable, setIsInternetReachable] = useState(
    forceOffline ? false : true
  );

  useEffect(() => {
    if (forceOffline) return;
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const wasOffline = !isConnected || !isInternetReachable;
      const isNowOnline = state.isConnected && state.isInternetReachable;

      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);

      // Coming back online - tasks will be processed manually from the home screen
      if (isNowOnline) {
        console.log("Coming back online - tasks can be processed manually");
      }
    });

    return () => unsubscribe();
  }, [isConnected, isInternetReachable, forceOffline]);

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
  // const { isOffline } = useNetworkStatus();

  // const queryClient = new QueryClient({
  //   defaultOptions: {
  //     mutations: {
  //       onError: (error: ApiError) => {
  //         console.log("🚀 ~ QueryProvider ~ error:", error.response?.data);
  //         toast.error(
  //           error.response?.data?.message ||
  //             error.message ||
  //             "An error occurred while fetching data"
  //         );
  //       },
  //       // Retry less when offline
  //       retry: isOffline ? 1 : 3,
  //     },
  //     queries: {
  //       throwOnError: (error: ApiError) => {
  //         console.log("🚀 ~ QueryProvider ~ error:", error.response);
  //         // Don't throw errors when offline to prevent crashes
  //         if (isOffline) {
  //           console.log("Offline mode - not throwing error");
  //           return false;
  //         }
  //         toast.error(
  //           error.response?.data?.message ||
  //             error.message ||
  //             "An error occurred while fetching data"
  //         );
  //         return false; // Changed from true to false to prevent crashes
  //       },
  //       // Add offline-friendly settings
  //       retry: (failureCount, error: ApiError) => {
  //         // Don't retry on network errors when offline
  //         if (
  //           error.message?.includes("Network Error") ||
  //           error.message?.includes("fetch") ||
  //           error.message?.includes("timeout")
  //         ) {
  //           return isOffline ? false : failureCount < 1;
  //         }
  //         return failureCount < 3;
  //       },
  //       // Offline-friendly cache settings
  //       staleTime: isOffline ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30 minutes when offline, 5 minutes when online
  //       gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
  //       // Disable refetch when offline
  //       refetchOnWindowFocus: !isOffline,
  //       refetchOnMount: !isOffline,
  //       refetchOnReconnect: true, // Always refetch when reconnecting
  //     },
  //   },
  // });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
