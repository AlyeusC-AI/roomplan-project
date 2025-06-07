import SettingsScreen from "../SettingsScreen";
import React from "react";

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { NavigationOptions } from "./RootScreen/utils";
import { Platform } from "react-native";
import { Button } from "native-base";
import { HomeStackParamList } from "../../types/Navigation";
import { ArrowLeft } from "lucide-react-native";

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
                  <ArrowLeft
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
