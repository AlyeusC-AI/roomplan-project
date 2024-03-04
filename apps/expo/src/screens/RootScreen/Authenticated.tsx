import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "expo-modules-core";
import AndroidNavigation from "./AndroidNavigation";
import TabNavigation from "./TabNavigation";

const Tab = createBottomTabNavigator();

export default function Authenticated() {
  return Platform.OS === "ios" ? <TabNavigation /> : <AndroidNavigation />;
}
