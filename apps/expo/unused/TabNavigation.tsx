import React from "react";
import DashboardStackScreen from "./DashboardStackScreen";
import SettingsStackScreen from "./SettingsStackScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function TabNavigation() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // tabBarIcon: ({ focused, color, size }) => {
        //   if (route.name === "Home") {
        //     if (focused)
        //       return <Entypo name="home" size={24} color="#182e43" />;
        //     return <Entypo name="home" size={24} color="black" />;
        //   } else if (route.name === "Settings") {
        //     if (focused) return <Entypo name="cog" size={24} color="#182e43" />;
        //     return <Entypo name="cog" size={24} color="black" />;
        //   }
        // },
        tabBarActiveTintColor: "#182e43",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Stack.Screen
        name="Home"
        component={DashboardStackScreen}
        // options={({ route }) => ({
        //   tabBarStyle: ((route) => {
        //     const routeName = getFocusedRouteNameFromRoute(route) ?? "";
        //     if (routeName === "Camera") {
        //       return { display: "none" };
        //     }
        //     return;
        //   })(route),
        // })}
      />
      <Stack.Screen name="Settings" component={SettingsStackScreen} />
    </Stack.Navigator>
  );
}
