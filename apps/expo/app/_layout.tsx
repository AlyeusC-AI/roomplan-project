import React, { useEffect, useCallback } from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import { Toaster } from "sonner-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { Stack } from "expo-router";
import "@/global.css";
import { supabase } from "@/lib/supabase";
import { AppState, View } from "react-native";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from 'expo-splash-screen';

console.log('App initialization started');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Error preventing splash screen auto hide:', err);
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function AppRoot() {
  console.log('AppRoot component started rendering');
  
  const theme = extendTheme({
    colors: {
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

  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    console.log('AppRoot useEffect triggered');
    async function prepare() {
      try {
        console.log('Starting app preparation');
        await requestTrackingPermissionsAsync();
        console.log('Tracking permissions requested');
        setAppIsReady(true);
      } catch (e) {
        console.error('Error during app preparation:', e);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('Layout ready, hiding splash screen');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  console.log('Rendering AppRoot component');

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
    </View>
  );
}
