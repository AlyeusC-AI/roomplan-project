import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProjectPhotos from "./ProjectPhotos";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/Navigation";
import RoomReadings from "./RoomReadings";
import RoomNotes from "./RoomNotes";

// @ts-expect-error
import PhotoIcon from "../../../assets/icons/Photo.svg";
// @ts-expect-error
import BookOpen from "../../../assets/icons/BookOpen.svg";
// @ts-expect-error
import Document from "../../../assets/icons/Document.svg";
// @ts-expect-error
import Home from "../../../assets/icons/Home.svg";
// @ts-expect-error
import SettingsLogo from "../../../assets/icons/Cog6Tooth.svg";

import ProjectOverview from "./ProjectOverview";
import InsuranceScreen from "../../screens/EditInsuranceScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Overview") {
            if (focused) return <Home height={24} width={24} color="#1e88e5" />;
            return <Home height={24} width={24} color="#000" />;
          }
          if (route.name === "Photos") {
            if (focused)
              return <PhotoIcon height={24} width={24} color="#1e88e5" />;
            return <PhotoIcon height={24} width={24} color="#000" />;
          }  else if (route.name === "Insurance") {
            if (focused)
              return <SettingsLogo height={24} width={24} color="#1e88e5" />;
            return <SettingsLogo height={24} width={24} color="#000" />;
          } else if (route.name === "Readings") {
            if (focused)
              return <BookOpen height={24} width={24} color="#1e88e5" />;
            return <BookOpen height={24} width={24} color="#000" />;
          } else if (route.name === "Notes") {
            if (focused)
              return <Document height={24} width={24} color="#1e88e5" />;
            return <Document height={24} width={24} color="#000" />;
          }
        },
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Overview"
        component={ProjectOverview}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Insurance"
        component={InsuranceScreen}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Photos"
        component={ProjectPhotos}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Readings"
        component={RoomReadings}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Notes"
        component={RoomNotes}
        initialParams={route.params}
      />
    </Tab.Navigator>
  );
}
