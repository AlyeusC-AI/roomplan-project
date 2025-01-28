import React, { useEffect } from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import ToastManager from "toastify-react-native";
import { TRPCProvider } from "@/utils/api";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency"
import { Stack } from "expo-router";
import "@/global.css";

export default function AppRoot() {
  const theme = extendTheme({
    colors: {
      // Add new color
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
      },
    },
  });

  useEffect(() => {
    requestTrackingPermissionsAsync()
  }, []);
  return (
    <TRPCProvider>
      <ToastManager width="auto" height="auto" showProgressBar={false} />
      <NativeBaseProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(dashboard)/(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="projects/address-input"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="(dashboard)/select-assignee" options={{ presentation: "modal" }} />
          <Stack.Screen name="projects/[projectId]/(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)/settings" options={{ headerShown: false }} />
          <Stack.Screen name="projects/new-project/index" options={{ headerShown: false }} />
        </Stack>
      </NativeBaseProvider>
    </TRPCProvider>
  );
}
