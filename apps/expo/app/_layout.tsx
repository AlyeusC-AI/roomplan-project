import React, { useEffect, useCallback } from "react";
import { NativeBaseProvider, extendTheme } from "native-base";
import { Toaster } from "sonner-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { Stack } from "expo-router";
import "@/global.css";
import { AppState, View, StatusBar, SafeAreaView } from "react-native";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";

import { QueryProvider } from "../lib/providers/QueryProvider";

console.log("App initialization started");

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto hide:", err);
});

export default function AppRoot() {
  console.log("AppRoot component started rendering");

  const theme = extendTheme({
    colors: {
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#182e43" ,
        600: "#182e43",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
      },
    },
  });

  const [appIsReady, setAppIsReady] = React.useState(false);
  // const { data: user } = useCurrentUser();

  useEffect(() => {
    console.log("AppRoot useEffect triggered");
    async function prepare() {
      try {
        console.log("Starting app preparation");

        // Initialize Supabase session
        // const { data, error } = await supabase.auth.getSession();
        // if (data.session) {
        //   console.log("Supabase session found, setting in userStore");
        //   setSession(data.session);
        // } else if (error) {
        //   console.error("Error getting Supabase session:", error);
        // }

        // Setup auth state change listener
        // const { data: authListener } = supabase.auth.onAuthStateChange(
        //   (event, session) => {
        //     console.log("Auth state changed:", event);
        //     setSession(session);
        //   }
        // );
        // if (user) {
        //   setSession({ user });
        // }
        await requestTrackingPermissionsAsync();
        console.log("Tracking permissions requested");
        setAppIsReady(true);
      } catch (e) {
        console.error("Error during app preparation:", e);
      }
    }

    prepare();

    // Return cleanup function
    return () => {
      // Clean up any listeners if needed
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log("Layout ready, hiding splash screen");
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  console.log("Rendering AppRoot component");

  return (
    <QueryProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <NativeBaseProvider theme={theme}>
              <Stack
                screenOptions={{
                  headerTintColor: "#FFFF",
                  headerStyle: { backgroundColor: "#182e43" },
                }}
              >
                <Stack.Screen
                  name="(auth)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="(app)"
                  options={{
                    headerShown: false,
                  }}
                />
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
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#f5f5f5"
          networkActivityIndicatorVisible={true}
        />
      </View>
    </QueryProvider>
  );
}
