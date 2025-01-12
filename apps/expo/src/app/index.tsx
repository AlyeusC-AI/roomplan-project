import React, { useEffect } from "react";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { NavigationContainer } from "@react-navigation/native";

import Authenticated from "../screens/RootScreen/Authenticated";
import Unauthenticated from "../screens/RootScreen/Unauthenticated";
import { supabase } from "../lib/supabase";
import { userStore } from "../atoms/user";
import { NativeBaseProvider, extendTheme } from "native-base";
import { TRPCProvider } from "../utils/api";

function RootScreen() {
  const { session, setSession } = userStore((state) => state);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    (async () => {
      await requestTrackingPermissionsAsync();
    })();
  }, []);

  return (
    <NavigationContainer>
      {session && session.user ? <Authenticated /> : <Unauthenticated />}
    </NavigationContainer>
  );
}

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
  return (
    <TRPCProvider>
      <NativeBaseProvider theme={theme}>
        <RootScreen />
      </NativeBaseProvider>
    </TRPCProvider>
  );
}
