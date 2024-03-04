import LoginScreen from "../LoginScreen";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "../RegisterScreen";
import { NavigationOptions } from "./utils";

const UnauthenticatedStack = createNativeStackNavigator();

export default function Unauthenticated() {
  return (
    <UnauthenticatedStack.Navigator
      screenOptions={{
        header: () => null,
      }}
    >
      <UnauthenticatedStack.Screen name="Login" component={LoginScreen} />
      <UnauthenticatedStack.Screen name="Register" component={RegisterScreen} />
    </UnauthenticatedStack.Navigator>
  );
}
