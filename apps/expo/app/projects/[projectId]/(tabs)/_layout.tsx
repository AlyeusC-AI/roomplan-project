import React from "react";

import {
  ArrowLeft,
  BookOpen,
  House,
  Images,
  StickyNote,
} from "lucide-react-native";
import { router, Tabs } from "expo-router";
import { Text } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1e88e5",
        headerLeft: () => (
          <ArrowLeft onPress={() => router.dismiss()} color="black" />
        ),
        headerRight: () => (
          <Text
            onPress={() => router.push({ pathname: "../edit" })}
            style={{ fontWeight: "600", marginHorizontal: 10 }}
          >
            Edit
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: "Photos",
          tabBarIcon: ({ color }) => (
            <Images size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: "Readings",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => <StickyNote size={24} color={color} />,
        }}
      />
    </Tabs>
    // <Tab.Navigator
    //   screenOptions={({ route }) => ({
    //     headerShown: false,
    //     tabBarIcon: ({ focused, color, size }) => {
    //       if (route.name === "Overview") {
    //         if (focused) return <House height={24} width={24} color="#1e88e5" />;
    //         return <House height={24} width={24} color="#000" />;
    //       }
    //       if (route.name === "Photos") {
    //         if (focused)
    //           return <PictureInPicture height={24} width={24} color="#1e88e5" />;
    //         return <PictureInPicture height={24} width={24} color="#000" />;
    //       } else if (route.name === "Readings") {
    //         if (focused)
    //           return <BookOpen height={24} width={24} color="#1e88e5" />;
    //         return <BookOpen height={24} width={24} color="#000" />;
    //       } else if (route.name === "Notes") {
    //         if (focused)
    //           return <StickyNote height={24} width={24} color="#1e88e5" />;
    //         return <StickyNote height={24} width={24} color="#000" />;
    //       }
    //     },
    //     tabBarActiveTintColor: "#1e88e5",
    //     tabBarInactiveTintColor: "gray",
    //   })}
    // >
    //   <Tab.Screen
    //     name="Overview"
    //     component={ProjectOverview}
    //     initialParams={route.params}
    //   />
    //   <Tab.Screen
    //     name="Photos"
    //     component={ProjectPhotos}
    //     initialParams={route.params}
    //   />
    //   <Tab.Screen
    //     name="Readings"
    //     component={RoomReadings}
    //     initialParams={route.params}
    //   />
    //   <Tab.Screen
    //     name="Notes"
    //     component={RoomNotes}
    //     initialParams={route.params}
    //   />
    // </Tab.Navigator>
  );
}
