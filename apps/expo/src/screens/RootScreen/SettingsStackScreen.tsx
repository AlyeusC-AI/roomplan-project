import SettingsScreen from "../SettingsScreen";
import React from "react";

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { NavigationOptions } from "./utils";
import { Platform } from "react-native";
import { Button } from "native-base";
// import { MaterialIcons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../types/Navigation";

// @ts-expect-error
import ArrowLongLeft from "../../../assets/icons/ArrowLongLeft.svg";

const SettingsStack = createNativeStackNavigator();

function SettingsStackScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList>) {
  return (
    <SettingsStack.Navigator
      screenOptions={
        Platform.OS === "ios"
          ? {
              ...NavigationOptions,
              headerLeft: () => (
                <Button onPress={() => navigation.navigate("Home")}>
                  <ArrowLongLeft
                    name="settings"
                    height={24}
                    width={30}
                    stroke="#ffffff"
                  />
                </Button>
              ),
            }
          : { header: () => null }
      }
    >
      <SettingsStack.Screen
        name="Account Settings"
        component={SettingsScreen}
      />
    </SettingsStack.Navigator>
  );
}

export default SettingsStackScreen;
