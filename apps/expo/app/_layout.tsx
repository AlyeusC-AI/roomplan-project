import React, { useEffect } from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import { Toaster } from "sonner-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { Stack } from "expo-router";
import "@/global.css";
import { supabase } from "@/lib/supabase";
import { AppState } from "react-native";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

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
    requestTrackingPermissionsAsync();
  }, []);
  return (
    <GestureHandlerRootView>
      <ThemeProvider>
        <NativeBaseProvider theme={theme}>
          <Stack
            screenOptions={{
              headerTintColor: "#FFFF",
              headerStyle: { backgroundColor: "#2563eb" },
            }}
          >
            <Stack.Screen
              name="(dashboard)/(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="projects/address-input"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="(dashboard)/select-assignee"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="projects/[projectId]/(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(dashboard)/settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="projects/new-project/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(dashboard)/chat"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="projects/[projectId]/edit"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="projects/[projectId]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/login"
              options={{
                headerTitle: "Log In",
              }}
            />
          </Stack>
        </NativeBaseProvider>
      </ThemeProvider>
      <Toaster visibleToasts={1} position="top-center" closeButton />
      <PortalHost />
    </GestureHandlerRootView>
  );
}
