import React, { useEffect } from "react";

import {
  ArrowLeft,
  BookOpen,
  House,
  Images,
  StickyNote,
} from "lucide-react-native";
import { router, Tabs, useGlobalSearchParams } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { projectStore } from "@/lib/state/project";
import { userStore } from "@/lib/state/user";

export default function Layout() {
  const { projectId } = useGlobalSearchParams();
  const [loading, setLoading] = React.useState(true);
  const project = projectStore();
  const { session } = userStore((state) => state);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": session!.access_token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        console.log(data);
        project.setProject(data.data);
        console.log("Project fetched");
      });
  }, []);

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1e88e5",
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "#1e88e5",
        },
        headerLeft: () => (
          <ArrowLeft
            className="ml-3"
            onPress={() => router.dismiss()}
            color="white"
          />
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "./edit" })}
          >
            <Text
              className="text-white mr-3"
              style={{ fontWeight: "600", paddingHorizontal: 10 }}
            >
              Edit
            </Text>
          </TouchableOpacity>
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
        name="pictures"
        options={{
          title: "Photos",
          tabBarIcon: ({ color }) => <Images size={24} color={color} />,
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
