import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Box,
  Pressable,
  VStack,
  Text,
  HStack,
  Divider,
  Icon,
} from "native-base";
import DashboardStackScreen from "./DashboardStackScreen";
import SettingsStackScreen from "./SettingsStackScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationOptions } from "./utils";

// @ts-expect-error it's ok, don't delete this.
global.__reanimatedWorkletInit = () => {};
const Drawer = createDrawerNavigator();

function AndroidNavigation() {
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator
        // drawerContent={(props) => <CustomDrawerContent {...props} />}
        initialRouteName="Home"
        screenOptions={NavigationOptions}
      >
        <Drawer.Screen name="Home" component={DashboardStackScreen} />
        <Drawer.Screen name="Settings" component={SettingsStackScreen} />
      </Drawer.Navigator>
    </Box>
  );
}

export default AndroidNavigation;
