import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import React from "react";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { NavigationContainer } from "@react-navigation/native";

import { useRecoilState } from "recoil";
import userSessionState from "../../atoms/user";
import Authenticated from "./Authenticated";
import Unauthenticated from "./Unauthenticated";

export default function RootScreen() {
  const [session, setSession] = useRecoilState(userSessionState);

  console.log("session", session);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session", session);
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
