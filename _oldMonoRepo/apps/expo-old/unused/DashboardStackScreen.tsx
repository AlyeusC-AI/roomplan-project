import DashboardScreen from "./screens/DashboardScreen";
import ProjectCreationScreen from "./ProjectCreationScreen";
import CameraScreen from "./screens/CameraScreen";
import ProjectScreen from "./ProjectScreen";
import React from "react";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import RoomCreationScreen from "./RoomCreationScreen";
import { NavigationOptions } from "./RootScreen/utils";
import { Platform } from "react-native";
import { Button } from "native-base";
import { HomeStackParamList } from "../../types/Navigation";

import EditProjectDetails from "./EditProjectDetails";
import InsuranceScreen from "./EditInsuranceScreen";
import { Cog } from "lucide-react-native";

const Stack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

function DashboardStackScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList>) {
  return (
    <DashboardStack.Navigator
      screenOptions={
        Platform.OS === "ios"
          ? {
              ...NavigationOptions,
              headerRight: () => (
                <Button onPress={() => navigation.navigate("Settings")}>
                  <Cog height={24} width={24} stroke="#ffffff" />
                </Button>
              ),
            }
          : { header: () => null }
      }
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="CreateProject" component={ProjectCreationScreen} />
      <Stack.Screen name="Project" component={ProjectScreen} />
      <Stack.Screen name="Create Room" component={RoomCreationScreen} />
      <Stack.Screen name="Edit Project" component={EditProjectDetails} />
      <Stack.Screen name="Edit Insurance" component={InsuranceScreen} />
      {/* @ts-ignore */}
      <Stack.Screen name="Camera" component={CameraScreen} />
    </DashboardStack.Navigator>
  );
}
export default DashboardStackScreen;
